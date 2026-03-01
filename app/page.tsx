"use client";
import { useState, useRef, useEffect } from "react";

// --- Data for Dropdowns ---
const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Kannada",
  "Odia",
  "Punjabi",
  "Malayalam",
];

const LANGUAGE_META: Record<string, { native: string; flag: string }> = {
  English: { native: "English", flag: "🇬🇧" },
  Hindi: { native: "हिन्दी", flag: "🇮🇳" },
  Bengali: { native: "বাংলা", flag: "🇮🇳" },
  Marathi: { native: "मराठी", flag: "🇮🇳" },
  Telugu: { native: "తెలుగు", flag: "🇮🇳" },
  Tamil: { native: "தமிழ்", flag: "🇮🇳" },
  Gujarati: { native: "ગુજરાતી", flag: "🇮🇳" },
  Kannada: { native: "ಕನ್ನಡ", flag: "🇮🇳" },
  Odia: { native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  Punjabi: { native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  Malayalam: { native: "മലയാളം", flag: "🇮🇳" },
};

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Andaman & Nicobar",
  "Chandigarh",
  "Dadra & Nagar Haveli",
  "Lakshadweep",
];

const OCCUPATIONS = [
  "Farmer",
  "Tailoring",
  "Small Business",
  "Student",
  "Unemployed",
  "Construction Worker",
  "Shopkeeper",
  "Artisan",
  "Others",
];

const GENDERS = ["Male", "Female", "Other"];
const CASTES = ["General", "OBC", "SC", "ST", "Minority", "EWS"];

const BACKEND_URL =
  "https://4eba60f5-9e25-4455-8166-4036273cf1e3-00-3l13l7k95pbtt.sisko.replit.dev";

const INDIAN_PHONE_REGEX = /^([6-9]|160|140)\d{7,9}$/;

// ─── UI Text translations ───────────────────────────────────────────────────
const UI_TEXT: Record<string, Record<string, string>> = {
  English: {
    appName: "SARKARI SAATHI",
    chooseLanguage: "Choose Your Language",
    languageSubtitle: "Select the language you are most comfortable with",
    // Onboarding choice page
    howToStart: "How would you like to start?",
    howToStartSub: "Choose the option that works best for you",
    voiceOption: "Speak to Laxmi",
    voiceOptionDesc:
      "Tell Laxmi your details by voice. She'll understand and find the right schemes for you.",
    voiceOptionBtn: "Start Speaking",
    formOption: "Fill the Form",
    formOptionDesc:
      "Enter your details manually in the sign-up form, then move to voice chat.",
    formOptionBtn: "Open Form",
    // Voice onboarding prompts
    voiceOnboardTitle: "Tell Laxmi About Yourself",
    voiceOnboardSub:
      "Hold the mic and say your name, age, gender, state, occupation and caste",
    voiceOnboardHint:
      'Example: "My name is Raju, I am 35 years old, male, from Uttar Pradesh, I am a farmer, General category"',
    processingProfile: "Understanding your profile...",
    profileFound: "Profile understood!",
    retryVoice: "Try Again",
    confirmProfile: "Confirm & Continue",
    // Form
    hello: "Hello!",
    login: "Login",
    fullName: "Full Name",
    age: "Age",
    gender: "Gender",
    selectGender: "Select Gender",
    occupation: "Occupation",
    selectOccupation: "Select Occupation",
    specifyOccupation: "Please specify your occupation",
    phone: "Phone Number",
    email: "Email",
    caste: "Caste / Category",
    selectCaste: "Select Caste / Category",
    state: "State",
    selectState: "Select State",
    startBtn: "START CONVERSATION",
    saving: "SAVING...",
    // Chat
    namaste: "NAMASTE",
    howHelp: "How can I help you?",
    holdSpeak: "Hold to Speak",
    listening: "Listening...",
    processing: "Processing...",
    youSaid: "YOU SAID",
    laxmiAI: "LAXMI AI",
    matchingSchemes: "SCHEMES & PROGRAMS FOR YOU",
    details: "Details",
    logout: "Logout",
    footer: "POWERED BY PROJECT VIKAS • BHARAT",
    connError: "Connection failed. Check if the Python Repl is running.",
    micError: "Please allow microphone access.",
    mongoError: "System connection error. Please ensure MongoDB is connected.",
    errName: "Full name is required.",
    errAge: "Age must be between 18 and 85.",
    errPhone: "Enter a valid 10-digit Indian mobile number.",
    errState: "Please select your state.",
    errGender: "Please select your gender.",
    errOccupation: "Please select your occupation.",
    errCaste: "Please select your caste / category.",
  },
  Hindi: {
    appName: "सरकारी साथी",
    chooseLanguage: "अपनी भाषा चुनें",
    languageSubtitle: "वह भाषा चुनें जिसमें आप सबसे सहज हैं",
    howToStart: "आप कैसे शुरू करना चाहेंगे?",
    howToStartSub: "आपके लिए जो सबसे अच्छा हो वह विकल्प चुनें",
    voiceOption: "लक्ष्मी से बात करें",
    voiceOptionDesc:
      "आवाज़ से लक्ष्मी को अपनी जानकारी बताएं। वह समझकर सही योजनाएं ढूंढेगी।",
    voiceOptionBtn: "बोलना शुरू करें",
    formOption: "फॉर्म भरें",
    formOptionDesc: "फॉर्म में जानकारी भरें, फिर आवाज़ चैट पर जाएं।",
    formOptionBtn: "फॉर्म खोलें",
    voiceOnboardTitle: "लक्ष्मी को अपने बारे में बताएं",
    voiceOnboardSub:
      "माइक दबाएं और अपना नाम, उम्र, लिंग, राज्य, पेशा और जाति बताएं",
    voiceOnboardHint:
      'उदाहरण: "मेरा नाम राजू है, मैं 35 साल का हूँ, पुरुष, उत्तर प्रदेश से हूँ, किसान हूँ, सामान्य वर्ग"',
    processingProfile: "आपकी प्रोफ़ाइल समझी जा रही है...",
    profileFound: "प्रोफ़ाइल समझ गई!",
    retryVoice: "फिर कोशिश करें",
    confirmProfile: "पुष्टि करें और आगे बढ़ें",
    hello: "नमस्ते!",
    login: "लॉगिन करें",
    fullName: "पूरा नाम",
    age: "उम्र",
    gender: "लिंग",
    selectGender: "लिंग चुनें",
    occupation: "पेशा",
    selectOccupation: "पेशा चुनें",
    specifyOccupation: "अपना पेशा बताएं",
    phone: "फोन नंबर",
    email: "ईमेल",
    caste: "जाति / श्रेणी",
    selectCaste: "जाति चुनें",
    state: "राज्य",
    selectState: "राज्य चुनें",
    startBtn: "बातचीत शुरू करें",
    saving: "सहेजा जा रहा है...",
    namaste: "नमस्ते",
    howHelp: "मैं आपकी कैसे मदद कर सकती हूँ?",
    holdSpeak: "बोलने के लिए दबाएं",
    listening: "सुन रही हूँ...",
    processing: "सोच रही हूँ...",
    youSaid: "आपने कहा",
    laxmiAI: "लक्ष्मी AI",
    matchingSchemes: "आपके लिए योजनाएं",
    details: "विवरण",
    logout: "लॉगआउट",
    footer: "प्रोजेक्ट विकास द्वारा • भारत",
    connError: "कनेक्शन विफल।",
    micError: "माइक्रोफोन की अनुमति दें।",
    mongoError: "सिस्टम कनेक्शन त्रुटि।",
    errName: "पूरा नाम आवश्यक है।",
    errAge: "उम्र 18 से 85 के बीच होनी चाहिए।",
    errPhone: "सही 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।",
    errState: "कृपया अपना राज्य चुनें।",
    errGender: "कृपया अपना लिंग चुनें।",
    errOccupation: "कृपया अपना पेशा चुनें।",
    errCaste: "कृपया अपनी जाति चुनें।",
  },
  Bengali: {
    appName: "সরকারি সাথী",
    chooseLanguage: "আপনার ভাষা বেছে নিন",
    languageSubtitle:
      "আপনি যে ভাষায় সবচেয়ে স্বাচ্ছন্দ্য বোধ করেন সেটি বেছে নিন",
    howToStart: "আপনি কীভাবে শুরু করতে চান?",
    howToStartSub: "আপনার জন্য যেটি সবচেয়ে ভালো সেই বিকল্পটি বেছে নিন",
    voiceOption: "লক্ষ্মীর সাথে কথা বলুন",
    voiceOptionDesc:
      "কণ্ঠস্বরে লক্ষ্মীকে আপনার তথ্য জানান। সে বুঝে সঠিক প্রকল্প খুঁজে দেবে।",
    voiceOptionBtn: "বলা শুরু করুন",
    formOption: "ফর্ম পূরণ করুন",
    formOptionDesc: "ফর্মে তথ্য দিন, তারপর ভয়েস চ্যাটে যান।",
    formOptionBtn: "ফর্ম খুলুন",
    voiceOnboardTitle: "লক্ষ্মীকে আপনার সম্পর্কে বলুন",
    voiceOnboardSub:
      "মাইক ধরুন এবং আপনার নাম, বয়স, লিঙ্গ, রাজ্য, পেশা ও জাতি বলুন",
    voiceOnboardHint:
      'উদাহরণ: "আমার নাম রাজু, আমার বয়স ৩৫, পুরুষ, উত্তরপ্রদেশ থেকে, কৃষক, সাধারণ বিভাগ"',
    processingProfile: "আপনার প্রোফাইল বোঝা হচ্ছে...",
    profileFound: "প্রোফাইল বোঝা গেছে!",
    retryVoice: "আবার চেষ্টা করুন",
    confirmProfile: "নিশ্চিত করুন ও এগিয়ে যান",
    hello: "নমস্কার!",
    login: "লগইন করুন",
    fullName: "পুরো নাম",
    age: "বয়স",
    gender: "লিঙ্গ",
    selectGender: "লিঙ্গ বেছে নিন",
    occupation: "পেশা",
    selectOccupation: "পেশা বেছে নিন",
    specifyOccupation: "আপনার পেশা লিখুন",
    phone: "ফোন নম্বর",
    email: "ইমেইল",
    caste: "জাতি / বিভাগ",
    selectCaste: "জাতি বেছে নিন",
    state: "রাজ্য",
    selectState: "রাজ্য বেছে নিন",
    startBtn: "কথোপকথন শুরু করুন",
    saving: "সংরক্ষণ হচ্ছে...",
    namaste: "নমস্কার",
    howHelp: "আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    holdSpeak: "বলতে ধরে রাখুন",
    listening: "শুনছি...",
    processing: "ভাবছি...",
    youSaid: "আপনি বললেন",
    laxmiAI: "লক্ষ্মী AI",
    matchingSchemes: "আপনার জন্য যোজনা",
    details: "বিবরণ",
    logout: "লগআউট",
    footer: "প্রজেক্ট বিকাশ দ্বারা • ভারত",
    connError: "সংযোগ ব্যর্থ।",
    micError: "মাইক্রোফোনের অনুমতি দিন।",
    mongoError: "সিস্টেম সংযোগ ত্রুটি।",
    errName: "পুরো নাম আবশ্যক।",
    errAge: "বয়স ১৮ থেকে ৮৫ এর মধ্যে হতে হবে।",
    errPhone: "সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন।",
    errState: "অনুগ্রহ করে আপনার রাজ্য বেছে নিন।",
    errGender: "অনুগ্রহ করে আপনার লিঙ্গ বেছে নিন।",
    errOccupation: "অনুগ্রহ করে আপনার পেশা বেছে নিন।",
    errCaste: "অনুগ্রহ করে আপনার জাতি বেছে নিন।",
  },
  Marathi: {
    appName: "सरकारी साथी",
    chooseLanguage: "तुमची भाषा निवडा",
    languageSubtitle: "तुम्हाला सर्वात सोयीस्कर वाटणारी भाषा निवडा",
    howToStart: "तुम्ही कसे सुरू करायचे?",
    howToStartSub: "तुमच्यासाठी सर्वोत्तम पर्याय निवडा",
    voiceOption: "लक्ष्मीशी बोला",
    voiceOptionDesc:
      "आवाजाने लक्ष्मीला माहिती सांगा. ती समजून योग्य योजना शोधेल.",
    voiceOptionBtn: "बोलणे सुरू करा",
    formOption: "फॉर्म भरा",
    formOptionDesc: "फॉर्ममध्ये माहिती भरा, मग व्हॉईस चॅटवर जा.",
    formOptionBtn: "फॉर्म उघडा",
    voiceOnboardTitle: "लक्ष्मीला स्वतःबद्दल सांगा",
    voiceOnboardSub:
      "मायक दाबा आणि नाव, वय, लिंग, राज्य, व्यवसाय आणि जात सांगा",
    voiceOnboardHint:
      'उदाहरण: "माझे नाव राजू आहे, मी ३५ वर्षांचा आहे, पुरुष, उत्तर प्रदेश, शेतकरी, सामान्य"',
    processingProfile: "तुमची प्रोफाइल समजली जात आहे...",
    profileFound: "प्रोफाइल समजली!",
    retryVoice: "पुन्हा प्रयत्न करा",
    confirmProfile: "पुष्टी करा आणि पुढे जा",
    hello: "नमस्कार!",
    login: "लॉगिन करा",
    fullName: "पूर्ण नाव",
    age: "वय",
    gender: "लिंग",
    selectGender: "लिंग निवडा",
    occupation: "व्यवसाय",
    selectOccupation: "व्यवसाय निवडा",
    specifyOccupation: "तुमचा व्यवसाय सांगा",
    phone: "फोन नंबर",
    email: "ईमेल",
    caste: "जात / प्रवर्ग",
    selectCaste: "जात निवडा",
    state: "राज्य",
    selectState: "राज्य निवडा",
    startBtn: "संभाषण सुरू करा",
    saving: "जतन होत आहे...",
    namaste: "नमस्कार",
    howHelp: "मी तुमची कशी मदद करू?",
    holdSpeak: "बोलण्यासाठी दाबा",
    listening: "ऐकत आहे...",
    processing: "विचार करत आहे...",
    youSaid: "तुम्ही म्हणालात",
    laxmiAI: "लक्ष्मी AI",
    matchingSchemes: "तुमच्यासाठी योजना",
    details: "तपशील",
    logout: "लॉगआउट",
    footer: "प्रोजेक्ट विकास द्वारे • भारत",
    connError: "कनेक्शन अयशस्वी.",
    micError: "मायक्रोफोनची परवानगी द्या.",
    mongoError: "सिस्टम कनेक्शन त्रुटी.",
    errName: "पूर्ण नाव आवश्यक आहे.",
    errAge: "वय १८ ते ८५ च्या दरम्यान असणे आवश्यक आहे.",
    errPhone: "योग्य १० अंकी भारतीय मोबाइल नंबर प्रविष्ट करा.",
    errState: "कृपया तुमचे राज्य निवडा.",
    errGender: "कृपया तुमचे लिंग निवडा.",
    errOccupation: "कृपया तुमचा व्यवसाय निवडा.",
    errCaste: "कृपया तुमची जात निवडा.",
  },
  Telugu: {
    appName: "సర్కారీ సాథీ",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    languageSubtitle: "మీకు అత్యంత సౌకర్యవంతమైన భాషను ఎంచుకోండి",
    howToStart: "మీరు ఎలా ప్రారంభించాలనుకుంటున్నారు?",
    howToStartSub: "మీకు అత్యంత అనుకూలమైన ఎంపికను ఎంచుకోండి",
    voiceOption: "లక్ష్మితో మాట్లాడండి",
    voiceOptionDesc:
      "మీ వివరాలను వాయిస్ ద్వారా లక్ష్మికి చెప్పండి. ఆమె అర్థం చేసుకుని సరైన పథకాలు కనుగొంటుంది.",
    voiceOptionBtn: "మాట్లాడడం ప్రారంభించండి",
    formOption: "ఫారం నింపండి",
    formOptionDesc:
      "ఫారంలో వివరాలు నమోదు చేయండి, తర్వాత వాయిస్ చాట్‌కు వెళ్ళండి.",
    formOptionBtn: "ఫారం తెరవండి",
    voiceOnboardTitle: "లక్ష్మికి మీ గురించి చెప్పండి",
    voiceOnboardSub:
      "మైక్ పట్టుకోండి మరియు పేరు, వయసు, లింగం, రాష్ట్రం, వృత్తి మరియు కులం చెప్పండి",
    voiceOnboardHint:
      'ఉదాహరణ: "నా పేరు రాజు, నాకు 35 సంవత్సరాలు, పురుషుడు, ఉత్తరప్రదేశ్ నుండి, రైతు, జనరల్"',
    processingProfile: "మీ ప్రొఫైల్ అర్థం చేసుకుంటున్నాను...",
    profileFound: "ప్రొఫైల్ అర్థమైంది!",
    retryVoice: "మళ్ళీ ప్రయత్నించండి",
    confirmProfile: "నిర్ధారించి కొనసాగండి",
    hello: "నమస్కారం!",
    login: "లాగిన్ చేయండి",
    fullName: "పూర్తి పేరు",
    age: "వయసు",
    gender: "లింగం",
    selectGender: "లింగం ఎంచుకోండి",
    occupation: "వృత్తి",
    selectOccupation: "వృత్తి ఎంచుకోండి",
    specifyOccupation: "మీ వృత్తి చెప్పండి",
    phone: "ఫోన్ నంబర్",
    email: "ఇమెయిల్",
    caste: "కులం / వర్గం",
    selectCaste: "కులం ఎంచుకోండి",
    state: "రాష్ట్రం",
    selectState: "రాష్ట్రం ఎంచుకోండి",
    startBtn: "సంభాషణ ప్రారంభించండి",
    saving: "సేవ్ అవుతోంది...",
    namaste: "నమస్కారం",
    howHelp: "నేను మీకు ఎలా సహాయం చేయగలను?",
    holdSpeak: "మాట్లాడటానికి పట్టుకోండి",
    listening: "వింటున్నాను...",
    processing: "ఆలోచిస్తున్నాను...",
    youSaid: "మీరు చెప్పారు",
    laxmiAI: "లక్ష్మి AI",
    matchingSchemes: "మీకు సరిపడే పథకాలు",
    details: "వివరాలు",
    logout: "లాగ్అవుట్",
    footer: "ప్రాజెక్ట్ వికాస్ ద్వారా • భారత్",
    connError: "కనెక్షన్ విఫలమైంది.",
    micError: "మైక్రోఫోన్ అనుమతి ఇవ్వండి.",
    mongoError: "సిస్టమ్ కనెక్షన్ లోపం.",
    errName: "పూర్తి పేరు అవసరం.",
    errAge: "వయసు 18 నుండి 85 మధ్య ఉండాలి.",
    errPhone: "సరైన 10 అంకెల భారతీయ మొబైల్ నంబర్ నమోదు చేయండి.",
    errState: "దయచేసి మీ రాష్ట్రాన్ని ఎంచుకోండి.",
    errGender: "దయచేసి మీ లింగాన్ని ఎంచుకోండి.",
    errOccupation: "దయచేసి మీ వృత్తిని ఎంచుకోండి.",
    errCaste: "దయచేసి మీ కులాన్ని ఎంచుకోండి.",
  },
  Tamil: {
    appName: "சர்க்காரி சாத்தி",
    chooseLanguage: "உங்கள் மொழியை தேர்வு செய்யுங்கள்",
    languageSubtitle: "உங்களுக்கு மிகவும் வசதியான மொழியை தேர்வு செய்யுங்கள்",
    howToStart: "நீங்கள் எப்படி தொடங்க விரும்புகிறீர்கள்?",
    howToStartSub:
      "உங்களுக்கு மிகவும் பொருத்தமான விருப்பத்தை தேர்வு செய்யுங்கள்",
    voiceOption: "லக்ஷ்மியிடம் பேசுங்கள்",
    voiceOptionDesc:
      "குரலில் உங்கள் விவரங்களை லக்ஷ்மியிடம் சொல்லுங்கள். அவள் புரிந்து சரியான திட்டங்களை கண்டுபிடிப்பாள்.",
    voiceOptionBtn: "பேச தொடங்கு",
    formOption: "படிவம் நிரப்புங்கள்",
    formOptionDesc:
      "படிவத்தில் விவரங்களை உள்ளிட்டு, குரல் அரட்டைக்கு செல்லுங்கள்.",
    formOptionBtn: "படிவம் திற",
    voiceOnboardTitle: "லக்ஷ்மியிடம் உங்களைப் பற்றி சொல்லுங்கள்",
    voiceOnboardSub:
      "மைக்கை அழுத்திப் பிடித்து பெயர், வயது, பாலினம், மாநிலம், தொழில் மற்றும் சாதி சொல்லுங்கள்",
    voiceOnboardHint:
      'எடுத்துக்காட்டு: "என் பெயர் ராஜு, வயது 35, ஆண், உத்தரப்பிரதேசம், விவசாயி, பொது வகை"',
    processingProfile: "உங்கள் சுயவிவரம் புரிந்துகொள்ளப்படுகிறது...",
    profileFound: "சுயவிவரம் புரிந்தது!",
    retryVoice: "மீண்டும் முயற்சிக்கவும்",
    confirmProfile: "உறுதிப்படுத்தி தொடரவும்",
    hello: "வணக்கம்!",
    login: "உள்நுழைக",
    fullName: "முழு பெயர்",
    age: "வயது",
    gender: "பாலினம்",
    selectGender: "பாலினம் தேர்வு செய்க",
    occupation: "தொழில்",
    selectOccupation: "தொழில் தேர்வு செய்க",
    specifyOccupation: "உங்கள் தொழிலை குறிப்பிடவும்",
    phone: "தொலைபேசி எண்",
    email: "மின்னஞ்சல்",
    caste: "சாதி / வகை",
    selectCaste: "சாதி தேர்வு செய்க",
    state: "மாநிலம்",
    selectState: "மாநிலம் தேர்வு செய்க",
    startBtn: "உரையாடலை தொடங்கு",
    saving: "சேமிக்கிறது...",
    namaste: "வணக்கம்",
    howHelp: "நான் உங்களுக்கு எப்படி உதவலாம்?",
    holdSpeak: "பேச அழுத்திப் பிடிக்கவும்",
    listening: "கேட்கிறேன்...",
    processing: "யோசிக்கிறேன்...",
    youSaid: "நீங்கள் சொன்னது",
    laxmiAI: "லக்ஷ்மி AI",
    matchingSchemes: "உங்களுக்கான திட்டங்கள்",
    details: "விவரங்கள்",
    logout: "வெளியேறு",
    footer: "திட்ட விகாஸ் மூலம் • பாரத்",
    connError: "இணைப்பு தோல்வி.",
    micError: "மைக்ரோஃபோன் அனுமதி வழங்கவும்.",
    mongoError: "சிஸ்டம் இணைப்பு பிழை.",
    errName: "முழு பெயர் அவசியம்.",
    errAge: "வயது 18 முதல் 85 வரை இருக்க வேண்டும்.",
    errPhone: "சரியான 10 இலக்க இந்திய மொபைல் எண் உள்ளிடவும்.",
    errState: "உங்கள் மாநிலத்தை தேர்வு செய்யவும்.",
    errGender: "உங்கள் பாலினத்தை தேர்வு செய்யவும்.",
    errOccupation: "உங்கள் தொழிலை தேர்வு செய்யவும்.",
    errCaste: "உங்கள் சாதியை தேர்வு செய்யவும்.",
  },
  Gujarati: {
    appName: "સરકારી સાથી",
    chooseLanguage: "તમારી ભાષા પસંદ કરો",
    languageSubtitle: "તમને સૌથી સહજ લાગે તે ભાષા પસંદ કરો",
    howToStart: "તમે કેવી રીતે શરૂ કરવા માગો છો?",
    howToStartSub: "તમારા માટે સૌથી સારો વિકલ્પ પસંદ કરો",
    voiceOption: "લક્ષ્મી સાથે બોલો",
    voiceOptionDesc:
      "અવાજ દ્વારા લક્ષ્મીને માહિતી આપો. તે સમજીને યોગ્ય યોજનાઓ શોધશે.",
    voiceOptionBtn: "બોલવાનું શરૂ કરો",
    formOption: "ફોર્મ ભરો",
    formOptionDesc: "ફોર્મમાં માહિતી ભરો, પછી વૉઇસ ચેટ પર જાઓ.",
    formOptionBtn: "ફોર્મ ખોલો",
    voiceOnboardTitle: "લક્ષ્મીને તમારા વિશે જણાવો",
    voiceOnboardSub:
      "માઇક દબાવો અને નામ, ઉંમર, જાતિ, રાજ્ય, વ્યવસાય અને જ્ઞાતિ જણાવો",
    voiceOnboardHint:
      'ઉદાહરણ: "મારું નામ રાજુ છે, હું ૩૫ વર્ષનો છું, પુરુષ, ઉત્તર પ્રદેશ, ખેડૂત, સામાન્ય"',
    processingProfile: "તમારી પ્રોફાઇલ સમજી રહ્યા છીએ...",
    profileFound: "પ્રોફાઇલ સમજાઈ!",
    retryVoice: "ફરી પ્રયાસ કરો",
    confirmProfile: "પુષ્ટિ કરો અને આગળ વધો",
    hello: "નમસ્તે!",
    login: "લૉગિન કરો",
    fullName: "પૂરું નામ",
    age: "ઉંમર",
    gender: "જાતિ",
    selectGender: "જાતિ પસંદ કરો",
    occupation: "વ્યવસાય",
    selectOccupation: "વ્યવસાય પસંદ કરો",
    specifyOccupation: "તમારો વ્યવસાય જણાવો",
    phone: "ફોન નંબર",
    email: "ઈમેઈલ",
    caste: "જ્ઞાતિ / વર્ગ",
    selectCaste: "જ્ઞાતિ પસંદ કરો",
    state: "રાજ્ય",
    selectState: "રાજ્ય પસંદ કરો",
    startBtn: "વાર્તાલાપ શરૂ કરો",
    saving: "સાચવી રહ્યું છે...",
    namaste: "નમસ્તે",
    howHelp: "હું તમારી કેવી રીતે મદદ કરી શકું?",
    holdSpeak: "બોલવા માટે દબાવો",
    listening: "સાંભળી રહી છું...",
    processing: "વિચારી રહી છું...",
    youSaid: "તમે કહ્યું",
    laxmiAI: "લક્ષ્મી AI",
    matchingSchemes: "તમારા માટે યોજનાઓ",
    details: "વિગત",
    logout: "લૉગઆઉટ",
    footer: "પ્રોજેક્ટ વિકાસ દ્વારા • ભારત",
    connError: "કનેક્શન નિષ્ફળ.",
    micError: "માઈક્રોફોન પરવાનગી આપો.",
    mongoError: "સિસ્ટમ કનેક્શન ભૂલ.",
    errName: "પૂરું નામ આવશ્યક છે.",
    errAge: "ઉંમર ૧૮ થી ૮૫ ની વચ્ચે હોવી જોઈએ.",
    errPhone: "સાચો ૧૦ અંકનો ભારતીય મોબાઇલ નંબર દાખલ કરો.",
    errState: "કૃપા કરીને તમારું રાજ્ય પસંદ કરો.",
    errGender: "કૃપા કરીને તમારી જાતિ પસંદ કરો.",
    errOccupation: "કૃપા કરીને તમારો વ્યવસાય પસંદ કરો.",
    errCaste: "કૃપા કરીને તમારી જ્ઞાતિ પસંદ કરો.",
  },
  Kannada: {
    appName: "ಸರ್ಕಾರಿ ಸಾಥಿ",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    languageSubtitle: "ನಿಮಗೆ ಅತ್ಯಂತ ಅನುಕೂಲಕರ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    howToStart: "ನೀವು ಹೇಗೆ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುತ್ತೀರಿ?",
    howToStartSub: "ನಿಮಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ",
    voiceOption: "ಲಕ್ಷ್ಮಿಯೊಂದಿಗೆ ಮಾತಾಡಿ",
    voiceOptionDesc:
      "ಧ್ವನಿಯ ಮೂಲಕ ಲಕ್ಷ್ಮಿಗೆ ನಿಮ್ಮ ವಿವರಗಳನ್ನು ತಿಳಿಸಿ. ಅವಳು ಅರ್ಥ ಮಾಡಿಕೊಂಡು ಸರಿಯಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುತ್ತಾಳೆ.",
    voiceOptionBtn: "ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ",
    formOption: "ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ",
    formOptionDesc:
      "ಫಾರ್ಮ್‌ನಲ್ಲಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ, ನಂತರ ವಾಯ್ಸ್ ಚಾಟ್‌ಗೆ ಹೋg��ಿ.",
    formOptionBtn: "ಫಾರ್ಮ್ ತೆರೆಯಿರಿ",
    voiceOnboardTitle: "ಲಕ್ಷ್ಮಿಗೆ ನಿಮ್ಮ ಬಗ್ಗೆ ಹೇಳಿ",
    voiceOnboardSub:
      "ಮೈಕ್ ಹಿಡಿದು ಹೆಸರು, ವಯಸ್ಸು, ಲಿಂಗ, ರಾಜ್ಯ, ವೃತ್ತಿ ಮತ್ತು ಜಾತಿ ಹೇಳಿ",
    voiceOnboardHint:
      'ಉದಾಹರಣೆ: "ನನ್ನ ಹೆಸರು ರಾಜು, ನನಗೆ 35 ವರ್ಷ, ಪುರುಷ, ಉತ್ತರ ಪ್ರದೇಶ, ರೈತ, ಸಾಮಾನ್ಯ"',
    processingProfile: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    profileFound: "ಪ್ರೊಫೈಲ್ ಅರ್ಥವಾಯಿತು!",
    retryVoice: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    confirmProfile: "ದೃಢಪಡಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ",
    hello: "ನಮಸ್ಕಾರ!",
    login: "ಲಾಗಿನ್ ಮಾಡಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    age: "ವಯಸ್ಸು",
    gender: "ಲಿಂಗ",
    selectGender: "ಲಿಂಗ ಆಯ್ಕೆ ಮಾಡಿ",
    occupation: "ವೃತ್ತಿ",
    selectOccupation: "ವೃತ್ತಿ ಆಯ್ಕೆ ಮಾಡಿ",
    specifyOccupation: "ನಿಮ್ಮ ವೃತ್ತಿ ನಮೂದಿಸಿ",
    phone: "ಫೋನ್ ನಂಬರ್",
    email: "ಇಮೇಲ್",
    caste: "ಜಾತಿ / ವರ್ಗ",
    selectCaste: "ಜಾತಿ ಆಯ್ಕೆ ಮಾಡಿ",
    state: "ರಾಜ್ಯ",
    selectState: "ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ",
    startBtn: "ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    namaste: "ನಮಸ್ಕಾರ",
    howHelp: "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    holdSpeak: "ಮಾತನಾಡಲು ಹಿಡಿದುಕೊಳ್ಳಿ",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ...",
    processing: "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...",
    youSaid: "ನೀವು ಹೇಳಿದ್ದು",
    laxmiAI: "ಲಕ್ಷ್ಮಿ AI",
    matchingSchemes: "ನಿಮಗಾಗಿ ಯೋಜನೆಗಳು",
    details: "ವಿವರಗಳು",
    logout: "ಲಾಗ್ಔಟ್",
    footer: "ಪ್ರಾಜೆಕ್ಟ್ ವಿಕಾಸ್ ಮೂಲಕ • ಭಾರತ",
    connError: "ಸಂಪರ್ಕ ವಿಫಲವಾಯಿತು.",
    micError: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
    mongoError: "ಸಿಸ್ಟಮ್ ಸಂಪರ್ಕ ದೋಷ.",
    errName: "ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯ.",
    errAge: "ವಯಸ್ಸು ೧೮ ರಿಂದ ೮೫ ರ ನಡುವೆ ಇರಬೇಕು.",
    errPhone: "ಸರಿಯಾದ ೧೦ ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ.",
    errState: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ.",
    errGender: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಲಿಂಗ ಆಯ್ಕೆ ಮಾಡಿ.",
    errOccupation: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ವೃತ್ತಿ ಆಯ್ಕೆ ಮಾಡಿ.",
    errCaste: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಾತಿ ಆಯ್ಕೆ ಮಾಡಿ.",
  },
  Odia: {
    appName: "ସରକାରୀ ସାଥୀ",
    chooseLanguage: "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ",
    languageSubtitle: "ଆପଣ ସବୁଠାରୁ ସହଜ ଅନୁଭବ କରୁଥିବା ଭାଷା ବାଛନ୍ତୁ",
    howToStart: "ଆପଣ କିପରି ଆରମ୍ଭ କରିବାକୁ ଚାହାଁନ୍ତି?",
    howToStartSub: "ଆପଣଙ୍କ ପାଇଁ ସର୍ବୋତ୍ତମ ବିକଳ୍ପ ବାଛନ୍ତୁ",
    voiceOption: "ଲକ୍ଷ୍ମୀ ସହ କଥା ହୁଅନ୍ତୁ",
    voiceOptionDesc: "କଣ୍ଠ ଦ୍ୱାରା ଲକ୍ଷ୍ମୀଙ୍କୁ ଆପଣଙ୍କ ବିବରଣ ଜଣାନ୍ତୁ।",
    voiceOptionBtn: "କଥା ଆରମ୍ଭ କରନ୍ତୁ",
    formOption: "ଫର୍ମ ପୂରଣ କରନ୍ତୁ",
    formOptionDesc: "ଫର୍ମରେ ବିବରଣ ଭର୍ତ୍ତି କରନ୍ତୁ, ତା'ପରେ ଭଏସ ଚାଟ୍‌କୁ ଯାଆନ୍ତୁ।",
    formOptionBtn: "ଫର୍ମ ଖୋଲନ୍ତୁ",
    voiceOnboardTitle: "ଲକ୍ଷ୍ମୀଙ୍କୁ ନିଜ ବିଷୟରେ ବୁଝାନ୍ତୁ",
    voiceOnboardSub:
      "ମାଇକ୍ ଦବାନ୍ତୁ ଏବଂ ନାମ, ବୟସ, ଲିଙ୍ଗ, ରାଜ୍ୟ, ବୃତ୍ତି ଓ ଜାତି କୁହନ୍ତୁ",
    voiceOnboardHint:
      'ଉଦାହରଣ: "ମୋ ନାମ ରାଜୁ, ବୟସ ୩୫, ପୁରୁଷ, ଉତ୍ତର ପ୍ରଦେଶ, କୃଷକ, ସାଧାରଣ"',
    processingProfile: "ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ବୁଝାଯାଉଛି...",
    profileFound: "ପ୍ରୋଫାଇଲ ବୁଝାଗଲା!",
    retryVoice: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
    confirmProfile: "ନିଶ୍ଚିତ କରନ୍ତୁ ଓ ଆଗକୁ ଯାଆନ୍ତୁ",
    hello: "ନମସ୍କାର!",
    login: "ଲଗଇନ୍ କରନ୍ତୁ",
    fullName: "ପୂରା ନାମ",
    age: "ବୟସ",
    gender: "ଲିଙ୍ଗ",
    selectGender: "ଲିଙ୍ଗ ବାଛନ୍ତୁ",
    occupation: "ବୃତ୍ତି",
    selectOccupation: "ବୃତ୍ତି ବାଛନ୍ତୁ",
    specifyOccupation: "ଆପଣଙ୍କ ବୃତ୍ତି ଲେଖନ୍ତୁ",
    phone: "ଫୋନ୍ ନମ୍ବର",
    email: "ଇମେଲ୍",
    caste: "ଜାତି / ବର୍ଗ",
    selectCaste: "ଜାତି ବାଛନ୍ତୁ",
    state: "ରାଜ୍ୟ",
    selectState: "ରାଜ୍ୟ ବାଛନ୍ତୁ",
    startBtn: "କଥୋପକଥନ ଆରମ୍ଭ",
    saving: "ସଞ୍ଚୟ ହେଉଛି...",
    namaste: "ନମସ୍କାର",
    howHelp: "ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    holdSpeak: "କହିବାକୁ ଦବାଇ ଧରନ୍ତୁ",
    listening: "ଶୁଣୁଛି...",
    processing: "ଭାବୁଛି...",
    youSaid: "ଆପଣ କହିଲେ",
    laxmiAI: "ଲକ୍ଷ୍ମୀ AI",
    matchingSchemes: "ଆପଣଙ୍କ ପାଇଁ ଯୋଜନା",
    details: "ବିବରଣୀ",
    logout: "ଲଗଆଉଟ୍",
    footer: "ପ୍ରୋଜେକ୍ଟ ବିକାଶ ଦ୍ୱାରା • ଭାରତ",
    connError: "ସଂଯୋଗ ବିଫଳ।",
    micError: "ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ଦିଅନ୍ତୁ।",
    mongoError: "ସିଷ୍ଟମ୍ ତ୍ରୁଟି।",
    errName: "ପୂରା ନାମ ଆବଶ୍ୟକ।",
    errAge: "ବୟସ ୧୮ ରୁ ୮୫ ମଧ୍ୟରେ ହେବା ଦରକାର।",
    errPhone: "ସଠିକ ୧୦ ଅଙ୍କ ଭାରତୀୟ ମୋବାଇଲ ନମ୍ବର ଦିଅନ୍ତୁ।",
    errState: "ଦୟାକରି ଆପଣଙ୍କ ରାଜ୍ୟ ବାଛନ୍ତୁ।",
    errGender: "ଦୟାକରି ଆପଣଙ୍କ ଲିଙ୍ଗ ବାଛନ୍ତୁ।",
    errOccupation: "ଦୟାକରି ଆପଣଙ୍କ ବୃତ୍ତି ବାଛନ୍ତୁ।",
    errCaste: "ଦୟାକରି ଆପଣଙ୍କ ଜାତି ବାଛନ୍ତୁ।",
  },
  Punjabi: {
    appName: "ਸਰਕਾਰੀ ਸਾਥੀ",
    chooseLanguage: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
    languageSubtitle: "ਉਹ ਭਾਸ਼ਾ ਚੁਣੋ ਜਿਸ ਵਿੱਚ ਤੁਸੀਂ ਸਭ ਤੋਂ ਅਰਾਮਦੇਹ ਹੋ",
    howToStart: "ਤੁਸੀਂ ਕਿਵੇਂ ਸ਼ੁਰੂ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    howToStartSub: "ਉਹ ਵਿਕਲਪ ਚੁਣੋ ਜੋ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੋਵੇ",
    voiceOption: "ਲਕਸ਼ਮੀ ਨਾਲ ਬੋਲੋ",
    voiceOptionDesc:
      "ਆਵਾਜ਼ ਦੁਆਰਾ ਲਕਸ਼ਮੀ ਨੂੰ ਆਪਣੀ ਜਾਣਕਾਰੀ ਦਿਓ। ਉਹ ਸਮਝ ਕੇ ਸਹੀ ਯੋਜਨਾਵਾਂ ਲੱਭੇਗੀ।",
    voiceOptionBtn: "ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ",
    formOption: "ਫਾਰਮ ਭਰੋ",
    formOptionDesc: "ਫਾਰਮ ਵਿੱਚ ਜਾਣਕਾਰੀ ਭਰੋ, ਫਿਰ ਵੌਇਸ ਚੈਟ ਤੇ ਜਾਓ।",
    formOptionBtn: "ਫਾਰਮ ਖੋਲੋ",
    voiceOnboardTitle: "ਲਕਸ਼ਮੀ ਨੂੰ ਆਪਣੇ ਬਾਰੇ ਦੱਸੋ",
    voiceOnboardSub: "ਮਾਈਕ ਦਬਾਓ ਅਤੇ ਨਾਮ, ਉਮਰ, ਲਿੰਗ, ਰਾਜ, ਕਿੱਤਾ ਅਤੇ ਜਾਤੀ ਦੱਸੋ",
    voiceOnboardHint:
      'ਉਦਾਹਰਣ: "ਮੇਰਾ ਨਾਮ ਰਾਜੂ ਹੈ, ਮੈਂ 35 ਸਾਲ ਦਾ ਹਾਂ, ਪੁਰਸ਼, ਉੱਤਰ ਪ੍ਰਦੇਸ਼, ਕਿਸਾਨ, ਸਾਧਾਰਨ"',
    processingProfile: "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਸਮਝੀ ਜਾ ਰਹੀ ਹੈ...",
    profileFound: "ਪ੍ਰੋਫਾਈਲ ਸਮਝ ਗਈ!",
    retryVoice: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    confirmProfile: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਅੱਗੇ ਵਧੋ",
    hello: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!",
    login: "ਲੌਗਿਨ ਕਰੋ",
    fullName: "ਪੂਰਾ ਨਾਮ",
    age: "ਉਮਰ",
    gender: "ਲਿੰਗ",
    selectGender: "ਲਿੰਗ ਚੁਣੋ",
    occupation: "ਕਿੱਤਾ",
    selectOccupation: "ਕਿੱਤਾ ਚੁਣੋ",
    specifyOccupation: "ਆਪਣਾ ਕਿੱਤਾ ਦੱਸੋ",
    phone: "ਫ਼ੋਨ ਨੰਬਰ",
    email: "ਈਮੇਲ",
    caste: "ਜਾਤੀ / ਵਰਗ",
    selectCaste: "ਜਾਤੀ ਚੁਣੋ",
    state: "ਰਾਜ",
    selectState: "ਰਾਜ ਚੁਣੋ",
    startBtn: "ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ",
    saving: "ਸੁਰੱਖਿਅਤ ਹੋ ਰਿਹਾ ਹੈ...",
    namaste: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    howHelp: "ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?",
    holdSpeak: "ਬੋਲਣ ਲਈ ਦਬਾਓ",
    listening: "ਸੁਣ ਰਹੀ ਹਾਂ...",
    processing: "ਸੋਚ ਰਹੀ ਹਾਂ...",
    youSaid: "ਤੁਸੀਂ ਕਿਹਾ",
    laxmiAI: "ਲਕਸ਼ਮੀ AI",
    matchingSchemes: "ਤੁਹਾਡੇ ਲਈ ਯੋਜਨਾਵਾਂ",
    details: "ਵੇਰਵੇ",
    logout: "ਲੌਗਆਉਟ",
    footer: "ਪ੍ਰੋਜੈਕਟ ਵਿਕਾਸ ਦੁਆਰਾ • ਭਾਰਤ",
    connError: "ਕੁਨੈਕਸ਼ਨ ਅਸਫਲ।",
    micError: "ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।",
    mongoError: "ਸਿਸਟਮ ਕਨੈਕਸ਼ਨ ਗਲਤੀ।",
    errName: "ਪੂਰਾ ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ।",
    errAge: "ਉਮਰ 18 ਤੋਂ 85 ਦੇ ਵਿਚਕਾਰ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।",
    errPhone: "ਸਹੀ 10 ਅੰਕਾਂ ਵਾਲਾ ਭਾਰਤੀ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।",
    errState: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਾਜ ਚੁਣੋ।",
    errGender: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਲਿੰਗ ਚੁਣੋ।",
    errOccupation: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਕਿੱਤਾ ਚੁਣੋ।",
    errCaste: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਾਤੀ ਚੁਣੋ।",
  },
  Malayalam: {
    appName: "സർക്കാർ സാഥി",
    chooseLanguage: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    languageSubtitle: "നിങ്ങൾക്ക് ഏറ്റവും സൗകര്യപ്രദമായ ഭാഷ തിരഞ്ഞെടുക്കുക",
    howToStart: "നിങ്ങൾ എങ്ങനെ ആരംഭിക്കാൻ ആഗ്രഹിക്കുന്നു?",
    howToStartSub: "നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായ ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക",
    voiceOption: "ലക്ഷ്മിയോട് സംസാരിക്കൂ",
    voiceOptionDesc:
      "ശബ്ദത്തിലൂടെ ലക്ഷ്മിക്ക് വിവരങ്ങൾ നൽകൂ. അവൾ മനസ്സിലാക്കി ശരിയായ പദ്ധതികൾ കണ്ടെത്തും.",
    voiceOptionBtn: "സംസാരം ആരംഭിക്കൂ",
    formOption: "ഫോം പൂരിപ്പിക്കൂ",
    formOptionDesc: "ഫോമിൽ വിവരങ്ങൾ നൽകി വോയ്സ് ചാറ്റിലേക്ക് പോകൂ.",
    formOptionBtn: "ഫോം തുറക്കൂ",
    voiceOnboardTitle: "ലക്ഷ്മിക്ക് നിങ്ങളെക്കുറിച്ച് പറയൂ",
    voiceOnboardSub:
      "മൈക്ക് പിടിച്ചു പേര്, പ്രായം, ലിംഗം, സംസ്ഥാനം, തൊഴിൽ, ജാതി പറയൂ",
    voiceOnboardHint:
      'ഉദാഹരണം: "എന്റെ പേര് രാജു, 35 വയസ്സ്, പുരുഷൻ, ഉത്തർ പ്രദേശ്, കർഷകൻ, ജനറൽ"',
    processingProfile: "നിങ്ങളുടെ പ്രൊഫൈൽ മനസ്സിലാക്കുന്നു...",
    profileFound: "പ്രൊഫൈൽ മനസ്സിലായി!",
    retryVoice: "വീണ്ടും ശ്രമിക്കൂ",
    confirmProfile: "സ്ഥിരീകരിച്ച് തുടരൂ",
    hello: "നമസ്കാരം!",
    login: "ലോഗിൻ ചെയ്യുക",
    fullName: "പൂർണ്ണ നാമം",
    age: "പ്രായം",
    gender: "ലിംഗം",
    selectGender: "ലിംഗം തിരഞ്ഞെടുക്കുക",
    occupation: "തൊഴിൽ",
    selectOccupation: "തൊഴിൽ തിരഞ്ഞെടുക്കുക",
    specifyOccupation: "നിങ്ങളുടെ തൊഴിൽ നൽകുക",
    phone: "ഫോൺ നമ്പർ",
    email: "ഇമെയിൽ",
    caste: "ജാതി / വിഭാഗം",
    selectCaste: "ജാതി തിരഞ്ഞെടുക്കുക",
    state: "സംസ്ഥാനം",
    selectState: "സംസ്ഥാനം തിരഞ്ഞെടുക്കുക",
    startBtn: "സംഭാഷണം ആരംഭിക്കുക",
    saving: "സംരക്ഷിക്കുന്നു...",
    namaste: "നമസ്കാരം",
    howHelp: "എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
    holdSpeak: "സംസാരിക്കാൻ അമർത്തിപ്പിടിക്കുക",
    listening: "കേൾക്കുന്നു...",
    processing: "ചിന്തിക്കുന്നു...",
    youSaid: "നിങ്ങൾ പറഞ്ഞത്",
    laxmiAI: "ലക്ഷ്മി AI",
    matchingSchemes: "നിങ്ങൾക്കുള്ള പദ്ധതികൾ",
    details: "വിശദാംശങ്ങൾ",
    logout: "ലോഗ്ഔട്ട്",
    footer: "പ്രോജക്ട് വികാസ് വഴി • ഭാരത്",
    connError: "കണക്ഷൻ പരാജയപ്പെട്ടു.",
    micError: "മൈക്രോഫോൺ അനുമതി നൽകുക.",
    mongoError: "സിസ്റ്റം കണക്ഷൻ പിശക്.",
    errName: "പൂർണ്ണ നാമം ആവശ്യമാണ്.",
    errAge: "പ്രായം 18 നും 85 നും ഇടയിൽ ആയിരിക്കണം.",
    errPhone: "ശരിയായ 10 അക്ക ഇന്ത്യൻ മൊബൈൽ നമ്പർ നൽകുക.",
    errState: "ദയവായി നിങ്ങളുടെ സംസ്ഥാനം തിരഞ്ഞെടുക്കുക.",
    errGender: "ദയവായി നിങ്ങളുടെ ലിംഗം തിരഞ്ഞെടുക്കുക.",
    errOccupation: "ദയവായി നിങ്ങളുടെ തൊഴിൽ തിരഞ്ഞെടുക്കുക.",
    errCaste: "ദയവായി നിങ്ങളുടെ ജാതി തിരഞ്ഞെടുക്കുക.",
  },
};

// ─── Shared UI components ────────────────────────────────────────────────────
const SoundWave = ({ active }: { active: boolean }) => {
  const bars = [
    0.3, 0.6, 0.9, 0.7, 1, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.3, 0.5, 0.8, 0.4,
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        height: 40,
        marginTop: 15,
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: active ? `${Math.max(8, h * 30)}px` : "4px",
            opacity: active ? 1 : 0.3,
            transition: "height 0.2s ease",
            animation: active
              ? `waveBar ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
};

const LaxmiAvatar = ({
  isListening,
  isSpeaking,
}: {
  isListening: boolean;
  isSpeaking: boolean;
}) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: 320,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div className="flag-wrapper">
      <svg
        viewBox="0 0 800 400"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <g opacity="0.9">
          <path
            className="ribbon-saffron"
            d="M100,150 C250,50 550,250 700,150 L700,200 C550,300 250,100 100,200 Z"
          />
          <path
            className="ribbon-white"
            d="M100,200 C250,100 550,300 700,200 L700,250 C550,350 250,150 100,250 Z"
          />
          <path
            className="ribbon-green"
            d="M100,250 C250,150 550,350 700,250 L700,300 C550,400 250,200 100,300 Z"
          />
          <circle className="ribbon-chakra" cx="400" cy="225" r="20" />
        </g>
      </svg>
    </div>
    <div className="avatar-container avatar-float">
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,#0d47a1 0%,#1565c0 40%,#0288d1 100%)",
          border: `4px solid ${isListening ? "#ef5350" : isSpeaking ? "#4fc3f7" : "#ffffff"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 100 100">
          <path
            d="M 25 50 Q 25 20 50 20 Q 75 20 75 50 L 80 80 L 20 80 Z"
            fill="#1a1a1a"
          />
          <path
            d="M 30 45 C 30 30, 70 30, 70 45 C 70 65, 50 80, 30 45"
            fill="#f5c6a0"
          />
          <g style={{ animation: "blink 4s infinite" }}>
            <circle cx="40" cy="50" r="3.5" fill="#1a1a2e" />
            <circle cx="60" cy="50" r="3.5" fill="#1a1a2e" />
          </g>
          <path
            d={isSpeaking ? "M 42 65 Q 50 72 58 65" : "M 43 66 Q 50 69 57 66"}
            stroke="#c2185b"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg,#1565c0,#0288d1)",
            padding: "4px 20px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            color: "white",
            letterSpacing: 1,
          }}
        >
          LAXMI AI
        </div>
      </div>
    </div>
  </div>
);

const FieldError = ({ msg }: { msg: string }) =>
  msg ? (
    <p
      style={{
        color: "#e53935",
        fontSize: "0.75rem",
        fontWeight: 600,
        marginTop: 5,
        marginBottom: 0,
      }}
    >
      ⚠ {msg}
    </p>
  ) : null;

const BackBtn = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <div style={{ position: "fixed", top: 16, left: 20, zIndex: 101 }}>
    <button
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(15,101,192,0.2)",
        borderRadius: 20,
        padding: "6px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "#1565c0",
        cursor: "pointer",
      }}
    >
      ← {label}
    </button>
  </div>
);

