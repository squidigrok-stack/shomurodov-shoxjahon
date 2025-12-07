import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Difficulty } from '../types';
import { BrainCircuit, Loader2, Award, History, Trash2, ArrowRight } from 'lucide-react';

interface SavedQuiz {
  id: string;
  topic: string;
  difficulty: Difficulty;
  content: string;
  date: string;
}

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [quizContent, setQuizContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedQuiz[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quiz_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (newTopic: string, level: Difficulty, content: string) => {
    const newItem: SavedQuiz = {
      id: Date.now().toString(),
      topic: newTopic,
      difficulty: level,
      content: content,
      date: new Date().toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...history].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('quiz_history', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const content = await generateQuiz(topic, difficulty);
    setQuizContent(content);
    saveToHistory(topic, difficulty, content);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const loadFromHistory = (item: SavedQuiz) => {
    setTopic(item.topic);
    setDifficulty(item.difficulty);
    setQuizContent(item.content);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('quiz_history', JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bilimni Sinash Vaqti!</h2>
        <p className="text-gray-500 mb-8">Mavzuni tanlang va o'z darajangizga mos testlarni yeching.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mavzu (masalan: Python Loops)"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none bg-white"
          >
            {Object.values(Difficulty).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {loading ? (
             <>
             <Loader2 className="animate-spin mr-2" />
             Testlar tuzilmoqda...
           </>
          ) : (
            "Testni Boshlash (Enter)"
          )}
        </button>
      </div>

      {quizContent && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award size={100} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Test Savollari</h3>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium font-sans">
            {quizContent}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 italic">Javoblarni belgilab, o'zingizni tekshiring. Neuron sizga ishonadi!</p>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <History className="mr-2 text-gray-500" size={20} />
            Avvalgi Testlar
          </h3>
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} onClick={() => loadFromHistory(item)} className="p-3 hover:bg-purple-50 rounded-lg cursor-pointer flex justify-between items-center group transition-colors border border-transparent hover:border-purple-100">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    item.difficulty === Difficulty.HARD ? 'bg-red-100 text-red-700' :
                    item.difficulty === Difficulty.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{item.difficulty}</span>
                  <span className="font-medium text-gray-700">{item.topic}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                 <button 
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
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

export default QuizGenerator;