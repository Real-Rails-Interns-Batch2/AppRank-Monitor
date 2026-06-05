"use client";
import React, { useState, useEffect } from 'react';

export default function Page() {
  // Sample data to simulate API response
  const [data, setData] = useState([
    { app: "App Store Tracker", rank: 1, change: "+2" },
    { app: "Fitness Pro", rank: 5, change: "-1" },
    { app: "Finance Manager", rank: 12, change: "0" },
  ]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold">App Store Ranking Tracker</h1>
        <p className="text-gray-400">Live monitor for your application performance.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
          <h3 className="text-gray-400">Total Apps</h3>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
          <h3 className="text-gray-400">Top Rank</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
        <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
          <h3 className="text-gray-400">Status</h3>
          <p className="text-3xl font-bold text-green-500">Active</p>
        </div>
      </div>

      <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
        <h2 className="text-xl font-semibold mb-6">Current Rankings</h2>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 border-b border-gray-800">
              <span className="font-medium">{item.app}</span>
              <div className="flex gap-6">
                <span className="text-blue-400">Rank: {item.rank}</span>
                <span className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  Change: {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
