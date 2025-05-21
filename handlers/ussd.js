// Core USSD handler for Cryptofono
const userService = require('../services/user');
const walletService = require('../services/wallet');
const { isValidEthereumAddress } = require('../utils/crypto');
const db = require('../config/database');
const languageService = require('../language_handlers/languageManager');


/**
 * Handle USSD requests
 * @param {Object} params - USSD request parameters
 * @param {string} params.sessionId - Session ID
 * @param {string} params.serviceCode - Service code
 * @param {string} params.phoneNumber - User phone number
 * @param {string} params.text - USSD input text
 * @returns {string} USSD response
 */
async function handleUssdRequest(params) {
  const { sessionId, serviceCode, phoneNumber, text } = params;
  console.log(`USSD request from ${phoneNumber}: ${text}`);

  try {
    // 🌐 Get user's current language (default to English if not set)
    const language = await languageService.getUserLanguage(phoneNumber);

    // 🌐 Handle universal request for language settings
    if (languageService.shouldShowLanguageMenu(text)) {
      return `CON ${languageService.getLanguageMenu(language)}`;
    }

    // 🌐 Handle language selection e.g. '00*1'
    if (text.startsWith('00*')) {
      const langChoice = text.split('*')[1];
      return await handleLanguageSelection(phoneNumber, langChoice);
    }

    // 🆕 Initial state - Show welcome screen
  if (text === '') {
  const userExists = await userService.checkUserExists(phoneNumber);
  if (userExists) {
    return `CON ${languageService.getTranslation('welcomeBack', language)}`;
  } else {
    // For new users, show language selection first
    return `CON ${languageService.getTranslation('selectLanguage', 'en')}\n${languageService.getLanguageMenu('en')}`;
  }
}

    // ⛏️ Parse input
    const textArray = text.split('*');
    const level = textArray.length;
    const lastInput = textArray[textArray.length - 1];

    // 🛂 Registration flow
    const userExists = await userService.checkUserExists(phoneNumber);
    if (!userExists) {
      return await handleRegistrationFlow(phoneNumber, textArray, lastInput, language);
    }

    // 🔐 Login flow
    return await handleLoginFlow(phoneNumber, textArray, lastInput, language);

  } catch (error) {
    console.error('Error in USSD handler:', error);
    return 'END An error occurred. Please try again later.';
  }
}

/**
 * Handle language selection and switching
 */
async function handleLanguageSelection(phoneNumber, choice) {
  // Default to current language if selection fails
  const currentLang = await languageService.getUserLanguage(phoneNumber);
  
  // Map numeric choices to language codes
  let newLang = currentLang;
  
  switch (choice) {
    case '1':
      newLang = languageService.LANGUAGES.EN;
      break;
    case '2':
      newLang = languageService.LANGUAGES.SW;
      break;
    // Add more cases for additional languages
    // case '3':
    //   newLang = languageService.LANGUAGES.YO;
    //   break;
    default:
      // Invalid selection
      return `CON ${languageService.getTranslation('invalidOption', currentLang)}`;
  }
  
  // Update user's language preference
  const success = await languageService.setUserLanguage(phoneNumber, newLang);
  
  if (success) {
    return `CON ${languageService.getTranslation('languageChanged', newLang)}\n\n${languageService.getTranslation('back', newLang)}`;
  } else {
    return `CON ${languageService.getTranslation('error', currentLang)}\n\n${languageService.getTranslation('back', currentLang)}`;
  }
}
/**
 * Handle registration flow for new users
 */
