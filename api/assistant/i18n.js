import i18n from 'i18next';

const serverResources = {
  mr: {
    translation: {
      assistantName: "किसान मित्र AI",
      greeting: "रामराम शेतकरी मित्र!",
      thinking: "माहिती शोधत आहे...",
      
      // Mandi Prices Responses
      mandiPriceSingle: "रामराम! {{mandi}} बाजारात आज {{crop}} चा चालू भाव ₹{{modalPrice}}/क्विंटल आहे (किमान ₹{{minPrice}} ते कमाल ₹{{maxPrice}}).",
      mandiPriceCropAll: "रामराम! वेबसाईटवरील विविध बाजारांतील आजचे {{crop}} भाव: {{rates}}.",
      mandiPriceMandiAll: "रामराम! आज {{mandi}} बाजारातील विविध पिकांचे चालू भाव: {{crops}}.",
      
      // Soil Guidance Responses
      soilGuidance: "रामराम! वेबसाईटवरील माती माहितीनुसार: {{name}} ही {{location}} योग्य पिके: {{crops}}. सल्ला: {{tip}}",
      
      // Value Addition / Post-Harvest
      postHarvestOnion: "रामराम! वेबसाईटवरील प्रक्रियेनुसार: साधा मंडी भाव ₹३,९५०/क्विंटल आहे. १ महिना कांदा चाळीत साठवून निर्जलीकरण केंद्रास विकल्यास रु. ४५०/क्विंटल अतिरिक्त नफा मिळतो.",
      postHarvestSoybean: "रामराम! वेबसाईटवरील प्रक्रियेनुसार: शेतकरी उत्पादक कंपनी (FPO) द्वारे थेट तेल गिरणीस (Solvent Extraction) पुरवठा केल्यास रु. ५८०/क्विंटल जादा दर मिळतो.",
      
      // Calculator & Alerts & General Help
      profitCalculatorHelp: "वेबसाईटवरील \"Profit Calculator\" मध्ये तुम्ही मातीचा प्रकार, जमीन क्षेत्र (एकरी/गुंठे) आणि लागवड खर्च टाकून विविध मंडयांमधील निव्वळ नफा (Net Payout) तुलना करू शकता.",
      priceAlertsHelp: "वेबसाईटवरील \"Price Alerts\" पृष्ठावर जाऊन तुम्ही ठरवलेला भाव बाजारात येताच मोबाईलवर थेट SIM SMS आणि Email अलर्ट मिळवू शकता.",
      generalWebsiteHelp: "रामराम शेतकरी मित्र! मी किसान सारथी वेबसाईटवरील माहिती शोधून मराठीत उत्तर देतो. तुम्ही मला कोपरगाव, लासलगाव, अहिल्यानगर इत्यादी मंड्यांतील चालू भाव, मातीचे प्रकार किंवा नफा कॅल्क्युलेटरबद्दल प्रश्न विचारू शकता.",
      
      systemMandate: "STRICT OUTPUT LANGUAGE MANDATE: The user asked in MARATHI. You MUST generate your response strictly in 100% Marathi (मराठी/देवनागरी) script. Do NOT use English."
    }
  },
  en: {
    translation: {
      assistantName: "Kisan Mitra AI",
      greeting: "Hello Farmer Friend!",
      thinking: "Searching website knowledge...",
      
      // Mandi Prices Responses
      mandiPriceSingle: "Hello! Today's {{crop}} modal price at {{mandi}} mandi is ₹{{modalPrice}}/quintal (Min: ₹{{minPrice}} - Max: ₹{{maxPrice}}).",
      mandiPriceCropAll: "Hello! Today's {{crop}} prices across all mandis on our website: {{rates}}.",
      mandiPriceMandiAll: "Hello! Today's crop prices at {{mandi}} mandi: {{crops}}.",
      
      // Soil Guidance Responses
      soilGuidance: "Hello! According to our website soil guide: {{name}} is {{location}} Recommended crops: {{crops}}. Agronomy advice: {{tip}}",
      
      // Value Addition / Post-Harvest
      postHarvestOnion: "Hello! According to our website: Standard mandi rate is ₹3,950/q. Storing in onion chawl for 1 month gets +₹450/q extra net profit.",
      postHarvestSoybean: "Hello! According to our website: Supplying directly to solvent extraction oil mills via FPO gets +₹580/q higher rate.",
      
      // Calculator & Alerts & General Help
      profitCalculatorHelp: "On our website's \"Profit Calculator\", you can select soil type, land area, cultivation costs, and compare net profit payouts across nearby mandis.",
      priceAlertsHelp: "Our website's \"Price Alerts\" page lets you set target crop prices to receive instant SMS & Email notifications directly on your phone.",
      generalWebsiteHelp: "Hello! I am Kisan Mitra AI. I search our current website data to answer questions about live APMC rates, regional soil types, price forecasts, or profit calculators.",
      
      systemMandate: "STRICT OUTPUT LANGUAGE MANDATE: The user asked in ENGLISH. You MUST generate your response strictly in English."
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
