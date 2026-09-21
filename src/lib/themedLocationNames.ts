import { SupportedLanguage } from './translations';

const LOCATION_NAMES: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  Hyderabad: { te: 'హైదరాబాద్', hi: 'हैदराबाद' },
  Charminar: { te: 'చార్మినార్', hi: 'चारमीनार' },
  'HITEC City': { te: 'హైటెక్ సిటీ', hi: 'हाईटेक सिटी' },
  Gachibowli: { te: 'గచ్చిబౌలి', hi: 'गच्चीबोवली' },
  Secunderabad: { te: 'సికింద్రాబాద్', hi: 'सिकंदराबाद' },
  'Banjara Hills': { te: 'బంజారా హిల్స్', hi: 'बंजारा हिल्स' },
  'Jubilee Hills': { te: 'జూబ్లీ హిల్స్', hi: 'जुबली हिल्स' },
  Warangal: { te: 'వరంగల్', hi: 'वारंगल' },
  Karimnagar: { te: 'కరీంనగర్', hi: 'करीमनगर' },
  Nizamabad: { te: 'నిజామాబాద్', hi: 'निज़ामाबाद' },
  Khammam: { te: 'ఖమ్మం', hi: 'खम्मम' },
  Nalgonda: { te: 'నల్గొండ', hi: 'नलगोंडा' },
  Mahbubnagar: { te: 'మహబూబ్‌నగర్', hi: 'महबूबनगर' },
  Siddipet: { te: 'సిద్దిపేట', hi: 'सिद्दिपेट' },
  Suryapet: { te: 'సూర్యాపేట', hi: 'सूर्यापेट' },
  Medak: { te: 'మెదక్', hi: 'मेडक' },
  Adilabad: { te: 'ఆదిలాబాద్', hi: 'आदिलाबाद' },
  Mumbai: { te: 'ముంబై', hi: 'मुंबई' },
  Delhi: { te: 'ఢిల్లీ', hi: 'दिल्ली' },
  Bangalore: { te: 'బెంగళూరు', hi: 'बेंगलुरु' },
  Chennai: { te: 'చెన్నై', hi: 'चेन्नई' },
  Kolkata: { te: 'కోల్‌కతా', hi: 'कोलकाता' },
  Pune: { te: 'పుణే', hi: 'पुणे' },
  Vijayawada: { te: 'విజయవాడ', hi: 'विजयवाड़ा' },
  Visakhapatnam: { te: 'విశాఖపట్నం', hi: 'विशाखापट्टनम' },
  Nagpur: { te: 'నాగ్‌పూర్', hi: 'नागपुर' },
  Goa: { te: 'గోవా', hi: 'गोवा' },
  Agra: { te: 'ఆగ్రా', hi: 'आगरा' },
  'Taj Mahal': { te: 'తాజ్ మహల్', hi: 'ताजमहल' },
  'Rajiv Gandhi Intl Airport': { te: 'రాజీవ్ గాంధీ అంతర్జాతీయ విమానాశ్రయం', hi: 'राजीव गांधी अंतरराष्ट्रीय हवाई अड्डा' },
};

export function getLocalizedLocationName(name: string, language: SupportedLanguage): string {
  return LOCATION_NAMES[name]?.[language] || name;
}

export function localizeLocationText(text: string, language: SupportedLanguage): string {
  if (language === 'en') return text;

  return Object.keys(LOCATION_NAMES)
    .sort((a, b) => b.length - a.length)
    .reduce((localizedText, canonicalName) => {
      const localizedName = getLocalizedLocationName(canonicalName, language);
      return localizedText.split(canonicalName).join(localizedName);
    }, text);
}