async function handleRegistrationFlow(phoneNumber, textArray, lastInput, language) {
  const level = textArray.length;
  
  // First level - Language selection for new users
  if (level === 1) {
    const langChoice = lastInput;
    let selectedLang = 'en'; // default
    
    switch (langChoice) {
      case '1':
        selectedLang = languageService.LANGUAGES.EN;
        break;
      case '2':
        selectedLang = languageService.LANGUAGES.SW;
        break;
      // Add more languages as needed
      default:
        return `END ${languageService.getTranslation('invalidOption', 'en')}`;
    }
    
    // Store the selected language temporarily (we'll save it properly after registration)
    // Show account type selection in the selected language
    return `CON ${languageService.getTranslation('selectAccountType', selectedLang)}`;
  }
  
  // Second level - Account type selection (language is now textArray[0])
  else if (level === 2) {
    const selectedLang = getLanguageFromChoice(textArray[0]);
    const accountType = lastInput;
    
    if (accountType === '1') {
      // Regular user PIN creation
      return `CON ${languageService.getTranslation('createPin', selectedLang)}`;
    } else if (accountType === '2') {
      // Merchant PIN creation
      return `CON ${languageService.getTranslation('createPin', selectedLang)}`;
    } else {
      return `END ${languageService.getTranslation('invalidOption', selectedLang)}`;
    }
  }
  
  // Third level - PIN creation
  else if (level === 3) {
    const selectedLang = getLanguageFromChoice(textArray[0]);
    const accountType = textArray[1];
    const pin = lastInput;
    
    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
      return `END ${languageService.getTranslation('invalidPin', selectedLang)}`;
    }
    
    if (accountType === '1' || accountType === '2') {
      // PIN confirmation for both user types
      return `CON ${languageService.getTranslation('confirmPin', selectedLang)}`;
    }
  }
  
  // Fourth level - PIN confirmation
  else if (level === 4) {
    const selectedLang = getLanguageFromChoice(textArray[0]);
    const accountType = textArray[1];
    const pin = textArray[2];
    const confirmPin = lastInput;
    
    if (pin !== confirmPin) {
      return `END ${languageService.getTranslation('pinsDontMatch', selectedLang)}`;
    }
    
    if (accountType === '1') {
      // Regular user - Complete registration
      const result = await userService.registerRegularUser(phoneNumber, pin);
      // Set the selected language
      await languageService.setUserLanguage(phoneNumber, selectedLang);
      return `CON ${result.message}\n\n1. ${languageService.getTranslation('continue', selectedLang)}`;
    } else if (accountType === '2') {
      // Merchant - Enter business name
      return `CON ${languageService.getTranslation('enterBusinessName', selectedLang)}`;
    }
  }
  
  // Fifth level - Business name (merchants only) or Continue to menu (regular users)
  else if (level === 5) {
    const selectedLang = getLanguageFromChoice(textArray[0]);
    const accountType = textArray[1];
    
    if (accountType === '1' && lastInput === '1') {
      // User selected "Continue to menu" after registration
      return `CON ${languageService.getTranslation('regularUserMenu', selectedLang)}`;
    } else if (accountType === '2') {
      const pin = textArray[2];
      const businessName = lastInput;
      
      if (!businessName || businessName.trim() === '') {
        return `END ${languageService.getTranslation('emptyBusinessName', selectedLang)}`;
      }
      
      // Register merchant
      const result = await userService.registerMerchant(phoneNumber, pin, businessName);
      // Set the selected language
      await languageService.setUserLanguage(phoneNumber, selectedLang);
      
      if (result.success) {
        return `CON ${result.message}\n\n1. ${languageService.getTranslation('continue', selectedLang)}`;
      } else {
        return `END ${result.message}`;
      }
    }
  }
  
  // Sixth level - Continue to menu (merchants)
  else if (level === 6 && getLanguageFromChoice(textArray[0]) && textArray[1] === '2' && lastInput === '1') {
    const selectedLang = getLanguageFromChoice(textArray[0]);
    return `CON ${languageService.getTranslation('merchantMenu', selectedLang)}`;
  }
  
  const selectedLang = getLanguageFromChoice(textArray[0]) || 'en';
  return `END ${languageService.getTranslation('invalidOption', selectedLang)}`;
}

/**
 * Handle login flow for existing users
 */
async function handleLoginFlow(phoneNumber, textArray, lastInput, language) {
  const level = textArray.length;
  
  // First level - PIN verification
  if (level === 1) {
    const pin = lastInput;
    
    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
      return `END ${languageService.getTranslation('invalidPin', language)}`;
    }
    
    const isValid = await userService.validatePin(phoneNumber, pin);
    
    if (!isValid) {
      return `END ${languageService.getTranslation('invalidLogin', language) || 'Invalid PIN. Please try again.'}`;
    }
    
    // Get user details to determine account type
    const user = await userService.getUserByPhone(phoneNumber);
    
    if (!user) {
      return `END ${languageService.getTranslation('userNotFound', language)}`;
    }

    // Get the user's language preference
    const userLang = await languageService.getUserLanguage(phoneNumber);
    
    // Show appropriate menu based on account type
    if (user.account_type === 'regular') {
      return `CON ${languageService.getTranslation('loginSuccessful', userLang)}\n${languageService.getTranslation('regularUserMenu', userLang)}`;
    } else if (user.account_type === 'merchant') {
      return `CON ${languageService.getTranslation('loginSuccessful', userLang)}\n${languageService.getTranslation('merchantMenu', userLang)}`;
    } else {
      return `END ${languageService.getTranslation('error', userLang)}`;
    }
  }
  
  // Post-login menu for authenticated users
  if (level >= 2) {
    // Get user to determine account type
    const user = await userService.getUserByPhone(phoneNumber);
    
    if (!user) {
      return `END ${languageService.getTranslation('userNotFound', language)}`;
    }
    
    // Get the user's language preference for subsequent interactions
    const userLang = await languageService.getUserLanguage(phoneNumber);
    
    if (user.account_type === 'regular') {
      return await handleRegularUserMenu(phoneNumber, textArray, lastInput, user);
    } else if (user.account_type === 'merchant') {
      return await handleMerchantMenu(phoneNumber, textArray, lastInput, user);
    }
  }
  
  return `END ${languageService.getTranslation('invalidOption', language)}`;
}


/**
 * Handle menu options for regular users
 */
