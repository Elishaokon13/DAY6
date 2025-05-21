import React, { useMemo } from 'react';

// GitHub green color scale
const COLOR_SCALE = [
  'bg-gray-800 border-gray-700', // 0
  'bg-green-900 border-green-800', // 1
  'bg-green-700 border-green-600', // 2
  'bg-green-500 border-green-400', // 3
  'bg-green-300 border-green-200', // 4
];

function getColor(count) {
  if (!count) return COLOR_SCALE[0];
  if (count < 2) return COLOR_SCALE[1];
  if (count < 5) return COLOR_SCALE[2];
  if (count < 10) return COLOR_SCALE[3];
  return COLOR_SCALE[4];
}

// Helper: get last N days, starting on Monday
function getCalendarData(n = 365, dailyActivity = {}) {
  const today = new Date();
  // Find the most recent Monday
  const dayOfWeek = today.getDay();
  const mondayOffset = (dayOfWeek + 6) % 7; // 0=Mon, 6=Sun
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - mondayOffset);
  // Build weeks (columns)
  const weeks = [];
  let week = [];
  let date = new Date(lastMonday);
  date.setDate(date.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const iso = date.toISOString().slice(0, 10);
    week.push({
      date: iso,
      count: dailyActivity[iso] || 0,
      month: date.getMonth(),
      day: date.getDay(),
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    date.setDate(date.getDate() + 1);
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export default function OnchainHeatmap({ dailyActivity = {}, currentStreak = 0, longestStreak = 0, totalActiveDays = 0 }) {
  // Show last 52 weeks (1 year)
  const weeks = useMemo(() => getCalendarData(364, dailyActivity), [dailyActivity]);
  // Month labels: show label if month changes at first row of week
  const monthLabels = [];
  let lastMonth = null;
  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i];
    const firstDay = week[0];
    if (firstDay && firstDay.month !== lastMonth) {
      monthLabels.push(MONTH_LABELS[firstDay.month]);
      lastMonth = firstDay.month;
    } else {
      monthLabels.push('');
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#161b22] rounded-lg p-6 border border-gray-800">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-pixel text-2xl text-gradient mb-1">Onchain Commit Tracker</h2>
          <div className="flex gap-4 text-sm font-pixel text-gray-300">
            <span>Current streak: <span className="text-green-400">{currentStreak}</span></span>
            <span>Longest streak: <span className="text-green-400">{longestStreak}</span></span>
            <span>Active days: <span className="text-green-400">{totalActiveDays}</span></span>
          </div>
        </div>
      </div>
      {/* Month labels */}
      <div className="flex ml-10 mb-1">
        {monthLabels.map((label, i) => (
          <div key={i} className="w-4 sm:w-5 h-4 text-xs text-gray-400 font-pixel text-center" style={{ minWidth: '1rem' }}>{label}</div>
        ))}
      </div>
      <div className="flex">
        {/* Day-of-week labels */}
        <div className="flex flex-col mr-2 mt-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-4 sm:h-5 text-xs text-gray-400 font-pixel text-right pr-1" style={{ minHeight: '1rem' }}>{label}</div>
          ))}
        </div>
        {/* Heatmap grid */}
        <div className="flex">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border rounded transition-colors duration-200 cursor-pointer ${day ? getColor(day.count) : 'bg-transparent border-transparent'}`}
                  title={day && day.date ? `${day.date}: ${day.count} txns` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 ml-10">
        <span className="text-xs text-gray-400 font-pixel">Less</span>
        {COLOR_SCALE.map((cls, i) => (
          <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 border rounded ${cls}`}></div>
        ))}
        <span className="text-xs text-gray-400 font-pixel">More</span>
      </div>
    </div>
  );
} 