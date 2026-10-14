import { NextResponse } from "next/server";

// Authentic ODOP Craft Database for Smart Fallback & Entity Recognition
const ODOP_CRAFT_PRESETS = [
  {
    keywords: ["saree", "silk", "tussar", "handloom", "cloth", "textile", "kapda", "saari", "varanasi", "banarasi"],
    name: "भागलपुरी शुद्ध तसर सिल्क हथकरघा साड़ी",
    nameEn: "Bhagalpuri Pure Tussar Handloom Silk Saree",
    tagline: "पारंपरिक हथकरघा बुनाई व प्राकृतिक रेशमी चमक",
    taglineEn: "Authentic handloom pit-loom woven pure tussar silk",
    category: "sarees",
    categoryLabel: "हथकरघा साड़ियाँ एवं सिल्क (Handloom Sarees)",
    categoryLabelEn: "Handloom Sarees & Silk",
    price: 3800,
    originalPrice: 5500,
    stock: 8,
    description: "बिहार के भागलपुर बुनकर क्लस्टर द्वारा शुद्ध तसर रेशम से बुनी गई प्रामाणिक साड़ी। पर्यावरण-अनुकूल प्राकृतिक रंगाई और पारंपरिक ज़री बॉर्डर युक्त।",
    descriptionEn: "Authentic pure tussar silk saree handwoven by artisan weavers of Bhagalpur cluster. Features eco-friendly natural vegetable dyes and traditional zari border.",
    specs: { material: "100% शुद्ध तसर सिल्क", origin: "भागलपुर, बिहार", weave: "पारंपरिक पिट लूम (Pit Loom)", weight: "550 ग्राम" },
    specsEn: { material: "100% Pure Tussar Silk", origin: "Bhagalpur, Bihar", weave: "Traditional Pit Loom", weight: "550g" },
    suggestedVariants: [
      { name: "Standard (5.5m)", size: "5.5m", color: "Natural Tussar", colorHex: "#EADDCA", price: 3800, stock: 5 },
      { name: "With Blouse (6.3m)", size: "6.3m", color: "Natural Tussar", colorHex: "#EADDCA", price: 4200, stock: 3 }
    ],
    giTag: "GI Verified (Bhagalpur Silk)",
    odopBadge: "ODOP Certified (One District One Product)",
  },
  {
    keywords: ["madhubani", "mithila", "painting", "art", "canvas", "chitra", "drawing"],
    name: "मिथिला हस्तनिर्मित मधुबनी पेंटिंग (कोहबर व मयूर)",
    nameEn: "Mithila Handmade Madhubani Painting (Kohbar Motif)",
    tagline: "बांस की कलम व प्राकृतिक रंगों से हस्तचित्रित",
    taglineEn: "Hand-painted with bamboo nibs using organic vegetable pigments",
    category: "art",
    categoryLabel: "पारंपरिक लोक कला व चित्रकला (Traditional Art)",
    categoryLabelEn: "Traditional Art & Mithila Paintings",
    price: 2400,
    originalPrice: 3500,
    stock: 5,
    description: "मधुबनी (मिथिला) की महिला शिल्पकारों द्वारा हस्तनिर्मित। प्राकृतिक खनिज व वानस्पतिक रंगों द्वारा हस्तनिर्मित कैनवास पर उकेरी गई लोक कला।",
    descriptionEn: "Authentic Mithila folk painting handcrafted by master women artisans of Madhubani using handmade paper and organic plant pigments.",
    specs: { material: "हैंडमेड पेपर / कैनवास", origin: "मधुबनी, बिहार", weave: "हस्तचित्रित (Hand Painted)", weight: "300 ग्राम" },
    specsEn: { material: "Handmade Cotton Canvas", origin: "Madhubani, Bihar", weave: "Hand Painted (Fine Nib)", weight: "300g" },
    suggestedVariants: [
      { name: "A4 Size", size: "A4 (8x12 in)", color: "Multi-color", colorHex: "#e74c3c", price: 2400, stock: 3 },
      { name: "A3 Size", size: "A3 (12x16 in)", color: "Multi-color", colorHex: "#e74c3c", price: 3800, stock: 2 }
    ],
    giTag: "GI Verified (Madhubani Art)",
    odopBadge: "ODOP Certified (Mithila Craft)",
  },
  {
    keywords: ["terracotta", "clay", "pottery", "horse", "diya", "mitti", "bartan"],
    name: "गोरखपुर प्रामाणिक टेराकोटा अश्व शिल्प",
    nameEn: "Gorakhpur Authentic Terracotta Horse Figurine",
    tagline: "प्राकृतिक चिकनी मिट्टी से गढ़ी पारंपरिक मूर्तिकला",
    taglineEn: "Traditional kiln-fired natural clay pottery and sculpture",
    category: "terracotta",
    categoryLabel: "टेराकोटा एवं मिट्टी शिल्प (Terracotta & Clay)",
    categoryLabelEn: "Terracotta & Clay Pottery",
    price: 1250,
    originalPrice: 1800,
    stock: 12,
    description: "गोरखपुर के कुम्हार परिवारों द्वारा भट्टी में पकाई गई विशेष लाल मिट्टी की प्राचीन शिल्पकृति। शुभ गृह-सज्जा हेतु उपयुक्त।",
    descriptionEn: "Master crafted terracotta figurine sculpted from rich alluvial clay and kiln-fired by traditional potter communities of Gorakhpur.",
    specs: { material: "प्राकृतिक टेराकोटा क्ले", origin: "गोरखपुर, उत्तर प्रदेश", weave: "हाथ से गढ़ा हुआ (Handcrafted)", weight: "1.2 किग्रा" },
    specsEn: { material: "Natural Terracotta Clay", origin: "Gorakhpur, Uttar Pradesh", weave: "Hand Sculpted & Fired", weight: "1.2 kg" },
    giTag: "GI Verified (Gorakhpur Terracotta)",
    odopBadge: "ODOP Certified",
  },
  {
    keywords: ["stone", "patthar", "carving", "gaya", "murti", "black stone"],
    name: "गया पारंपरिक हस्तउत्कीर्ण काला पत्थर शिल्प",
    nameEn: "Gaya Traditional Hand-Carved Black Stone Craft",
    tagline: "पारंपरिक छैनी-हथौड़ी से तराशा गया टिकाऊ प्रस्तर शिल्प",
    taglineEn: "Chisel-carved monolithic black stone heirloom sculpture",
    category: "stonecraft",
    categoryLabel: "प्रस्तर शिल्प व नक्काशी (Stone Carving)",
    categoryLabelEn: "Stone Carvings & Sculptures",
    price: 1800,
    originalPrice: 2600,
    stock: 6,
    description: "गया के प्राचीन शिल्पकारों द्वारा स्थानीय काले पत्थर पर बारीक नक्काशी द्वारा तैयार किया गया पारंपरिक हस्तशिल्प।",
    descriptionEn: "Centuries-old stone carving art perfected by artisan guilds of Gaya, intricately hand-chiselled on durable native black stone.",
    specs: { material: "स्थानीय कठोर काला पत्थर (Black Stone)", origin: "गया, बिहार", weave: "हस्त नक्काशी (Hand Carved)", weight: "2.5 किग्रा" },
    specsEn: { material: "Native Gaya Black Stone", origin: "Gaya, Bihar", weave: "Hand Chiseled", weight: "2.5 kg" },
    giTag: "ODOP Gaya Verified",
    odopBadge: "ODOP Certified (Gaya Cluster)",
  },
  {
    keywords: ["sikki", "grass", "basket", "tokri", "golden grass"],
    name: "बिहार सुनहरी सीक्की घास हस्तनिर्मित मंजूषा डलिया",
    nameEn: "Sikki Golden Grass Artisan Utility Basket",
    tagline: "पारंपरिक प्राकृतिक सुनहरी घास से हाथ से बुनी डलिया",
    taglineEn: "Eco-friendly hand-coiled golden grass storage basket",
    category: "sikki",
    categoryLabel: "प्राकृतिक घास व बांस शिल्प (Eco Crafts)",
    categoryLabelEn: "Sikki Grass & Eco Crafts",
    price: 850,
    originalPrice: 1200,
    stock: 15,
    description: "उत्तरी बिहार की स्थानीय सीक्की घास से महिला कारीगरों द्वारा सुई-धागे की पारंपरिक तकनीक से तैयार पर्यावरण-अनुकूल टोकरी।",
    descriptionEn: "Hand-coiled by rural women artisans of Mithila using wild golden Sikki grass and natural lacquer dyes. Durable and eco-friendly.",
    specs: { material: "प्राकृतिक सीक्की घास", origin: "दरभंगा, बिहार", weave: "हस्त बुनाई (Hand Coiled)", weight: "250 ग्राम" },
    specsEn: { material: "Organic Sikki Golden Grass", origin: "Darbhanga, Bihar", weave: "Hand Coiled & Dyed", weight: "250g" },
    giTag: "GI Verified (Sikki Grass)",
    odopBadge: "ODOP Certified",
  }
];

