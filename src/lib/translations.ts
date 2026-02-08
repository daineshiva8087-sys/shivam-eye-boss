export type Language = 'en' | 'mr' | 'hi';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const translations = {
  en: {
    // Header
    home: 'Home',
    services: 'Services',
    contact: 'Contact',
    account: 'Account',
    adminPanel: 'Admin Panel',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    
    // Hero Section
    brandName: 'SHIVAM CCTV',
    tagline: "Jalna's No.1 CCTV Solution",
    since2016: 'Serving Jalna since 2016',
    trustedSecurityPartner: 'Trusted Security Partner',
    freeSiteSurvey: 'Free Site Survey',
    callNow: 'Call Now',
    whatsAppNow: 'WhatsApp Now',
    
    // Products Section
    ourProducts: 'Our Products',
    ourProductsDescription: 'Browse our wide range of CCTV cameras and security equipment',
    allCategories: 'All',
    noProductsAvailable: 'No products available in this category.',
    noProductsFound: 'No products found',
    checkBackSoon: 'Check back soon for new products!',
    searchPlaceholder: 'Search camera, brand, MP, price...',
    requestQuote: 'Request Quote',
    
    // Services Section
    ourServices: 'Our Services',
    ourServicesDescription: 'Complete security solutions tailored to your needs',
    cctvInstallation: 'CCTV Installation',
    cctvInstallationDesc: 'Professional installation for homes and businesses',
    maintenanceRepair: 'Maintenance & Repair',
    maintenanceRepairDesc: 'Regular maintenance and quick repair services',
    monitoring24x7: '24/7 Monitoring',
    monitoring24x7Desc: 'Round-the-clock surveillance support',
    freeSiteSurveyService: 'Free Site Survey',
    freeSiteSurveyServiceDesc: 'Complimentary security assessment',
    bookAService: 'Book a Service',
    
    // About Section
    aboutUs: 'About Us',
    since: 'Since 2016',
    aboutParagraph1: 'Shivam CCTV is a trusted CCTV solution service in Jalna city.',
    aboutParagraph2: 'Working in service of Jalna residents since 2016, we provide modern and quality security solutions for homes, shops, offices, and businesses.',
    aboutParagraph3: 'Right advice, accurate installation, and timely service is our identity.',
    sinceYear: 'Since 2016',
    inService: 'In Service',
    trusted: 'Trusted',
    securitySolution: 'Security Solution',
    quality: 'Quality',
    service: 'Service',
    
    // Footer
    footerTagline: 'Jalna\'s trusted CCTV solution provider since 2016',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    footerCopyright: '© Shivam CCTV | Serving Jalna since 2016',
    
    // Language
    selectLanguage: 'Select Language',
    languagePromptTitle: 'Choose Your Preferred Language',
    languagePromptSubtitle: 'You can change this later from settings',
    continue: 'Continue',
    
    // Alerts & Messages
    quotationSent: 'Quotation request sent successfully!',
    serviceBooked: 'Service booking request sent successfully!',
    errorOccurred: 'An error occurred. Please try again.',
    
    // Combo Section
    comboOffers: 'Combo Offers',
    comboOffersDescription: 'Save more with our specially curated combo packages',
    
    // Service Charges
    serviceCharges: 'Service Charges',
    serviceChargesDescription: 'Transparent pricing for all our services',
  },
  
  mr: {
    // Header
    home: 'होम',
    services: 'सेवा',
    contact: 'संपर्क',
    account: 'खाते',
    adminPanel: 'अॅडमिन पॅनेल',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    
    // Hero Section
    brandName: 'SHIVAM CCTV',
    tagline: 'जालना मधील नं 1 CCTV सोल्युशन',
    since2016: '2016 पासून जालनेकरच्या सेवेत',
    trustedSecurityPartner: 'विश्वासार्ह सुरक्षा भागीदार',
    freeSiteSurvey: 'फ्री साइट सर्व्हे',
    callNow: 'कॉल करा',
    whatsAppNow: 'WhatsApp करा',
    
    // Products Section
    ourProducts: 'आमची उत्पादने',
    ourProductsDescription: 'आमच्या CCTV कॅमेरे आणि सुरक्षा उपकरणांची विस्तृत श्रेणी पहा',
    allCategories: 'सर्व',
    noProductsAvailable: 'या श्रेणीत उत्पादने उपलब्ध नाहीत.',
    noProductsFound: 'कोणतीही उत्पादने आढळली नाहीत',
    checkBackSoon: 'नवीन उत्पादनांसाठी लवकरच परत या!',
    searchPlaceholder: 'कॅमेरा, ब्रँड, MP, किंमत शोधा...',
    requestQuote: 'कोटेशन मागवा',
    
    // Services Section
    ourServices: 'आमच्या सेवा',
    ourServicesDescription: 'तुमच्या गरजेनुसार पूर्ण सुरक्षा सोल्युशन',
    cctvInstallation: 'CCTV इंस्टॉलेशन',
    cctvInstallationDesc: 'घर आणि व्यवसायांसाठी व्यावसायिक इंस्टॉलेशन',
    maintenanceRepair: 'देखभाल आणि दुरुस्ती',
    maintenanceRepairDesc: 'नियमित देखभाल आणि जलद दुरुस्ती सेवा',
    monitoring24x7: '24/7 मॉनिटरिंग',
    monitoring24x7Desc: 'दिवसरात्र पाळत ठेवण्याची सहाय्यता',
    freeSiteSurveyService: 'फ्री साइट सर्व्हे',
    freeSiteSurveyServiceDesc: 'मोफत सुरक्षा मूल्यांकन',
    bookAService: 'सेवा बुक करा',
    
    // About Section
    aboutUs: 'आमच्याबद्दल',
    since: '2016 पासून',
    aboutParagraph1: 'Shivam CCTV ही जालना शहरातील एक विश्वासार्ह CCTV सोल्युशन सेवा आहे.',
    aboutParagraph2: '2016 पासून जालनेकरांच्या सेवेत कार्यरत राहून, आम्ही घर, दुकान, ऑफिस आणि व्यवसायांसाठी आधुनिक व दर्जेदार सुरक्षा उपाय उपलब्ध करून देत आहोत.',
    aboutParagraph3: 'योग्य सल्ला, अचूक इंस्टॉलेशन आणि वेळेवर सर्व्हिस हीच आमची ओळख आहे.',
    sinceYear: '2016 पासून',
    inService: 'सेवेत कार्यरत',
    trusted: 'विश्वासार्ह',
    securitySolution: 'सुरक्षा सोल्युशन',
    quality: 'दर्जेदार',
    service: 'सर्व्हिस',
    
    // Footer
    footerTagline: '2016 पासून जालनेकरांचा विश्वासार्ह CCTV सोल्युशन प्रदाता',
    quickLinks: 'जलद दुवे',
    contactUs: 'संपर्क साधा',
    footerCopyright: '© Shivam CCTV | 2016 पासून जालनेकरच्या सेवेत',
    
    // Language
    selectLanguage: 'भाषा निवडा',
    languagePromptTitle: 'तुमची पसंतीची भाषा निवडा',
    languagePromptSubtitle: 'तुम्ही हे नंतर सेटिंग्जमधून बदलू शकता',
    continue: 'पुढे जा',
    
    // Alerts & Messages
    quotationSent: 'कोटेशन विनंती यशस्वीरित्या पाठवली!',
    serviceBooked: 'सेवा बुकिंग विनंती यशस्वीरित्या पाठवली!',
    errorOccurred: 'एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
    
    // Combo Section
    comboOffers: 'कॉम्बो ऑफर्स',
    comboOffersDescription: 'आमच्या खास कॉम्बो पॅकेजेससह अधिक बचत करा',
    
    // Service Charges
    serviceCharges: 'सेवा शुल्क',
    serviceChargesDescription: 'आमच्या सर्व सेवांसाठी पारदर्शक किंमती',
  },
  
  hi: {
    // Header
    home: 'होम',
    services: 'सेवाएं',
    contact: 'संपर्क',
    account: 'खाता',
    adminPanel: 'एडमिन पैनल',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    
    // Hero Section
    brandName: 'SHIVAM CCTV',
    tagline: 'जालना का नंबर 1 CCTV सोल्यूशन',
    since2016: '2016 से जालना की सेवा में',
    trustedSecurityPartner: 'भरोसेमंद सुरक्षा साझेदार',
    freeSiteSurvey: 'फ्री साइट सर्वे',
    callNow: 'कॉल करें',
    whatsAppNow: 'WhatsApp करें',
    
    // Products Section
    ourProducts: 'हमारे उत्पाद',
    ourProductsDescription: 'हमारे CCTV कैमरों और सुरक्षा उपकरणों की विस्तृत श्रेणी देखें',
    allCategories: 'सभी',
    noProductsAvailable: 'इस श्रेणी में उत्पाद उपलब्ध नहीं हैं।',
    noProductsFound: 'कोई उत्पाद नहीं मिले',
    checkBackSoon: 'नए उत्पादों के लिए जल्द ही वापस आएं!',
    searchPlaceholder: 'कैमरा, ब्रांड, MP, कीमत खोजें...',
    requestQuote: 'कोटेशन मांगें',
    
    // Services Section
    ourServices: 'हमारी सेवाएं',
    ourServicesDescription: 'आपकी जरूरतों के अनुसार पूर्ण सुरक्षा समाधान',
    cctvInstallation: 'CCTV इंस्टॉलेशन',
    cctvInstallationDesc: 'घर और व्यापार के लिए पेशेवर इंस्टॉलेशन',
    maintenanceRepair: 'रखरखाव और मरम्मत',
    maintenanceRepairDesc: 'नियमित रखरखाव और त्वरित मरम्मत सेवाएं',
    monitoring24x7: '24/7 मॉनिटरिंग',
    monitoring24x7Desc: 'चौबीसों घंटे निगरानी सहायता',
    freeSiteSurveyService: 'फ्री साइट सर्वे',
    freeSiteSurveyServiceDesc: 'मुफ्त सुरक्षा मूल्यांकन',
    bookAService: 'सेवा बुक करें',
    
    // About Section
    aboutUs: 'हमारे बारे में',
    since: '2016 से',
    aboutParagraph1: 'Shivam CCTV जालना शहर में एक विश्वसनीय CCTV समाधान सेवा है।',
    aboutParagraph2: '2016 से जालना के निवासियों की सेवा में कार्यरत रहकर, हम घर, दुकान, ऑफिस और व्यापार के लिए आधुनिक और गुणवत्तापूर्ण सुरक्षा समाधान प्रदान करते हैं।',
    aboutParagraph3: 'सही सलाह, सटीक इंस्टॉलेशन और समय पर सर्विस यही हमारी पहचान है।',
    sinceYear: '2016 से',
    inService: 'सेवा में',
    trusted: 'भरोसेमंद',
    securitySolution: 'सुरक्षा समाधान',
    quality: 'गुणवत्तापूर्ण',
    service: 'सेवा',
    
    // Footer
    footerTagline: '2016 से जालना का विश्वसनीय CCTV समाधान प्रदाता',
    quickLinks: 'त्वरित लिंक',
    contactUs: 'संपर्क करें',
    footerCopyright: '© Shivam CCTV | 2016 से जालना की सेवा में',
    
    // Language
    selectLanguage: 'भाषा चुनें',
    languagePromptTitle: 'अपनी पसंदीदा भाषा चुनें',
    languagePromptSubtitle: 'आप इसे बाद में सेटिंग्स से बदल सकते हैं',
    continue: 'जारी रखें',
    
    // Alerts & Messages
    quotationSent: 'कोटेशन अनुरोध सफलतापूर्वक भेजा गया!',
    serviceBooked: 'सेवा बुकिंग अनुरोध सफलतापूर्वक भेजा गया!',
    errorOccurred: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    
    // Combo Section
    comboOffers: 'कॉम्बो ऑफर्स',
    comboOffersDescription: 'हमारे विशेष कॉम्बो पैकेज के साथ अधिक बचत करें',
    
    // Service Charges
    serviceCharges: 'सेवा शुल्क',
    serviceChargesDescription: 'हमारी सभी सेवाओं के लिए पारदर्शी मूल्य',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
