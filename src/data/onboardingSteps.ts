export interface OnboardingStep {
  id: string;
  target?: string; // CSS selector data-tour="..." or undefined for centered modals
  title: {
    mr: string;
    en: string;
  };
  description: {
    mr: string;
    en: string;
  };
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // 1. Welcome Modal
  {
    id: 'welcome',
    placement: 'center',
    title: {
      mr: 'किसान सारथी मध्ये आपले सहर्ष स्वागत आहे! 🙏',
      en: 'Welcome to Kisan Saarthi! 🙏'
    },
    description: {
      mr: 'हा तुमचा मुख्य बाजार माहिती डॅशबोर्ड आहे. हे छोटेसे मार्गदर्शन तुम्हाला सर्व महत्त्वाचे फिचर्स सोप्या भाषेत समजून घेण्यास मदत करेल.',
      en: 'This is your main market intelligence dashboard. This quick guided tour will help you understand all key features easily.'
    }
  },

  // 2. Language Toggle
  {
    id: 'language-toggle',
    target: '[data-tour="language-toggle"]',
    placement: 'bottom',
    title: {
      mr: 'भाषा बदला (Language Toggle)',
      en: 'Language Switcher'
    },
    description: {
      mr: 'तुम्ही इथून कधीही मराठी आणि इंग्रजी भाषा बदलू शकता. सर्व माहिती आणि मार्गदर्शन लगेच तुमच्या भाषेत अपडेट होईल.',
      en: 'You can switch between Marathi and English anytime here. The entire interface and tour will update instantly.'
    }
  },

  // 3. Notification Bell
  {
    id: 'notification-bell',
    target: '[data-tour="notification-bell"]',
    placement: 'bottom',
    title: {
      mr: 'सूचना आणि अपडेट्स (Notification Bell)',
      en: 'Notifications & Alerts'
    },
    description: {
      mr: 'बाजार भावातील मोठे बदल, हवामान इशारे आणि तुमचे अलर्ट्स इथे लाल टिंबाने दर्शवले जातात.',
      en: 'Important market price shifts, weather advisories, and active alerts appear right here.'
    }
  },

  // 4. User Profile / Avatar
  {
    id: 'user-profile',
    target: '[data-tour="user-profile"]',
    placement: 'bottom',
    title: {
      mr: 'शेतकरी प्रोफाइल (User Profile)',
      en: 'Farmer Profile & Settings'
    },
    description: {
      mr: 'तुमचे नाव, मोबाईल नंबर, तालुका व पिकांची माहिती पाहण्यासाठी किंवा लॉगिन/साइनआउट करण्यासाठी इथे क्लिक करा.',
      en: 'Click here to view your profile details, mobile number, land records, or logout.'
    }
  },

  // 5. Left Sidebar Navigation
  {
    id: 'sidebar-nav',
    target: '[data-tour="sidebar-nav"]',
    placement: 'right',
    title: {
      mr: 'मुख्य मेनू नेव्हिगेशन (Main Sidebar)',
      en: 'Main Navigation Bar'
    },
    description: {
      mr: 'हा अ‍ॅपचा मुख्य मेनू आहे. यावरून तुम्ही वेगवेगळ्या सुविधांवर सहज जाऊ शकता.',
      en: 'This sidebar is your primary navigation menu to access all smart farming tools.'
    }
  },

  // 6. Dashboard Menu Item
  {
    id: 'nav-dashboard',
    target: '[data-tour="nav-dashboard"]',
    placement: 'right',
    title: {
      mr: 'डॅशबोर्ड (Dashboard Overview)',
      en: 'Dashboard Menu Item'
    },
    description: {
      mr: 'इथे तुम्हाला सर्व प्रमुख बाजार समित्यांचे आजचे ताजे भाव आणि संक्षिप्त सारांश मिळतो.',
      en: 'This gives you a real-time overview of current market rates and quick summary cards.'
    }
  },

  // 7. Crop Recommendation
  {
    id: 'nav-recommendation',
    target: '[data-tour="nav-recommendation"]',
    placement: 'right',
    title: {
      mr: 'पिक निवड सल्लागार (Crop Recommendation)',
      en: 'Smart Crop Recommendation'
    },
    description: {
      mr: 'बाजार भाव ट्रेंड आणि मागणीनुसार सर्वाधिक नफा देणारे पिक कोणते निवडावे याचा AI आधारित सल्ला इथे मिळतो.',
      en: 'Get AI recommendations on which crop to sell or cultivate for maximum profit.'
    }
  },

  // 8. Price Forecast
  {
    id: 'nav-forecast',
    target: '[data-tour="nav-forecast"]',
    placement: 'right',
    title: {
      mr: 'भाव अंदाज (Price Forecast)',
      en: 'AI Price Forecast'
    },
    description: {
      mr: 'पुढील ७, १४ व ३० दिवसांत बाजार भाव वाढणार की कमी होणार याचा सविस्तर अंदाज चार्टसह पहा.',
      en: 'View 7, 14, and 30-day market price trend projections with historical confidence charts.'
    }
  },

  // 9. Mandi Compare
  {
    id: 'nav-comparison',
    target: '[data-tour="nav-comparison"]',
    placement: 'right',
    title: {
      mr: 'बाजार तुलना (Mandi Comparison)',
      en: 'Mandi Rate Comparison'
    },
    description: {
      mr: 'कोपरगाव, राहता, श्रीरामपूर, येवला, लासलगाव इत्यादी बाजार समित्यांच्या भावांची तुलना एकाच जागी करा.',
      en: 'Compare live rates and freight costs across Kopargaon, Rahata, Shrirampur, Yeola, and nearby mandis.'
    }
  },

  // 10. Market Trends
  {
    id: 'nav-trends',
    target: '[data-tour="nav-trends"]',
    placement: 'right',
    title: {
      mr: 'बाजार कल व आलेख (Market Trends)',
      en: 'Market Movement & Trends'
    },
    description: {
      mr: 'मागील ३० दिवसांतील आवक, उच्चांकी भाव आणि बाजार कल आलेखाच्या मदतीने समजून घ्या.',
      en: 'Explore market movement, daily arrival volumes, and historical price movement graphs.'
    }
  },

  // 11. Profit Calculator
  {
    id: 'nav-calculator',
    target: '[data-tour="nav-calculator"]',
    placement: 'right',
    title: {
      mr: 'नफा गणित कॅल्क्युलेटर (Profit Calculator)',
      en: 'Net Profit Calculator'
    },
    description: {
      mr: 'लागवड खर्च, वाहतूक खर्च आणि निव्वळ नफा एका क्लिकवर मोजा.',
      en: 'Calculate cultivation costs, transportation expenses, and exact net profit after freight.'
    }
  },

  // 12. Price Alerts
  {
    id: 'nav-alerts',
    target: '[data-tour="nav-alerts"]',
    placement: 'right',
    title: {
      mr: 'भाव अलर्ट्स (Price Alerts)',
      en: 'Custom Price Alerts'
    },
    description: {
      mr: 'इच्छित भाव गाठताच तुमच्या मोबाईलवर SMS आणि व्हॉट्सॲपवर थेट संदेश मिळवण्यासाठी अलर्ट सेट करा.',
      en: 'Set custom price alerts to get SMS and WhatsApp updates directly to your mobile.'
    }
  },

  // 13. My Profile
  {
    id: 'nav-profile',
    target: '[data-tour="nav-profile"]',
    placement: 'right',
    title: {
      mr: 'माझी माहिती (My Profile)',
      en: 'Farmer Profile Menu'
    },
    description: {
      mr: 'तुमची शेतकरी माहिती, जमिनीचे क्षेत्र आणि प्राधान्य दिलेल्या पिकांची नोंदणी व्यवस्थापित करा.',
      en: 'Manage your farmer profile, land acreage, contact details, and crop preferences.'
    }
  },

  // 14. Main Dashboard Hero Content
  {
    id: 'dashboard-hero',
    target: '[data-tour="dashboard-hero"]',
    placement: 'bottom',
    title: {
      mr: 'कोपरगाव बाजार समिती इंटेलिजन्स',
      en: 'Main Dashboard Intelligence Header'
    },
    description: {
      mr: 'हा डॅशबोर्डचा मुख्य मथळा आहे, जिथून तुम्ही ताजे भाव रीफ्रेश करू शकता आणि मुख्य सुविधेवर थेट जाऊ शकता.',
      en: 'This main header section allows you to refresh live rates and quickly trigger top actions.'
    }
  },

  // 15. Active Alert Banner
  {
    id: 'active-alert-banner',
    target: '[data-tour="active-alert-banner"]',
    placement: 'bottom',
    title: {
      mr: 'सक्रिय भाव अलर्ट पट्टी (Active Alert Banner)',
      en: 'Live Active Alert Banner'
    },
    description: {
      mr: 'तुमच्या पिकाचा भाव निश्चित लक्ष्याजवळ पोहोचल्यास अशी थेट सूचना इथे दिसते.',
      en: 'Whenever a commodity hits or nears your targeted price point, live warnings appear here.'
    }
  },

  // 16. Key Metric Cards
  {
    id: 'key-metrics',
    target: '[data-tour="key-metrics"]',
    placement: 'bottom',
    title: {
      mr: 'महत्त्वाचे बाजार निर्देशक (Key Metric Cards)',
      en: 'Key Market Summary Cards'
    },
    description: {
      mr: '१. सर्वाधिक भाव देणारी बाजार समिती\n२. आजचा बाजार कल व टक्केवारी वाढ/घट\n३. सर्वोत्तम नफा देणारा पिक सल्ला',
      en: 'Quick snapshot showing 1. Highest paying mandi 2. Today\'s percentage price change 3. Smart crop advisor.'
    }
  },

  // 17. Crop Filter Section
  {
    id: 'crop-filters',
    target: '[data-tour="crop-filters"]',
    placement: 'bottom',
    title: {
      mr: 'पिक निवड फिल्टर (Crop Filters)',
      en: 'Crop Filter Chips'
    },
    description: {
      mr: 'कांदा, सोयाबीन, कापूस, ऊस, डाळिंब, गवत/गहू, टोमॅटो इत्यादी पिकांवर क्लिक करून फक्त त्या पिकांचे भाव पहा.',
      en: 'Click on crop chips like Onion, Soybean, Cotton, sugarcane, Pomegranate, Wheat, or Tomato to filter data.'
    }
  },

  // 18. Market List / Sorting Controls
  {
    id: 'market-sort-controls',
    target: '[data-tour="market-sort-controls"]',
    placement: 'top',
    title: {
      mr: 'बाजार भाव क्रमवारी आणि व्ह्यू (Sorting Controls)',
      en: 'Sorting & Display Controls'
    },
    description: {
      mr: 'इथून तुम्ही भाव जास्त ते कमी, कमी ते जास्त किंवा अंतरानुसार बाजार समित्यांची क्रमवारी लावू शकता.',
      en: 'Sort market rates by highest price, lowest price, or distance from Kopargaon.'
    }
  },

  // 19. Finish Tour Modal
  {
    id: 'finish',
    placement: 'center',
    title: {
      mr: 'मार्गदर्शन पूर्ण झाले! 🎉',
      en: 'Tour Completed! 🎉'
    },
    description: {
      mr: 'अभिनंदन! तुम्ही किसान सारथी डॅशबोर्डचे मार्गदर्शन पूर्ण केले आहे. तुम्हाला कधीही पुन्हा मार्गदर्शन हवे असल्यास वरील "मार्गदर्शन चालू करा" बटणावर क्लिक करा.',
      en: 'Congratulations! You have completed the Kisan Saarthi tour. You can restart this tour anytime using the "Take Tour" button in the top header.'
    }
  }
];
