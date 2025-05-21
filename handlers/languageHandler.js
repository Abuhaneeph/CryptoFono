// Language support for Cryptofono
const db = require('../config/database');

/**
 * Available languages
 */
const LANGUAGES = {
  EN: 'en', // English
  SW: 'sw'  // Swahili
  // More languages can be added here in the future
  // YO: 'yo', // Yoruba
};

/**
 * Language translation maps for all UI text
 */
const translations = {
  // English translations
  [LANGUAGES.EN]: {
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
    regularUserMenu: 'Main Menu:\n1. Check Balance\n2. Send USDC\n3. Pay a Merchant\n4. View Transactions\n5. My Wallet Address\n6. Exit',
    merchantMenu: 'Main Menu:\n1. Check Balance\n2. View Payments\n3. Withdraw\n4. Share Merchant Code\n5. My Wallet Address\n6. View Withdrawals\n7. Exit',
    
    // Common navigation
    back: '0. Back to Main Menu',
    exit: '9. Exit',
    backAndExit: '0. Back to Main Menu\n9. Exit',
    loginSuccessful: 'Login successful!',
    
    // Balance
    balance: 'Your USDC Balance: {0} USDC',
    balanceError: 'Could not retrieve balance. Please try again later.',
    
    // Send money
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
    
    // Pay merchant
    enterMerchantCode: 'Enter merchant code:',
    invalidMerchantCode: 'Invalid merchant code. Please check and try again.',
    payToMerchant: 'Pay to: {0}\nEnter amount (USDC):',
    confirmPayMerchant: 'Pay {0} USDC to {1}?\n\n1. Confirm\n2. Cancel',
    paymentCancelled: 'Payment cancelled.',
    
    // Transactions
    noTransactions: 'No recent transactions found.',
    transactionsHeader: 'Recent Transactions:',
    sent: 'Sent',
    received: 'Received',
    
    // Wallet
    walletAddress: 'Your Wallet Address:\n{0}',
    walletAddressError: 'Could not retrieve wallet address. Please try again later.',
    
    // Merchant specific
    noPayments: 'No recent payments found.',
    paymentsHeader: 'Recent Payments:',
    receivedPayment: 'Received {0} USDC from ***{1} - {2}',
    merchantCode: 'Your Merchant Code is: {0}\n\nShare this code with customers for payments.',
    withdrawOptions: 'Withdraw to:\n1. Cryptofono User\n2. External Wallet Address',
    enterWithdrawalAddress: 'Enter withdrawal address:',
    confirmWithdrawUser: 'Withdraw {0} USDC to Cryptofono user {1}?\n\n1. Confirm\n2. Cancel',
    confirmWithdrawExternal: 'Withdraw {0} USDC to:\n{1}\n\n1. Confirm\n2. Cancel',
    withdrawalCancelled: 'Withdrawal cancelled.',
    noWithdrawals: 'No withdrawal history found.',
    withdrawalsHeader: 'Recent Withdrawals:',
    
    // Language
    languageMenu: 'Choose your language / Chagua lugha yako:\n1. English\n2. Swahili',
    languageChanged: 'Language set to English',
    
    // Errors and general messages
    error: 'An error occurred. Please try again later.',
    goodbye: 'Thank you for using Cryptofono. Goodbye!',
    invalidOption: 'Invalid option. Please try again.',
    transactionFailed: 'Failed to send USDC. Please try again later.',
    withdrawalFailed: 'Failed to withdraw USDC. Please try again later.',
    paymentFailed: 'Failed to pay merchant. Please try again later.',
  },
  
  // Swahili translations
  [LANGUAGES.SW]: {
    // Welcome screens
    welcomeBack: 'Karibu tena kwenye Cryptofono 💸\nIngiza PIN yako ya tarakimu 4:',
    welcomeNew: 'Karibu kwenye Cryptofono 💸\nTutengeneze akaunti yako!\nChagua Aina ya Akaunti:\n1. Mtumiaji wa Kawaida\n2. Mfanyabiashara',
    
    // Registration flow
    createPin: 'Tengeneza PIN ya tarakimu 4:',
    confirmPin: 'Thibitisha PIN:',
    pinsDontMatch: 'PIN hazifanani. Tafadhali jaribu tena.',
    invalidPin: 'PIN lazima iwe tarakimu 4 hasa. Tafadhali jaribu tena.',
    enterBusinessName: 'Ingiza Jina la Biashara:',
    emptyBusinessName: 'Jina la biashara haliruhusiwi kuwa tupu. Tafadhali jaribu tena.',
    
    // Main menus
    regularUserMenu: 'Menyu Kuu:\n1. Angalia Salio\n2. Tuma USDC\n3. Lipia Mfanyabiashara\n4. Angalia Miamala\n5. Anwani ya Mkoba Wangu\n6. Ondoka',
    merchantMenu: 'Menyu Kuu:\n1. Angalia Salio\n2. Angalia Malipo\n3. Toa Pesa\n4. Shiriki Msimbo wa Mfanyabiashara\n5. Anwani ya Mkoba Wangu\n6. Angalia Miamala ya Kutoa\n7. Ondoka',
    
    // Common navigation
    back: '0. Rudi kwenye Menyu Kuu',
    exit: '9. Ondoka',
    backAndExit: '0. Rudi kwenye Menyu Kuu\n9. Ondoka',
    loginSuccessful: 'Umeingia kikamilifu!',
    
    // Balance
    balance: 'Salio lako la USDC: {0} USDC',
    balanceError: 'Haiwezekani kupata salio. Tafadhali jaribu tena baadaye.',
    
    // Send money
    sendOptions: 'Tuma USDC kwa:\n1. Mtumiaji wa Cryptofono\n2. Anwani ya Mkoba wa Nje',
    recipientPhone: 'Ingiza nambari ya simu ya mpokeaji:',
    recipientAddress: 'Ingiza anwani ya mpokeaji:',
    invalidEthAddress: 'Anwani ya Ethereum si sahihi. Tafadhali jaribu tena.',
    userNotFound: 'Mtumiaji wa Cryptofono hajapatikana. Tafadhali hakikisha nambari na ujaribu tena.',
    enterAmount: 'Ingiza kiasi cha kutuma (USDC):',
    invalidAmount: 'Kiasi si sahihi. Tafadhali ingiza nambari chanya.',
    confirmSendUser: 'Tuma {0} USDC kwa mtumiaji wa Cryptofono {1}?\n\n1. Thibitisha\n2. Ghairi',
    confirmSendExternal: 'Tuma {0} USDC kwa anwani ya nje:\n{1}\n\n1. Thibitisha\n2. Ghairi',
    sendSuccess: 'Umetuma {0} USDC kwa mtumiaji wa Cryptofono {1} kwa mafanikio',
    cancelled: 'Muamala umeghairiwa.',
    
    // Pay merchant
    enterMerchantCode: 'Ingiza msimbo wa mfanyabiashara:',
    invalidMerchantCode: 'Msimbo wa mfanyabiashara si sahihi. Tafadhali angalia na ujaribu tena.',
    payToMerchant: 'Lipa kwa: {0}\nIngiza kiasi (USDC):',
    confirmPayMerchant: 'Lipa {0} USDC kwa {1}?\n\n1. Thibitisha\n2. Ghairi',
    paymentCancelled: 'Malipo yameghairiwa.',
    
    // Transactions
    noTransactions: 'Hakuna miamala ya hivi karibuni iliyopatikana.',
    transactionsHeader: 'Miamala ya Hivi Karibuni:',
    sent: 'Ulituma',
    received: 'Ulipokea',
    
    // Wallet
    walletAddress: 'Anwani ya Mkoba Wako:\n{0}',
    walletAddressError: 'Haiwezekani kupata anwani ya mkoba. Tafadhali jaribu tena baadaye.',
    
    // Merchant specific
    noPayments: 'Hakuna malipo ya hivi karibuni yaliyopatikana.',
    paymentsHeader: 'Malipo ya Hivi Karibuni:',
    receivedPayment: 'Ulipokea {0} USDC kutoka ***{1} - {2}',
    merchantCode: 'Msimbo wako wa Mfanyabiashara ni: {0}\n\nShiriki msimbo huu na wateja kwa malipo.',
    withdrawOptions: 'Toa kwa:\n1. Mtumiaji wa Cryptofono\n2. Anwani ya Mkoba wa Nje',
    enterWithdrawalAddress: 'Ingiza anwani ya kutoa:',
    confirmWithdrawUser: 'Toa {0} USDC kwa mtumiaji wa Cryptofono {1}?\n\n1. Thibitisha\n2. Ghairi',
    confirmWithdrawExternal: 'Toa {0} USDC kwa:\n{1}\n\n1. Thibitisha\n2. Ghairi',
    withdrawalCancelled: 'Kutoa pesa kumeghairiwa.',
    noWithdrawals: 'Hakuna historia ya kutoa pesa iliyopatikana.',
    withdrawalsHeader: 'Kutoa Pesa kwa Hivi Karibuni:',
    
    // Language
    languageMenu: 'Choose your language / Chagua lugha yako:\n1. English\n2. Swahili',
    languageChanged: 'Lugha imewekwa kuwa Kiswahili',
    
    // Errors and general messages
    error: 'Hitilafu imetokea. Tafadhali jaribu tena baadaye.',
    goodbye: 'Asante kwa kutumia Cryptofono. Kwaheri!',
    invalidOption: 'Chaguo si sahihi. Tafadhali jaribu tena.',
    transactionFailed: 'Imeshindwa kutuma USDC. Tafadhali jaribu tena baadaye.',
    withdrawalFailed: 'Imeshindwa kutoa USDC. Tafadhali jaribu tena baadaye.',
    paymentFailed: 'Imeshindwa kulipia mfanyabiashara. Tafadhali jaribu tena baadaye.',
  }
};

