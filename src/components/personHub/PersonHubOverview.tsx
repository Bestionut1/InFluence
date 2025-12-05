import type { Person, PersonProfile, Relation } from '../../types/genogram';

interface PersonHubOverviewProps {
  person: Person;
  profile?: PersonProfile;
  relations: Relation[];
}

export const PersonHubOverview = ({ person, profile }: PersonHubOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Demographic Section */}
      <div className="bg-ocean-800/40 border border-ocean-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-ocean-700">DEMOGRAPHIC INFORMATION</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-ocean-400 text-xs uppercase tracking-wide">Full Name</label>
            <p className="text-white text-lg font-semibold mt-1">{person.name}</p>
          </div>
          {person.age && (
            <div>
              <label className="text-ocean-400 text-xs uppercase tracking-wide">Age</label>
              <p className="text-white text-lg font-semibold mt-1">{person.age} years</p>
            </div>
          )}
          {person.gender && (
            <div>
              <label className="text-ocean-400 text-xs uppercase tracking-wide">Gender</label>
              <p className="text-white text-lg font-semibold mt-1 capitalize">{person.gender}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Status */}
      <div className="bg-ocean-800/40 border border-ocean-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-ocean-700">CLINICAL STATUS</h3>
        <div className="grid grid-cols-3 gap-6">
          {person.status && (
            <div>
              <label className="text-ocean-400 text-xs uppercase tracking-wide">Life Status</label>
              <div className={`text-lg font-semibold mt-1 ${person.status === 'living' ? 'text-green-400' : 'text-gray-400'}`}>
                {person.status === 'living' ? '✓ Living' : '✗ Deceased'}
              </div>
            </div>
          )}
          {person.occupation && (
            <div>
              <label className="text-ocean-400 text-xs uppercase tracking-wide">Occupation</label>
              <p className="text-white text-lg font-semibold mt-1">{person.occupation}</p>
            </div>
          )}
          {person.templateCategory && (
            <div>
              <label className="text-ocean-400 text-xs uppercase tracking-wide">Profile Type</label>
              <p className="text-white text-lg font-semibold mt-1 capitalize">{person.templateCategory.replace(/-/g, ' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Notes */}
      {person.notes && (
        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-accent-blue mb-3 pb-3 border-b border-accent-blue/30">CLINICAL NOTES</h3>
          <p className="text-ocean-100 leading-relaxed">{person.notes}</p>
        </div>
      )}

      {/* Medical Conditions */}
      {person.medicalConditions && person.medicalConditions.length > 0 && (
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 pb-3 border-b border-red-700/30">MEDICAL CONDITIONS</h3>
          <div className="flex flex-wrap gap-2">
            {person.medicalConditions.map((condition, idx) => (
              <span key={idx} className="px-3 py-2 bg-red-900/30 text-red-300 rounded-lg text-sm font-medium">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attributes */}
      {person.attributes && person.attributes.length > 0 && (
        <div className="bg-ocean-800/40 border border-ocean-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-ocean-700">PERSONAL ATTRIBUTES</h3>
          <div className="flex flex-wrap gap-2">
            {person.attributes.map((attr, idx) => (
              <span key={idx} className="px-3 py-2 bg-accent-blue/30 text-accent-blue rounded-lg text-sm font-medium">
                {attr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Significant Events */}
      {person.significantEvents && person.significantEvents.length > 0 && (
        <div className="bg-ocean-800/40 border border-ocean-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-ocean-700">SIGNIFICANT LIFE EVENTS</h3>
          <ul className="space-y-2">
            {person.significantEvents.map((event, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-blue mt-1 text-lg">•</span>
                <span className="text-ocean-200">{event}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Psychological Profile */}
      {profile && (
        <div className="bg-purple-900/10 border border-purple-700/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-300 mb-4 pb-3 border-b border-purple-700/30">PSYCHOLOGICAL PROFILE</h3>
          <div className="space-y-4">
            {profile.templateCategory && (
              <div>
                <label className="text-ocean-400 text-xs uppercase tracking-wide">Profile Template</label>
                <p className="text-white font-semibold mt-1 capitalize">{profile.templateCategory.replace(/-/g, ' ')}</p>
              </div>
            )}
            {profile.description && (
              <div>
                <label className="text-ocean-400 text-xs uppercase tracking-wide">Description</label>
                <p className="text-ocean-200 mt-1 leading-relaxed">{profile.description}</p>
              </div>
            )}
            {profile.psychologicalTraits && profile.psychologicalTraits.length > 0 && (
              <div>
                <label className="text-ocean-400 text-xs uppercase tracking-wide mb-2">Psychological Traits</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.psychologicalTraits.map((trait, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-lg text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