const FlagBar = () => (
  <div
    style={{
      height: 4,
      background:
        "linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)",
      width: "100%",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
    }}
  />
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);

  // 0=language  1=onboarding choice  2=voice onboarding  3=form  4=chat
  const [step, setStep] = useState(0);

  const [userData, setUserData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    language: "",
    state: "",
    occupation: "",
    gender: "",
    caste: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [schemes, setSchemes] = useState([]);
  const [speakingSchemeId, setSpeakingSchemeId] = useState<string | null>(null);
  const [customOccupation, setCustomOccupation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");

  // Voice onboarding specific state
  const [voiceOnboardStatus, setVoiceOnboardStatus] = useState<
    "idle" | "recording" | "processing" | "done" | "error"
  >("idle");
  const [parsedProfile, setParsedProfile] = useState<Record<
    string,
    string
  > | null>(null);
  const [voiceOnboardTranscript, setVoiceOnboardTranscript] = useState("");

  // Send-documents modal state
  const [sendModal, setSendModal] = useState<{ scheme: any } | null>(null);
  const [sendChannel, setSendChannel] = useState<"whatsapp" | "email">(
    "whatsapp",
  );
  const [sendContact, setSendContact] = useState("");
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [sendError, setSendError] = useState("");

  // ── Aadhaar verification state (gates document delivery) ─────────────────
  const [aadhaarStep, setAadhaarStep] = useState<"input" | "otp" | "verified">(
    "input",
  );
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarRefId, setAadhaarRefId] = useState<number | null>(null);
  const [aadhaarStatus, setAadhaarStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [aadhaarError, setAadhaarError] = useState("");

  // ── Location state ────────────────────────────────────────────────────────
  // "unseen"  = banner not shown yet
  // "asking"  = permission dialog open (browser)
  // "granted" = we have coords
  // "denied"  = user said no or browser blocked
  type LocationState = "unseen" | "asking" | "granted" | "denied";
  const [locationState, setLocationState] = useState<LocationState>("unseen");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Nearby-centers modal state
  const [nearbyModal, setNearbyModal] = useState<{ scheme: any } | null>(null);
  const [nearbyStatus, setNearbyStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [nearbyCenters, setNearbyCenters] = useState<any[]>([]);
  const [nearbyInstruction, setNearbyInstruction] = useState("");
  const [nearbyFormInfo, setNearbyFormInfo] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatMediaRecorder = useRef<MediaRecorder | null>(null);
  const chatAudioChunks = useRef<Blob[]>([]);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const t = (key: string) =>
    (UI_TEXT[userData.language] ?? UI_TEXT["English"])[key] ??
    UI_TEXT["English"][key];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = async (text: string) => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    setIsSpeaking(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: userData.language }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingSchemeId(null);
        URL.revokeObjectURL(url);
        currentAudio.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setSpeakingSchemeId(null);
        currentAudio.current = null;
      };
      await audio.play();
    } catch {
      setIsSpeaking(false);
      setSpeakingSchemeId(null);
    }
  };

  const stopSpeaking = () => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    setIsSpeaking(false);
    setSpeakingSchemeId(null);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const txt = UI_TEXT[userData.language] ?? UI_TEXT["English"];
    const e: Record<string, string> = {};
    if (!userData.name.trim()) e.name = txt.errName;
    const a = parseInt(userData.age);
    if (!userData.age || isNaN(a) || a < 18 || a > 85) e.age = txt.errAge;
    if (!userData.phone || !INDIAN_PHONE_REGEX.test(userData.phone.trim()))
      e.phone = txt.errPhone;
    if (!userData.state) e.state = txt.errState;
    if (!userData.gender) e.gender = txt.errGender;
    if (
      !userData.occupation ||
      (userData.occupation === "Others" && !customOccupation.trim())
    )
      e.occupation = txt.errOccupation;
    if (!userData.caste) e.caste = txt.errCaste;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Login & scheme fetch (shared by both paths) ───────────────────────────
  const doLoginAndFetchSchemes = async (profile: typeof userData) => {
    setStatus("thinking");
    try {
      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!loginRes.ok) throw new Error("Login failed");

      // Find schemes via AI web search (Python backend)
      const schemeRes = await fetch(`${BACKEND_URL}/api/find-schemes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: profile.age,
          gender: profile.gender,
          occupation: profile.occupation,
          caste: profile.caste,
          state: profile.state,
          language: profile.language,
        }),
      });
      const schemeData = await schemeRes.json();
      const matchedSchemes = schemeData.schemes ?? [];

      setSchemes(matchedSchemes);
      setStep(4);
      setStatus("idle");

      const greeting = `${UI_TEXT[profile.language]?.namaste ?? "Namaste"} ${profile.name}! ${matchedSchemes.length} ${UI_TEXT[profile.language]?.matchingSchemes ?? "matching schemes found"}. ${UI_TEXT[profile.language]?.howHelp ?? "How can I help you?"}`;
      setResponseText(greeting);
      speak(greeting);
    } catch {
      alert(t("mongoError"));
      setStatus("idle");
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalProfile =
      userData.occupation === "Others" && customOccupation.trim()
        ? { ...userData, occupation: customOccupation.trim() }
        : userData;
    await doLoginAndFetchSchemes(finalProfile);
  };

  // ── Voice onboarding recording ────────────────────────────────────────────
  const startVoiceOnboard = async () => {
    if (
      voiceOnboardStatus === "recording" ||
      voiceOnboardStatus === "processing"
    )
      return;
    setVoiceOnboardStatus("recording"); // set BEFORE await so stop guard works immediately
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      // 250ms timeslice flushes data incrementally — prevents corrupted webm on short recordings
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // always release mic
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) processVoiceOnboard(blob);
        else setVoiceOnboardStatus("error");
      };
      mediaRecorderRef.current.start(250); // timeslice: 250ms
    } catch {
      setVoiceOnboardStatus("idle");
      alert(t("micError"));
    }
  };

  const stopVoiceOnboard = () => {
    // Check recorder.state directly — immune to React state timing issues
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop(); // triggers onstop which calls processVoiceOnboard
      setVoiceOnboardStatus("processing");
    } else if (voiceOnboardStatus === "recording") {
      // Recorder not started yet (still awaiting getUserMedia) — reset cleanly
      setVoiceOnboardStatus("idle");
    }
  };

  // Send audio to backend → STT → LLM parses profile fields
  const processVoiceOnboard = async (blob: Blob) => {
    setVoiceOnboardStatus("processing");
    try {
      // Step 1: transcribe via our upload-audio endpoint (STT only path)
      const form = new FormData();
      form.append("file", blob, "onboard.webm");
      form.append("user_name", "unknown");
      form.append("user_phone", "0000000000");
      form.append("user_language", userData.language);
      form.append("user_state", "unknown");
      form.append("user_age", "0");
      form.append("user_gender", "unknown");
      form.append("user_occupation", "unknown");

      const sttRes = await fetch(`${BACKEND_URL}/api/upload-audio`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(30000),
      });
      const sttData = await sttRes.json();
      const spokenText = sttData.transcription || "";
      setVoiceOnboardTranscript(spokenText);

      if (!spokenText) {
        setVoiceOnboardStatus("error");
        return;
      }

      // Step 2: Ask LLM to parse the spoken text into structured profile fields
      const parseRes = await fetch(`${BACKEND_URL}/api/parse-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spokenText, language: userData.language }),
      });
      const parseData = await parseRes.json();

      if (parseData.status === "Success" && parseData.profile) {
        setParsedProfile(parseData.profile);
        setVoiceOnboardStatus("done");
      } else {
        setVoiceOnboardStatus("error");
      }
    } catch {
      setVoiceOnboardStatus("error");
    }
  };

  // User confirms parsed profile → proceed to chat
  const confirmVoiceProfile = async () => {
    if (!parsedProfile) return;

    // Replace any "unknown" values with safe defaults so the login
    // route's required-field checks always pass.
    // Phone is never spoken by voice users — generate a unique placeholder.
    const merged = {
      ...userData,
      name:
        parsedProfile.name && parsedProfile.name !== "unknown"
          ? parsedProfile.name
          : userData.name || "Voice User",
      age:
        parsedProfile.age && parsedProfile.age !== "unknown"
          ? parsedProfile.age
          : userData.age || "30",
      gender:
        parsedProfile.gender && parsedProfile.gender !== "unknown"
          ? parsedProfile.gender
          : userData.gender || "Other",
      state:
        parsedProfile.state && parsedProfile.state !== "unknown"
          ? parsedProfile.state
          : userData.state || "Delhi",
      occupation:
        parsedProfile.occupation && parsedProfile.occupation !== "unknown"
          ? parsedProfile.occupation
          : userData.occupation || "Others",
      caste:
        parsedProfile.caste && parsedProfile.caste !== "unknown"
          ? parsedProfile.caste
          : userData.caste || "General",
      phone: userData.phone || `VOICE-${Date.now()}`,
    };

    setUserData(merged);
    await doLoginAndFetchSchemes(merged);
  };

  // ── Chat recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    if (isRecording || status === "thinking") return;
    stopSpeaking();
    setIsRecording(true);
    setStatus("listening");
    setResponseText(""); // set first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chatMediaRecorder.current = new MediaRecorder(stream);
      chatAudioChunks.current = [];
      // 250ms timeslice — incremental flush prevents corrupted webm
      chatMediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chatAudioChunks.current.push(e.data);
      };
      chatMediaRecorder.current.onstop = () => {
        stream.getTracks().forEach((track) => track.stop()); // always release mic
        const blob = new Blob(chatAudioChunks.current, { type: "audio/webm" });
        if (blob.size > 0) uploadChatAudio(blob);
        else {
          setIsRecording(false);
          setStatus("idle");
        }
      };
      chatMediaRecorder.current.start(250); // timeslice: 250ms
    } catch {
      setIsRecording(false);
      setStatus("idle");
      alert(t("micError"));
    }
  };

  const stopRecording = () => {
    // Use recorder.state — immune to React state batching delays
    if (
      chatMediaRecorder.current &&
      chatMediaRecorder.current.state === "recording"
    ) {
      chatMediaRecorder.current.stop(); // triggers onstop → uploadChatAudio
      setIsRecording(false);
    } else if (isRecording) {
      // getUserMedia still pending — reset cleanly
      setIsRecording(false);
      setStatus("idle");
    }
  };

  const uploadChatAudio = async (blob: Blob) => {
    setStatus("thinking");
    const form = new FormData();
    form.append("file", blob, "recording.webm");
    form.append("user_name", userData.name);
    form.append("user_phone", userData.phone);
    form.append("user_state", userData.state);
    form.append("user_age", userData.age);
    form.append("user_gender", userData.gender);
    form.append("user_occupation", userData.occupation);
    form.append("user_language", userData.language);
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-audio`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(30000), // 30s timeout — prevents indefinite hang
      });
      const data = await res.json();
      if (res.ok && data.status === "Success") {
        setTranscript(data.transcription);
        setResponseText(data.ai_response);
        setStatus("done");
        speak(data.ai_response);
      } else if (
        data.status === "Error" &&
        data.message === "No speech detected"
      ) {
        setStatus("idle");
        setResponseText(
          t("noSpeech") || "No speech detected. Please try again.",
        );
      } else {
        throw new Error(data.message || "Server error");
      }
    } catch (err: any) {
      setStatus("idle");
      setIsRecording(false);
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        setResponseText(
          "Connection timed out. Please check your internet and try again.",
        );
      } else if (
        err?.message?.includes("fetch") ||
        err?.message?.includes("network") ||
        err?.message?.includes("Failed")
      ) {
        setResponseText(
          "Could not reach the server. Please check your connection and try again.",
        );
      } else {
        setResponseText(
          t("connError") || "Something went wrong. Please try again.",
        );
      }
    }
  };

  // ── Send documents (WhatsApp or Email) ───────────────────────────────────

  // ── Aadhaar OTP: Step 1 — request OTP ────────────────────────────────────
  const requestAadhaarOtp = async () => {
    const num = aadhaarNumber.replace(/\s/g, "");
    if (num.length !== 12 || !/^\d{12}$/.test(num)) {
      setAadhaarError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setAadhaarStatus("loading");
    setAadhaarError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/aadhaar-send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar_number: num }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json();
      if (res.ok && data.status === "Success") {
        setAadhaarRefId(data.reference_id);
        setAadhaarStep("otp");
        setAadhaarStatus("idle");
      } else {
        setAadhaarError(
          data.detail ||
            data.message ||
            "Could not send OTP. Please try again.",
        );
        setAadhaarStatus("error");
      }
    } catch {
      setAadhaarError(
        "Network error. Please check your connection and try again.",
      );
      setAadhaarStatus("error");
    }
  };

  // ── Aadhaar OTP: Step 2 — verify OTP ────────────────────────────────────
  const verifyAadhaarOtp = async () => {
    if (aadhaarOtp.length !== 6) {
      setAadhaarError("Please enter the 6-digit OTP.");
      return;
    }
    setAadhaarStatus("loading");
    setAadhaarError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/aadhaar-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: aadhaarRefId, otp: aadhaarOtp }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setAadhaarStep("verified");
        setAadhaarStatus("idle");
      } else {
        setAadhaarError(data.message || "Incorrect OTP. Please try again.");
        setAadhaarStatus("error");
      }
    } catch {
      setAadhaarError("Network error. Please try again.");
      setAadhaarStatus("error");
    }
  };

  const sendDocuments = async () => {
    if (!sendModal || !sendContact.trim()) return;
    setSendStatus("sending");
    setSendError("");
    try {
      const endpoint =
        sendChannel === "whatsapp" ? "/api/send-whatsapp" : "/api/send-email";
      const payload =
        sendChannel === "whatsapp"
          ? {
              scheme_name: sendModal.scheme.name,
              phone: sendContact.trim(),
              user_name: userData.name,
              language: userData.language,
            }
          : {
              scheme_name: sendModal.scheme.name,
              email: sendContact.trim(),
              user_name: userData.name,
              language: userData.language,
              official_url: sendModal.scheme.official_url,
            };

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.status === "Success") {
        setSendStatus("sent");
      } else {
        setSendError(data.detail || "Failed to send. Please try again.");
        setSendStatus("error");
      }
    } catch (e: any) {
      setSendError("Network error. Check your connection.");
      setSendStatus("error");
    }
  };

  const closeSendModal = () => {
    setSendModal(null);
    setSendStatus("idle");
    setSendContact("");
    setSendError("");
    setSendChannel("whatsapp");
    // reset Aadhaar verification
    setAadhaarStep("input");
    setAadhaarNumber("");
    setAadhaarOtp("");
    setAadhaarRefId(null);
    setAadhaarStatus("idle");
    setAadhaarError("");
  };

  const handleLogout = () => {
    stopSpeaking();
    setStep(0);
    setUserData({
      name: "",
      age: "",
      phone: "",
      email: "",
      language: "",
      state: "",
      occupation: "",
      gender: "",
      caste: "",
    });
    setErrors({});
    setSchemes([]);
    setTranscript("");
    setResponseText("");
    setVoiceOnboardStatus("idle");
    setParsedProfile(null);
    setVoiceOnboardTranscript("");
    setStatus("idle");
    setLocationState("unseen");
    setUserCoords(null);
  };

  // ── Location helpers ──────────────────────────────────────────────────────
  const requestLocation = () => {
    setLocationState("asking");
    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState("granted");
      },
      () => {
        setLocationState("denied");
      },
      { timeout: 12000 },
    );
  };

  const openNearbyModal = async (scheme: any) => {
    if (!userCoords) return;
    setNearbyModal({ scheme });
    setNearbyStatus("loading");
    setNearbyCenters([]);
    setNearbyInstruction("");
    setNearbyFormInfo("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/nearby-centers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_name: scheme.name,
          ministry: scheme.ministry ?? "",
          scheme_type: scheme.type ?? "Government",
          lat: userCoords.lat,
          lng: userCoords.lng,
          language: userData.language,
        }),
      });
      const data = await res.json();
      if (data.status === "Success") {
        setNearbyCenters(data.centers ?? []);
        setNearbyInstruction(data.instruction ?? "");
        setNearbyFormInfo(data.form_info ?? "");
        setNearbyStatus("done");
      } else {
        setNearbyStatus("error");
      }
    } catch {
      setNearbyStatus("error");
    }
  };

  const closeNearbyModal = () => {
    setNearbyModal(null);
    setNearbyStatus("idle");
    setNearbyCenters([]);
  };

  if (!hasMounted) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 0 — Language Selection
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 0)
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #e8f4fd 0%, #fef9ee 35%, #eefaf3 65%, #f0eeff 100%)",
        }}
      >
        {/* Decorative blobs */}
        <style>{`
        @keyframes blobFloat1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-20px) scale(1.05);} }
        @keyframes blobFloat2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-20px,25px) scale(1.08);} }
        @keyframes blobFloat3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(15px,15px) scale(0.95);} }
        @keyframes logoFadeIn  { 0%{opacity:0;transform:translateY(-22px) scale(0.8);} 100%{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes vikasReveal { 0%{opacity:0;letter-spacing:0.04em;filter:blur(10px);} 60%{opacity:0.9;letter-spacing:0.22em;filter:blur(1px);} 100%{opacity:1;letter-spacing:0.16em;filter:blur(0);} }
        @keyframes taglineIn   { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        @keyframes selectIn    { from{opacity:0;transform:translateY(8px);}  to{opacity:1;transform:translateY(0);} }
        @keyframes gridIn      { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .vikas-logo    { animation: logoFadeIn  0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .vikas-title   { animation: vikasReveal 1.8s cubic-bezier(0.22,1,0.36,1) 0.9s both; }
        .vikas-tagline { animation: taglineIn   0.8s ease 2.4s both; }
        .select-label  { animation: selectIn    0.7s ease 3.0s both; }
        .lang-grid     { animation: gridIn      0.8s ease 3.4s both; }
        .blob { position:absolute; border-radius:50%; filter:blur(60px); opacity:0.45; pointer-events:none; z-index:0; }
        .blob1 { width:420px;height:420px; background:radial-gradient(circle, #ff9933 0%, #ffcc80 100%); top:-100px; left:-120px; animation:blobFloat1 8s ease-in-out infinite; }
        .blob2 { width:380px;height:380px; background:radial-gradient(circle, #138808 0%, #80cbc4 100%); bottom:-80px; right:-100px; animation:blobFloat2 10s ease-in-out infinite; }
        .blob3 { width:300px;height:300px; background:radial-gradient(circle, #1565c0 0%, #90caf9 100%); top:40%; left:60%; animation:blobFloat3 7s ease-in-out infinite; }
      `}</style>
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div
          style={{
            textAlign: "center",
            width: "100%",
            maxWidth: 560,
            padding: "80px 0 60px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <header
            style={{
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              className="vikas-logo"
              src="data:image/jpeg;base64,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"
              alt="Vikas Logo"
              style={{
                width: 110,
                height: 110,
                objectFit: "contain",
                marginBottom: 10,
                filter: "drop-shadow(0 8px 20px rgba(21,101,192,0.25))",
              }}
            />
            <h1
              className="vikas-title"
              style={{
                fontSize: "3.4rem",
                fontWeight: 900,
                color: "#0d47a1",
                textTransform: "uppercase",
                lineHeight: 1,
                opacity: 0,
              }}
            >
              VIKAS
            </h1>
            <p
              className="vikas-tagline"
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#1565c0",
                marginTop: 10,
                letterSpacing: "0.04em",
                fontStyle: "italic",
                opacity: 0,
              }}
            >
              Your Voice, Your Benefits
            </p>
          </header>
          <p
            className="select-label"
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#546e7a",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 16,
              opacity: 0,
            }}
          >
            Select your language
          </p>
          <div
            className="lang-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 14,
              opacity: 0,
            }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setUserData((p) => ({ ...p, language: lang }));
                  setStep(1);
                }}
                style={{
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(15,101,192,0.18)",
                  borderRadius: 16,
                  padding: "16px 10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform = "translateY(-4px)";
                  b.style.boxShadow = "0 10px 28px rgba(21,101,192,0.22)";
                  b.style.borderColor = "#1565c0";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform = "translateY(0)";
                  b.style.boxShadow = "0 4px 18px rgba(0,0,0,0.07)";
                  b.style.borderColor = "rgba(15,101,192,0.18)";
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>
                  {LANGUAGE_META[lang].flag}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#0d47a1",
                  }}
                >
                  {LANGUAGE_META[lang].native}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#78909c",
                    fontWeight: 600,
                  }}
                >
                  {lang}
                </span>
              </button>
            ))}
          </div>
          <p
            style={{
              marginTop: 40,
              color: "#90a4ae",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            POWERED BY PROJECT VIKAS • BHARAT
          </p>
        </div>
      </main>
    );

  // STEP 1 — Onboarding Choice (Voice or Form)
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 1)
    return (
      <main
        className="bg-grid"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <FlagBar />
        <BackBtn label={t("chooseLanguage")} onClick={() => setStep(0)} />
        <div
          className="fade-slide-up"
          style={{
            textAlign: "center",
            width: "100%",
            maxWidth: 500,
            padding: "90px 0 60px",
          }}
        >
          <header style={{ marginBottom: 40 }}>
            <h2
              style={{
                color: "#1565c0",
                letterSpacing: 3,
                fontSize: "0.8rem",
                fontWeight: 800,
              }}
            >
              {t("appName")}
            </h2>
            <h1
              style={{
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "#0d47a1",
                marginTop: 6,
              }}
            >
              {t("howToStart")}
            </h1>
            <p style={{ color: "#546e7a", fontSize: "0.9rem", marginTop: 8 }}>
              {t("howToStartSub")}
            </p>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Voice option */}
            <div
              onClick={() => setStep(2)}
              style={{
                background: "linear-gradient(135deg,#e3f2fd,#ffffff)",
                border: "2px solid #1565c0",
                borderRadius: 24,
                padding: "28px 24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
                boxShadow: "0 8px 25px rgba(21,101,192,0.12)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 14px 35px rgba(21,101,192,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 25px rgba(21,101,192,0.12)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#1565c0,#0288d1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    flexShrink: 0,
                  }}
                >
                  🎤
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#0d47a1",
                    }}
                  >
                    {t("voiceOption")}
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.82rem",
                      color: "#546e7a",
                      lineHeight: 1.4,
                    }}
                  >
                    {t("voiceOptionDesc")}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background: "linear-gradient(90deg,#1565c0,#0288d1)",
                    color: "white",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    display: "inline-block",
                  }}
                >
                  {t("voiceOptionBtn")} →
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(15,101,192,0.15)",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#90a4ae",
                  fontWeight: 700,
                }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(15,101,192,0.15)",
                }}
              />
            </div>

            {/* Form option */}
            <div
              onClick={() => setStep(3)}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1.5px solid rgba(15,101,192,0.25)",
                borderRadius: 24,
                padding: "28px 24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 10px 28px rgba(21,101,192,0.13)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 15px rgba(0,0,0,0.06)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#43a047,#66bb6a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    flexShrink: 0,
                  }}
                >
                  📋
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#2e7d32",
                    }}
                  >
                    {t("formOption")}
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.82rem",
                      color: "#546e7a",
                      lineHeight: 1.4,
                    }}
                  >
                    {t("formOptionDesc")}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background: "linear-gradient(90deg,#43a047,#66bb6a)",
                    color: "white",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    display: "inline-block",
                  }}
                >
                  {t("formOptionBtn")} →
                </span>
              </div>
            </div>
          </div>

          <p
            style={{
              marginTop: 40,
              color: "#90a4ae",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {t("footer")}
          </p>
        </div>
      </main>
    );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2 — Voice Onboarding
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 2)
    return (
      <main
        className="bg-grid"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <FlagBar />
        <BackBtn
          label={t("howToStart")}
          onClick={() => {
            setVoiceOnboardStatus("idle");
            setParsedProfile(null);
            setVoiceOnboardTranscript("");
            setStep(1);
          }}
        />
        <div
          className="fade-slide-up"
          style={{
            textAlign: "center",
            width: "100%",
            maxWidth: 500,
            padding: "90px 0 60px",
          }}
        >
          <header style={{ marginBottom: 30 }}>
            <h2
              style={{
                color: "#1565c0",
                letterSpacing: 2,
                fontSize: "0.8rem",
                fontWeight: 800,
              }}
            >
              {t("appName")}
            </h2>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#0d47a1",
                marginTop: 6,
              }}
            >
              {t("voiceOnboardTitle")}
            </h1>
            <p style={{ color: "#546e7a", fontSize: "0.85rem", marginTop: 8 }}>
              {t("voiceOnboardSub")}
            </p>
          </header>

          {/* Hint box */}
          <div
            style={{
              background: "rgba(21,101,192,0.06)",
              border: "1px dashed rgba(21,101,192,0.3)",
              borderRadius: 16,
              padding: "14px 18px",
              marginBottom: 28,
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#546e7a",
                lineHeight: 1.5,
              }}
            >
              💡 {t("voiceOnboardHint")}
            </p>
          </div>

          {/* Mic button */}
          {(voiceOnboardStatus === "idle" ||
            voiceOnboardStatus === "error") && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                onMouseDown={startVoiceOnboard}
                onMouseUp={stopVoiceOnboard}
                onTouchStart={startVoiceOnboard}
                onTouchEnd={stopVoiceOnboard}
                className="mic-btn idle"
                style={{ width: 110, height: 110, fontSize: "2.2rem" }}
              >
                🎤
              </button>
              <p
                style={{
                  color: "#1565c0",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {t("holdSpeak")}
              </p>
              {voiceOnboardStatus === "error" && (
                <p
                  style={{
                    color: "#e53935",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  ⚠ Could not parse profile. Please try again.
                </p>
              )}
            </div>
          )}

          {voiceOnboardStatus === "recording" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                onMouseUp={stopVoiceOnboard}
                onTouchEnd={stopVoiceOnboard}
                className="mic-btn listening"
                style={{ width: 110, height: 110, fontSize: "2.2rem" }}
              >
                ⏹️
              </button>
              <SoundWave active={true} />
              <p style={{ color: "#ef5350", fontWeight: 700 }}>
                {t("listening")}
              </p>
            </div>
          )}

          {voiceOnboardStatus === "processing" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "20px 0",
              }}
            >
              <div style={{ fontSize: "2.5rem" }}>⏳</div>
              <p style={{ color: "#1565c0", fontWeight: 700 }}>
                {t("processingProfile")}
              </p>
              {voiceOnboardTranscript && (
                <div
                  className="history-card"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <small>{t("youSaid")}</small>
                  <p>{voiceOnboardTranscript}</p>
                </div>
              )}
            </div>
          )}

          {voiceOnboardStatus === "done" && parsedProfile && (
            <div className="fade-slide-up" style={{ width: "100%" }}>
              <div
                style={{
                  background: "rgba(67,160,71,0.06)",
                  border: "1.5px solid #43a047",
                  borderRadius: 20,
                  padding: "20px",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "#2e7d32",
                    letterSpacing: 1,
                  }}
                >
                  ✅ {t("profileFound")}
                </p>
                {Object.entries(parsedProfile).map(
                  ([k, v]) =>
                    v &&
                    v !== "unknown" && (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          padding: "6px 0",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#546e7a",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {k}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#1a1a2e",
                            fontWeight: 700,
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ),
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    setVoiceOnboardStatus("idle");
                    setParsedProfile(null);
                    setVoiceOnboardTranscript("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(15,101,192,0.3)",
                    background: "white",
                    color: "#1565c0",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  ↺ {t("retryVoice")}
                </button>
                <button
                  onClick={confirmVoiceProfile}
                  disabled={status === "thinking"}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(90deg,#1565c0,#0288d1)",
                    color: "white",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {status === "thinking"
                    ? t("saving")
                    : `${t("confirmProfile")} →`}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3 — Manual Form
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 3)
    return (
      <main
        className="bg-grid"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <FlagBar />
        <BackBtn label={t("howToStart")} onClick={() => setStep(1)} />
        <div
          className="fade-slide-up"
          style={{
            textAlign: "center",
            width: "100%",
            maxWidth: 450,
            padding: "80px 0",
          }}
        >
          <header style={{ marginBottom: 40 }}>
            <h2
              style={{
                color: "#1565c0",
                letterSpacing: 3,
                fontSize: "0.8rem",
                fontWeight: 800,
              }}
            >
              {t("appName")}
            </h2>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0d47a1" }}>
              {t("hello")}
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1565c0",
                marginTop: 6,
              }}
            >
              {t("login")}
            </p>
          </header>
          <form className="login-card" onSubmit={handleFormSubmit} noValidate>
            <div className="input-group">
              <label>{t("fullName")} *</label>
              <input
                type="text"
                className="input-field"
                value={userData.name}
                onChange={(e) => {
                  setUserData({ ...userData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                style={{ borderColor: errors.name ? "#e53935" : undefined }}
              />
              <FieldError msg={errors.name} />
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>{t("age")} * (18–85)</label>
                <input
                  type="number"
                  className="input-field"
                  value={userData.age}
                  min={18}
                  max={85}
                  onChange={(e) => {
                    setUserData({ ...userData, age: e.target.value });
                    setErrors({ ...errors, age: "" });
                  }}
                  style={{ borderColor: errors.age ? "#e53935" : undefined }}
                />
                <FieldError msg={errors.age} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>{t("gender")} *</label>
                <select
                  className="input-field"
                  value={userData.gender}
                  onChange={(e) => {
                    setUserData({ ...userData, gender: e.target.value });
                    setErrors({ ...errors, gender: "" });
                  }}
                  style={{ borderColor: errors.gender ? "#e53935" : undefined }}
                >
                  <option value="" disabled>
                    {t("selectGender")}
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.gender} />
              </div>
            </div>
            <div className="input-group">
              <label>{t("occupation")} *</label>
              <select
                className="input-field"
                value={userData.occupation}
                onChange={(e) => {
                  setUserData({ ...userData, occupation: e.target.value });
                  setErrors({ ...errors, occupation: "" });
                  if (e.target.value !== "Others") setCustomOccupation("");
                }}
                style={{
                  borderColor: errors.occupation ? "#e53935" : undefined,
                }}
              >
                <option value="" disabled>
                  {t("selectOccupation")}
                </option>
                {OCCUPATIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {userData.occupation === "Others" && (
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder={t("specifyOccupation")}
                  value={customOccupation}
                  onChange={(e) => {
                    setCustomOccupation(e.target.value);
                  }}
                  style={{ marginTop: 10 }}
                />
              )}
              <FieldError msg={errors.occupation} />
            </div>
            <div className="input-group">
              <label>{t("caste")} *</label>
              <select
                className="input-field"
                value={userData.caste}
                onChange={(e) => {
                  setUserData({ ...userData, caste: e.target.value });
                  setErrors({ ...errors, caste: "" });
                }}
                style={{ borderColor: errors.caste ? "#e53935" : undefined }}
              >
                <option value="" disabled>
                  {t("selectCaste")}
                </option>
                {CASTES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.caste} />
            </div>
            <div className="input-group">
              <label>{t("phone")} *</label>
              <input
                type="tel"
                className="input-field"
                placeholder="e.g. 9876543210"
                value={userData.phone}
                onChange={(e) => {
                  setUserData({ ...userData, phone: e.target.value });
                  setErrors({ ...errors, phone: "" });
                }}
                style={{ borderColor: errors.phone ? "#e53935" : undefined }}
              />
              <FieldError msg={errors.phone} />
            </div>
            <div className="input-group">
              <label>{t("email")}</label>
              <input
                type="email"
                className="input-field"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>{t("state")} *</label>
              <select
                className="input-field"
                value={userData.state}
                onChange={(e) => {
                  setUserData({ ...userData, state: e.target.value });
                  setErrors({ ...errors, state: "" });
                }}
                style={{ borderColor: errors.state ? "#e53935" : undefined }}
              >
                <option value="" disabled>
                  {t("selectState")}
                </option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.state} />
            </div>
            <button
              type="submit"
              className="login-btn"
              disabled={status === "thinking"}
            >
              {status === "thinking" ? t("saving") : t("startBtn")}
            </button>
          </form>
        </div>
      </main>
    );

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4 — Chat / Voice Screen
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <main
      className="bg-grid"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px",
      }}
    >
      <FlagBar />
      <div
        className="fade-slide-up"
        style={{
          width: "100%",
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <div className="nav-header" style={{ width: "100%", maxWidth: 600 }}>
          <div className="profile-pill">
            <span>👤</span>
            <span>{userData.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-link">
            {t("logout")}
          </button>
        </div>

        {/* ── Location Permission Banner ── */}
        {locationState === "unseen" && (
          <div
            className="fade-slide-up"
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#e8f5e9,#f1f8e9)",
              border: "1.5px solid #43a047",
              borderRadius: 18,
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>📍</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 800,
                  color: "#2e7d32",
                  fontSize: "0.88rem",
                }}
              >
                Find Nearby Application Centers
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.75rem",
                  color: "#546e7a",
                }}
              >
                Allow location access to see the nearest offices &amp; CSCs
                where you can apply for your schemes.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={requestLocation}
                style={{
                  background: "linear-gradient(90deg,#2e7d32,#43a047)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "7px 14px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ✅ Allow
              </button>
              <button
                onClick={() => setLocationState("denied")}
                style={{
                  background: "rgba(0,0,0,0.06)",
                  color: "#546e7a",
                  border: "none",
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Not Now
              </button>
            </div>
          </div>
        )}
        {locationState === "asking" && (
          <div
            style={{
              width: "100%",
              background: "rgba(21,101,192,0.06)",
              border: "1px dashed #1565c0",
              borderRadius: 14,
              padding: "10px 16px",
              marginBottom: 12,
              fontSize: "0.8rem",
              color: "#1565c0",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            ⏳ Waiting for location permission...
          </div>
        )}
        {locationState === "granted" && userCoords && (
          <div
            style={{
              width: "100%",
              background: "rgba(67,160,71,0.07)",
              border: "1px solid rgba(67,160,71,0.3)",
              borderRadius: 14,
              padding: "8px 16px",
              marginBottom: 12,
              fontSize: "0.78rem",
              color: "#2e7d32",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📍</span>
            <span>
              Location detected — tap <strong>"📍 Nearby"</strong> on any scheme
              to find application centers near you.
            </span>
          </div>
        )}
        {locationState === "denied" && (
          <div
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.03)",
              borderRadius: 14,
              padding: "8px 16px",
              marginBottom: 12,
              fontSize: "0.75rem",
              color: "#90a4ae",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📍</span>
            <span>Location not shared. </span>
            <button
              onClick={() => setLocationState("unseen")}
              style={{
                background: "none",
                border: "none",
                color: "#1565c0",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: 0,
              }}
            >
              Enable
            </button>
          </div>
        )}
        <header style={{ textAlign: "center", marginBottom: 10 }}>
          <h2
            style={{
              color: "#1565c0",
              letterSpacing: 2,
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {t("namaste")}
          </h2>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0d47a1" }}>
            {t("howHelp")}
          </h1>
        </header>
        <LaxmiAvatar isListening={isRecording} isSpeaking={isSpeaking} />
        <div
          className="glass-strong"
          style={{
            width: "100%",
            padding: "30px",
            borderRadius: 32,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 160,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopRecording();
              }}
              className={`mic-btn ${isRecording ? "listening" : "idle"}`}
            >
              {isRecording ? "⏹️" : "🎤"}
            </button>
            <SoundWave active={isRecording} />
            <p
              style={{
                marginTop: 15,
                fontWeight: 700,
                color: isRecording ? "#ef5350" : "#1565c0",
                fontSize: "0.9rem",
              }}
            >
              {status === "listening"
                ? t("listening")
                : status === "thinking"
                  ? t("processing")
                  : t("holdSpeak")}
            </p>
          </div>
          {(transcript || responseText) && (
            <div
              style={{
                width: "100%",
                marginTop: 20,
                textAlign: "left",
                borderTop: "1px solid rgba(0,0,0,0.05)",
                paddingTop: 20,
              }}
            >
              {transcript && (
                <div
                  className="history-card fade-slide-up"
                  style={{ marginBottom: 15 }}
                >
                  <small>{t("youSaid")}</small>
                  <p>{transcript}</p>
                </div>
              )}
              {responseText && (
                <div
                  className="fade-slide-up"
                  style={{
                    padding: 15,
                    background: "rgba(15,101,192,0.05)",
                    borderLeft: "4px solid #1565c0",
                    borderRadius: "0 12px 12px 0",
                    marginBottom: 20,
                  }}
                >
                  <small
                    style={{
                      color: "#0d47a1",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {t("laxmiAI")}
                  </small>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {responseText}
                  </p>
                </div>
              )}
              {schemes.length > 0 && (
                <div style={{ width: "100%", marginTop: 10 }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "#1565c0",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    {t("matchingSchemes")}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {schemes.map((scheme: any) => {
                      const schemeId = scheme.id ?? scheme._id ?? scheme.name;
                      const isActive = speakingSchemeId === schemeId;
                      return (
                        <div
                          key={schemeId}
                          className="history-card fade-slide-up"
                          style={{
                            textAlign: "left",
                            borderLeft: `4px solid ${isActive ? "#e53935" : "#43a047"}`,
                            padding: "12px 14px",
                            background: isActive
                              ? "rgba(229,57,53,0.05)"
                              : "rgba(15,101,192,0.03)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              color: "#2e7d32",
                              fontSize: "0.9rem",
                              fontWeight: 800,
                            }}
                          >
                            {scheme.name}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              margin: "6px 0 4px",
                              color: "#444",
                              lineHeight: 1.4,
                            }}
                          >
                            {scheme.description}
                          </p>
                          {scheme.eligibility_summary && (
                            <p
                              style={{
                                fontSize: "0.72rem",
                                margin: "0 0 6px",
                                color: "#6a6a6a",
                                fontStyle: "italic",
                              }}
                            >
                              ✅ {scheme.eligibility_summary}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 8,
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: 10,
                                color:
                                  scheme.type === "Government"
                                    ? "#0d47a1"
                                    : scheme.type === "NGO"
                                      ? "#e65100"
                                      : scheme.type === "Bank"
                                        ? "#1b5e20"
                                        : scheme.type === "CSR"
                                          ? "#6a1b9a"
                                          : scheme.type === "International"
                                            ? "#004d40"
                                            : "#546e7a",
                                background:
                                  scheme.type === "Government"
                                    ? "#e3f2fd"
                                    : scheme.type === "NGO"
                                      ? "#fff3e0"
                                      : scheme.type === "Bank"
                                        ? "#e8f5e9"
                                        : scheme.type === "CSR"
                                          ? "#f3e5f5"
                                          : scheme.type === "International"
                                            ? "#e0f2f1"
                                            : "#f5f5f5",
                              }}
                            >
                              {scheme.type === "Government"
                                ? "🏛️"
                                : scheme.type === "NGO"
                                  ? "🤝"
                                  : scheme.type === "Bank"
                                    ? "🏦"
                                    : scheme.type === "CSR"
                                      ? "🏢"
                                      : scheme.type === "International"
                                        ? "🌐"
                                        : "📋"}{" "}
                              {scheme.ministry}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              {scheme.official_url && (
                                <a
                                  href={scheme.official_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: "0.68rem",
                                    color: "white",
                                    background: "#1565c0",
                                    borderRadius: 4,
                                    padding: "2px 8px",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                  }}
                                >
                                  🔗 Official Site
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  if (isActive) {
                                    stopSpeaking();
                                    return;
                                  }
                                  setSpeakingSchemeId(schemeId);
                                  speak(
                                    `${scheme.name}. ${scheme.description}. ${scheme.eligibility_summary ? scheme.eligibility_summary + "." : ""} This scheme is managed by ${scheme.ministry}.`,
                                  );
                                }}
                                style={{
                                  background: isActive ? "#e53935" : "#43a047",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  fontSize: "0.68rem",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                  fontWeight: 700,
                                  transition: "background 0.3s ease",
                                }}
                              >
                                {isActive
                                  ? `🔊 ${t("listening")}`
                                  : `🔊 ${t("details")}`}
                              </button>
                              <button
                                onClick={() => {
                                  setSendModal({ scheme });
                                  setSendContact(
                                    userData.phone &&
                                      !userData.phone.startsWith("VOICE-")
                                      ? userData.phone
                                      : "",
                                  );
                                }}
                                style={{
                                  background: "#7b1fa2",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  fontSize: "0.68rem",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                  fontWeight: 700,
                                }}
                              >
                                📩 Send
                              </button>
                              {/* ── Nearby Centers button ── */}
                              {locationState === "granted" && userCoords ? (
                                <button
                                  onClick={() => openNearbyModal(scheme)}
                                  style={{
                                    background: "#00897b",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    fontSize: "0.68rem",
                                    padding: "2px 8px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                  }}
                                >
                                  📍 Nearby
                                </button>
                              ) : locationState !== "granted" ? (
                                <button
                                  onClick={() => setLocationState("unseen")}
                                  title="Enable location to find nearby centers"
                                  style={{
                                    background: "#b0bec5",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 4,
                                    fontSize: "0.68rem",
                                    padding: "2px 8px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                  }}
                                >
                                  📍 Nearby
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <footer
          style={{
            margin: "40px 0",
            color: "#90a4ae",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {t("footer")}
        </footer>
      </div>

      {/* ── Nearby Centers Modal ── */}
      {nearbyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
          }}
        >
          <div
            className="fade-slide-up"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "24px 20px",
              width: "100%",
              maxWidth: 460,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#0d47a1",
                    fontSize: "1rem",
                    fontWeight: 800,
                  }}
                >
                  📍 Nearby Application Centers
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.78rem",
                    color: "#546e7a",
                  }}
                >
                  For:{" "}
                  <strong style={{ color: "#2e7d32" }}>
                    {nearbyModal.scheme.name}
                  </strong>
                </p>
              </div>
              <button
                onClick={closeNearbyModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  color: "#90a4ae",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Loading */}
            {nearbyStatus === "loading" && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>⏳</div>
                <p
                  style={{
                    color: "#1565c0",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  Finding offices near your location...
                </p>
              </div>
            )}

            {/* Error */}
            {nearbyStatus === "error" && (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>⚠️</div>
                <p
                  style={{
                    color: "#e53935",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                  }}
                >
                  Could not find nearby centers. Please try again.
                </p>
                <button
                  onClick={() => openNearbyModal(nearbyModal.scheme)}
                  style={{
                    marginTop: 12,
                    background: "#1565c0",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 20px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Results */}
            {nearbyStatus === "done" && (
              <div>
                {/* Instruction box */}
                {nearbyInstruction && (
                  <div
                    style={{
                      background: "rgba(21,101,192,0.06)",
                      border: "1px dashed rgba(21,101,192,0.3)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        color: "#1a1a2e",
                        lineHeight: 1.5,
                      }}
                    >
                      ℹ️ {nearbyInstruction}
                    </p>
                  </div>
                )}

                {/* Form info */}
                {nearbyFormInfo && (
                  <div
                    style={{
                      background: "rgba(67,160,71,0.07)",
                      border: "1px solid rgba(67,160,71,0.3)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#2e7d32",
                      }}
                    >
                      📄 Forms / Documents needed:
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.78rem",
                        color: "#444",
                        lineHeight: 1.5,
                      }}
                    >
                      {nearbyFormInfo}
                    </p>
                  </div>
                )}

                {/* Office cards */}
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#546e7a",
                    letterSpacing: 1,
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  Places to visit near you
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {nearbyCenters.map((center: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(0,137,123,0.05)",
                        border: "1.5px solid rgba(0,137,123,0.25)",
                        borderRadius: 14,
                        padding: "14px 16px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 800,
                          color: "#00695c",
                          fontSize: "0.9rem",
                        }}
                      >
                        🏛️ {center.office_type}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 10px",
                          fontSize: "0.75rem",
                          color: "#546e7a",
                        }}
                      >
                        Search: <em>{center.search_query}</em>
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={center.maps_search_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            background:
                              "linear-gradient(90deg,#1565c0,#0288d1)",
                            color: "white",
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            textDecoration: "none",
                            textAlign: "center",
                            display: "block",
                          }}
                        >
                          🗺️ Search on Maps
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Maps note */}
                <p
                  style={{
                    marginTop: 14,
                    fontSize: "0.7rem",
                    color: "#90a4ae",
                    textAlign: "center",
                  }}
                >
                  Links open Google Maps centered on your current location.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Send Documents Modal ── */}
      {sendModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 16px",
          }}
        >
          <div
            className="fade-slide-up"
            style={{
              background: "white",
              borderRadius: 24,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
            }}
          >
            {sendStatus === "sent" ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
                <h3
                  style={{
                    color: "#2e7d32",
                    margin: "0 0 8px",
                    fontSize: "1.1rem",
                  }}
                >
                  Sent Successfully!
                </h3>
                <p
                  style={{
                    color: "#546e7a",
                    fontSize: "0.85rem",
                    margin: "0 0 20px",
                  }}
                >
                  {sendChannel === "whatsapp"
                    ? `Required documents for "${sendModal.scheme.name}" have been sent to your WhatsApp.`
                    : `Required documents for "${sendModal.scheme.name}" have been sent to your email.`}
                </p>
                <button
                  onClick={closeSendModal}
                  style={{
                    background: "#1565c0",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 28px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Close
                </button>
              </div>
            ) : aadhaarStep === "input" ? (
              /* ── STEP A: Aadhaar number entry ── */
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#0d47a1",
                        fontSize: "1rem",
                        fontWeight: 800,
                      }}
                    >
                      🔐 Aadhaar Verification
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: "0.78rem",
                        color: "#546e7a",
                      }}
                    >
                      Required before sending documents for:
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.82rem",
                        color: "#2e7d32",
                        fontWeight: 700,
                      }}
                    >
                      {sendModal.scheme.name}
                    </p>
                  </div>
                  <button
                    onClick={closeSendModal}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.3rem",
                      cursor: "pointer",
                      color: "#90a4ae",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* UIDAI badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#e8f5e9",
                    border: "1px solid #a5d6a7",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🇮🇳</span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "#2e7d32",
                      }}
                    >
                      UIDAI Authorised Verification
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        color: "#546e7a",
                      }}
                    >
                      An OTP will be sent to your Aadhaar-linked mobile number
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#546e7a",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Aadhaar Number
                  </label>
                  <input
                    type="tel"
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => {
                      setAadhaarNumber(e.target.value.replace(/\D/g, ""));
                      setAadhaarError("");
                    }}
                    placeholder="Enter 12-digit Aadhaar number"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${aadhaarError ? "#e53935" : "#e0e0e0"}`,
                      fontSize: "1rem",
                      letterSpacing: "0.1em",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {aadhaarError && (
                    <p
                      style={{
                        color: "#e53935",
                        fontSize: "0.75rem",
                        margin: "5px 0 0",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ {aadhaarError}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    background: "rgba(21,101,192,0.05)",
                    border: "1px dashed rgba(21,101,192,0.25)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 18,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      color: "#546e7a",
                      lineHeight: 1.6,
                    }}
                  >
                    🔒 Your Aadhaar number is used only for one-time OTP
                    verification and is <strong>not stored</strong>. This is
                    required to confirm your identity before document delivery.
                  </p>
                </div>

                <button
                  onClick={requestAadhaarOtp}
                  disabled={
                    aadhaarStatus === "loading" || aadhaarNumber.length !== 12
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      aadhaarStatus === "loading" || aadhaarNumber.length !== 12
                        ? "#b0bec5"
                        : "linear-gradient(90deg,#1565c0,#1e88e5)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor:
                      aadhaarStatus === "loading" || aadhaarNumber.length !== 12
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {aadhaarStatus === "loading"
                    ? "⏳ Sending OTP..."
                    : "📱 Send OTP to Aadhaar Mobile"}
                </button>
              </>
            ) : aadhaarStep === "otp" ? (
              /* ── STEP B: OTP entry ── */
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#0d47a1",
                        fontSize: "1rem",
                        fontWeight: 800,
                      }}
                    >
                      📲 Enter OTP
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: "0.78rem",
                        color: "#546e7a",
                      }}
                    >
                      OTP sent to your Aadhaar-linked mobile number
                    </p>
                  </div>
                  <button
                    onClick={closeSendModal}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.3rem",
                      cursor: "pointer",
                      color: "#90a4ae",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    background: "#fff8e1",
                    border: "1px solid #ffe082",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "#f57f17",
                      fontWeight: 700,
                    }}
                  >
                    ⚠ The OTP was sent by UIDAI to the mobile number linked
                    with Aadhaar ending in ••••{aadhaarNumber.slice(-4)}
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#546e7a",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    6-Digit OTP
                  </label>
                  <input
                    type="tel"
                    maxLength={6}
                    value={aadhaarOtp}
                    onChange={(e) => {
                      setAadhaarOtp(e.target.value.replace(/\D/g, ""));
                      setAadhaarError("");
                    }}
                    placeholder="Enter 6-digit OTP"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${aadhaarError ? "#e53935" : "#e0e0e0"}`,
                      fontSize: "1.4rem",
                      letterSpacing: "0.35em",
                      outline: "none",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                  {aadhaarError && (
                    <p
                      style={{
                        color: "#e53935",
                        fontSize: "0.75rem",
                        margin: "5px 0 0",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ {aadhaarError}
                    </p>
                  )}
                </div>

                <button
                  onClick={verifyAadhaarOtp}
                  disabled={
                    aadhaarStatus === "loading" || aadhaarOtp.length !== 6
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      aadhaarStatus === "loading" || aadhaarOtp.length !== 6
                        ? "#b0bec5"
                        : "linear-gradient(90deg,#1565c0,#1e88e5)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor:
                      aadhaarStatus === "loading" || aadhaarOtp.length !== 6
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s",
                    marginBottom: 10,
                  }}
                >
                  {aadhaarStatus === "loading"
                    ? "⏳ Verifying..."
                    : "✅ Verify OTP"}
                </button>

                <button
                  onClick={() => {
                    setAadhaarStep("input");
                    setAadhaarOtp("");
                    setAadhaarError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 12,
                    border: "1.5px solid #e0e0e0",
                    background: "white",
                    color: "#546e7a",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  ← Change Aadhaar Number
                </button>
              </>
            ) : (
              /* ── STEP C: Verified — choose channel & send ── */
              <>
                {/* Verified badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#e8f5e9",
                    border: "1px solid #a5d6a7",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 18,
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>✅</span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: "#2e7d32",
                      }}
                    >
                      Aadhaar Verified Successfully
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        color: "#546e7a",
                      }}
                    >
                      You can now receive documents
                    </p>
                  </div>
                </div>

                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#0d47a1",
                        fontSize: "1rem",
                        fontWeight: 800,
                      }}
                    >
                      📩 Send Required Documents
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.78rem",
                        color: "#546e7a",
                      }}
                    >
                      AI will find official documents for:
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.82rem",
                        color: "#2e7d32",
                        fontWeight: 700,
                      }}
                    >
                      {sendModal.scheme.name}
                    </p>
                  </div>
                  <button
                    onClick={closeSendModal}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.3rem",
                      cursor: "pointer",
                      color: "#90a4ae",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Channel toggle */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button
                    onClick={() => {
                      setSendChannel("whatsapp");
                      setSendContact(
                        userData.phone && !userData.phone.startsWith("VOICE-")
                          ? userData.phone
                          : "",
                      );
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      borderRadius: 12,
                      border: `2px solid ${sendChannel === "whatsapp" ? "#25d366" : "#e0e0e0"}`,
                      background:
                        sendChannel === "whatsapp" ? "#e8f5e9" : "white",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: sendChannel === "whatsapp" ? "#1b5e20" : "#666",
                      transition: "all 0.2s",
                    }}
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      setSendChannel("email");
                      setSendContact(userData.email || "");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      borderRadius: 12,
                      border: `2px solid ${sendChannel === "email" ? "#1565c0" : "#e0e0e0"}`,
                      background: sendChannel === "email" ? "#e3f2fd" : "white",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: sendChannel === "email" ? "#0d47a1" : "#666",
                      transition: "all 0.2s",
                    }}
                  >
                    ✉️ Email
                  </button>
                </div>

                {/* Contact input */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#546e7a",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {sendChannel === "whatsapp"
                      ? "WhatsApp Number (10 digits)"
                      : "Email Address"}
                  </label>
                  <input
                    type={sendChannel === "whatsapp" ? "tel" : "email"}
                    value={sendContact}
                    onChange={(e) => {
                      setSendContact(e.target.value);
                      setSendError("");
                    }}
                    placeholder={
                      sendChannel === "whatsapp"
                        ? "e.g. 9876543210"
                        : "e.g. name@email.com"
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${sendError ? "#e53935" : "#e0e0e0"}`,
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {sendError && (
                    <p
                      style={{
                        color: "#e53935",
                        fontSize: "0.75rem",
                        margin: "5px 0 0",
                        fontWeight: 600,
                      }}
                    >
                      ⚠ {sendError}
                    </p>
                  )}
                </div>

                {/* Info box */}
                <div
                  style={{
                    background: "rgba(21,101,192,0.05)",
                    border: "1px dashed rgba(21,101,192,0.25)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 18,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "#546e7a",
                      lineHeight: 1.5,
                    }}
                  >
                    🤖 Our AI will find the official document checklist for{" "}
                    <strong>{sendModal.scheme.name}</strong> and send it
                    directly to your{" "}
                    {sendChannel === "whatsapp" ? "WhatsApp" : "email"}.
                    {sendChannel === "whatsapp" &&
                      " Make sure you have joined the WhatsApp sandbox first."}
                  </p>
                </div>

                {/* Send button */}
                <button
                  onClick={sendDocuments}
                  disabled={sendStatus === "sending" || !sendContact.trim()}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      sendStatus === "sending" || !sendContact.trim()
                        ? "#b0bec5"
                        : "linear-gradient(90deg,#7b1fa2,#ab47bc)",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor:
                      sendStatus === "sending" || !sendContact.trim()
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {sendStatus === "sending"
                    ? "⏳ AI is finding documents..."
                    : sendChannel === "whatsapp"
                      ? "📲 Send to WhatsApp"
                      : "📧 Send to Email"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
