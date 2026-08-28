import i18n from 'i18next';

export function toMarathiNumerals(num) {
  if (num === null || num === undefined) return '';
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (w) => devanagariDigits[+w]);
}

const serverResources = {
  mr: {
    translation: {
      assistantName: "किसान मित्र AI",
      greeting: "रामराम शेतकरी मित्र!",
      thinking: "माहिती शोधत आहे...",
      
      // Mandi Prices Responses with Marathi Devanagari numerals
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
      generalWebsiteHelp: "रामराम शेतकरी मित्र! मी किसान सारथी वेबसाईटवरील माहिती शोधून केवळ मराठीत उत्तर देतो. तुम्ही मला कोपरगाव, लासलगाव, अहिल्यानगर इत्यादी मंड्यांतील चालू भाव, मातीचे प्रकार किंवा नफा कॅल्क्युलेटरबद्दल प्रश्न विचारू शकता.",
      
      systemMandate: "CRITICAL MANDATE (STRICTEST PRIORITY): You MUST answer EVERY question strictly and exclusively in MARATHI (मराठी / देवनागरी script). ALL numbers, prices, mandi names, crop names, and explanations MUST be written in 100% MARATHI (Devanagari script). DO NOT OUTPUT ANY ENGLISH WORDS OR ENGLISH SENTENCES UNDER ANY CIRCUMSTANCES."
    }
  }
};

if (!i18n.isInitialized) {
  i18n.init({
    resources: serverResources,
    lng: 'mr',
    fallbackLng: 'mr',
    interpolation: {
      escapeValue: false
    }
  });
}

export default i18n;
