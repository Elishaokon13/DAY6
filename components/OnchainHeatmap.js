import React, { useMemo } from 'react';

// GitHub-inspired green color scale
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
  const dayOfWeek = today.getDay();
  const mondayOffset = (dayOfWeek + 6) % 7; // 0=Mon, 6=Sun
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - mondayOffset);
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
    <div className="w-full max-w-5xl mx-auto bg-gray-900 rounded-xl p-6 sm:p-8 border border-gray-700 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-mono text-2xl sm:text-3xl text-white bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            Onchain Commit Tracker
          </h2>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-mono text-gray-300">
            <span>
              Current Streak: <span className="text-green-400 font-semibold">{currentStreak}</span>
            </span>
            <span>
              Longest Streak: <span className="text-green-400 font-semibold">{longestStreak}</span>
            </span>
            <span>
              Active Days: <span className="text-green-400 font-semibold">{totalActiveDays}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex ml-10 sm:ml-12 mb-2 overflow-x-auto">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-xs sm:text-sm text-gray-400 font-mono text-center flex-shrink-0"
            style={{ width: '1.25rem', minWidth: '1.25rem' }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex">
        {/* Day-of-week Labels */}
        <div className="flex flex-col mr-2 sm:mr-3 mt-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-4 sm:h-5 text-xs sm:text-sm text-gray-400 font-mono text-right pr-1"
              style={{ minHeight: '1.25rem' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="flex overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Hide scrollbar for Webkit browsers */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-4 h-4 sm:w-5 sm:h-5 border rounded-sm transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-md ${
                    day ? getColor(day.count) : 'bg-transparent border-transparent'
                  }`}
                  title={day && day.date ? `${day.date}: ${day.count} txns` : ''}
                  aria-label={day && day.date ? `${day.date}: ${day.count} transactions` : 'No data'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 sm:gap-3 mt-6 ml-10 sm:ml-12">
        <span className="text-xs sm:text-sm text-gray-400 font-mono">Less</span>
        {COLOR_SCALE.map((cls, i) => (
          <div
            key={i}
            className={`w-4 h-4 sm:w-5 sm:h-5 border rounded-sm ${cls}`}
            aria-label={`Activity level ${i}`}
          />
        ))}
        <span className="text-xs sm:text-sm text-gray-400 font-mono">More</span>
      </div>
    </div>
  );
}