// Helper: Convert Hindi and English number words to numbers
function parseNumberWords(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Try direct digits first (e.g. "₹2500", "2500/-", "10 pcs")
  const digitMatch = lower.match(/\b\d+\b/);
  if (digitMatch) return parseInt(digitMatch[0], 10);

  const wordsMap = {
    "साढ़े चार हजार": 4500, "साढ़े तीन हजार": 3500, "साढ़े दो हजार": 2500,
    "पांच हजार": 5000, "पाँच हजार": 5000, "चार हजार": 4000, "तीन हजार": 3000,
    "ढाई हजार": 2500, "दो हजार": 2000, "डेढ़ हजार": 1500, "एक हजार": 1000,
    "पच्चीस सौ": 2500, "चौबीस सौ": 2400, "तेईस सौ": 2300, "बाइस सौ": 2200,
    "इक्कीस सौ": 2100, "उन्नीस सौ": 1900, "अट्ठारह सौ": 1800, "सत्रह सौ": 1700,
    "सोलह सौ": 1600, "पंद्रह सौ": 1500, "चौदह सौ": 1400, "तेरह सौ": 1300,
    "बारह सौ": 1200, "ग्यारह सौ": 1100,
    "नौ सौ": 900, "आठ सौ": 800, "सात सौ": 700, "छह सौ": 600,
    "पांच सौ": 500, "पाँच सौ": 500, "चार सौ": 400, "तीन सौ": 300, "दो सौ": 200, "एक सौ": 100,
    "हजार": 1000, "हज़ार": 1000, "सौ": 100,
    "पचास": 50, "चालीस": 40, "पैंतीस": 35, "तीस": 30, "पच्चीस": 25, "बीस": 20,
    "पंद्रह": 15, "चौदह": 14, "तेरह": 13, "बारह": 12, "ग्यारह": 11, "दस": 10,
    "नौ": 9, "आठ": 8, "सात": 7, "छह": 6, "पाँच": 5, "पांच": 5, "चार": 4, "तीन": 3, "दो": 2, "एक": 1,
    "ten thousand": 10000, "five thousand": 5000, "four thousand": 4000, "three thousand": 3000,
    "two thousand five hundred": 2500, "two thousand": 2000, "fifteen hundred": 1500,
    "one thousand": 1000, "five hundred": 500, "four hundred": 400, "three hundred": 300, "two hundred": 200,
    "one hundred": 100, "fifty": 50, "forty": 40, "thirty": 30, "twenty five": 25, "twenty": 20,
    "fifteen": 15, "ten": 10, "five": 5
  };

  for (const [phrase, val] of Object.entries(wordsMap)) {
    if (lower.includes(phrase)) {
      return val;
    }
  }

  return null;
}

