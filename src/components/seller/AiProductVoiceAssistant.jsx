"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Loader2,
  X,
  Check,
  ShieldCheck,
  Edit3,
} from "lucide-react";

export default function AiProductVoiceAssistantDialog({
  isOpen,
  onOpenChange,
  form,
  setForm,
  onApply,
  onPublish,
  isPublishing,
}) {
  const [language, setLanguage] = useState("en"); // English by default
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Local synchronized product state to prevent dropped inputs
  const [localProduct, setLocalProduct] = useState(form || {});
  const localProductRef = useRef(form || {});

  const [localVariants, setLocalVariants] = useState([]);
  const localVariantsRef = useRef([]);

  // Conversational state:
  // 'upload' -> 'check_all_photos' -> 'analyzing' -> 'confirm_name' -> 'price' -> 'stock' -> 'specs' -> 'gi_odop' -> 'completed'
  const [currentStep, setCurrentStep] = useState("upload");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Craft Assistant. Upload one or more photos of your handcrafted product to get started.",
      textHindi: "नमस्ते! मैं आपका AI शिल्प सहायक हूँ। शुरू करने के लिए अपने हस्तनिर्मित उत्पाद की फोटो अपलोड करें।",
      textHinglish: "Hello! Main aapka AI Craft Assistant hoon. Shuru karne ke liye apne handmade product ki photo upload karein.",
      textEn: "Hello! I am your AI Craft Assistant. Upload one or more photos of your handcrafted product to get started."
    }
  ]);

  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync when dialog opens or parent form changes
  useEffect(() => {
    if (form) {
      localProductRef.current = { ...form };
      setLocalProduct({ ...form });
      if (form.primaryImage && uploadedPhotos.length === 0) {
        setUploadedPhotos([form.primaryImage]);
      }
    }
  }, [isOpen]);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAnalyzing]);

  // Speech Synthesis Helper
  const speakText = (text) => {
    if (typeof window === "undefined" || isAudioMuted) return;
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      if (language === "hi") {
        utterance.lang = "hi-IN";
        const hindiVoice = voices.find(
          (v) => v.lang.includes("hi") || v.name.toLowerCase().includes("hindi")
        );
        if (hindiVoice) utterance.voice = hindiVoice;
      } else if (language === "hinglish") {
        utterance.lang = "en-IN"; // English Indian voice works best for Hinglish
        const enInVoice = voices.find(
          (v) => v.lang.includes("en-IN")
        );
        if (enInVoice) utterance.voice = enInVoice;
      } else {
        utterance.lang = "en-US";
        const enVoice = voices.find(
          (v) => v.lang.includes("en-US") || v.lang.includes("en")
        );
        if (enVoice) utterance.voice = enVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-IN";

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const text = event.results?.[0]?.[0]?.transcript || "";
        if (text) {
          setTranscript(text);
          handleUserReply(text);
        }
      };

      recognitionRef.current = rec;

      return () => {
        try {
          rec.abort();
        } catch (e) {
          // ignore cleanup errors
        }
      };
    }
  }, [language, currentStep]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is supported in Google Chrome, Microsoft Edge, and modern mobile browsers.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Mic start error:", err);
      }
    }
  };

  // Switch Language
  const switchLanguage = (newLang) => {
    setLanguage(newLang);
    if (newLang === "hi") {
      addAiMessage(
        "भाषा बदलकर हिंदी कर दी गई है। आप बोलकर या लिखकर विवरण दे सकते हैं।",
        "Language switched to Hindi."
      );
    } else if (newLang === "hinglish") {
      addAiMessage(
        "Language Hinglish set ho gayi hai. Aap bolkar ya type karke details de sakte hain.",
        "Language switched to Hinglish."
      );
    } else {
      addAiMessage(
        "Language switched to English. You can speak or type your product details.",
        "Language switched to English."
      );
    }
  };

  // Append AI message
  const addAiMessage = (msgText, msgEn = null) => {
    const textToShow = language === "hi" ? msgText : language === "hinglish" ? (msgEn || msgText) : (msgEn || msgText);
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: textToShow,
        textHindi: msgText,
        textHinglish: msgEn || msgText,
        textEn: msgEn || msgText
      }
    ]);
    speakText(textToShow);
  };

  // Append User message
  const addUserMessage = (text) => {
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
  };

  // 1. Direct R2 File Upload Handler
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingPhoto(true);

    const uploadedUrls = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    if (uploadedUrls.length > 0) {
      const combined = [...uploadedPhotos, ...uploadedUrls];
      setUploadedPhotos(combined);

      const nextProd = {
        ...localProductRef.current,
        primaryImage: localProductRef.current.primaryImage || combined[0],
        galleryInput: combined.slice(1).join(", "),
      };
      localProductRef.current = nextProd;
      setLocalProduct(nextProd);
      setForm((prev) => ({ ...prev, ...nextProd }));

      setCurrentStep("check_all_photos");
      if (language === "hi") {
        addAiMessage(
          "तस्वीर सुरक्षित अपलोड हो गई है! क्या आपने सभी तस्वीरें अपलोड कर दी हैं?",
          "Photo securely uploaded! Have you uploaded all photos for this craft?"
        );
      } else if (language === "hinglish") {
        addAiMessage(
          "Photo securely upload ho gayi hai! Kya aapne is craft ki saari photos upload kar di hain?",
          "Photo securely upload ho gayi hai! Kya aapne is craft ki saari photos upload kar di hain?"
        );
      } else {
        addAiMessage(
          "Photo securely uploaded! Have you uploaded all photos for this craft?",
          "Photo securely uploaded! Have you uploaded all photos for this craft?"
        );
      }
    }

    setIsUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove photo
  const removePhoto = (idx) => {
    const updated = uploadedPhotos.filter((_, i) => i !== idx);
    setUploadedPhotos(updated);
    const nextProd = {
      ...localProductRef.current,
      primaryImage: updated[0] || "",
      galleryInput: updated.slice(1).join(", "),
    };
    localProductRef.current = nextProd;
    setLocalProduct(nextProd);
    setForm((prev) => ({ ...prev, ...nextProd }));
  };

  // 2. Multimodal Gemini 3.6 Flash Craft Analysis
  const runVisionAnalysis = async (imgUrl) => {
    const targetUrl = imgUrl || uploadedPhotos[0] || localProductRef.current.primaryImage;
    if (!targetUrl) {
      addAiMessage(
        "Please upload a photo of your craft first so AI can analyze it.",
        "Please upload a photo of your craft first so AI can analyze it."
      );
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep("analyzing");

    if (language === "hi") {
      addAiMessage(
        "शानदार! Google Gemini 3.6 AI अब आपकी फोटो का विश्लेषण कर रहा है...",
        "Great! Google Gemini 3.6 AI is now analyzing your craft photo..."
      );
    } else if (language === "hinglish") {
      addAiMessage(
        "Great! Google Gemini AI ab aapki craft photo analyze kar raha hai...",
        "Great! Google Gemini AI ab aapki craft photo analyze kar raha hai..."
      );
    } else {
      addAiMessage(
        "Great! Google Gemini 3.6 AI is now analyzing your craft photo...",
        "Great! Google Gemini 3.6 AI is now analyzing your craft photo..."
      );
    }

    try {
      const res = await fetch("/api/ai/product-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_image",
          imageUrl: targetUrl,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const craft = json.data;

        // Auto-fill and update synchronized states
        const nextProd = {
          ...localProductRef.current,
          name: craft.name || localProductRef.current.name,
          tagline: craft.tagline || localProductRef.current.tagline,
          category: craft.category || localProductRef.current.category,
          categoryLabel: craft.categoryLabel || localProductRef.current.categoryLabel,
          price: craft.estimatedPrice || localProductRef.current.price,
          originalPrice: craft.suggestedMrp || localProductRef.current.originalPrice,
          description: craft.description || localProductRef.current.description,
          odopBadge: craft.odopBadge || localProductRef.current.odopBadge,
          giTag: craft.giTag || localProductRef.current.giTag,
          specs: {
            ...(localProductRef.current.specs || {}),
            ...(craft.specs || {}),
          },
        };

        localProductRef.current = nextProd;
        setLocalProduct(nextProd);
        setForm((prev) => ({ ...prev, ...nextProd }));

        if (craft.suggestedVariants && craft.suggestedVariants.length > 0) {
          localVariantsRef.current = craft.suggestedVariants;
          setLocalVariants(craft.suggestedVariants);
        }

        setCurrentStep("confirm_name");
        addAiMessage(
          craft.hindiSpeechMessage || `अद्भुत कारीगरी! फोटो देखकर हमने इसे '${craft.name}' पहचाना है। क्या आप यही नाम रखना चाहेंगे?`,
          craft.englishSpeechMessage || `Wonderful craft! Based on the image, we detected '${craft.name}'. Would you like to keep this title or provide a custom name?`
        );
      }
    } catch (err) {
      console.error("Vision analysis failed", err);
      setCurrentStep("confirm_name");
      addAiMessage(
        "Photo received! What is the title of this handcrafted product?",
        "Photo received! What is the title of this handcrafted product?"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Conversational Response Handler
  const handleUserReply = async (userText) => {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();
    addUserMessage(cleanText);
    setTranscript("");

    // Step 1: Photos confirmation
    if (currentStep === "check_all_photos") {
      const isYes = /^(yes|yeah|yep|ha|haan|हाँ|हा|done|all|sab|ho gayi|upload ho gayi|bilkul)/i.test(cleanText);
      if (isYes) {
        runVisionAnalysis(uploadedPhotos[0] || localProductRef.current.primaryImage);
      } else {
        if (language === "hi") {
          addAiMessage(
            "कोई बात नहीं! आप और तस्वीरें अपलोड कर सकते हैं, फिर 'हाँ' कहें।",
            "No problem! You can upload additional photos, then click or say 'Yes' to proceed."
          );
        } else {
          addAiMessage(
            "No problem! You can upload additional photos, then click or say 'Yes' to proceed.",
            "No problem! You can upload additional photos, then click or say 'Yes' to proceed."
          );
        }
      }
      return;
    }

    // Step 2..N: Conversational chat step via Gemini 3.6 Flash
    try {
      const res = await fetch("/api/ai/product-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat_step",
          step: currentStep,
          transcript: cleanText,
          currentProduct: {
            ...localProductRef.current,
            suggestedVariants: localVariantsRef.current,
          },
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.updatedProduct) {
        const merged = {
          ...localProductRef.current,
          ...data.updatedProduct,
          specs: {
            ...(localProductRef.current.specs || {}),
            ...(data.updatedProduct.specs || {}),
          },
        };

        localProductRef.current = merged;
        setLocalProduct(merged);
        setForm((prev) => ({ ...prev, ...merged }));

        if (data.updatedProduct.suggestedVariants) {
          localVariantsRef.current = data.updatedProduct.suggestedVariants;
          setLocalVariants(data.updatedProduct.suggestedVariants);
        }

        if (data.nextStep) {
          setCurrentStep(data.nextStep);
        }
        if (data.speech) {
          addAiMessage(data.speech, data.speech);
        }
      }
    } catch (err) {
      console.error("Chat step failed", err);
    }
  };

  // Suggested Quick Response Chips
  const renderQuickChips = () => {
    const isEn = language === "en";

    if (currentStep === "check_all_photos") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => handleUserReply(isEn ? "Yes, all photos uploaded" : "हाँ, सभी फोटो अपलोड हो गईं")}
            className="rounded-pill bg-brand-primary hover:bg-primary-hover text-white text-xs h-7 px-3 cursor-pointer"
          >
            ✓ {isEn ? "Yes, all photos uploaded" : "हाँ, सभी फोटो अपलोड हो गईं"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            + {isEn ? "Upload more photos" : "और फोटो जोड़नी है"}
          </Button>
        </div>
      );
    }

    if (currentStep === "confirm_name") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {localProduct.name && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleUserReply(isEn ? "Yes, keep this title" : "हाँ, यही नाम रखें")}
              className="rounded-pill bg-brand-primary hover:bg-primary-hover text-white text-xs h-7 px-3 cursor-pointer"
            >
              ✓ {isEn ? `Keep '${localProduct.name}'` : "हाँ, यही नाम रखें"}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "Varanasi Silk Saree" : "वाराणसी सिल्क साड़ी")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            {isEn ? "Varanasi Silk Saree" : "वाराणसी सिल्क साड़ी"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "Madhubani Silk Saree" : "मधुबनी सिल्क साड़ी")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            {isEn ? "Madhubani Silk Saree" : "मधुबनी सिल्क साड़ी"}
          </Button>
        </div>
      );
    }

    if (currentStep === "price") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {["₹2,500", "₹3,500", "₹5,000", "₹7,500"].map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUserReply(p)}
              className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card hover:bg-muted cursor-pointer"
            >
              {p}
            </Button>
          ))}
        </div>
      );
    }

    if (currentStep === "stock") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {[isEn ? "5 units" : "5 पीस", isEn ? "10 units" : "10 पीस", isEn ? "20 units" : "20 पीस", isEn ? "50 units" : "50 पीस"].map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUserReply(s)}
              className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card hover:bg-muted cursor-pointer"
            >
              {s}
            </Button>
          ))}
        </div>
      );
    }

    if (currentStep === "specs") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "Pure Silk, Varanasi" : "शुद्ध सिल्क, वाराणसी")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            {isEn ? "Pure Silk (Varanasi)" : "शुद्ध सिल्क (वाराणसी)"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "Pure Tussar Silk, Bhagalpur" : "तसर सिल्क, भागलपुर")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            {isEn ? "Tussar Silk (Bhagalpur)" : "तसर सिल्क (भागलपुर)"}
          </Button>
        </div>
      );
    }

    if (currentStep === "gi_odop" || currentStep === "completed") {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => handleUserReply(isEn ? "Yes, GI Verified and ODOP Certified" : "हाँ, GI-टैग और ODOP प्रमाणित है")}
            className="rounded-pill bg-brand-primary hover:bg-primary-hover text-white text-xs h-7 px-3 cursor-pointer"
          >
            ✓ {isEn ? "Yes, GI & ODOP Certified" : "हाँ, GI और ODOP"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "fix the title" : "नाम बदलो")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            ✏️ {isEn ? "Edit Title" : "नाम बदलें"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleUserReply(isEn ? "change the price" : "कीमत बदलो")}
            className="rounded-pill border-brand-line text-xs h-7 px-3 bg-card cursor-pointer"
          >
            💰 {isEn ? "Edit Price" : "कीमत बदलें"}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl border-brand-line bg-card shadow-2xl flex flex-col">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-brand-line bg-gradient-to-r from-card via-card to-brand-tertiary/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-extrabold text-brand-primary flex items-center gap-2">
                AI Craft Listing Studio
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-brand-subtle mt-1">
                Upload product photos, interact with AI in your language, and auto-fill your listing specifications.
              </DialogDescription>
            </div>
          </div>

          {/* Language & Audio Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-pill p-1 border border-brand-line text-xs font-bold">
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${language === "en" ? "bg-brand-primary text-white shadow-xs" : "text-brand-subtle hover:text-brand-primary"
                  }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("hi")}
                className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${language === "hi" ? "bg-brand-primary text-white shadow-xs" : "text-brand-subtle hover:text-brand-primary"
                  }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("hinglish")}
                className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${language === "hinglish" ? "bg-brand-primary text-white shadow-xs" : "text-brand-subtle hover:text-brand-primary"
                  }`}
              >
                Hinglish
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="h-8 w-8 p-0 rounded-full border border-brand-line text-brand-subtle hover:text-brand-primary cursor-pointer"
              title={isAudioMuted ? "Unmute Audio Speech" : "Mute Audio Speech"}
            >
              {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-brand-tertiary" />}
            </Button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[480px]">
          {/* Left Column: Media Upload & Interactive Conversation (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-brand-line p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[calc(90vh-130px)]">
            {/* Step 1: Photos Upload Area */}
            <div className="p-6 rounded-[24px] bg-muted/40 border border-brand-line/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-primary flex items-center gap-2">
                  <ImageIcon size={16} className="text-brand-tertiary" />
                  Product Craft Photos
                </span>
                {uploadedPhotos.length > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                    ✓ {uploadedPhotos.length} {uploadedPhotos.length === 1 ? "photo" : "photos"} stored
                  </Badge>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-4 rounded-[16px] border-2 border-dashed border-brand-tertiary/40 bg-card hover:bg-brand-tertiary/5 transition-all text-sm font-bold text-brand-tertiary shadow-sm">
                  <Upload size={18} />
                  <span>{isUploadingPhoto ? "Uploading photo..." : "+ Select or Drag Product Photos"}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>

                {uploadedPhotos.length > 0 && !isAnalyzing && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => runVisionAnalysis(uploadedPhotos[0])}
                    className="h-[48px] px-5 rounded-button bg-brand-tertiary hover:bg-tertiary-hover text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-[0.98]"
                  >
                    <Sparkles size={16} />
                    <span>Analyze Craft</span>
                  </Button>
                )}
              </div>

              {/* Photo Thumbnails */}
              {uploadedPhotos.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                  {uploadedPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-brand-line shrink-0 bg-card group">
                      <img src={url} alt="Uploaded craft" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-white font-bold text-center py-0.5">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Chat History Stream */}
            <div
              ref={chatScrollRef}
              className="flex-1 min-h-[180px] max-h-[260px] overflow-y-auto space-y-4 p-5 rounded-[24px] bg-card border border-brand-line/60 text-sm custom-scrollbar shadow-inner"
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-xs shadow-sm">
                      AI
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${msg.sender === "user"
                        ? "bg-brand-primary text-primary-foreground font-medium rounded-tr-none"
                        : "bg-muted/80 text-brand-primary font-medium rounded-tl-none border border-brand-line/60"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAnalyzing && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-brand-tertiary/10 text-brand-tertiary font-bold text-sm">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Gemini Multimodal AI is inspecting your craft image...</span>
                </div>
              )}
            </div>

            {/* Quick Answer Chips */}
            {renderQuickChips()}

            {/* Voice Listening & Message Input */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={toggleListening}
                className={`h-[48px] px-6 rounded-button font-bold text-sm flex items-center gap-2 transition-transform active:scale-[0.98] cursor-pointer shrink-0 ${isListening
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-md"
                    : "bg-brand-tertiary hover:bg-tertiary-hover text-white shadow-sm"
                  }`}
                title="Click to speak using your microphone"
              >
                {isListening ? (
                  <>
                    <MicOff size={18} />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    <span>Speak</span>
                  </>
                )}
              </Button>

              <div className="flex-1 flex items-center gap-2 relative">
                <Input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUserReply(transcript);
                    }
                  }}
                  placeholder={
                    language === "hi"
                      ? "उत्तर लिखें या माइक दबाकर बोलें..."
                      : "Type your reply or click Speak to talk..."
                  }
                  className="h-[48px] w-full pl-4 pr-12 rounded-input bg-muted border-brand-line text-sm font-bold text-brand-primary placeholder:text-brand-subtle placeholder:font-medium focus-visible:ring-1 focus-visible:ring-brand-tertiary focus-visible:border-brand-tertiary shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleUserReply(transcript)}
                  disabled={!transcript.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] bg-brand-primary hover:bg-primary-hover text-primary-foreground cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Live Product Spec Preview (5 Cols) */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-card to-muted flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-130px)] shadow-inner">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-brand-line/60">
                <span className="text-xs font-bold text-brand-primary flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Live Specifications Sync
                </span>
                <Badge className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold border border-brand-primary/20 backdrop-blur-sm">
                  AI Auto-Fill Active
                </Badge>
              </div>

              {/* Product Photo Showcase */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-brand-line shadow-sm bg-card group">
                {localProduct.primaryImage ? (
                  <>
                    <img
                      src={localProduct.primaryImage}
                      alt="Craft Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-brand-subtle">
                    <ImageIcon size={40} className="stroke-1 text-brand-subtle/30 mb-2" />
                    <span className="text-xs font-medium">Awaiting Craft Photo</span>
                  </div>
                )}

                {/* Overlays */}
                {localProduct.categoryLabel && (
                  <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand-primary text-[10px] font-extrabold shadow-sm">
                    {localProduct.categoryLabel}
                  </Badge>
                )}
                {(localProduct.giTag || localProduct.odopBadge) && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {localProduct.giTag && (
                      <Badge className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-extrabold shadow-sm border border-amber-400/50">
                        {localProduct.giTag}
                      </Badge>
                    )}
                    {localProduct.odopBadge && (
                      <Badge className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold shadow-sm border border-emerald-500/50">
                        {localProduct.odopBadge}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-extrabold text-lg leading-tight shadow-black drop-shadow-md">
                    {localProduct.name || <span className="text-white/70 italic text-sm">Craft Title...</span>}
                  </h4>
                  {localProduct.tagline && (
                    <p className="text-xs font-medium text-white/90 drop-shadow-md mt-0.5 line-clamp-1">{localProduct.tagline}</p>
                  )}
                </div>
              </div>

              {/* Price & Stock Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-black p-3.5 rounded-2xl border border-brand-line shadow-xs flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-subtle">Price</span>
                    <button type="button" onClick={() => handleUserReply("change price")} className="text-brand-tertiary hover:text-brand-primary cursor-pointer"><Edit3 size={12} /></button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-brand-primary">{localProduct.price ? `₹${localProduct.price}` : "—"}</span>
                    {localProduct.originalPrice && <span className="text-xs text-brand-subtle font-bold line-through">₹{localProduct.originalPrice}</span>}
                  </div>
                </div>

                <div className="bg-white dark:bg-black p-3.5 rounded-2xl border border-brand-line shadow-xs flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-subtle">Inventory</span>
                    <button type="button" onClick={() => handleUserReply("change stock")} className="text-brand-tertiary hover:text-brand-primary cursor-pointer"><Edit3 size={12} /></button>
                  </div>
                  <span className="text-lg font-black text-brand-primary">{localProduct.stock ? `${localProduct.stock} Units` : "—"}</span>
                </div>
              </div>

              {/* Artisan Specs */}
              {localProduct.specs && Object.keys(localProduct.specs).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-subtle">Craft Specifications</span>
                  <div className="grid grid-cols-2 gap-2">
                    {localProduct.specs.material && (
                      <div className="bg-muted/50 p-2.5 rounded-xl border border-brand-line/50 text-[11px]">
                        <span className="block text-brand-subtle font-bold mb-0.5">Material</span>
                        <span className="text-brand-primary font-bold">{localProduct.specs.material}</span>
                      </div>
                    )}
                    {localProduct.specs.origin && (
                      <div className="bg-muted/50 p-2.5 rounded-xl border border-brand-line/50 text-[11px]">
                        <span className="block text-brand-subtle font-bold mb-0.5">Origin</span>
                        <span className="text-brand-primary font-bold">{localProduct.specs.origin}</span>
                      </div>
                    )}
                    {localProduct.specs.weave && (
                      <div className="bg-muted/50 p-2.5 rounded-xl border border-brand-line/50 text-[11px]">
                        <span className="block text-brand-subtle font-bold mb-0.5">Technique</span>
                        <span className="text-brand-primary font-bold">{localProduct.specs.weave}</span>
                      </div>
                    )}
                    {localProduct.specs.weight && (
                      <div className="bg-muted/50 p-2.5 rounded-xl border border-brand-line/50 text-[11px]">
                        <span className="block text-brand-subtle font-bold mb-0.5">Weight</span>
                        <span className="text-brand-primary font-bold">{localProduct.specs.weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variants Extracted */}
              {localVariants.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-subtle flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" /> AI Suggested Variants ({localVariants.length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {localVariants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-black p-2.5 rounded-xl border border-brand-line/60 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full shadow-sm border border-brand-line" style={{ backgroundColor: v.colorHex || "#ccc" }} />
                          <div>
                            <p className="text-[11px] font-bold text-brand-primary leading-tight">{v.name}</p>
                            <p className="text-[9px] font-medium text-brand-subtle">{v.size} • {v.color}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-extrabold text-brand-primary">₹{v.price}</p>
                          <p className="text-[9px] font-medium text-emerald-600">{v.stock} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Pinned at Bottom */}
            <div className="p-5 bg-card/80 backdrop-blur-xl border-t border-brand-line flex flex-col gap-2.5 z-10 sticky bottom-0">
              <Button
                type="button"
                onClick={() => {
                  if (onApply) onApply(localProductRef.current, localVariantsRef.current);
                  onOpenChange(false);
                }}
                className="w-full h-12 rounded-xl bg-brand-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check size={18} />
                <span>Apply Specs & Variants to Form</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (onPublish) onPublish(localProductRef.current, localVariantsRef.current);
                }}
                disabled={isPublishing || !localProduct.name || !localProduct.price}
                className="w-full h-11 rounded-xl border-brand-line bg-transparent hover:bg-muted font-bold text-brand-primary text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Publishing directly to Store...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-brand-tertiary" />
                    <span>Publish Directly (Bypass Form)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
