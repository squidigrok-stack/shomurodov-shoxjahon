import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BookOpen, Code2, BrainCircuit, Share2, Terminal, FolderOpen, Instagram, Send } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Kabinet', icon: LayoutDashboard },
    { id: ViewState.LESSON, label: 'Dars Generatori', icon: BookOpen },
    { id: ViewState.CODE_GEN, label: 'AI Dasturchi', icon: Terminal },
    { id: ViewState.CODE_REVIEW, label: 'Kod Tekshiruvi', icon: Code2 },
    { id: ViewState.QUIZ, label: 'Test & Quiz', icon: BrainCircuit },
    { id: ViewState.MARKETING, label: 'SMM Yordamchi', icon: Share2 },
    { id: ViewState.LIBRARY, label: 'Kutubxona', icon: FolderOpen },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50 hidden md:flex">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
          Neuron AI
        </h1>
        <p className="text-indigo-300 text-xs mt-1">Sizning shaxsiy mentoringiz</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Social Media Links */}
      <div className="p-4 border-t border-indigo-800 space-y-3">
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider ml-1">Biz bilan bo'ling</p>
        
        <a 
          href="https://t.me/neuron_AiFront" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 hover:text-white border border-blue-500/20 hover:border-blue-400/50 transition-all group"
        >
          <div className="bg-blue-500 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
             <Send size={14} className="-ml-0.5 mt-0.5 transform -rotate-12" />
          </div>
          <span className="text-sm font-medium">Telegram</span>
        </a>

        <a 
          href="https://www.instagram.com/neuron_aif?igsh=YTFtMGRkOHJ0c3Bt" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 hover:text-white border border-pink-500/20 hover:border-pink-400/50 transition-all group"
        >
          <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
             <Instagram size={14} />
          </div>
          <span className="text-sm font-medium">Instagram</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;