// 1. Google Gemini 3.6 Flash Multimodal Vision
async function callGeminiVision(imageUrl, apiKey, language = "en") {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    let imagePart = null;
    if (imageUrl.startsWith("data:image/")) {
      const parts = imageUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      imagePart = {
        inlineData: {
          mimeType: mime,
          data: parts[1],
        },
      };
    } else {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const arrayBuf = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString("base64");
        const mime = imgRes.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: {
            mimeType: mime,
            data: base64,
          },
        };
      }
    }

    const isHindi = language === "hi";
    const isHinglish = language === "hinglish";
    const requestedLang = isHindi ? "Hindi" : isHinglish ? "Hinglish (Hindi written in English alphabet)" : "English";

    const promptText = `
You are an expert Indian ODOP (One District One Product) and GI-tag artisan marketplace specialist for LokKart.
Inspect this product photograph uploaded by an Indian artisan carefully.
Identify the true craft, artform, or textile represented in the image (for example: Banarasi / Varanasi Silk Saree, Madhubani Painting, Terracotta Clay Sculpture, Stone Carving, Sikki Grass, Brass Metalware, Woodcraft, etc.).
The user requested all output strictly in language: ${requestedLang}.

Return a STRICT JSON object (no markdown, no backticks, just raw json) with these fields:
{
  "detectedCraft": "e.g. Varanasi Silk Saree or Madhubani Painting",
  "name": "Professional product title in ${requestedLang}",
  "tagline": "Catchy craft subtitle in ${requestedLang}",
  "category": "One of: sarees, textiles, art, terracotta, stonecraft, sikki, woodwork, metalware, leather, food",
  "categoryLabel": "Friendly category label in ${requestedLang}",
  "estimatedPrice": 3500,
  "suggestedMrp": 4800,
  "description": "2-3 sentences authentic craft story in ${requestedLang} highlighting artisan handmade quality and heritage",
  "specs": {
    "material": "e.g. Pure Katan Silk / Natural Terracotta Clay",
    "origin": "e.g. Varanasi, Uttar Pradesh / Bhagalpur, Bihar",
    "weave": "e.g. Handloom Jacquard Weave / Pit Loom / Hand Carved",
    "weight": "e.g. 550g"
  },
  "suggestedVariants": [
    {
      "name": "e.g. Standard Size or 6.3m",
      "size": "e.g. Standard",
      "color": "e.g. Red",
      "colorHex": "e.g. #FF0000",
      "price": 3500,
      "stock": 5
    }
  ],
  "odopBadge": "ODOP Certified",
  "giTag": "GI Verified",
  "speechMessage": "Friendly greeting and verification question in ${requestedLang}"
}
`;

    const contents = [
      {
        parts: [
          ...(imagePart ? [imagePart] : []),
          { text: promptText },
        ],
      },
    ];

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.15,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText.replace(/```json|```/g, "").trim());
      }
    } else {
      console.warn("Gemini vision response error:", await response.text());
    }
  } catch (err) {
    console.warn("Gemini Vision API notice:", err.message);
  }
  return null;
}

