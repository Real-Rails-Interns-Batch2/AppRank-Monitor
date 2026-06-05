"use client";
import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">App Store Ranking Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simple Card Replacement */}
        <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
          <h2 className="text-xl font-semibold mb-2">App Overview</h2>
          <p className="text-gray-400">Welcome to your tracking dashboard. Data will appear here.</p>
        </div>

        <div className="p-6 border border-gray-700 rounded-lg bg-[#111827]">
          <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
          <p className="text-gray-400">No active rankings to display at the moment.</p>
        </div>
      </div>

      <div className="mt-8 p-6 border border-gray-700 rounded-lg bg-[#111827]">
        <h2 className="text-xl font-semibold mb-4">Live Updates</h2>
        <p className="text-gray-400">The system is ready to track your app store rankings.</p>
      </div>
    </div>
  );
}
