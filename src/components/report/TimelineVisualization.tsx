import type { TimelineEvent } from '@/lib/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts';
import { format } from 'date-fns';

interface TimelineVisualizationProps {
  events: TimelineEvent[];
}

export function TimelineVisualization({ events }: TimelineVisualizationProps) {
  const data = events.map((evt) => ({
    time: new Date(evt.timestamp).getTime(),
    word_count: evt.word_count,
    type: evt.type,
    label: evt.label || evt.type,
  }));

  const specialEvents = data.filter(
    (d) => d.type === 'paste' || d.type === 'blur' || d.type === 'focus' || d.type === 'session_start' || d.type === 'session_end',
  );

  const eventColor = (type: string) => {
    switch (type) {
      case 'paste': return 'hsl(38, 92%, 50%)';
      case 'blur': return 'hsl(0, 72%, 51%)';
      case 'focus': return 'hsl(152, 60%, 40%)';
      case 'session_start': return 'hsl(152, 60%, 40%)';
      case 'session_end': return 'hsl(24, 70%, 45%)';
      default: return 'hsl(220, 10%, 46%)';
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="wordCountGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(24, 70%, 45%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(24, 70%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(val) => format(new Date(val), 'HH:mm')}
            tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(d.time), 'h:mm a')}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {d.word_count} words
                  </p>
                  {d.label && (
                    <p className="text-xs text-muted-foreground capitalize">{d.label}</p>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="word_count"
            stroke="hsl(24, 70%, 45%)"
            strokeWidth={2}
            fill="url(#wordCountGrad)"
          />
          {specialEvents.map((evt, i) => (
            <ReferenceDot
              key={i}
              x={evt.time}
              y={evt.word_count}
              r={4}
              fill={eventColor(evt.type)}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {[
          { label: 'Paste', color: 'hsl(38, 92%, 50%)' },
          { label: 'Left editor', color: 'hsl(0, 72%, 51%)' },
          { label: 'Returned', color: 'hsl(152, 60%, 40%)' },
          { label: 'Session event', color: 'hsl(24, 70%, 45%)' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
