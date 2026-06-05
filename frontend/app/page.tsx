"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  // ഇവിടെയാണ് മാറ്റം വരുത്തിയത്
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const rankRes = await fetch('https://app-rank-monitor-api.onrender.com/api/rankings');
      const rankingsData = await rankRes.json();
      
      setRankings(Array.isArray(rankingsData) ? rankingsData : []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-5">INFOCREON</h1>
      <p className="mb-5">App Store Ranking Tracker (ID 47)</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>RANK</th>
              <th>APPLICATION</th>
              <th>VISIBILITY</th>
              <th>GROWTH</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((item: any, index: number) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.rank}</td>
                <td>{item.name}</td>
                <td>{item.visibility}</td>
                <td>{item.growth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
