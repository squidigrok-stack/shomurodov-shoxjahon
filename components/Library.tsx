import React, { useState, useEffect } from 'react';
import { FolderOpen, BookOpen, Terminal, BrainCircuit, Share2, Trash2, Code2, ChevronDown, ChevronUp, Clock } from 'lucide-react';

type TabType = 'lessons' | 'codes' | 'reviews' | 'quizzes' | 'marketing';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('codes');
  const [items, setItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load data based on active tab
  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = () => {
    let key = '';
    switch (activeTab) {
      case 'lessons': key = 'lesson_history'; break;
      case 'codes': key = 'code_history'; break;
      case 'reviews': key = 'review_history'; break;
      case 'quizzes': key = 'quiz_history'; break;
      case 'marketing': key = 'marketing_history'; break;
    }

    const saved = localStorage.getItem(key);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems([]);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    
    let key = '';
    switch (activeTab) {
      case 'lessons': key = 'lesson_history'; break;
      case 'codes': key = 'code_history'; break;
      case 'reviews': key = 'review_history'; break;
      case 'quizzes': key = 'quiz_history'; break;
      case 'marketing': key = 'marketing_history'; break;
    }
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const tabs = [
    { id: 'codes', label: 'Kodlar', icon: Terminal },
    { id: 'lessons', label: 'Darslar', icon: BookOpen },
    { id: 'quizzes', label: 'Testlar', icon: BrainCircuit },
    { id: 'reviews', label: 'Tahlillar', icon: Code2 },
    { id: 'marketing', label: 'SMM', icon: Share2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FolderOpen className="mr-2 text-indigo-600" />
          Mening Kutubxonam
        </h2>
        <p className="text-gray-500 mb-6">Barcha saqlangan darslar, kodlar va ma'lumotlar arxivi.</p>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); setExpandedId(null); }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
            >
              <div 
                onClick={() => toggleExpand(item.id)}
                className="p-5 flex items-start justify-between cursor-pointer bg-white hover:bg-gray-50/50"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl mt-1 ${
                    activeTab === 'codes' ? 'bg-gray-900 text-white' : 
                    activeTab === 'lessons' ? 'bg-indigo-100 text-indigo-600' :
                    activeTab === 'quizzes' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activeTab === 'codes' ? <Terminal size={20} /> :
                     activeTab === 'lessons' ? <BookOpen size={20} /> :
                     activeTab === 'quizzes' ? <BrainCircuit size={20} /> :
                     <Code2 size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {item.topic || item.request || item.originalPrompt || "Nomsiz Hujjat"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded">
                        <Clock size={12} className="mr-1" />
                        {item.date}
                      </span>
                      {(item.stack || item.tech || item.difficulty || item.platform) && (
                        <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                           {item.stack || item.tech || item.difficulty || item.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 text-gray-400">
                    {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                  <div className="prose prose-sm max-w-none prose-indigo">
                    <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded-xl border border-gray-200 text-gray-700 shadow-inner">
                      {item.content || item.result || item.feedback || "Ma'lumot yo'q"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">Bu bo'limda hali hech narsa yo'q</h3>
            <p className="text-gray-400 mt-2">Dasturdan foydalaning va natijalar shu yerda saqlanadi.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;