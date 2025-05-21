// Language support for Cryptofono
const db = require('../config/database');
const en = require('./languages/lang.en');
const sw = require('./languages/lang.sw');
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
  [LANGUAGES.EN]: en,
  
  // Swahili translations
  [LANGUAGES.SW]: sw
};


/**
 * Language data structure with display information
 */
const LANGUAGE_INFO = {
  [LANGUAGES.EN]: { name: 'English', nativeName: 'English' },
  [LANGUAGES.SW]: { name: 'Swahili', nativeName: 'Kiswahili' },
  // [LANGUAGES.YO]: { name: 'Yoruba', nativeName: 'Yorùbá' },
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

/**
 * Get language selection menu text
 * @param {string} currentLanguage - The user's current language
 * @returns {string} - The language selection menu text
 */
function getLanguageMenu(currentLanguage) {
  let menu = 'CON Language Settings / Mipangilio ya Lugha:\n';
  
  // Display all available languages with selection number
  Object.entries(LANGUAGE_INFO).forEach(([code, info], index) => {
    const isCurrent = code === currentLanguage ? '✓ ' : '';
    menu += `${index + 1}. ${isCurrent}${info.name} (${info.nativeName})\n`;
  });
  
  menu += '\n0. Back to Main Menu';
  return menu;
}
module.exports = {
  LANGUAGES,
  getUserLanguage,
  setUserLanguage,
  getTranslation,
  formatMenu,
  shouldShowLanguageMenu,
  LANGUAGE_INFO,
  getLanguageMenu
};