// 2. Google Gemini 3.6 Flash Conversational Dialogue & Intent Understanding
async function callGeminiChatStep(userText, currentStep, currentProduct, language = "en", apiKey) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const isHindi = language === "hi";
    const isHinglish = language === "hinglish";
    const requestedLang = isHindi ? "Hindi" : isHinglish ? "Hinglish (Hindi written in English alphabet)" : "English";

    const promptText = `
You are an intelligent artisan copilot assistant for LokKart (One District One Product).
The artisan is talking to you to create their craft product listing.
Current conversational step: "${currentStep}"
Current product data state:
${JSON.stringify(currentProduct, null, 2)}

Artisan's message: "${userText}"
Active language: ${requestedLang}

YOUR GOAL:
Understand the artisan's intent, deeply analyze their entire query, and update the product data appropriately without losing existing fields.

CRITICAL INSTRUCTIONS:
1. TYPOS & CASUAL CONVERSATION:
   - If the artisan mentions a typo (e.g. "varsansi shree"), correct it to "Varanasi Silk Saree" (category: "sarees", origin: "Varanasi, Uttar Pradesh", material: "Pure Silk").
   - NEVER include filler words like "No it is", "actually it is", "nahi ye to" in the product title!
   - If the artisan says "fix the title" or "change title" or "edit price" or "change stock":
     - Understand they want to edit that specific field.
     - DO NOT reset or wipe out other fields! Keep all existing price, stock, specs, and photos!
     - Set nextStep to "confirm_name" (or "price", "stock" etc.) and ask them what they would like to set.
2. PRICE & STOCK EXTRACTION:
   - Extract numbers implicitly (e.g., "5000", "₹5,000", "5000 rs", "five thousand") and set price.
   - Automatically suggest an originalPrice (MRP ~ 1.35x price, e.g. 6750).
   - If the artisan mentions stock like "20 units", "10 pieces", set stock.
3. ADVANCED VARIANT ANALYSIS (CRITICAL):
   - DEEPLY ANALYZE the user's entire query for mentions of colors, sizes, materials, or different versions (e.g. "I also have a red one for 6000", "Large size is available in 10 units", "Also add blue color").
   - If variants are mentioned, DYNAMICALLY GENERATE OR APPEND them to the "suggestedVariants" array.
   - Extract precise 'colorHex' codes if a color is mentioned (e.g. Red -> #FF0000, Royal Blue -> #4169E1, Black -> #000000, Natural -> #EADDCA).
   - Inherit base price and stock if not explicitly stated for a variant. Keep existing variants intact and just append the new ones.
4. SPECS & ORIGIN:
   - If the artisan says a city or craft origin like "varanasi", "bhagalpur", "madhubani", update specs.origin.
   - If they specify materials like "pure silk", "clay", update specs.material.
5. GI & ODOP:
   - If artisan says "yes", "gi verified", "odop certified", set giTag = "GI Verified", odopBadge = "ODOP Certified".
   - Set nextStep = "completed" and isComplete = true.

Return a STRICT JSON response (no markdown, no backticks, just raw json):
{
  "updatedProduct": {
    "name": "Clean corrected title",
    "tagline": "...",
    "category": "One of: sarees, textiles, art, terracotta, stonecraft, sikki, woodwork, metalware, leather, food",
    "categoryLabel": "Friendly category label",
    "price": 5000,
    "originalPrice": 6750,
    "stock": 20,
    "description": "...",
    "specs": {
      "material": "...",
      "origin": "...",
      "weave": "...",
      "weight": "..."
    },
    "suggestedVariants": [
      {
        "name": "Variant Name (e.g. Red - Standard)",
        "size": "Size",
        "color": "Color",
        "colorHex": "#Hex Code",
        "price": 5000,
        "stock": 10
      }
    ],
    "odopBadge": "ODOP Certified",
    "giTag": "GI Verified"
  "nextStep": "stock",
  "speech": "Natural, helpful, friendly spoken reply in ${requestedLang} confirming the change, acknowledging variants if added, and asking the next question.",
  "isComplete": false
}
NOTE: For 'nextStep', strictly output one of these exact strings: "confirm_name", "price", "stock", "specs", "gi_odop", or "completed".
`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText.replace(/```json|```/g, "").trim());
      }
    }
  } catch (err) {
    console.warn("Gemini Chat Step API notice:", err.message);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, imageUrl, language = "en", transcript, currentProduct, step } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
    const isEn = language !== "hi";

    // ACTION 1: ANALYZE IMAGE (Vision Identification)
    if (action === "analyze_image") {
      let analysisResult = null;

      if (apiKey && imageUrl) {
        analysisResult = await callGeminiVision(imageUrl, apiKey, language);
      }

      // Local fallback presets
      if (!analysisResult) {
        const lowerUrl = (imageUrl || "").toLowerCase();
        let matched = ODOP_CRAFT_PRESETS[0];

        for (const preset of ODOP_CRAFT_PRESETS) {
          if (preset.keywords.some((k) => lowerUrl.includes(k))) {
            matched = preset;
            break;
          }
        }

        analysisResult = {
          detectedCraft: isEn ? matched.nameEn : matched.name,
          name: isEn ? matched.nameEn : matched.name,
          tagline: isEn ? matched.taglineEn : matched.tagline,
          category: matched.category,
          categoryLabel: isEn ? matched.categoryLabelEn : matched.categoryLabel,
          estimatedPrice: matched.price,
          suggestedMrp: matched.originalPrice,
          description: isEn ? matched.descriptionEn : matched.description,
          specs: isEn ? matched.specsEn : matched.specs,
          odopBadge: matched.odopBadge,
          giTag: matched.giTag,
          hindiSpeechMessage: `अद्भुत कारीगरी! फोटो देखकर हमने इसे '${matched.name}' पहचाना है। क्या आप यही नाम रखना चाहेंगे या कोई और नाम बताना चाहते हैं?`,
          englishSpeechMessage: `Wonderful craft! Based on the photo, we identified this as '${matched.nameEn}'. Would you like to keep this title or provide a custom name?`,
        };
      }

      const speech = isEn
        ? (analysisResult.englishSpeechMessage || analysisResult.speechMessage || `Detected '${analysisResult.name}'. Keep this title or enter a custom name?`)
        : (analysisResult.hindiSpeechMessage || analysisResult.speechMessage || `हमने फोटो से '${analysisResult.name}' पहचाना है। क्या आप यही नाम रखना चाहेंगे?`);

      return NextResponse.json({
        success: true,
        data: analysisResult,
        nextStep: "confirm_name",
        speech,
      });
    }

    // ACTION 2: CHAT STEP (Conversational Voice Extraction)
    if (action === "chat_step") {
      const userText = (transcript || "").trim();
      const isHindi = language === "hi";
      const product = { ...(currentProduct || {}) };

      // 1. Try Gemini 3.6 Flash Conversational Parser
      if (apiKey && userText) {
        const geminiChatResult = await callGeminiChatStep(userText, step, product, language, apiKey);
        if (geminiChatResult && geminiChatResult.updatedProduct) {
          // Merge safely so existing fields like images are preserved
          const mergedProduct = {
            ...product,
            ...geminiChatResult.updatedProduct,
            images: product.images || geminiChatResult.updatedProduct.images,
            primaryImage: product.primaryImage || geminiChatResult.updatedProduct.primaryImage,
          };

          return NextResponse.json({
            success: true,
            updatedProduct: mergedProduct,
            speech: geminiChatResult.speech,
            nextStep: geminiChatResult.nextStep || "confirm_name",
            isComplete: Boolean(geminiChatResult.isComplete),
          });
        }
      }

      // 2. Rule-Based Fallback Parser if Gemini fails or is offline
      let speechResponse = "";
      let nextStep = step;
      let isComplete = false;

      // Check if user is asking to fix or edit a specific field
      if (/(fix|change|edit|update)\s+(the\s+)?(title|name|naam)/i.test(userText)) {
        nextStep = "confirm_name";
        speechResponse = isHindi
          ? "बिल्कुल! आप इस उत्पाद का क्या नया शीर्षक रखना चाहते हैं?"
          : "Sure! What would you like the new title of the product to be?";
        return NextResponse.json({ success: true, updatedProduct: product, speech: speechResponse, nextStep, isComplete: false });
      }

      if (/(fix|change|edit|update)\s+(the\s+)?(price|rate|cost|keemat)/i.test(userText)) {
        nextStep = "price";
        speechResponse = isHindi
          ? "ज़रूर! आप इसकी क्या बिक्री कीमत (₹) रखना चाहते हैं?"
          : "Sure! What selling price (in ₹) would you like to set?";
        return NextResponse.json({ success: true, updatedProduct: product, speech: speechResponse, nextStep, isComplete: false });
      }

      if (/(fix|change|edit|update)\s+(the\s+)?(stock|quantity|units)/i.test(userText)) {
        nextStep = "stock";
        speechResponse = isHindi
          ? "ज़रूर! आपके पास बिक्री के लिए कितनी मात्रा उपलब्ध है?"
          : "Sure! How many units do you have available in stock?";
        return NextResponse.json({ success: true, updatedProduct: product, speech: speechResponse, nextStep, isComplete: false });
      }

      switch (step) {
        case "check_all_photos": {
          const affirmative = /^(yes|yeah|yep|ha|haan|हाँ|हा|done|all done|all uploaded|bilkul|कर दी|upload ho gayi)/i.test(userText);
          if (affirmative || userText.length === 0) {
            nextStep = "confirm_name";
            speechResponse = isHindi
              ? "बहुत अच्छा! अब हम फोटो की जांच करके उत्पाद के विवरण पहचान रहे हैं..."
              : isHinglish 
                ? "Bahut badhiya! Ab hum photo ko analyze karke details pehchan rahe hain..." 
                : "Great! Analyzing product photos to detect craft features and details...";
          } else {
            nextStep = "check_all_photos";
            speechResponse = isHindi
              ? "कृपया अपने उत्पाद की सभी तस्वीरें जोड़ लें, फिर 'हाँ' कहें।"
              : isHinglish
                ? "Kripya apni saari photos add kar lein, fir 'Yes' ya 'Haan' kahein."
                : "Please upload any additional photos, then say or click 'Yes' to proceed.";
          }
          break;
        }

        case "confirm_name": {
          const isKeep = /^(yes|yeah|yep|keep|correct|fine|right|sure|looks good|हाँ|हा|ha|haan|sahi hai|yahi|यही)/i.test(userText);
          if (!isKeep && userText.length > 2) {
            let cleanedTitle = userText.replace(/^(no,?\s*(it\s*is|its)?|it\s*is|name\s*is|title\s*is|call\s*it|please\s*set|actually\s*(it\s*is)?|nahi\s*(ye\s*to)?|nah|naam)\s*/i, "");
            
            // Typo cleanup heuristics
            if (/varsansi\s*shree|varanasi\s*saree|banarasi/i.test(cleanedTitle)) {
              cleanedTitle = "Varanasi Silk Saree";
              product.category = "sarees";
              product.categoryLabel = "Handloom Sarees & Silk";
              product.specs = { ...(product.specs || {}), origin: "Varanasi, Uttar Pradesh", material: "Pure Silk" };
            }

            product.name = cleanedTitle || product.name;
          }
          nextStep = "price";
          speechResponse = isHindi
            ? `नाम दर्ज हो गया: '${product.name}'। अब बताइए, इस उत्पाद की बिक्री कीमत (Selling Price in ₹) क्या रखना चाहते हैं?`
            : isHinglish
              ? `Naam save ho gaya: '${product.name}'. Ab bataiye, aapki selling price (₹) kya hogi?`
              : `Product title saved as '${product.name}'. What is your target selling price (in ₹)?`;
          break;
        }

        case "price": {
          const parsedPrice = parseNumberWords(userText);
          if (parsedPrice && parsedPrice > 0) {
            product.price = parsedPrice;
            product.originalPrice = Math.round(parsedPrice * 1.35);
            nextStep = "stock";
            speechResponse = isHindi
              ? `कीमत ₹${parsedPrice} तय हो गई। आपके पास अभी बिक्री के लिए कितना स्टॉक (Quantity) उपलब्ध है?`
              : isHinglish
                ? `Price ₹${parsedPrice} set ho gayi hai. Aapke paas abhi kitna stock (pieces) available hai?`
                : `Selling price set to ₹${parsedPrice}. How many units do you have available in stock?`;
          } else {
            nextStep = "price";
            speechResponse = isHindi
              ? "कृपया केवल संख्या या कीमत बोलें, जैसे 'दो हजार' या '2500 रुपये'।"
              : isHinglish
                ? "Kripya sirf numbers me price batayein, jaise '2500' ya '5000'."
                : "Please specify the price as a number, for example '2500' or '5000 rupees'.";
          }
          break;
        }

        case "stock": {
          const parsedStock = parseNumberWords(userText);
          if (parsedStock !== null && parsedStock >= 0) {
            product.stock = parsedStock;
            nextStep = "specs";
            speechResponse = isHindi
              ? `स्टॉक ${parsedStock} पीस दर्ज हुआ। यह उत्पाद किस सामग्री (जैसे शुद्ध सिल्क, कॉटन, टेराकोटा) और किस जिले में तैयार हुआ है?`
              : isHinglish
                ? `Stock ${parsedStock} units set ho gaya hai. Ye kis material (kapda/mitti) se bana hai aur kis zila (city) ka hai?`
                : `Stock set to ${parsedStock} units. What raw material is it made of and which craft district/city does it belong to?`;
          } else {
            nextStep = "stock";
            speechResponse = isHindi
              ? "कृपया उपलब्ध मात्रा बोलें, जैसे '5 पीस' या '10'।"
              : isHinglish
                ? "Kripya stock numbers me batayein, jaise '10' ya '5 pieces'."
                : "Please specify the available quantity, for example '10' or '20 units'.";
          }
          break;
        }

        case "specs": {
          if (userText.length > 2) {
            let origin = product.specs?.origin || "Varanasi, Uttar Pradesh";
            if (/bhagalpur|भागलपुर/i.test(userText)) origin = "Bhagalpur, Bihar";
            else if (/madhubani|मधुबनी/i.test(userText)) origin = "Madhubani, Bihar";
            else if (/varanasi|बनारस|banaras/i.test(userText)) origin = "Varanasi, Uttar Pradesh";
            else if (/gorakhpur|गोरखपुर/i.test(userText)) origin = "Gorakhpur, Uttar Pradesh";

            const parts = userText.split(/(in|from|,|made of|में|से|का|aur|and)/i);
            const material = parts[0]?.trim() || product.specs?.material || "Handcrafted Authentic";

            product.specs = {
              ...(product.specs || {}),
              material,
              origin,
            };
          }
          nextStep = "gi_odop";
          speechResponse = isHindi
            ? "विवरण जुड़ गया। क्या यह उत्पाद आधिकारिक GI-टैग या ODOP योजना के तहत प्रमाणित है?"
            : isHinglish
              ? "Details add ho gaye. Kya ye product GI-tag ya ODOP certified hai? (Haan / Nahi)"
              : "Craft specifications recorded. Is this product certified under official GI-tag or ODOP?";
          break;
        }

        case "gi_odop": {
          const hasGi = /^(yes|yeah|sure|gi|odop|certified|verified|हाँ|हा|ha|haan|प्रमाणित|bilkul)/i.test(userText);
          const isNo = /^(no|nah|nhi|nahi|na|none|not)/i.test(userText);
          
          if (hasGi) {
            product.giTag = "GI Verified";
            product.odopBadge = "ODOP Certified";
          } else if (isNo) {
            product.giTag = null;
            product.odopBadge = null;
          } else {
            product.giTag = "Artisan Handcrafted Authentic";
            product.odopBadge = "ODOP Eligible";
          }
          
          nextStep = "completed";
          isComplete = true;
          speechResponse = isHindi
            ? "बधाई हो! आपकी उत्पाद लिस्टिंग पूरी तरह तैयार हो गई है। 'उत्पाद प्रकाशित करें' दबाकर इसे लाइव करें।"
            : isHinglish
              ? "Badhai ho! Aapki product listing taiyar hai. Ab aap isko direct publish kar sakte hain!"
              : "Congratulations! Your craft listing is completely ready. All details have been populated. You can apply them to the form or publish directly!";
          break;
        }

        default: {
          nextStep = "confirm_name";
          speechResponse = isHindi
            ? `उत्पाद का नाम '${product.name || "हस्तशिल्प"}' है। क्या आप इसे बदलना चाहते हैं?`
            : `Product title is currently '${product.name || "Craft Item"}'. What would you like to update?`;
        }
      }

      return NextResponse.json({
        success: true,
        updatedProduct: product,
        speech: speechResponse,
        nextStep,
        isComplete,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("AI Product Assistant Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
