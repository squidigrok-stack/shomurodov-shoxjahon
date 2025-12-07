
import React, { useState, useEffect, useRef } from 'react';
import { generateCodeSolution } from '../services/geminiService';
import { Terminal, Loader2, Copy, Check, Code, Cpu, Play, Edit3, Monitor, Minimize2, Maximize2, Download, Package, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

interface SavedCode {
  id: string;
  request: string;
  tech: string;
  result: string;
  date: string;
}

const CodeGenerator: React.FC = () => {
  const [request, setRequest] = useState('');
  const [tech, setTech] = useState('HTML');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedCode[]>([]);
  
  // View States
  const [mobileTab, setMobileTab] = useState<'editor' | 'result'>('editor');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // DRAFT SYSTEM
  useEffect(() => {
    try {
      const draft = localStorage.getItem('codegen_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.request) setRequest(parsed.request);
        if (parsed.tech) setTech(parsed.tech);
        if (parsed.result) {
            setResult(parsed.result);
            setMobileTab('result');
        }
      }
    } catch (e) {
      console.error("Draft load error", e);
    }
  }, []);

  useEffect(() => {
    const draft = { request, tech, result };
    localStorage.setItem('codegen_draft', JSON.stringify(draft));
  }, [request, tech, result]);

  const saveToHistory = (req: string, technology: string, res: string) => {
    const newItem: SavedCode = {
      id: Date.now().toString(),
      request: req,
      tech: technology,
      result: res,
      date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    // Keep reasonably small history
    const updated = [newItem, ...history].slice(0, 15);
    setHistory(updated);
    // Silent fail if localstorage full
    try {
        localStorage.setItem('code_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleGenerate = async () => {
    if (!request.trim()) return;
    setLoading(true);
    setCopied(false);
    
    // Switch to result view immediately on mobile to show loading state
    setMobileTab('result'); 
    
    const response = await generateCodeSolution(request, tech);
    
    setResult(response);
    setRefreshKey(prev => prev + 1); // Force iframe refresh
    saveToHistory(request, tech, response);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleGenerate();
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCleanCode = (markdown: string) => {
    if (!markdown) return "";
    const codeBlockRegex = /```(?:html|css|js|javascript|jsx|tsx|react|python|sql)?([\s\S]*?)```/;
    const match = markdown.match(codeBlockRegex);
    return match && match[1] ? match[1].trim() : markdown;
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    const zip = new JSZip();
    const cleanCode = getCleanCode(result);
    
    if (tech === 'React') {
        const folderName = "react-project";
        const root = zip.folder(folderName);
        root?.file("package.json", JSON.stringify({
            name: "react-app-gen",
            version: "1.0.0",
            dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "react-scripts": "5.0.1" },
            scripts: { "start": "react-scripts start", "build": "react-scripts build" }
        }, null, 2));
        const publicFolder = root?.folder("public");
        publicFolder?.file("index.html", `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>React App</title></head><body><div id="root"></div></body></html>`);
        const srcFolder = root?.folder("src");
        srcFolder?.file("index.js", `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<React.StrictMode><App /></React.StrictMode>);`);
        let appContent = cleanCode;
        if (!appContent.includes('export default')) appContent += "\n\nexport default App;";
        srcFolder?.file("App.js", appContent);
    } else if (tech === 'Python') {
        const root = zip.folder("python-project");
        root?.file("main.py", cleanCode);
    } else {
        const root = zip.folder("web-project");
        root?.file("index.html", cleanCode);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tech.toLowerCase()}-project-${Date.now()}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePreviewContent = (code: string, technology: string) => {
    if (!code) return "";
    const isReact = technology.includes('React');
    const isPython = technology.includes('Python');

    const baseStyle = `
        <style>
            html, body { height: 100%; margin: 0; padding: 0; overflow-x: hidden; background-color: #ffffff; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        </style>
    `;

    if (isPython) {
        return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />${baseStyle}</head><body style="display:flex;align-items:center;justify-content:center;height:100vh;padding:20px;text-align:center;"><div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:12px;"><h3>Python Environment</h3><p>Python kodini brauzerda to'g'ridan-to'g'ri ishlatib bo'lmaydi. Kodni nusxalab IDE ga qo'ying.</p></div></body></html>`;
    }

    if (isReact) {
        let cleanReactCode = code.replace(/import\s+.*?;/g, '').replace(/export\s+default\s+/g, '');
        return `
        <!DOCTYPE html>
        <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            ${baseStyle}
            </head>
            <body>
            <div id="root"></div>
            <script type="text/babel">
                const { useState, useEffect, useRef, useMemo, useCallback } = React;
                const { createRoot } = ReactDOM;
                const { Lucide, icons } = { Lucide: null, icons: {} }; // Mock icons if needed
                
                class ErrorBoundary extends React.Component {
                    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
                    static getDerivedStateFromError(error) { return { hasError: true, error }; }
                    render() {
                        if (this.state.hasError) return <div className="p-4 bg-red-50 text-red-600 m-4 border border-red-200">Runtime Error: {this.state.error?.toString()}</div>;
                        return this.props.children;
                    }
                }
                try {
                    ${cleanReactCode}
                    const root = createRoot(document.getElementById('root'));
                    const AppToRender = (typeof App !== 'undefined') ? App : (typeof Component !== 'undefined') ? Component : null;
                    if (AppToRender) root.render(<ErrorBoundary><AppToRender /></ErrorBoundary>);
                    else root.render(<div className="p-4">App component topilmadi.</div>);
                } catch (err) { document.body.innerHTML = '<div style="color:red;padding:20px;">Syntax Error: ' + err.message + '</div>'; }
            </script>
            </body>
        </html>`;
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />${baseStyle}</head><body>${code}</body></html>`;
  };

  // Main container styles
  const containerClass = isFullScreen 
    ? 'fixed inset-0 z-50 bg-white' 
    : 'flex flex-col h-[calc(100vh-6rem)] relative';

  return (
    <div className={containerClass}>
      
      {/* MOBILE TAB NAVIGATION (Visible only on mobile/tablet) */}
      {!isFullScreen && (
        <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0 sticky top-0 z-20">
            <button 
                onClick={() => setMobileTab('editor')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center transition-all ${mobileTab === 'editor' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}
            >
                <Edit3 size={16} className="mr-2" />
                Loyiha
            </button>
            <button 
                onClick={() => setMobileTab('result')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center transition-all ${mobileTab === 'result' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}
            >
                <Monitor size={16} className="mr-2" />
                Natija
                {result && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </button>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 lg:p-0 ${isFullScreen ? 'h-full' : 'overflow-hidden'}`}>
        
        {/* EDITOR COLUMN */}
        <div className={`lg:col-span-1 flex flex-col h-full bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 ${mobileTab === 'result' && !isFullScreen ? 'hidden lg:flex' : 'flex'} ${isFullScreen ? 'hidden' : ''}`}>
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center hidden lg:flex">
              <Terminal className="mr-2 text-indigo-600" />
              AI Dasturchi
            </h2>
            
            <div className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texnologiya</label>
                <select 
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white font-medium text-gray-700"
                >
                  <option value="HTML">HTML + Tailwind (Web)</option>
                  <option value="React">React (App)</option>
                  <option value="Python">Python (Script)</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vazifa
                </label>
                <textarea
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Masalan: Login sahifasi, Kalkulyator yoki Portfolio sayt yasab ber..."
                  className="w-full flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-base font-sans"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !request}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Cpu className="mr-2" size={18} />
                    Kodni Yaratish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW/RESULT COLUMN */}
        <div className={`lg:col-span-2 flex flex-col h-full ${mobileTab === 'editor' && !isFullScreen ? 'hidden lg:flex' : 'flex'}`}>
          <div className={`flex flex-col flex-1 bg-[#1e1e1e] border-gray-800 relative ${isFullScreen ? '' : 'lg:rounded-2xl lg:shadow-xl lg:border lg:overflow-hidden'}`}>
            
            {/* Browser Toolbar */}
            <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-gray-700 shrink-0 h-14">
              <div className="flex items-center space-x-3 overflow-hidden">
                 {isFullScreen && (
                     <button onClick={() => setIsFullScreen(false)} className="p-2 text-gray-300 hover:text-white bg-white/10 rounded-full lg:hidden">
                         <Minimize2 size={18} />
                     </button>
                 )}
                 <div className="hidden sm:flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 </div>
                 <div className="bg-black/20 px-3 py-1 rounded text-xs text-gray-400 font-mono truncate max-w-[150px] md:max-w-none">
                    localhost:3000/{tech.toLowerCase()}
                 </div>
              </div>
              
              <div className="flex items-center space-x-1 md:space-x-2">
                 {result && (
                    <>
                        <button 
                            onClick={() => setRefreshKey(k => k + 1)}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors"
                            title="Yangilash"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button 
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors hidden md:block"
                            title="To'liq ekran"
                        >
                            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button 
                            onClick={handleDownloadZip}
                            className="p-2 text-indigo-400 hover:text-white bg-white/5 rounded hover:bg-indigo-600 transition-colors"
                            title="Yuklab olish"
                        >
                            <Package size={16} />
                        </button>
                        <button 
                            onClick={handleCopy}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded hover:bg-white/10 transition-colors"
                            title="Nusxalash"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </>
                 )}
              </div>
            </div>

            {/* Preview Area (Iframe) */}
            <div className="flex-1 relative bg-white overflow-hidden">
              {loading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 px-6 bg-[#1e1e1e] z-20">
                    <Loader2 size={48} className="animate-spin text-indigo-500" />
                    <p className="text-gray-400 text-sm font-mono animate-pulse">Neuron AI kod yozmoqda...</p>
                 </div>
              ) : result ? (
                 <iframe 
                   key={refreshKey}
                   title="Result Preview"
                   srcDoc={generatePreviewContent(getCleanCode(result), tech)}
                   className="w-full h-full border-none bg-white"
                   sandbox="allow-scripts allow-modals allow-same-origin allow-popups allow-forms allow-pointer-lock"
                   allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
                 />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 px-6 text-center bg-[#1e1e1e]">
                   <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Code size={32} className="text-gray-600" />
                   </div>
                   <h3 className="text-gray-300 font-bold mb-1">Natija oynasi</h3>
                   <p className="text-sm text-gray-500">Kodni yozing va natijani shu yerda ko'ring</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
