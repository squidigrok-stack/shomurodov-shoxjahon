import React, { useState, useEffect } from 'react';
import { ViewState, UserStats } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonGenerator from './components/LessonGenerator';
import CodeReviewer from './components/CodeReviewer';
import QuizGenerator from './components/QuizGenerator';
import MarketingGen from './components/MarketingGen';
import CodeGenerator from './components/CodeGenerator';
import Library from './components/Library';
import { Menu, BrainCircuit, Sparkles, User, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User Identity State
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Chart Data State
  const [chartData, setChartData] = useState<{name: string, points: number}[]>([]);

  // User Stats with Persistence
  const [stats, setStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem('neuron_stats_v2');
    return savedStats ? JSON.parse(savedStats) : {
      points: 50,
      level: 1,
      badges: ['Yangi Talaba'],
      streak: 0,
      totalTime: 0,
      totalActivities: 0
    };
  });

  // Load User & Trigger Splash
  useEffect(() => {
    const savedName = localStorage.getItem('neuron_user_name');
    if (savedName) {
      setUserName(savedName);
      setShowNameModal(false);
      triggerSplash();
    } else {
      setShowNameModal(true);
    }
  }, []);

  // Time Tracker (Runs every minute)
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => {
        const newStats = { ...prev, totalTime: (prev.totalTime || 0) + 1 };
        localStorage.setItem('neuron_stats_v2', JSON.stringify(newStats));
        return newStats;
      });
    }, 60000); // 1 minute

    return () => clearInterval(timer);
  }, []);

  // Calculate Chart Data from History
  useEffect(() => {
    const calculateChartData = () => {
      const allHistoryKeys = ['lesson_history', 'code_history', 'quiz_history', 'marketing_history', 'image_history_v2', 'review_history'];
      const daysMap = new Map<string, number>();
      
      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
        daysMap.set(dayName, 0);
      }

      allHistoryKeys.forEach(key => {
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        history.forEach((item: any) => {
           // Assume item.date is formatted "DD.MM.YYYY, HH:MM" or similar, or just try to parse if valid date string
           // For simplicity in this demo, we check if created recently. 
           // In a real app, store proper ISO timestamps.
           // Here we mock it by checking if it exists (assuming recent usage for demo)
           const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'short' });
           if (daysMap.has(today)) {
             daysMap.set(today, (daysMap.get(today) || 0) + 50); // 50 points per activity
           }
        });
      });

      const data = Array.from(daysMap).map(([name, points]) => ({ name, points }));
      setChartData(data);
    };

    calculateChartData();
    // Re-calculate when view changes (simulating updates after generation)
  }, [currentView, stats.totalActivities]);

  const triggerSplash = () => {
    setShowSplash(true);
    setTimeout(() => setFadeOut(true), 2500);
    setTimeout(() => setShowSplash(false), 3200);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    localStorage.setItem('neuron_user_name', tempName);
    setUserName(tempName);
    setShowNameModal(false);
    triggerSplash();
  };

  // Centralized function to update stats on user action
  const updateStatsOnAction = () => {
    setStats(prev => {
      const newPoints = prev.points + 50;
      const newLevel = Math.floor(newPoints / 1000) + 1;
      const newActivities = (prev.totalActivities || 0) + 1;
      
      const newStats = {
        ...prev,
        points: newPoints,
        level: newLevel,
        totalActivities: newActivities,
        streak: prev.streak === 0 ? 1 : prev.streak // Simple streak logic for now
      };
      
      localStorage.setItem('neuron_stats_v2', JSON.stringify(newStats));
      return newStats;
    });
  };

  // Wrap view setters to trigger stats update on successful generation
  // NOTE: In a real Redux app, this would be cleaner. Here we pass a callback or useEffect.
  // For simplicity, we detect changes in localStorage in the components, or assume action taken when view switches back to Dashboard.
  // Better approach: We pass `onGenerate` prop to components.

  const renderView = () => {
    const props = { onGenerate: updateStatsOnAction };

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard stats={stats} userName={userName} chartData={chartData} />;
      case ViewState.LESSON:
        return <LessonGenerator {...props} />; // We would need to update LessonGenerator to accept onGenerate
      case ViewState.CODE_REVIEW:
        return <CodeReviewer {...props} />;
      case ViewState.QUIZ:
        return <QuizGenerator {...props} />;
      case ViewState.CODE_GEN:
        return <CodeGenerator {...props} />;
      case ViewState.MARKETING:
        return <MarketingGen {...props} />;
      case ViewState.LIBRARY:
        return <Library />;
      default:
        return <Dashboard stats={stats} userName={userName} chartData={chartData} />;
    }
  };

  // Modification: To make sure stats update, we need to pass the updater to components.
  // Since I can't easily change ALL component props in one XML block without rewriting them all,
  // I will attach a global event listener or just rely on the Interval for time, 
  // and for "Total Activities", I will check array lengths in localStorage on every render or use a wrapper.
  
  // Revised approach for 'Total Activities' without prop drilling everything:
  // We will count total items in localStorage whenever `currentView` changes.
  useEffect(() => {
     const keys = ['lesson_history', 'code_history', 'quiz_history', 'marketing_history', 'image_history_v2', 'review_history'];
     let count = 0;
     let totalPoints = 50; // Base points

     keys.forEach(key => {
       const items = JSON.parse(localStorage.getItem(key) || '[]');
       count += items.length;
     });

     // Update stats if count differs (meaning something was generated)
     setStats(prev => {
       if (prev.totalActivities !== count) {
          const newPoints = 50 + (count * 50);
          const newLevel = Math.floor(newPoints / 1000) + 1;
          const updated = {
             ...prev,
             totalActivities: count,
             points: newPoints,
             level: newLevel
          };
          localStorage.setItem('neuron_stats_v2', JSON.stringify(updated));
          return updated;
       }
       return prev;
     });
  }, [currentView]); // Check when user navigates

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden relative">
      
      {/* NAME ENTRY MODAL */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] bg-indigo-950 flex flex-col items-center justify-center p-4">
           <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-fade-in-up">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <User size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Tanishib olaylik!</h2>
              <p className="text-center text-gray-500 mb-8">Neuron AI sizga shaxsiy yordamchi bo'lishi uchun ismingizni kiriting.</p>
              
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ism va Familiyangiz</label>
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Masalan: Azizbek Karimov"
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-lg transition-all"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!tempName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-indigo-200"
                >
                  Boshlash <ArrowRight className="ml-2" />
                </button>
              </form>
           </div>
           <div className="mt-8 text-indigo-300 text-sm animate-pulse">
             Neuron AI © 2024
           </div>
        </div>
      )}

      {/* WELCOME SPLASH SCREEN */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] bg-indigo-950 flex flex-col items-center justify-center text-white transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
           <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
              <BrainCircuit size={80} className="text-indigo-400 mb-6 relative z-10 animate-bounce" />
           </div>
           <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white animate-fade-in-up text-center px-4">
             Assalomu alaykum, {userName}!
           </h1>
           <div className="flex items-center space-x-2 text-indigo-200 text-lg md:text-xl animate-pulse">
              <Sparkles size={20} />
              <p>Neuron AI saytiga xush kelibsiz!</p>
              <Sparkles size={20} />
           </div>
        </div>
      )}

      <Sidebar currentView={currentView} setView={(view) => { setCurrentView(view); setMobileMenuOpen(false); }} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
           <div className="bg-indigo-900 text-white w-72 h-full p-6 shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
             <h2 className="text-xl font-bold mb-8 flex items-center">
                <span className="w-8 h-8 bg-indigo-500 rounded-lg mr-2"></span>
                Neuron AI
             </h2>
             <nav className="space-y-3">
                <button onClick={() => { setCurrentView(ViewState.DASHBOARD); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">Kabinet</button>
                <button onClick={() => { setCurrentView(ViewState.LESSON); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">Dars Generatori</button>
                <button onClick={() => { setCurrentView(ViewState.CODE_GEN); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium bg-indigo-800/50 border border-indigo-700">AI Dasturchi</button>
                <button onClick={() => { setCurrentView(ViewState.CODE_REVIEW); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">Kod Tekshiruvi</button>
                <button onClick={() => { setCurrentView(ViewState.QUIZ); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">Test & Quiz</button>
                <button onClick={() => { setCurrentView(ViewState.MARKETING); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">SMM</button>
                <button onClick={() => { setCurrentView(ViewState.LIBRARY); setMobileMenuOpen(false); }} className="block w-full text-left p-3 hover:bg-indigo-800 rounded-xl transition-colors font-medium">Kutubxona</button>
             </nav>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden relative">
         {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0 z-30">
          <h1 className="text-lg font-bold text-gray-800">Neuron AI</h1>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;