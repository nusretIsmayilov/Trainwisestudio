import { useMemo } from 'react';
import { useProgramEntries } from '@/hooks/useProgramEntries';

const ProgramHistoryPage = () => {
  const { entries } = useProgramEntries();
  const grouped = useMemo(() => {
    const byDate: Record<string, typeof entries> = {} as any;
    for (const e of entries) {
      byDate[e.date] = byDate[e.date] ? [...byDate[e.date], e] : [e];
    }
    return byDate;
  }, [entries]);

  const dates = Object.keys(grouped).sort((a,b) => (a < b ? 1 : -1));

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Program History</h1>
      <p className="text-sm text-muted-foreground mb-6">Filed programs are read-only. Entries are one per day.</p>
      <div className="space-y-4">
        {dates.map(date => (
          <div key={date} className="border rounded-lg p-4">
            <div className="font-semibold mb-2">{date}</div>
            <ul className="space-y-1 text-sm">
              {grouped[date].map(e => (
                <li key={e.id} className="flex justify-between">
                  <span className="capitalize">{e.type}</span>
                  <span className="text-muted-foreground">Program: {e.program_id || 'Unlinked'}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {dates.length === 0 && (
          <div className="text-muted-foreground">No history yet.</div>
        )}
      </div>
    </div>
  );
};

export default ProgramHistoryPage;


