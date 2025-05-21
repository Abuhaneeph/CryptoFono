/**
 * Generate language selection menu
 * @param {string} currentLanguage - User's current language
 * @returns {string} - Language menu text
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

/**
 * Handle language selection flow
 */
async function handleLanguageSettings(phoneNumber, textArray, lastInput, user) {
  // First level of language settings
  if (textArray.length === 3 && textArray[1] === '6') { // '6' is the menu option for language settings
    const action = lastInput;
    
    // Back to main menu
    if (action === '0') {
      const menuTranslation = user.account_type === 'regular' ? 'regularUserMenu' : 'merchantMenu';
      const language = await languageService.getUserLanguage(phoneNumber);
      return `CON ${languageService.formatMenu(menuTranslation, language)}`;
    }
    
    // Get current user language
    const currentLanguage = await languageService.getUserLanguage(phoneNumber);
    
    // User selected a language option
    const languageCodes = Object.values(languageService.LANGUAGES);
    const selectedIndex = parseInt(action) - 1;
    
    if (selectedIndex >= 0 && selectedIndex < languageCodes.length) {
      const newLanguage = languageCodes[selectedIndex];
      
      // Set the new language
      await languageService.setUserLanguage(phoneNumber, newLanguage);
      
      // Confirm language change in the new language
      return `CON ${languageService.getTranslation('languageChanged', newLanguage)}\n\n0. ${languageService.getTranslation('back', newLanguage)}`;
    } else {
      return `CON ${languageService.getTranslation('invalidOption', currentLanguage)}\n\n0. ${languageService.getTranslation('back', currentLanguage)}`;
    }
  }
  
  // Show language menu
  const currentLanguage = await languageService.getUserLanguage(phoneNumber);
  return getLanguageMenu(currentLanguage);
}

/**
 * Get translation text for a specific key in the user's preferred language
 * @param {string} key - The translation key
 * @param {string} language - The language code
 * @param {Array|Object} params - Parameters for string formatting (array or named object)
 * @returns {string} - The translated text
 */
/**
 * Get translation text for a specific key in the user's preferred language
 * @param {string} key - The translation key
 * @param {string} language - The language code
 * @param {Array|Object} params - Parameters for string formatting (array or named object)
 * @returns {string} - The translated text
 */
function getTranslation(key, language, params = null) {
  // Default to English if language is not supported
  if (!translations[language]) {
    language = LANGUAGES.EN;
  }
  
  // Get the translation text
  let text = translations[language][key] || translations[LANGUAGES.EN][key] || key;
  
  // Handle array parameters
  if (Array.isArray(params)) {
    params.forEach((param, index) => {
      text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
    });
  }
  // Handle object parameters
  else if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    });
  }
  
  return text;
}

module.exports = {
 handleLanguageSettings,
    getLanguageMenu,
    getTranslation

};