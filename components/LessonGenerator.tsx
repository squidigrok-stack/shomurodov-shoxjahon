import React, { useState, useEffect } from 'react';
import { generateLesson } from '../services/geminiService';
import { TechStack } from '../types';
import { BookOpen, Loader2, Send, History, Trash2, ArrowRight } from 'lucide-react';

interface SavedLesson {
  id: string;
  topic: string;
  stack: TechStack;
  content: string;
  date: string;
}

const LessonGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [stack, setStack] = useState<TechStack>(TechStack.FRONTEND);
  const [loading, setLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedLesson[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('lesson_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (newTopic: string, newStack: TechStack, newContent: string) => {
    const newItem: SavedLesson = {
      id: Date.now().toString(),
      topic: newTopic,
      stack: newStack,
      content: newContent,
      date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem('lesson_history', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('lesson_history', JSON.stringify(updated));
  };

  const loadFromHistory = (item: SavedLesson) => {
    setTopic(item.topic);
    setStack(item.stack);
    setLessonContent(item.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const content = await generateLesson(topic, stack);
    setLessonContent(content);
    saveToHistory(topic, stack, content);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <BookOpen className="mr-2 text-indigo-600" />
          Dars Generatori
        </h2>
        <p className="text-gray-500 mb-6">Mavzuni kiriting va 2 soatlik mukammal dars rejasini oling.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dars Mavzusi</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Masalan: React Hooks, Flexbox, Python Lists..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texnologiya</label>
            <select
              value={stack}
              onChange={(e) => setStack(e.target.value as TechStack)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
            >
              <option value={TechStack.FRONTEND}>Front-End</option>
              <option value={TechStack.PYTHON}>Python</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Dars tayyorlanmoqda...
            </>
          ) : (
            <>
              <Send className="mr-2" size={18} />
              Darsni Yaratish (Enter)
            </>
          )}
        </button>
      </div>

      {lessonContent && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="prose prose-indigo max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-headings:text-indigo-900">
             <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {lessonContent}
             </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <History className="mr-2 text-gray-500" size={20} />
            Saqlangan Darslar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadFromHistory(item)}
                className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-gray-800 line-clamp-1">{item.topic}</h4>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">{item.stack === TechStack.FRONTEND ? 'FE' : 'PY'}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                   <ArrowRight size={16} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonGenerator;