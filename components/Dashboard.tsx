import React from 'react';
import { UserStats } from '../types';
import { Trophy, Star, Zap, Target, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: UserStats;
  userName?: string;
  chartData?: {name: string, points: number}[];
}

const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours} soat ${minutes} daq`;
  }
  return `${minutes} daqiqa`;
};

const Dashboard: React.FC<DashboardProps> = ({ stats, userName, chartData }) => {
  const defaultData = [
    { name: 'Du', points: 0 },
    { name: 'Se', points: 0 },
    { name: 'Cho', points: 0 },
    { name: 'Pay', points: 0 },
    { name: 'Ju', points: 0 },
    { name: 'Sha', points: 0 },
    { name: 'Yak', points: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Assalomu alaykum, {userName || "Kelajak Dasturchisi"}! 👋</h2>
        <p className="text-gray-600 mt-2">Bugun yangi bilimlar olish uchun ajoyib kun.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Jami Ballar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Jami Ballar</p>
            <p className="text-2xl font-bold text-gray-800">{stats.points}</p>
          </div>
        </div>

        {/* Level */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Joriy Daraja</p>
            <p className="text-2xl font-bold text-gray-800">{stats.level}-Level</p>
          </div>
        </div>

        {/* Saytda Vaqt (New) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Saytda Vaqt</p>
            <p className="text-2xl font-bold text-gray-800">{formatTime(stats.totalTime || 0)}</p>
          </div>
        </div>

        {/* Jami Amallar (New) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Jami Amallar</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalActivities || 0} ta</p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Streak (Kun)</p>
            <p className="text-2xl font-bold text-gray-800">{stats.streak} 🔥</p>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Badges</p>
            <p className="text-2xl font-bold text-gray-800">{stats.badges.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Haftalik Faollik</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData && chartData.length > 0 ? chartData : defaultData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="points" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges & Recommendations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Mening Yutuqlarim</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {stats.badges.map((badge, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="mt-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl text-white">
            <h4 className="font-bold flex items-center mb-2">
              <Zap size={16} className="mr-2" />
              Neuron maslahati:
            </h4>
            <p className="text-sm opacity-90">
              "React o'rganishda Props va State farqini tushunish juda muhim. Bugun shu mavzuni takrorlaymiz!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;