/**
 * Get user's preferred language
 * @param {string} phoneNumber - The user's phone number
 * @returns {Promise<string>} - The user's language preference code
 */
async function getUserLanguage(phoneNumber) {
  try {
    // Query the database for the user's language preference
    const [rows] = await db.query(
      'SELECT language FROM users WHERE phone_number = ?',
      [phoneNumber]
    );
    
    // If user exists and has a language preference, return it
    if (rows.length > 0 && rows[0].language) {
      return rows[0].language;
    }
    
    // Default to English if not found or not set
    return LANGUAGES.EN;
  } catch (error) {
    console.error('Error getting user language:', error);
    // Default to English on error
    return LANGUAGES.EN;
  }
}

/**
 * Set user's preferred language
 * @param {string} phoneNumber - The user's phone number
 * @param {string} language - The language code to set
 * @returns {Promise<boolean>} - Success status
 */
async function setUserLanguage(phoneNumber, language) {
  try {
    // Check if language is valid
    if (!Object.values(LANGUAGES).includes(language)) {
      return false;
    }
    
    // Update the user's language preference
    await db.query(
      'UPDATE users SET language = ? WHERE phone_number = ?',
      [language, phoneNumber]
    );
    
    return true;
  } catch (error) {
    console.error('Error setting user language:', error);
    return false;
  }
}

