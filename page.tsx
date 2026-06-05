"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star, MessageSquareQuote, Search, Activity, Info, X } from 'lucide-react';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface Review {
  user: string;
  comment: string;
  rating: number;
}

interface AppRanking {
  rank: number;
  name: string;
  category: string;
  visibility: number;
  growth: string;
  history: number[];
  recent_reviews: Review[];
  sentiment: string;
}

export default function Dashboard() {
  const [rankings, setRankings] = useState<AppRanking[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppRanking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rankRes, catRes] = await Promise.all([
          fetch(`/api/rankings`),
          fetch(`/api/categories`)
        ]);
        
        if (!rankRes.ok) throw new Error('API Sync Failed');
        
        setRankings(await rankRes.json());
        setCategories(await catRes.json());
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredRankings = activeCategory === 'All' 
    ? rankings 
    : rankings.filter(r => r.category === activeCategory);

  return (
    <div className="h-screen overflow-y-auto bg-slate-950 text-slate-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4 relative">
        <div>
          <h1 className="text-3xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
             INFOCREON
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-cyan-400" />
            App Store Ranking Tracker (ID 47)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg shadow-sm">
            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-cyan-400 animate-pulse-glow shadow-[0_0_8px_rgba(0,229,255,0.5)]'}`}></div>
            <span className="text-sm font-medium tracking-wide">
              {error ? 'API Disconnected' : 'GDELT Signal Active'}
            </span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        <Badge 
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          className={`cursor-pointer px-4 py-1.5 text-sm ${activeCategory === 'All' ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-400 border-slate-700 hover:bg-slate-800'}`}
          onClick={() => setActiveCategory('All')}
        >
          All Signals
        </Badge>
        {categories.map(cat => (
          <Badge 
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-1.5 text-sm ${activeCategory === cat ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-400 border-slate-700 hover:bg-slate-800'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="relative">
          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Application Focus</th>
                    <th className="px-6 py-4 text-center">Visibility Trend (10h)</th>
                    <th className="px-6 py-4 text-right">Growth Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredRankings.map((app) => {
                    const isPositive = app.growth.includes('+');
                    return (
                      <tr key={app.rank} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 text-slate-300 font-mono text-sm border border-slate-700">
                            {app.rank}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-100 text-lg group-hover:text-blue-400 transition-colors">{app.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-xs shrink-0 hover:bg-slate-700 border-0">
                              {app.category}
                            </Badge>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {app.sentiment} Response
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 w-56 h-20">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={app.history.map((val, i) => ({ val, i }))}>
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke={isPositive ? "#10b981" : "#3b82f6"} 
                                strokeWidth={2.5} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-base">
                          <div className={`flex items-center justify-end gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4 ml-1" />}
                            {app.growth}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Score: {app.visibility}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredRankings.length === 0 && !error && (
              <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                <Search className="w-8 h-8 mb-4 opacity-50" />
                No applications matching this signal filter.
              </div>
            )}
          </Card>

          {/* Slide-over Intelligence Panel */}
          {selectedApp && (
            <div className="fixed top-0 right-0 w-96 h-full bg-[#0A0F1D] border-l border-slate-800 shadow-2xl z-40 transform transition-transform animate-slide-in flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-xl font-bold text-slate-100 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Intelligence Panel
                </h2>
                <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                  <CardHeader className="border-b border-slate-800/50 pb-4">
                    <CardTitle className="text-cyan-400 flex items-center text-lg font-bold">
                       <MessageSquareQuote className="w-5 h-5 mr-2" />
                       Review Snippets ({selectedApp.name})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedApp.recent_reviews.map((rev, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-sm">
                          <p className="text-slate-400 italic text-xs mb-2">"{rev.comment}"</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-mono text-slate-600">{rev.user}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                  <CardHeader className="border-b border-slate-800/50 pb-4">
                    <CardTitle className="text-emerald-400 flex items-center text-lg font-bold">
                       <Activity className="w-5 h-5 mr-2" />
                       Metadata Brief
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      <strong>{selectedApp.name}</strong> ({selectedApp.category}) currently holds rank #{selectedApp.rank} with a visibility score of {selectedApp.visibility}. The recent growth index is {selectedApp.growth} with a prevailing {selectedApp.sentiment.toLowerCase()} sentiment.
                    </p>
                  </CardContent>
                </Card>

              </div>
            </div>
          )}

          {/* Overlay for Panel */}
          {selectedApp && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={() => setSelectedApp(null)}></div>
          )}
        </div>
      )}

      {/* Metadata Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <Card className="relative bg-slate-900 border-slate-700 shadow-2xl w-full max-w-md z-10 animate-slide-in">
            <CardHeader className="border-b border-slate-800 pb-4 flex flex-row justify-between items-center">
              <CardTitle className="text-cyan-400 text-xl font-bold flex items-center">
                <Info className="w-5 h-5 mr-2" /> Project Metadata
              </CardTitle>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-slate-400 text-sm">Architect</span>
                <span className="text-slate-100 font-medium">jaliba sherin kj</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className="text-slate-400 text-sm">Batch</span>
                <Badge variant="outline" className="text-cyan-400 border-cyan-900 bg-cyan-950/30">Batch 2 Interns</Badge>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-400 text-sm">Tech Stack</span>
                <div className="flex flex-wrap justify-end gap-2 max-w-[200px]">
                  <Badge className="bg-slate-800 hover:bg-slate-700 text-xs border-0 text-slate-300">Next.js</Badge>
                  <Badge className="bg-slate-800 hover:bg-slate-700 text-xs border-0 text-slate-300">FastAPI</Badge>
                  <Badge className="bg-slate-800 hover:bg-slate-700 text-xs border-0 text-slate-300">Tailwind CSS</Badge>
                  <Badge className="bg-slate-800 hover:bg-slate-700 text-xs border-0 text-slate-300">Recharts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}