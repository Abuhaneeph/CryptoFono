module.exports={
    
    // Welcome screens
    welcomeBack: 'Welcome back to Cryptofono 💸\nEnter your 4-digit PIN:',
    welcomeNew: 'Welcome to Cryptofono 💸\nLet\'s create your account!\nChoose Account Type:\n1. Regular User\n2. Merchant',
    
    // Registration flow
    createPin: 'Create 4-digit PIN:',
    confirmPin: 'Confirm PIN:',
    pinsDontMatch: 'PINs do not match. Please try again.',
    invalidPin: 'PIN must be exactly 4 digits. Please try again.',
    enterBusinessName: 'Enter Business Name:',
    emptyBusinessName: 'Business name cannot be empty. Please try again.',
    
    // Main menus
    regularUserMenu: 'Main Menu:\n1. Check Balance\n2. Send USDC\n3. Pay a Merchant\n4. View Transactions\n5. My Wallet Address\n6. Language Settings\n7. Exit',    
    
    // Common navigation
    back: 'Back to Main Menu',
    exit: 'Exit',
    backAndExit: '0. Back to Main Menu\n9. Exit',
    loginSuccessful: 'Login successful!',
    
    // Balance
    balance: 'Your USDC Balance: {0} USDC',
    balanceError: 'Could not retrieve balance. Please try again later.',
    
    // Send money
    sendUSDCOptions: 'Send USDC to:\n1. Cryptofono User\n2. External Wallet Address\n\n0. Back',
    sendOptions: 'Send USDC to:\n1. Cryptofono User\n2. External Wallet Address',
    recipientPhone: 'Enter recipient phone number:',
    recipientAddress: 'Enter recipient address:',
    invalidEthAddress: 'Invalid Ethereum address. Please try again.',
    userNotFound: 'Cryptofono user not found. Please check number and try again.',
    enterAmount: 'Enter amount to send (USDC):',
    invalidAmount: 'Invalid amount. Please enter a positive number.',
    confirmSendUser: 'Send {0} USDC to Cryptofono user {1}?\n\n1. Confirm\n2. Cancel',
    confirmSendExternal: 'Send {0} USDC to external address:\n{1}\n\n1. Confirm\n2. Cancel',
    sendSuccess: 'Successfully sent {0} USDC to Cryptofono user {1}',
    cancelled: 'Transaction cancelled.',
     transfer_success: "Successfully sent ${amount} USDC to ${recipientAddress} on ${NETWORK}",
         insufficient_balance: "Insufficient USDC balance on ${NETWORK}. You have ${usdcBalance} USDC. Need at least ${requiredAmount} USDC (including fees).",
    
    // Pay merchant - UPDATED SECTION
    enterMerchantCode: 'Enter merchant code:',
    invalidMerchantCode: 'Invalid merchant code. Please check and try again.',
    enterPaymentAmount: 'Enter amount to pay to {0} (USDC):',
    confirmPayment: 'Pay {0} USDC to {1}?\n\n1. Confirm\n2. Cancel',
    merchantNotFound: 'Merchant not found.',
    paymentSuccess: 'Payment of {0} USDC sent successfully to {1}!',
    payToMerchant: 'Pay to: {0}\nEnter amount (USDC):',
    confirmPayMerchant: 'Pay {0} USDC to {1}?\n\n1. Confirm\n2. Cancel',
    paymentCancelled: 'Payment cancelled.',
    paymentFailed: 'Payment failed. Please try again.',
    
    // Transactions
    noTransactions: 'No recent transactions found.',
    recentTransactions: 'Recent Transactions:',
    transactionsHeader: 'Recent Transactions:',
    transactionError: 'Could not retrieve transactions. Please try again later.',
    sent: 'Sent',
    received: 'Received',
    to: 'to',
    
    // Wallet
    walletAddress: 'Your Wallet Address:\n{0}',
    walletAddressError: 'Could not retrieve wallet address. Please try again later.',
    
    // Merchant specific
    merchantMenu: 'Merchant Menu:\n1. Check Balance\n2. View Payments\n3. Withdraw\n4. Share Merchant Code\n5. My Wallet Address\n6. View Withdrawals\n7. Language Settings\n8. Exit',
    noPayments: 'No recent payments found.',
    paymentsHeader: 'Recent Payments:',
    receivedPayment: 'Received {0} USDC from ***{1} - {2}',
    merchantCode: 'Your Merchant Code is: {0}\n\nShare this code with customers for payments.',
    withdrawOptions: 'Withdraw to:\n1. Cryptofono User\n2. External Wallet Address\n\n0. Back',
    enterWithdrawalAddress: 'Enter withdrawal address:',
    confirmWithdrawUser: 'Withdraw {0} USDC to Cryptofono user {1}?\n\n1. Confirm\n2. Cancel',
    confirmWithdrawExternal: 'Withdraw {0} USDC to:\n{1}\n\n1. Confirm\n2. Cancel',
    withdrawalCancelled: 'Withdrawal cancelled.',
    withdrawalFailed: 'Withdrawal failed. Please try again.',
    noWithdrawals: 'No withdrawal history found.',
    withdrawalsHeader: 'Recent Withdrawals:',
    
    // Language
    languageMenu: 'Choose your language / Chagua lugha yako:\n1. English\n2. Swahili',
    languageChanged: 'Language set to English',
    selectLanguage: 'Select your preferred language',
    selectAccountType: 'Select account type',  
    languageChangeError: 'Failed to change language',
    backToMenu: 'Back to Menu',
    
    // Errors and general messages
    error: 'An error occurred. Please try again later.',
    goodbye: 'Thank you for using Cryptofono. Goodbye!',
    invalidOption: 'Invalid option. Please try again.',
    transactionFailed: 'Failed to send USDC. Please try again later.',
}