/**
 * Get translation text for a specific key in the user's preferred language
 * @param {string} key - The translation key
 * @param {string} language - The language code
 * @param {Array} params - Optional parameters for string formatting
 * @returns {string} - The translated text
 */
function getTranslation(key, language, ...params) {
  // Default to English if language is not supported
  if (!translations[language]) {
    language = LANGUAGES.EN;
  }
  
  // Get the translation text
  let text = translations[language][key] || translations[LANGUAGES.EN][key] || key;
  
  // Replace parameters in the text (like {0}, {1}, etc.)
  if (params && params.length > 0) {
    params.forEach((param, index) => {
      text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
    });
  }
  
  return text;
}

/**
 * Format a menu string based on language
 * @param {string} translationKey - The translation key for the menu text
 * @param {string} language - The language code
 * @param {Array} params - Optional parameters for string formatting
 * @returns {string} - The formatted menu text
 */
function formatMenu(translationKey, language, ...params) {
  return getTranslation(translationKey, language, ...params);
}

/**
 * Check if we need to show the language menu
 * @param {string} text - The USSD text input
 * @returns {boolean} - Whether to show the language menu
 */
function shouldShowLanguageMenu(text) {
  // Show language menu if text is '00' (reserved command for language menu)
  return text === '00';
}

module.exports = {
  LANGUAGES,
  getUserLanguage,
  setUserLanguage,
  getTranslation,
  formatMenu,
  shouldShowLanguageMenu
};