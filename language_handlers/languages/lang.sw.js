const { insufficient_balance } = require("./lang.en");

module.exports={

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
    regularUserMenu: 'Menyu Kuu:\n1. Angalia Salio\n2. Tuma USDC\n3. Lipa Mfanyabiashara\n4. Ona Miamala\n5. Anwani ya Wallet\n6. Mipangilio ya Lugha\n7. Toka',    
    
    // Common navigation
    back: 'Rudi kwenye Menyu Kuu',
    exit: 'Toka',
    backAndExit: '0. Rudi kwenye Menyu Kuu\n9. Toka',
    loginSuccessful: 'Umeingia kikamilifu!',
    
    // Balance
    balance: 'Salio lako la USDC: {0} USDC',
    balanceError: 'Haiwezekani kupata salio. Tafadhali jaribu tena baadaye.',
    
    // Send money
    sendUSDCOptions: 'Tuma USDC kwa:\n1. Mtumiaji wa Cryptofono\n2. Anwani ya Mkoba wa Nje\n\n0. Rudi',
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
   insufficient_balance: 'Salio la USDC halitoshi kwenye ${NETWORK}. Una ${usdcBalance} USDC. Unahitaji angalau ${requiredAmount} USDC (ikiwa ni pamoja na ada).',
     transfer_success: "Imetumwa kwa mafanikio ${amount} USDC kwa ${recipientAddress} kupitia ${NETWORK}",
    // Pay merchant - UPDATED SECTION
    enterMerchantCode: 'Ingiza msimbo wa mfanyabiashara:',
    invalidMerchantCode: 'Msimbo wa mfanyabiashara si sahihi. Tafadhali hakikisha na ujaribu tena.',
    enterPaymentAmount: 'Ingiza kiasi cha kumlipa {0} (USDC):',
    confirmPayment: 'Lipa {0} USDC kwa {1}?\n\n1. Thibitisha\n2. Ghairi',
    merchantNotFound: 'Mfanyabiashara hajapatikana.',
    paymentSuccess: 'Malipo ya {0} USDC yametumwa kwa mafanikio kwa {1}!',
    payToMerchant: 'Lipa kwa: {0}\nIngiza kiasi (USDC):',
    confirmPayMerchant: 'Lipa {0} USDC kwa {1}?\n\n1. Thibitisha\n2. Ghairi',
    paymentCancelled: 'Malipo yameghairiwa.',
    paymentFailed: 'Malipo yameshindwa. Tafadhali jaribu tena.',
    
    // Transactions
    noTransactions: 'Hakuna miamala ya hivi karibuni iliyopatikana.',
    recentTransactions: 'Miamala ya Hivi Karibuni:',
    transactionsHeader: 'Miamala ya Hivi Karibuni:',
    transactionError: 'Haiwezekani kupata miamala. Tafadhali jaribu tena baadaye.',
    sent: 'Ulituma',
    received: 'Ulipokea',
    to: 'kwa',
    
    // Wallet
    walletAddress: 'Anwani ya Mkoba Wako:\n{0}',
    walletAddressError: 'Haiwezekani kupata anwani ya mkoba. Tafadhali jaribu tena baadaye.',
    
    // Merchant specific
    merchantMenu: 'Menyu ya Mfanyabiashara:\n1. Angalia Salio\n2. Ona Malipo\n3. Toa Pesa\n4. Shiriki Msimbo wa Mfanyabiashara\n5. Anwani ya Mkoba\n6. Ona Miwondoo\n7. Mipangilio ya Lugha\n8. Toka',
    noPayments: 'Hakuna malipo ya hivi karibuni yaliyopatikana.',
    paymentsHeader: 'Malipo ya Hivi Karibuni:',
    receivedPayment: 'Ulipokea {0} USDC kutoka ***{1} - {2}',
    merchantCode: 'Msimbo wako wa Mfanyabiashara ni: {0}\n\nShiriki msimbo huu na wateja kwa malipo.',
    withdrawOptions: 'Toa kwa:\n1. Mtumiaji wa Cryptofono\n2. Anwani ya Mkoba wa Nje\n\n0. Rudi',
    enterWithdrawalAddress: 'Ingiza anwani ya kutoa:',
    confirmWithdrawUser: 'Toa {0} USDC kwa mtumiaji wa Cryptofono {1}?\n\n1. Thibitisha\n2. Ghairi',
    confirmWithdrawExternal: 'Toa {0} USDC kwa:\n{1}\n\n1. Thibitisha\n2. Ghairi',
    withdrawalCancelled: 'Kutoa pesa kumeghairiwa.',
    withdrawalFailed: 'Kutoa pesa kumeshindwa. Tafadhali jaribu tena.',
    noWithdrawals: 'Hakuna historia ya kutoa pesa iliyopatikana.',
    withdrawalsHeader: 'Kutoa Pesa kwa Hivi Karibuni:',
    
    // Language
    languageMenu: 'Choose your language / Chagua lugha yako:\n1. English\n2. Swahili',
    languageChanged: 'Lugha imewekwa kuwa Kiswahili',
    selectLanguage: 'Chagua lugha yako inayopendelewa',
    selectAccountType: 'Chagua aina ya akaunti',  
    languageChangeError: 'Imeshindwa kubadilisha lugha',
    backToMenu: 'Rudi kwenye Menyu',
    
    // Errors and general messages
    error: 'Hitilafu imetokea. Tafadhali jaribu tena baadaye.',
    goodbye: 'Asante kwa kutumia Cryptofono. Kwaheri!',
    invalidOption: 'Chaguo si sahihi. Tafadhali jaribu tena.',
    transactionFailed: 'Imeshindwa kutuma USDC. Tafadhali jaribu tena baadaye.',
}