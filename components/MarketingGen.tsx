import React, { useState, useEffect } from 'react';
import { generateMarketingContent } from '../services/geminiService';
import { Share2, Instagram, Youtube, Video, Copy, Check, History, Trash2 } from 'lucide-react';

interface SavedPost {
  id: string;
  platform: string;
  topic: string;
  content: string;
  date: string;
}

const MarketingGen: React.FC = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedPost[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('marketing_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (plat: string, top: string, res: string) => {
    const newItem: SavedPost = {
      id: Date.now().toString(),
      platform: plat,
      topic: top,
      content: res,
      date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...history].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('marketing_history', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCopied(false);
    const result = await generateMarketingContent(platform, topic);
    setContent(result);
    saveToHistory(platform, topic, result);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadFromHistory = (item: SavedPost) => {
    setPlatform(item.platform);
    setTopic(item.topic);
    setContent(item.content);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('marketing_history', JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center">
              <Share2 className="mr-2 text-pink-500" size={20} />
              Platforma
            </h2>
            
            <div className="space-y-2">
              {[
                { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                { name: 'TikTok', icon: Video, color: 'text-black' },
                { name: 'YouTube', icon: Youtube, color: 'text-red-600' }
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                  className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                    platform === p.name 
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p.icon className={`mr-3 ${p.color}`} size={20} />
                  <span className="font-medium text-gray-700">{p.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kontent Mavzusi</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Masalan: Nega dasturlashni o'rganish kerak? (Ctrl + Enter)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none h-32 resize-none text-sm"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Yozilmoqda..." : "Post Yaratish"}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div className="md:col-span-2">
          <div className="bg-white h-full min-h-[500px] rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Natija</h3>
              {content && (
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                  title="Nusxa olish"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              )}
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {content ? (
                <div className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed font-sans">
                  {content}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                   <Share2 size={48} className="mb-4" />
                   <p>Post mavzusini kiriting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <History className="mr-2 text-gray-500" size={20} />
            Saqlangan Postlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {history.map(item => (
               <div key={item.id} onClick={() => loadFromHistory(item)} className="p-4 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl cursor-pointer flex justify-between items-start group transition-all">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.platform === 'Instagram' ? 'bg-pink-100 text-pink-700' : 
                        item.platform === 'Youtube' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-black'
                      }`}>{item.platform}</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <p className="text-gray-800 font-medium line-clamp-1">{item.topic}</p>
                  </div>
                   <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
             ))}
          </div>
         </div>
      )}
    </div>
  );
};

export default MarketingGen;