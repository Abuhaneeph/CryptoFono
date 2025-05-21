require("dotenv").config();

import { writeFileSync } from "fs";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPublicClient, http, parseUnits, formatUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";
import { createSmartAccountClient } from "permissionless";
import { getAddress, maxUint256, parseAbi } from "viem";
import axios from "axios";

// Environment variables
const apiKey = process.env.PIMLICO_API_KEY;
if (!apiKey) throw new Error("Missing PIMLICO_API_KEY");

const swyptApiKey = process.env.SWYPT_API_KEY;
const swyptApiSecret = process.env.SWYPT_API_SECRET;
if (!swyptApiKey || !swyptApiSecret) throw new Error("Missing SWYPT_API_KEY or SWYPT_API_SECRET");

const privateKey = 
  process.env.PRIVATE_KEY || 
  (() => { 
    const pk = generatePrivateKey();
    writeFileSync(".env", `PRIVATE_KEY=${pk}`);
    return pk;
  })();

const recipientPhone = process.env.RECIPIENT_PHONE;
if (!recipientPhone) throw new Error("Missing RECIPIENT_PHONE");

// POLYGON USDT contract address
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const USDT_DECIMALS = 6;

// Swypt contract address on polygon
const SWYPT_CONTRACT_ADDRESS = "0x5d3398142E393bB4BBFF6f67a3778322d3F9D90B";

