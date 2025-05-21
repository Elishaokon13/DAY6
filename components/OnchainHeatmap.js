import React from 'react';

// Helper to generate last N days as YYYY-MM-DD
function getLastNDates(n) {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Color scale for activity (adjust as needed)
function getColor(count) {
  if (!count) return 'bg-gray-800 border-gray-700';
  if (count < 2) return 'bg-green-900 border-green-700';
  if (count < 5) return 'bg-green-700 border-green-600';
  if (count < 10) return 'bg-green-500 border-green-400';
  return 'bg-green-300 border-green-200';
}

export default function OnchainHeatmap({ dailyActivity = {}, currentStreak = 0, longestStreak = 0, totalActiveDays = 0 }) {
  const days = getLastNDates(90);
  // Group by week for grid (start on Sunday)
  const weeks = [];
  let week = [];
  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const dayOfWeek = new Date(date).getDay();
    if (i === 0 && dayOfWeek !== 0) {
      // Pad first week
      for (let j = 0; j < dayOfWeek; j++) week.push(null);
    }
    week.push(date);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-pixel text-2xl text-gradient mb-1">Onchain Commit Tracker</h2>
          <div className="flex gap-4 text-sm font-pixel text-gray-300">
            <span>Current streak: <span className="text-green-400">{currentStreak}</span></span>
            <span>Longest streak: <span className="text-green-400">{longestStreak}</span></span>
            <span>Active days: <span className="text-green-400">{totalActiveDays}</span></span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-13 gap-1">
          {/* Weekday labels */}
          <div></div>
          {[...Array(weeks.length)].map((_, i) => (
            <div key={i} className="text-xs text-center text-gray-500 font-pixel">W{i + 1}</div>
          ))}
        </div>
        <div className="grid grid-cols-13 gap-1">
          {/* Day labels */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={d} className="text-xs text-gray-500 font-pixel text-center">{d}</div>
          ))}
          {/* Heatmap grid */}
          {weeks.map((week, wi) => (
            <React.Fragment key={wi}>
              {week.map((date, di) => (
                <div
                  key={di}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border rounded ${date ? getColor(dailyActivity[date]) : 'bg-transparent border-transparent'}`}
                  title={date && dailyActivity[date] ? `${date}: ${dailyActivity[date]} txns` : date ? `${date}: 0 txns` : ''}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
} 