/**
 * Handle menu options for regular users
 */
async function handleRegularUserMenu(phoneNumber, textArray, lastInput, user) {
  const language = await languageService.getUserLanguage(phoneNumber);

  // When user selects "0" to go back to main menu, reset the navigation state
  // This handles the back to main menu function from any level
  if (textArray.length > 2 && lastInput === '0') {
    // Return to the main menu by preserving only the PIN
    const pin = textArray[0];
    return `CON ${languageService.getTranslation('regularUserMenu', language)}`;
  }

  // Special handler for direct merchant code entry
  if (textArray.length === 3 && textArray[0].match(/^\d{4}$/) && textArray[1] === '3') {
    // This matches pattern like "1111*3*BS881" - PIN + Pay Merchant + Merchant Code
    const merchantCode = textArray[2];  // The merchant code (BS881)
    
    // Validate merchant code exists
    try {
      const [merchantResult] = await db.query(
        `SELECT u.id, u.phone_number, u.business_name 
         FROM users AS u 
         WHERE u.merchant_code = ? 
           AND u.account_type = 'merchant'`,
        [merchantCode]
      );
      
      if (merchantResult.length === 0) {
        return `CON ${languageService.getTranslation('invalidMerchantCode', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      }
      
      const merchant = merchantResult[0];
      return `CON ${languageService.formatMenu('enterPaymentAmount', language, merchant.business_name)}\n\n0. ${languageService.getTranslation('back', language)}`;
    } catch (error) {
      console.error('Error validating merchant code:', error);
      return `CON ${languageService.getTranslation('error', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Handler for payment amount entry after direct merchant code
  else if (textArray.length === 4 && textArray[0].match(/^\d{4}$/) && textArray[1] === '3') {
    if (lastInput === '0') {
      return `CON ${languageService.getTranslation('regularUserMenu', language)}`;
    }
    
    const merchantCode = textArray[2];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    // Get merchant details for confirmation
    try {
      const [merchantResult] = await db.query(
        'SELECT business_name FROM users WHERE merchant_code = ?',
        [merchantCode]
      );
      
      const merchant = merchantResult[0];
      return `CON ${languageService.formatMenu('confirmPayment', language, amount, merchant.business_name)}\n\n0. ${languageService.getTranslation('back', language)}`;
    } catch (error) {
      console.error('Error getting merchant details:', error);
      return `CON ${languageService.getTranslation('error', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Main menu - second level
  if (textArray.length === 2) {
    const option = textArray[1];

    switch (option) {
      case '1':
        try {
          const walletData = await walletService.getOrCreateSmartWallet(phoneNumber);
          const usdcBalance = await walletService.checkUSDCBalance(walletData.account.address, walletData.publicClient);
          return `CON ${languageService.formatMenu('balance', language, usdcBalance.toFixed(6))}\n\n${languageService.formatMenu('backAndExit', language)}`;
        } catch (error) {
          console.error('Balance check error:', error);
          return `CON ${languageService.formatMenu('balanceError', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }

      case '2':
        return `CON ${languageService.getTranslation('sendUSDCOptions', language)}`;

      case '3':
        return `CON ${languageService.getTranslation('enterMerchantCode', language)}\n\n0. ${languageService.getTranslation('back', language)}`;

      case '4':
        try {
          const transactions = await walletService.getRecentTransactions(phoneNumber);
          if (!transactions.length) {
            return `CON ${languageService.getTranslation('noTransactions', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
          }
          let response = `CON ${languageService.getTranslation('recentTransactions', language)}`;
          transactions.forEach((tx, index) => {
            const date = new Date(tx.created_at).toLocaleDateString();
            response += `\n${index + 1}. ${tx.direction === 'sent' ? 'Sent' : 'Received'} ${Number(tx.amount).toFixed(2)} USDC - ${date}`;
          });
          return `${response}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        } catch (err) {
          console.error('Transactions error:', err);
          return `CON ${languageService.getTranslation('transactionError', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        }

      case '5':
        try {
          const walletData = await walletService.getOrCreateSmartWallet(phoneNumber);
          return `CON ${languageService.getTranslation('walletAddress', language)}:\n${walletData.account.address}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        } catch (err) {
          console.error('Wallet address error:', err);
          return `CON ${languageService.getTranslation('walletAddressError', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        }

      case '6': // Language settings
        return `CON ${languageService.getTranslation('selectLanguage', language)}\n${languageService.getLanguageMenu(language)}`;
      
      case '7': // Exit
        return `END ${languageService.getTranslation('goodbye', language)}`;

      default:
        return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Handle navigation from all other menu levels
  else if (textArray.length >= 3) {
    if (lastInput === '0') {
      // Go back to main menu when '0' is selected, preserving the PIN
      const pin = textArray[0];
      return `CON ${languageService.getTranslation('regularUserMenu', language)}`;
    } else if (lastInput === '9') {
      // Exit the application when '9' is selected
      return `END ${languageService.getTranslation('goodbye', language)}`;
    } 
    
    // Handle Send USDC flow 
    else if (textArray.length === 3 && textArray[1] === '2') {
      const sendOption = lastInput;
      
      if (sendOption === '1') {
        return `CON ${languageService.getTranslation('enterRecipientPhone', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      } 
      else if (sendOption === '2') {
        return `CON ${languageService.getTranslation('enterRecipientAddress', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      } 
      else {
        return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      }
    }
  }

  // Handle recipient phone entry for sending to Cryptofono user
  if (textArray.length === 4 && textArray[1] === '2' && textArray[2] === '1') {
    const recipientPhone = lastInput;
    
    // Validate the recipient exists
    try {
      const recipientUser = await userService.getUserByPhone(recipientPhone);
      
      if (!recipientUser) {
        return `CON ${languageService.getTranslation('userNotFound', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      }
      
      return `CON ${languageService.getTranslation('enterAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    } catch (error) {
      console.error('Error validating recipient:', error);
      return `CON ${languageService.getTranslation('error', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Handle recipient address entry for sending to external wallet
  else if (textArray.length === 4 && textArray[1] === '2' && textArray[2] === '2') {
    const recipientAddress = lastInput;
    
    // Validate the address format
    if (!isValidEthereumAddress(recipientAddress)) {
      return `CON ${languageService.getTranslation('invalidEthAddress', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    return `CON ${languageService.getTranslation('enterAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }
  
  // Handle amount entry for sending to Cryptofono user
  else if (textArray.length === 5 && textArray[1] === '2' && textArray[2] === '1') {
    const recipientPhone = textArray[3];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    // Show masked phone number for privacy
    const maskedPhone = recipientPhone.slice(-4).padStart(recipientPhone.length, '*');
    
    return `CON ${languageService.formatMenu('confirmSendUser', language, amount, maskedPhone)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }
  
  // Handle amount entry for sending to external wallet
  else if (textArray.length === 5 && textArray[1] === '2' && textArray[2] === '2') {
    const recipientAddress = textArray[3];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    // Show shortened address for better UX
    const shortAddress = `${recipientAddress.substring(0, 6)}...${recipientAddress.substring(38)}`;
    
    return `CON ${languageService.formatMenu('confirmSendExternal', language, amount, shortAddress)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }
  
  // Handle confirmation for sending to Cryptofono user
  else if (textArray.length === 6 && textArray[1] === '2' && textArray[2] === '1') {
    const recipientPhone = textArray[3];
    const amount = parseFloat(textArray[4]);
    const confirmation = lastInput;
    
    if (confirmation === '1') {
      try {
        // Get recipient's wallet address
        const recipientUser = await userService.getUserByPhone(recipientPhone);
        
        if (!recipientUser || !recipientUser.wallet_address) {
          // Create wallet for recipient if needed
          const recipientWalletData = await walletService.getOrCreateSmartWallet(recipientPhone);
          recipientUser.wallet_address = recipientWalletData.account.address;
        }
        
        // Send USDC
        const result = await walletService.sendUSDC(phoneNumber, recipientUser.wallet_address, amount);
        
        if (result.success) {
          // Record transaction details
          const [senderResult] = await db.query(
            'SELECT id FROM users WHERE phone_number = ?',
            [phoneNumber]
          );
          
          const [recipientResult] = await db.query(
            'SELECT id FROM users WHERE phone_number = ?',
            [recipientPhone]
          );
          
          if (senderResult.length > 0 && recipientResult.length > 0) {
            await db.query(
              'UPDATE transactions SET recipient_id = ?, transaction_type = ? WHERE tx_hash = ?',
              [recipientResult[0].id, 'p2p_transfer', result.txHash]
            );
          }
          
          const maskedPhone = recipientPhone.slice(-4).padStart(recipientPhone.length, '*');
          return `CON ${languageService.formatMenu('sendSuccess', language, amount, maskedPhone)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        } else {
          return `CON ${result.message}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        }
      } catch (error) {
        console.error('Error sending USDC to user:', error);
        return `CON ${languageService.getTranslation('transactionFailed', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
      }
    } else if (confirmation === '2') {
      return `CON ${languageService.getTranslation('cancelled', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Handle confirmation for sending to external wallet
  else if (textArray.length === 6 && textArray[1] === '2' && textArray[2] === '2') {
    const recipientAddress = textArray[3];
    const amount = parseFloat(textArray[4]);
    const confirmation = lastInput;
    
    if (confirmation === '1') {
      try {
        // Send USDC to external address
        const result = await walletService.sendUSDC(phoneNumber, recipientAddress, amount);
        
        if (result.success) {
          // Update transaction type
          await db.query(
            'UPDATE transactions SET transaction_type = ? WHERE tx_hash = ?',
            ['external_transfer', result.txHash]
          );
          
          const shortAddress = `${recipientAddress.substring(0, 6)}...${recipientAddress.substring(38)}`;
          return `CON ${languageService.formatMenu('sendSuccess', language, amount, shortAddress)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        } else {
          return `CON ${result.message}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        }
      } catch (error) {
        console.error('Error sending USDC to external address:', error);
        return `CON ${languageService.getTranslation('transactionFailed', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
      }
    } else if (confirmation === '2') {
      return `CON ${languageService.getTranslation('cancelled', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Handle language selection: textArray[1] === '6'
  else if (textArray.length === 3 && textArray[1] === '6') {
    const langChoice = lastInput;
    let newLang = language;

    switch (langChoice) {
      case '1':
        newLang = languageService.LANGUAGES.EN;
        break;
      case '2':
        newLang = languageService.LANGUAGES.SW;
        break;
      // Add more languages as needed
      case '0':
        return `CON ${languageService.getTranslation('regularUserMenu', language)}`;
      default:
        return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }

    // Update user's language preference
    const success = await languageService.setUserLanguage(phoneNumber, newLang);
    
    if (success) {
      return `CON ${languageService.getTranslation('languageChanged', newLang)}\n\n1. ${languageService.getTranslation('backToMenu', newLang)}\n9. ${languageService.getTranslation('exit', newLang)}`;
    } else {
      return `CON ${languageService.getTranslation('languageChangeError', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Handle after language change confirmation for regular users
  else if (textArray.length === 4 && textArray[1] === '6') {
    const userLang = await languageService.getUserLanguage(phoneNumber);
    if (lastInput === '1') {
      // Back to menu
      return `CON ${languageService.getTranslation('regularUserMenu', userLang)}`;
    } else if (lastInput === '9') {
      // Exit
      return `END ${languageService.getTranslation('goodbye', userLang)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', userLang)}\n\n0. ${languageService.getTranslation('back', userLang)}`;
    }
  }

  // Handle merchant code payment flow for regular users
  else if (textArray.length === 3 && textArray[1] === '3') {
    const merchantCode = lastInput;
    
    // Validate merchant code exists
    try {
      const [merchantResult] = await db.query(
        'SELECT id, phone_number, business_name FROM users WHERE merchant_code = ? AND account_type = "merchant"',
        [merchantCode]
      );
      
      if (merchantResult.length === 0) {
        return `CON ${languageService.getTranslation('invalidMerchantCode', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
      }
      
      const merchant = merchantResult[0];
      return `CON ${languageService.formatMenu('enterPaymentAmount', language, merchant.business_name)}\n\n0. ${languageService.getTranslation('back', language)}`;
    } catch (error) {
      console.error('Error validating merchant code:', error);
      return `CON ${languageService.getTranslation('error', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Handle payment amount entry
  else if (textArray.length === 4 && textArray[1] === '3') {
    const merchantCode = textArray[2];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    // Get merchant details for confirmation
    try {
      const [merchantResult] = await db.query(
        'SELECT business_name FROM users WHERE merchant_code = ?',
        [merchantCode]
      );
      
      const merchant = merchantResult[0];
      return `CON ${languageService.formatMenu('confirmPayment', language, amount, merchant.business_name)}\n\n0. ${languageService.getTranslation('back', language)}`;
    } catch (error) {
      console.error('Error getting merchant details:', error);
      return `CON ${languageService.getTranslation('error', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Handle payment confirmation
  else if (textArray.length === 5 && textArray[1] === '3') {
    const merchantCode = textArray[2];
    const amount = textArray[3];
    const confirmation = lastInput;
    
    if (confirmation === '1') {
      try {
        // Get merchant wallet address
        const [merchantResult] = await db.query(
          'SELECT id, phone_number, business_name FROM users WHERE merchant_code = ?',
          [merchantCode]
        );
        
        if (merchantResult.length === 0) {
          return `CON ${languageService.getTranslation('merchantNotFound', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
        }
        
        const merchant = merchantResult[0];
        
        // If merchant doesn't have wallet address, create one
        let merchantWalletAddress = merchant.wallet_address;
        if (!merchantWalletAddress) {
          const merchantWalletData = await walletService.getOrCreateSmartWallet(merchant.phone_number);
          merchantWalletAddress = merchantWalletData.account.address;
        }
        
        // Send USDC to merchant
        const result = await walletService.sendUSDC(phoneNumber, merchantWalletAddress, amount);
        
        if (result.success) {
          // Record payment in database
          const [senderResult] = await db.query(
            'SELECT id FROM users WHERE phone_number = ?',
            [phoneNumber]
          );
          
          const [recipientResult] = await db.query(
            'SELECT id FROM users WHERE merchant_code = ?',
            [merchantCode]
          );
          
          if (senderResult.length > 0 && recipientResult.length > 0) {
            // Update transaction with merchant payment details
            await db.query(
              'UPDATE transactions SET recipient_id = ?, transaction_type = ?, merchant_code = ? WHERE tx_hash = ?',
              [recipientResult[0].id, 'merchant_payment', merchantCode, result.txHash]
            );
          }
          
          return `CON ${languageService.formatMenu('paymentSuccess', language, amount, merchant.business_name)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        } else {
          return `CON ${result.message}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
        }
      } catch (error) {
        console.error('Error processing merchant payment:', error);
        return `CON ${languageService.getTranslation('paymentFailed', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
      }
    } else if (confirmation === '2') {
      return `CON ${languageService.getTranslation('paymentCancelled', language)}\n\n0. ${languageService.getTranslation('back', language)}\n9. ${languageService.getTranslation('exit', language)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }

  // Special handler for PIN + language selection
  if (textArray.length === 3 && textArray[0].match(/^\d{4}$/) && textArray[1] === '6') {
    const langChoice = textArray[2];
    let newLang = language;

    switch (langChoice) {
      case '1':
        newLang = languageService.LANGUAGES.EN;
        break;
      case '2':
        newLang = languageService.LANGUAGES.SW;
        break;
      // Add more languages as needed
      case '0':
        return `CON ${languageService.getTranslation('regularUserMenu', language)}`;
      default:
        return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }

    // Update user's language preference
    const success = await languageService.setUserLanguage(phoneNumber, newLang);
    
    if (success) {
      return `CON ${languageService.getTranslation('languageChanged', newLang)}\n\n1. ${languageService.getTranslation('backToMenu', newLang)}\n9. ${languageService.getTranslation('exit', newLang)}`;
    } else {
      return `CON ${languageService.getTranslation('languageChangeError', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Fallback for all other cases
  return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
}


/**
 * Handle menu options for merchant users
 */
async function handleMerchantMenu(phoneNumber, textArray, lastInput, user) {
  const language = await languageService.getUserLanguage(phoneNumber);

  // Second level menu selection
  if (textArray.length === 2) {
    const option = textArray[1];
    
    // Check Balance
    if (option === '1') {
      try {
        const walletData = await walletService.getOrCreateSmartWallet(phoneNumber);
        const usdcBalance = await walletService.checkUSDCBalance(walletData.account.address, walletData.publicClient);
        
        return `CON ${languageService.formatMenu('balance', language, usdcBalance.toFixed(6))}\n\n${languageService.formatMenu('backAndExit', language)}`;
      } catch (error) {
        console.error('Error checking balance:', error);
        return `CON ${languageService.formatMenu('balanceError', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    }
    
    // View Payments
    else if (option === '2') {
      try {
        const payments = await walletService.getMerchantPayments(phoneNumber);
        
        if (payments.length === 0) {
          return `CON ${languageService.getTranslation('noPayments', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }
        
        let response = `CON ${languageService.getTranslation('paymentsHeader', language)}`;
        payments.forEach((payment, index) => {
          const amount = Number(payment.amount).toFixed(2);  // Ensure it's treated as a number
          const date = new Date(payment.created_at).toLocaleDateString();
          const phone = payment.customer_phone.slice(-4); // Show last 4 digits
          
          response += `\n${index + 1}. ${languageService.formatMenu('receivedPayment', language, amount, phone, date)}`;
        });
        
        response += `\n\n${languageService.formatMenu('backAndExit', language)}`;
        return response;
      } catch (error) {
        console.error('Error retrieving payments:', error);
        return `CON ${languageService.getTranslation('error', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    }
    
    // Withdraw
    else if (option === '3') {
      return `CON ${languageService.getTranslation('withdrawOptions', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
    
    // Share Merchant Code
    else if (option === '4') {
      return `CON ${languageService.formatMenu('merchantCode', language, user.merchant_code)}\n\n${languageService.formatMenu('backAndExit', language)}`;
    }
    
    // My Wallet Address
    else if (option === '5') {
      try {
        const walletData = await walletService.getOrCreateSmartWallet(phoneNumber);
        const walletAddress = walletData.account.address;
        
        return `CON ${languageService.formatMenu('walletAddress', language, walletAddress)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      } catch (error) {
        console.error('Error retrieving wallet address:', error);
        return `CON ${languageService.getTranslation('walletAddressError', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    }
    
    // View Withdrawals
    else if (option === '6') {
      try {
        const withdrawals = await walletService.getMerchantWithdrawals(phoneNumber);
        
        if (withdrawals.length === 0) {
          return `CON ${languageService.getTranslation('noWithdrawals', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }
        
        let response = `CON ${languageService.getTranslation('withdrawalsHeader', language)}`;
        withdrawals.forEach((withdrawal, index) => {
          const amount = Number(withdrawal.amount).toFixed(2);
          const date = new Date(withdrawal.created_at).toLocaleDateString();
          const shortAddress = `${withdrawal.recipient_address.substring(0, 6)}...${withdrawal.recipient_address.substring(38)}`;
          
          response += `\n${index + 1}. ${languageService.getTranslation('sent', language)} ${amount} USDC ${languageService.getTranslation('to', language)} ${shortAddress} - ${date}`;
        });
        
        response += `\n\n${languageService.formatMenu('backAndExit', language)}`;
        return response;
      } catch (error) {
        console.error('Error retrieving withdrawals:', error);
        return `CON ${languageService.getTranslation('error', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    }
    
    // Language settings
    else if (option === '7') {
      return `CON ${languageService.getTranslation('selectLanguage', language)}\n${languageService.getLanguageMenu(language)}`
    }
    
    // Exit
    else if (option === '8' || option === '9') {
      return `END ${languageService.getTranslation('goodbye', language)}`;
    }
    
    // Back to Main Menu
    else if (option === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    }
    
    else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
  }
  
  // Handle language selection: textArray[1] === '7'
// And update the language selection handling for merchants:
else if (textArray.length === 3 && textArray[1] === '7') {
  const langChoice = lastInput;
  let newLang = language;

  switch (langChoice) {
    case '1':
      newLang = languageService.LANGUAGES.EN;
      break;
    case '2':
      newLang = languageService.LANGUAGES.SW;
      break;
    // Add more languages as needed
    case '0':
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    default:
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }

  // Update user's language preference
  const success = await languageService.setUserLanguage(phoneNumber, newLang);
  
  if (success) {
    return `CON ${languageService.getTranslation('languageChanged', newLang)}\n\n1. ${languageService.getTranslation('backToMenu', newLang)}\n9. ${languageService.getTranslation('exit', newLang)}`;
  } else {
    return `CON ${languageService.getTranslation('languageChangeError', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }
}  
// 7. Add handling for after language change confirmation for merchants
// Add this in the merchant menu function before the navigation options handling:
else if (textArray.length === 4 && textArray[1] === '7') {
  const userLang = await languageService.getUserLanguage(phoneNumber);
  if (lastInput === '1') {
    // Back to menu
    return `CON ${languageService.getTranslation('merchantMenu', userLang)}`;
  } else if (lastInput === '9') {
    // Exit
    return `END ${languageService.getTranslation('goodbye', userLang)}`;
  } else {
    return `CON ${languageService.getTranslation('invalidOption', userLang)}\n\n0. ${languageService.getTranslation('back', userLang)}`;
  }
}

  // Navigation options
 // Navigation options
if (textArray.length === 3) {
  const menuOption = textArray[1];
  const navigationOption = lastInput;
  
  // Back to Main Menu (works for all menu options)
  if (navigationOption === '0') {
    return `CON ${languageService.getTranslation('merchantMenu', language)}`;
  }
  
  // Exit (works for all menu options)
  else if (navigationOption === '9') {
    return `END ${languageService.getTranslation('goodbye', language)}`;
  }
  
  // For Withdraw flow (option 3) - Choose recipient type
  else if (menuOption === '3') {
    const recipientType = lastInput;
    
    // Withdraw to Cryptofono User
    if (recipientType === '1') {
      return `CON ${languageService.getTranslation('recipientPhone', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    // Withdraw to External Wallet
    else if (recipientType === '2') {
      return `CON ${languageService.getTranslation('enterWithdrawalAddress', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
    
    else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
    }
  }
  
  // For all other menu options (1,2,4,5,6) - handle navigation
  else {
    return `CON ${languageService.getTranslation('invalidOption', language)}\n\n0. ${languageService.getTranslation('back', language)}`;
  }
}
  
  // For Withdraw flow - Enter phone number for Cryptofono user
  else if (textArray.length === 4 && textArray[1] === '3' && textArray[2] === '1') {
    const navigationOption = lastInput;
    
    // Back to Main Menu
    if (navigationOption === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    }
    
    const recipientPhone = lastInput;
    
    // Validate phone number and check if user exists
    const recipientUser = await userService.getUserByPhone(recipientPhone);
    
    if (!recipientUser) {
      return `CON ${languageService.getTranslation('userNotFound', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
    
    return `CON ${languageService.getTranslation('enterAmount', language)}\n\n${languageService.getTranslation('back', language)}`;
  }
  
  // For Withdraw flow to external wallet - Enter address
  else if (textArray.length === 4 && textArray[1] === '3' && textArray[2] === '2') {
    const navigationOption = lastInput;
    
    // Back to Main Menu
    if (navigationOption === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    }
    
    const withdrawalAddress = lastInput;
    
    if (!isValidEthereumAddress(withdrawalAddress)) {
      return `CON ${languageService.getTranslation('invalidEthAddress', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
    
    return `CON ${languageService.getTranslation('enterAmount', language)}\n\n${languageService.getTranslation('back', language)}`;
  }
  
  // For Withdraw flow to Cryptofono user - Enter amount
  else if (textArray.length === 5 && textArray[1] === '3' && textArray[2] === '1') {
    const navigationOption = lastInput;
    
    // Back to Main Menu
    if (navigationOption === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    }
    
    const recipientPhone = textArray[3];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
    
    // Get recipient user details for confirmation
    const recipientUser = await userService.getUserByPhone(recipientPhone);
    
    // Show masked phone number for privacy
    const maskedPhone = '*'.repeat(recipientPhone.length - 4) + recipientPhone.slice(-4);
    
    return `CON ${languageService.formatMenu('confirmWithdrawUser', language, amount, maskedPhone)}\n\n${languageService.getTranslation('back', language)}`;
  }
  
  // For Withdraw flow to external wallet - Enter amount
  else if (textArray.length === 5 && textArray[1] === '3' && textArray[2] === '2') {
    const navigationOption = lastInput;
    
    // Back to Main Menu
    if (navigationOption === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    }
    
    const withdrawalAddress = textArray[3];
    const amount = parseFloat(lastInput);
    
    if (isNaN(amount) || amount <= 0) {
      return `CON ${languageService.getTranslation('invalidAmount', language)}\n\n${languageService.getTranslation('back', language)}`;
    }
    
    return `CON ${languageService.formatMenu('confirmWithdrawExternal', language, amount, withdrawalAddress)}\n\n${languageService.getTranslation('back', language)}`;
  }
  
  // For Withdraw flow to Cryptofono user - Confirmation
  else if (textArray.length === 6 && textArray[1] === '3' && textArray[2] === '1') {
    const recipientPhone = textArray[3];
    const amount = textArray[4];
    const confirmation = lastInput;
    
    if (confirmation === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    } else if (confirmation === '1') {
      try {
        // Get recipient user details and wallet address
        const recipientUser = await userService.getUserByPhone(recipientPhone);
        
        if (!recipientUser || !recipientUser.wallet_address) {
          return `CON ${languageService.getTranslation('userNotFound', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }
        
        // Send USDC to the recipient's wallet address
        const result = await walletService.sendUSDC(phoneNumber, recipientUser.wallet_address, amount);
        
        if (result.success) {
          // Update transaction record to include recipient_id for proper tracking
          const [senderResult] = await db.query(
            'SELECT id FROM users WHERE phone_number = ?',
            [phoneNumber]
          );
          
          const [recipientResult] = await db.query(
            'SELECT id FROM users WHERE phone_number = ?',
            [recipientPhone]
          );
          
          if (senderResult.length > 0 && recipientResult.length > 0) {
            // Update the transaction to include recipient_id
            await db.query(
              'UPDATE transactions SET recipient_id = ? WHERE tx_hash = ?',
              [recipientResult[0].id, result.txHash]
            );
          }
          
          // Update transaction type to 'withdraw'
          await db.query(
            'UPDATE transactions SET transaction_type = ? WHERE tx_hash = ?',
            ['withdraw', result.txHash]
          );
          
          // Show masked phone number for privacy
          const maskedPhone = '*'.repeat(recipientPhone.length - 4) + recipientPhone.slice(-4);
          return `CON ${languageService.formatMenu('sendSuccess', language, amount, maskedPhone)}\n\n${languageService.formatMenu('backAndExit', language)}`;
        } else {
          return `CON ${result.message}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }
      } catch (error) {
        console.error('Error withdrawing USDC to Cryptofono user:', error);
        return `CON ${languageService.getTranslation('withdrawalFailed', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    } else if (confirmation === '2') {
      return `CON ${languageService.getTranslation('withdrawalCancelled', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
    }
  }
  
  // For Withdraw flow to external wallet - Confirmation
  else if (textArray.length === 6 && textArray[1] === '3' && textArray[2] === '2') {
    const withdrawalAddress = textArray[3];
    const amount = textArray[4];
    const confirmation = lastInput;
    
    if (confirmation === '0') {
      return `CON ${languageService.getTranslation('merchantMenu', language)}`;
    } else if (confirmation === '1') {
      try {
        const result = await walletService.sendUSDC(phoneNumber, withdrawalAddress, amount);
        
        if (result.success) {
          // Update transaction type to 'withdraw'
          await db.query(
            'UPDATE transactions SET transaction_type = ? WHERE tx_hash = ?',
            ['withdraw', result.txHash]
          );
          
          return `CON ${result.message}\n\n${languageService.formatMenu('backAndExit', language)}`;
        } else {
          return `CON ${result.message}\n\n${languageService.formatMenu('backAndExit', language)}`;
        }
      } catch (error) {
        console.error('Error withdrawing USDC to external wallet:', error);
        return `CON ${languageService.getTranslation('withdrawalFailed', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
      }
    } else if (confirmation === '2') {
      return `CON ${languageService.getTranslation('withdrawalCancelled', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', language)}\n\n${languageService.formatMenu('backAndExit', language)}`;
    }
  }
  
  return `CON ${languageService.getTranslation('invalidOption', language)}\n\n${languageService.getTranslation('back', language)}`;
}

function getLanguageFromChoice(choice) {
  switch (choice) {
    case '1':
      return languageService.LANGUAGES.EN;
    case '2':
      return languageService.LANGUAGES.SW;
    // Add more cases for additional languages
    default:
      return languageService.LANGUAGES.EN; // default to English
  }
}
module.exports = {
  handleUssdRequest
};