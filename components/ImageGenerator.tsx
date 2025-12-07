
import React, { useState, useEffect } from 'react';
import { generateImageFromPrompt, optimizeImagePrompt } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Wand2, RefreshCw, AlertCircle, History, Trash2, CheckCircle2, ExternalLink, Sparkles, Zap, Brain } from 'lucide-react';

interface SavedImage {
  id: string;
  originalPrompt: string;
  optimizedPrompt: string;
  imageSrc: string;
  date: string;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // States
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Idle, 1: Optimizing, 2: Rendering
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedImage[]>([]);
  
  // Options
  const [isFastMode, setIsFastMode] = useState(false); 
  const [lastOptimizedPrompt, setLastOptimizedPrompt] = useState<string>('');

  useEffect(() => {
    try {
        const saved = localStorage.getItem('image_history_v2');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    } catch (e) {
        console.error("History loading error", e);
    }
  }, []);

  const saveToHistory = (origPrompt: string, optPrompt: string, newImage: string) => {
      try {
        const newItem: SavedImage = {
            id: Date.now().toString(),
            originalPrompt: origPrompt,
            optimizedPrompt: optPrompt,
            imageSrc: newImage,
            date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        };
        const updated = [newItem, ...history].slice(0, 10);
        setHistory(updated);
        localStorage.setItem('image_history_v2', JSON.stringify(updated));
      } catch (e) {
          console.warn("Storage quota exceeded");
      }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('image_history_v2', JSON.stringify(updated));
  };

  const preloadImage = (src: string, timeout: number): Promise<void> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          let timer: any;

          const cleanup = () => {
              clearTimeout(timer);
              img.onload = null;
              img.onerror = null;
          };

          timer = setTimeout(() => {
              cleanup();
              const extraHelp = !isFastMode ? " Iltimos, 'Tezkor Rejim' (Turbo) ga o'tib ko'ring." : "";
              reject(new Error(`Server javob bermadi (Timeout).${extraHelp}`));
          }, timeout);

          img.onload = () => {
              cleanup();
              resolve();
          };

          img.onerror = () => {
              cleanup();
              reject(new Error("Rasm serverdan yuklanmadi. Aloqani tekshiring."));
          };
          
