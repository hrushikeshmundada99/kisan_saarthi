import i18n from 'i18next';

const serverResources = {
  mr: {
    translation: {
      assistantName: "किसान मित्र AI",
      greeting: "रामराम शेतकरी मित्र!",
      thinking: "माहिती शोधत आहे...",
      fallbackPrefix: "रामराम! वेबसाईटवरील ताज्या माहितीनुसार:",
      notFound: "क्षमस्व, या विषयावर वेबसाईटवर माहिती उपलब्ध नाही."
    }
  },
  en: {
    translation: {
      assistantName: "Kisan Mitra AI",
      greeting: "Hello Farmer Friend!",
      thinking: "Searching website knowledge...",
      fallbackPrefix: "Hello! According to our live website market data:",
      notFound: "Sorry, data for this item is currently unavailable on our website."
    }
  }
};

if (!i18n.isInitialized) {
  i18n.init({
    resources: serverResources,
    lng: 'mr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
}

export default i18n;
