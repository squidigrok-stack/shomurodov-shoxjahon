import React, { useState, useEffect } from 'react';
import { reviewCode } from '../services/geminiService';
import { Code2, Play, CheckCircle2, AlertCircle, History, Trash2, ArrowRight } from 'lucide-react';

interface SavedReview {
  id: string;
  codeSnippet: string;
  feedback: string;
  date: string;
}

const CodeReviewer: React.FC = () => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedReview[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('review_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (codeText: string, result: string) => {
    const newItem: SavedReview = {
      id: Date.now().toString(),
      codeSnippet: codeText.substring(0, 100) + (codeText.length > 100 ? '...' : ''),
      feedback: result,
      date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('review_history', JSON.stringify(updated));
  };

  const handleCheck = async () => {
    if (!code.trim()) return;
    setLoading(true);
    // Auto-detect language hint simply based on simple keywords for now
    const lang = code.includes('def ') || code.includes('print(') ? 'Python' : 'JavaScript/React';
    const result = await reviewCode(code, lang);
    setFeedback(result);
    saveToHistory(code, result);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCheck();
    }
  };

  const loadFromHistory = (item: SavedReview) => {
    setFeedback(item.feedback);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('review_history', JSON.stringify(updated));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
    <div className="h-[calc(100vh-16rem)] flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 flex items-center">
            <Code2 className="mr-2 text-indigo-600" size={20} />
            Kod Muharriri
          </h2>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Input</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Kodingizni shu yerga yozing... (Ctrl + Enter to run)"
          className="flex-1 p-4 font-mono text-sm resize-none outline-none focus:bg-indigo-50/10 transition-colors"
        />
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleCheck}
            disabled={loading || !code}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Tekshirilmoqda...
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="mr-2 fill-current" size={16} />
                Kodni Tekshirish
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 flex items-center">
            <CheckCircle2 className="mr-2 text-green-600" size={20} />
            Neuron Feedback
          </h2>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Analysis</span>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {feedback ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                {feedback}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p className="text-center">Kodni yozing va men uni tahlil qilib, <br/> xatolarini to'g'irlab beraman.</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <History className="mr-2 text-gray-500" size={20} />
            So'nggi Tahlillar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadFromHistory(item)}
                className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all flex justify-between items-center"
              >
                <div className="overflow-hidden">
                  <h4 className="font-mono text-xs text-gray-600 bg-gray-100 p-1 rounded inline-block mb-1">{item.date}</h4>
                  <p className="text-sm text-gray-800 line-clamp-2 font-mono">{item.codeSnippet}</p>
                </div>
                <button 
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
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

export default CodeReviewer;