          img.src = src;
      });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setLoadingStep(1);
    setError(null);
    setImageSrc(null);
    setLastOptimizedPrompt('');

    try {
        // 1. BOSQICH: Promptni Tozalash va Kuchaytirish (Gemini)
        // Bu bosqich GPT dan olingan uzun matnlarni tozalaydi
        const finalPrompt = await optimizeImagePrompt(prompt);
        setLastOptimizedPrompt(finalPrompt);

        // 2. BOSQICH: Rasm Chizish (Gemini)
        setLoadingStep(2);
        
        const model = isFastMode ? 'turbo' : 'flux';
        const imageUrl = await generateImageFromPrompt(finalPrompt, model);
        
        // Timeout: Fast mode = 30s, Flux mode = 90s
        const timeoutDuration = isFastMode ? 30000 : 90000;
        
        await preloadImage(imageUrl, timeoutDuration);
        
        setImageSrc(imageUrl);
        saveToHistory(prompt, finalPrompt, imageUrl);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Xatolik yuz berdi.");
    } finally {
        setGenerating(false);
        setLoadingStep(0);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    window.open(imageSrc, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      
      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 flex flex-col md:flex-row gap-6 items-start animate-fade-in relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Brain size={150} className="text-indigo-900"/>
        </div>

        <div className="flex-1 w-full space-y-4 relative z-10">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <label className="text-lg font-bold text-gray-800 flex items-center">
                    <Wand2 size={24} className="mr-2 text-indigo-600"/>
                    AI Rassom (Gemini)
                </label>
                
                <button 
                onClick={() => setIsFastMode(!isFastMode)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center border transition-all ${
                    isFastMode 
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                }`}
                >
                    {isFastMode ? <Zap size={14} className="mr-1 fill-current" /> : <Sparkles size={14} className="mr-1" />}
                    {isFastMode ? "Tezkor Rejim (Flash)" : "Yuqori Sifat (Pro)"}
                </button>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setError(null); }}
                placeholder="Bu yerga istalgan g'oyangizni yozing yoki GPT/Gemini dan olgan matnni to'g'ridan-to'g'ri tashlang. Men uni tushunaman..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none resize-none h-32 text-gray-900 placeholder-gray-400 text-lg transition-all"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                    }
                }}
            />
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
               <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                  <Brain size={12} className="mr-1 text-indigo-500" />
                  GPT Prompts Supported
               </span>
               <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                  <CheckCircle2 size={12} className="mr-1 text-green-500" />
                  Auto-Enhance Active
               </span>
            </div>
        </div>

        <div className="md:h-48 md:w-48 w-full flex-shrink-0 relative z-10">
            <button
                onClick={handleGenerate}
                disabled={generating || !prompt}
                className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold rounded-xl flex flex-col items-center justify-center transition-all disabled:opacity-80 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 transform active:scale-95 p-4 border-b-4 border-indigo-900 active:border-b-0 active:mt-1"
            >
                {generating ? (
                    <>
                        <Loader2 className="animate-spin mb-3" size={36} />
                        <span className="text-sm font-medium animate-pulse">
                            {loadingStep === 1 ? "G'oya tahlil qilinmoqda..." : "Rasm chizilmoqda..."}
                        </span>
                    </>
                ) : (
                    <>
                        <ImageIcon className="mb-2" size={36}/>
                        <span className="text-xl">Yaratish</span>
                        <span className="text-xs opacity-70 mt-1 font-normal">Ctrl + Enter</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-indigo-50 overflow-hidden flex flex-col relative min-h-[500px]">
        {/* Error State */}
        {error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-50/50">
                <div className="text-center max-w-lg p-8 bg-white rounded-2xl shadow-sm border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-red-600 font-bold text-xl mb-2">Ulanishda xatolik</p>
                    <p className="text-gray-600 mb-6 px-4">{error}</p>
                    
                    <button 
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200 flex items-center justify-center mx-auto"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Qayta urinish
                    </button>
                </div>
            </div>
        ) : imageSrc && !generating ? (
            <div className="flex-1 flex flex-col md:flex-row h-full animate-fade-in">
                 <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
                    
                    <img 
                        src={imageSrc} 
                        alt="AI Generated" 
                        className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-lg"
                    />
                 </div>
                 
                 <div className="md:w-80 w-full bg-white border-l border-gray-100 p-6 flex flex-col justify-center space-y-5">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <CheckCircle2 className="text-green-500 mr-2" size={24} />
                        Muvaffaqiyatli!
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="font-bold text-xs text-gray-400 uppercase mb-1">Original Prompt:</p>
                            <p className="text-sm text-gray-700 italic line-clamp-3">"{prompt}"</p>
                        </div>

                        {lastOptimizedPrompt && (
                             <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 relative group">
                                <p className="font-bold text-xs text-indigo-400 uppercase mb-1 flex items-center">
                                    <Sparkles size={10} className="mr-1" />
                                    AI Enhanced Prompt:
                                </p>
                                <p className="text-xs font-mono text-indigo-900 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all">
                                    {lastOptimizedPrompt}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 mt-auto space-y-3">
                         <button 
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold"
                        >
                            <ExternalLink size={20} />
                            <span>HD Yuklab Olish</span>
                        </button>
                        <button
                           onClick={() => { setImageSrc(null); setPrompt(''); }}
                           className="w-full flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            <RefreshCw size={18} />
                            <span>Yangi rasm</span>
                        </button>
                    </div>
                 </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 bg-slate-50 relative p-8">
                 {generating && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-8 transition-opacity duration-500">
                        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 relative animate-pulse">
                            {loadingStep === 1 ? <Brain className="text-white animate-bounce" size={40} /> : <Wand2 className="text-white animate-spin-slow" size={40} />}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {loadingStep === 1 ? "AI Tahlili..." : "Rasm Yaratilmoqda..."}
                        </h3>
                        <p className="text-indigo-600 font-medium text-lg text-center max-w-md animate-fade-in">
                            {loadingStep === 1 
                                ? "Matn ichidan vizual g'oyalarni ajratib olyapman" 
                                : "Gemini Image modeli ishga tushdi, biroz kuting..."}
                        </p>
                    </div>
                 )}
            
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-50">
                    <ImageIcon size={64} className="text-indigo-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-3">Professional AI Rassom</h3>
                <p className="text-lg text-gray-600 max-w-xl mx-auto px-4 leading-relaxed mb-8">
                    "Tiniq va Zamonaviy" ishlaydigan tizim. 
                    <br/>
                    <span className="text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded mt-2 inline-block font-medium">
                        GPT yoki Gemini'dan istalgan matnni nusxalab tashlang — o'zi tushunadi!
                    </span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {["Kelajakdagi O'zbekiston", "Kiberpank uslubida Amir Temur", "Tog'dagi zamonaviy uy"].map(idea => (
                        <button 
                            key={idea}
                            onClick={() => setPrompt(idea)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm"
                        >
                            {idea}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      {/* History Strip */}
      {history.length > 0 && (
         <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <History className="mr-2 text-gray-500" size={20} />
                Mening Galereyam
             </h3>
             <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                 {history.map(item => (
                     <div key={item.id} className="relative group flex-shrink-0 w-32 cursor-pointer" onClick={() => { setImageSrc(item.imageSrc); setPrompt(item.originalPrompt); setLastOptimizedPrompt(item.optimizedPrompt); }}>
                         <img src={item.imageSrc} alt={item.originalPrompt} className="w-32 h-32 object-cover rounded-xl border border-gray-200 hover:border-indigo-400 transition-colors bg-gray-100" />
                         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate rounded-b-xl backdrop-blur-sm">
                             {item.originalPrompt}
                         </div>
                         <button 
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <Trash2 size={12} />
                        </button>
                     </div>
                 ))}
             </div>
         </div>
      )}
    </div>
  );
};

export default ImageGenerator;
