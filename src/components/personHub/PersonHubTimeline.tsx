import { Card } from '../ui/Card';
import type { Person } from '../../types/genogram';

interface PersonHubTimelineProps {
  person: Person;
}

export const PersonHubTimeline = ({ person }: PersonHubTimelineProps) => {
  const events: Array<{ date: string; title: string; type: string; icon: string }> = [];

  // Add life events
  if (person.dateOfBirth) {
    events.push({
      date: person.dateOfBirth,
      title: `Birth of ${person.name}`,
      type: 'birth',
      icon: '👶',
    });
  }

  if (person.significantEvents && person.significantEvents.length > 0) {
    person.significantEvents.forEach((event, idx) => {
      events.push({
        date: `Event ${idx + 1}`,
        title: event,
        type: 'event',
        icon: '📌',
      });
    });
  }

  if (person.dateOfDeath) {
    events.push({
      date: person.dateOfDeath,
      title: `Death of ${person.name}`,
      type: 'death',
      icon: '🕊️',
    });
  }

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-ocean-300">No timeline events recorded for {person.name}.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-ocean-800/50 to-transparent">
        <h2 className="text-2xl font-bold text-white mb-2">📅 Life Timeline</h2>
        <p className="text-ocean-300">{events.length} event(s) recorded</p>
      </Card>

      {/* Timeline */}
      <div className="relative space-y-8">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-blue via-accent-purple to-accent-blue"></div>

        {/* Events */}
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-20">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-14 h-14 bg-deep border-4 border-accent-blue rounded-full flex items-center justify-center text-2xl">
              {event.icon}
            </div>

            {/* Event card */}
            <Card className={`p-4 ${
              event.type === 'birth' ? 'border-l-4 border-green-500' :
              event.type === 'death' ? 'border-l-4 border-red-500' :
              'border-l-4 border-accent-blue'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-ocean-400 text-sm font-medium">{event.date}</p>
                  <h4 className="text-white font-semibold mt-1">{event.title}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.type === 'birth' ? 'bg-green-900/30 text-green-300' :
                  event.type === 'death' ? 'bg-red-900/30 text-red-300' :
                  'bg-accent-blue/30 text-accent-blue'
                }`}>
                  {event.type === 'birth' ? 'Birth' : event.type === 'death' ? 'Death' : 'Event'}
                </span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-ocean-800/50">
        <h3 className="text-lg font-bold text-white mb-3">📊 Timeline Summary</h3>
        <div className="space-y-2 text-ocean-200 text-sm">
          {person.dateOfBirth && (
            <p>Born: <span className="text-white font-semibold">{person.dateOfBirth}</span></p>
          )}
          {person.dateOfDeath && (
            <p>Passed: <span className="text-white font-semibold">{person.dateOfDeath}</span></p>
          )}
          {person.age && (
            <p>Current Age: <span className="text-white font-semibold">{person.age} years</span></p>
          )}
          <p>Significant Events: <span className="text-white font-semibold">{person.significantEvents?.length || 0}</span></p>
        </div>
      </Card>
    </div>
  );
};