// Create polygon public client
const publicClient = createPublicClient({
  chain: polygon,
  transport: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`), 
});

// Pimlico setup
const pimlicoUrl = `https://api.pimlico.io/v2/polygon/rpc?apikey=${apiKey}`;

const pimlicoClient = createPimlicoClient({
  chain: polygon,
  transport: http(pimlicoUrl),
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
});

// ERC20 ABI for USDT
const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

// Swypt Contract ABI
const SWYPT_ABI = parseAbi([
  "function withdrawToEscrow(address _tokenAddress, uint256 _amountPlusfee, uint256 _exchangeRate, uint256 _feeAmount) returns (uint256)",
  "function withdrawWithPermit(address _tokenAddress, uint256 _amountPlusfee, uint256 _exchangeRate, uint256 _feeAmount, uint deadline, uint8 v, bytes32 r, bytes32 s) returns (uint256)"
]);

// Swypt API functions
async function getSwyptQuote(amount) {
  try {
    const response = await axios.post(
      "https://pool.swypt.io/api/swypt-quotes",
      {
        type: "offramp",
        amount,
        fiatCurrency: "KES",
        cryptoCurrency: "USDT",
        network: "polygon",
        category: "B2C",
      },
      {
        headers: {
          "x-api-key": swyptApiKey,
          "x-api-secret": swyptApiSecret,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Swypt quote:", error);
    throw error;
  }
}

async function initiateOfframp(txHash, phoneNumber) {
  try {
    const response = await axios.post(
      "https://pool.swypt.io/api/swypt-order-offramp",
      {
        chain: "polygon",
        hash: txHash,
        partyB: phoneNumber,
        tokenAddress: USDT_ADDRESS,
      },
      {
        headers: {
          "x-api-key": swyptApiKey,
          "x-api-secret": swyptApiSecret,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating offramp:", error);
    throw error;
  }
}

async function checkOfframpStatus(orderID) {
  try {
    const response = await axios.get(
      `https://pool.swypt.io/api/order-offramp-status/${orderID}`,
      {
        headers: {
          "x-api-key": swyptApiKey,
          "x-api-secret": swyptApiSecret,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking offramp status:", error);
    throw error;
  }
}

async function main() {
  try {
    // Set up the smart account
    const account = await toSafeSmartAccount({
      client: publicClient,
      owners: [privateKeyToAccount(privateKey)],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      version: "1.4.1",
    });

    console.log(`Smart account address: https://polygonscan.com/address/${account.address}`);

    // Create smart account client
    const smartAccountClient = createSmartAccountClient({
      account,
      chain: polygon,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });

    // Amount to transfer (0.001 USDT)
    const amount = "0.00001";
    const amountInWei = parseUnits(amount, USDT_DECIMALS);

    // Get Swypt quote
    console.log(`Getting quote for ${amount} USDT to KES...`);
    const quote = await getSwyptQuote(amount);
    console.log("Quote received:", JSON.stringify(quote, null, 2));

    // Extract exchange rate and fee from quote
    const exchangeRate = BigInt(Math.floor(quote.data.exchangeRate * 1000000)); // Convert to BigInt with 6 decimals
    const feeAmount = parseUnits(quote.data.fee.amount.toString(), USDT_DECIMALS);
    const amountPlusFee = amountInWei + feeAmount;

    console.log(`Exchange Rate: ${formatUnits(exchangeRate, 6)}`);
    console.log(`Fee Amount: ${formatUnits(feeAmount, USDT_DECIMALS)} USDT`);
    console.log(`Total Amount (including fee): ${formatUnits(amountPlusFee, USDT_DECIMALS)} USDT`);

    // Get token quotes from Pimlico for USDT
    console.log("Getting token quotes from Pimlico for USDT...");
    const quotes = await pimlicoClient.getTokenQuotes({
      
      tokens: [USDT_ADDRESS]
    });
    
    // Get the paymaster address from the quotes
    const paymaster = quotes[0].paymaster;
    console.log(`Paymaster address: ${paymaster}`);

    // Step 1: First approve the paymaster to use USDT for gas fees
    // Then approve the Swypt contract to spend USDT for the transaction
    console.log(`Approving paymaster and Swypt contract to spend USDT...`);
    
    const approvalTxHash = await smartAccountClient.sendTransaction({
      calls: [
        {
          to: getAddress(USDT_ADDRESS),
          abi: ERC20_ABI,
          functionName: "approve",
          args: [paymaster, maxUint256],
        },
        {
          to: getAddress(USDT_ADDRESS),
          abi: ERC20_ABI,
          functionName: "approve",
          args: [SWYPT_CONTRACT_ADDRESS, amountPlusFee],
        },
      ],
      paymasterContext: {
        token: USDT_ADDRESS,
      },
    });

    console.log(`Approvals transaction included: https://polygonscan.com/tx/${approvalTxHash}`);
    
    // Wait for the approvals to be confirmed
    console.log("Waiting for approvals confirmation...");
    await publicClient.waitForTransactionReceipt({ hash: approvalTxHash });
    console.log("Approvals confirmed!");

    // Step 2: Call withdrawToEscrow on the Swypt contract
    console.log(`Calling withdrawToEscrow with ${formatUnits(amountPlusFee, USDT_DECIMALS)} USDT...`);
    
    const withdrawTxHash = await smartAccountClient.sendTransaction({
      calls: [
        {
          to: getAddress(SWYPT_CONTRACT_ADDRESS),
          abi: SWYPT_ABI,
          functionName: "withdrawToEscrow",
          args: [
            USDT_ADDRESS,
            amountPlusFee,
            exchangeRate,
            feeAmount
          ],
        },
      ],
      paymasterContext: {
        token: USDT_ADDRESS,
      },
    });

    console.log(`Withdrawal transaction included: https://polygonscan.com/tx/${withdrawTxHash}`);
    
    // Wait for the withdrawal to be confirmed
    console.log("Waiting for withdrawal confirmation...");
    await publicClient.waitForTransactionReceipt({ hash: withdrawTxHash });
    console.log("Withdrawal confirmed!");

    // Step 3: Initiate offramp
    console.log(`Initiating offramp to phone number ${recipientPhone}...`);
    const offrampResult = await initiateOfframp(withdrawTxHash, recipientPhone);
    console.log("Offramp initiated:", offrampResult);

    // Get the order ID
    const orderID = offrampResult.data.orderID;
    
    // Check initial status
    console.log(`Checking initial status for order ${orderID}...`);
    const initialStatus = await checkOfframpStatus(orderID);
    console.log("Initial status:", initialStatus);

    // Poll for status updates (in a real app, you might want to use webhooks)
    console.log("Polling for status updates...");
    let finalStatus = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!finalStatus && attempts < maxAttempts) {
      const status = await checkOfframpStatus(orderID);
      console.log(`Status update (attempt ${attempts + 1}/${maxAttempts}):`, status);
      
      if (status.data.status === "SUCCESS" || status.data.status === "FAILED") {
        finalStatus = status;
        break;
      }
      
      // Wait 10 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    if (finalStatus) {
      console.log("Final status:", finalStatus);
      if (finalStatus.data.status === "SUCCESS") {
        console.log(`Off-ramp successful! ${amount} USDT converted to KES and sent to ${recipientPhone}`);
        console.log(`M-Pesa receipt: ${finalStatus.data.details.mpesaReceipt}`);
      } else {
        console.log(`Off-ramp failed: ${finalStatus.data.message}`);
      }
    } else {
      console.log(`Reached maximum attempts. Last status: ${await checkOfframpStatus(orderID)}`);
    }
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
}

main();