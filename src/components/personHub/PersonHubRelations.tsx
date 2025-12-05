import { Card } from '../ui/Card';
import { useGenogramStore } from '../../store/genogramStore';
import type { Person, Relation } from '../../types/genogram';

interface PersonHubRelationsProps {
  person: Person;
  relations: Relation[];
}

interface RelationDynamic {
  relation: Relation;
  targetPerson: Person;
  type: string;
  intensity: number;
  quality: 'conflicted' | 'supportive' | 'distant' | 'fused' | 'neutral';
  transgenerational: boolean;
  description: string;
}

export const PersonHubRelations = ({ person, relations }: PersonHubRelationsProps) => {
  const { people } = useGenogramStore();

  const relationTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
    // Blood relations
    'parent-child': { label: 'Parent-Child', icon: '👨‍👧', color: 'from-blue-900 to-blue-700' },
    'biological-sibling': { label: 'Biological Sibling', icon: '👫', color: 'from-purple-900 to-purple-700' },
    'half-sibling': { label: 'Half-Sibling', icon: '👯', color: 'from-purple-800 to-purple-600' },
    'full-sibling': { label: 'Full Sibling', icon: '👬', color: 'from-purple-900 to-purple-700' },
    'step-sibling': { label: 'Step-Sibling', icon: '👭', color: 'from-purple-700 to-purple-500' },
    'twin': { label: 'Twin', icon: '👯', color: 'from-indigo-900 to-indigo-700' },
    'fraternal-twin': { label: 'Fraternal Twin', icon: '👨‍🤝‍👨', color: 'from-indigo-800 to-indigo-600' },
    'identical-twin': { label: 'Identical Twin', icon: '👯', color: 'from-indigo-900 to-indigo-700' },
    'step-parent': { label: 'Step-Parent', icon: '👨‍👦', color: 'from-blue-800 to-blue-600' },
    'step-child': { label: 'Step-Child', icon: '👨‍👧', color: 'from-blue-800 to-blue-600' },
    'grandparent-grandchild': { label: 'Grandparent', icon: '👴', color: 'from-cyan-900 to-cyan-700' },
    'uncle-aunt-niece-nephew': { label: 'Uncle/Aunt', icon: '👨‍👦‍👦', color: 'from-teal-900 to-teal-700' },
    'cousin': { label: 'Cousin', icon: '👥', color: 'from-teal-800 to-teal-600' },
    // Partnerships
    'partner': { label: 'Partner', icon: '💑', color: 'from-pink-900 to-pink-700' },
    'married-couple': { label: 'Married Couple', icon: '💒', color: 'from-pink-900 to-pink-700' },
    'domestic-partnership': { label: 'Domestic Partnership', icon: '💑', color: 'from-pink-800 to-pink-600' },
    'ex-partner': { label: 'Ex-Partner', icon: '💔', color: 'from-red-900 to-red-700' },
    'ex-spouse': { label: 'Ex-Spouse', icon: '💔', color: 'from-red-800 to-red-600' },
    'engaged': { label: 'Engaged', icon: '💍', color: 'from-rose-900 to-rose-700' },
    // Adoption & guardianship
    'adoptive-parent': { label: 'Adoptive Parent', icon: '🏠', color: 'from-cyan-900 to-cyan-700' },
    'adoptive-child': { label: 'Adoptive Child', icon: '🏠', color: 'from-cyan-800 to-cyan-600' },
    'foster-parent': { label: 'Foster Parent', icon: '🤝', color: 'from-emerald-900 to-emerald-700' },
    'foster-child': { label: 'Foster Child', icon: '🤝', color: 'from-emerald-800 to-emerald-600' },
    // Relationship quality
    'close': { label: 'Close', icon: '🤗', color: 'from-green-900 to-green-700' },
    'supportive': { label: 'Supportive', icon: '💪', color: 'from-green-800 to-green-600' },
    'distant': { label: 'Distant', icon: '🚶', color: 'from-gray-900 to-gray-700' },
    'conflict': { label: 'Conflict', icon: '⚡', color: 'from-red-900 to-orange-700' },
    'estranged': { label: 'Estranged', icon: '😔', color: 'from-orange-900 to-orange-700' },
    'fused': { label: 'Fused', icon: '🔗', color: 'from-purple-900 to-indigo-700' },
    'dependent': { label: 'Dependent', icon: '👶', color: 'from-amber-900 to-amber-700' },
  };

  // Analyze relationship dynamics
  const analyzeRelationDynamics = (): RelationDynamic[] => {
    return relations
      .map((relation) => {
        const targetId = relation.sourceId === person.id ? relation.targetId : relation.sourceId;
        const targetPerson = people.find(p => p.id === targetId);
        if (!targetPerson) return null;

        // Calculate intensity based on relation type
        const intensityMap: Record<string, number> = {
          // Blood relations
          'parent-child': 90,
          'biological-sibling': 80,
          'half-sibling': 70,
          'full-sibling': 80,
          'step-sibling': 60,
          'twin': 95,
          'fraternal-twin': 90,
          'identical-twin': 95,
          'step-parent': 70,
          'step-child': 70,
          'grandparent-grandchild': 75,
          'uncle-aunt-niece-nephew': 55,
          'cousin': 50,
          // Partnerships
          'married-couple': 100,
          'partner': 90,
          'domestic-partnership': 85,
          'ex-partner': 40,
          'ex-spouse': 45,
          'engaged': 95,
          // Adoption & guardianship
          'adoptive-parent': 85,
          'adoptive-child': 85,
          'foster-parent': 75,
          'foster-child': 75,
          // Relationship quality
          'close': 75,
          'supportive': 80,
          'distant': 30,
          'conflict': 70,
          'estranged': 25,
          'fused': 85,
          'dependent': 65,
        };

        // Determine quality
        const quality = getRelationQuality(relation.type);
        
        // Detect potential transgenerational patterns
        const transgenerational = detectTransgenerationality(
          person,
          targetPerson,
          relation.type
        );

        return {
          relation,
          targetPerson,
          type: relation.type,
          intensity: intensityMap[relation.type] || 50,
          quality,
          transgenerational,
          description: buildRelationDescription(person, targetPerson, relation.type, quality),
        };
      })
      .filter(Boolean) as RelationDynamic[];
  };

  const getRelationQuality = (type: string): RelationDynamic['quality'] => {
    const conflictedTypes = ['conflict', 'ex-partner', 'ex-spouse', 'estranged'];
    const supportiveTypes = ['close', 'partner', 'married-couple', 'domestic-partnership', 'supportive', 'adoptive-parent', 'adoptive-child'];
    const distantTypes = ['distant', 'estranged'];
    const fusedTypes = ['fused', 'dependent'];
    
    if (conflictedTypes.includes(type)) return 'conflicted';
    if (supportiveTypes.includes(type)) return 'supportive';
    if (distantTypes.includes(type)) return 'distant';
    if (fusedTypes.includes(type)) return 'fused';
    return 'neutral';
  };

  const detectTransgenerationality = (p1: Person, p2: Person, type: string): boolean => {
    // Detect parent-child relationships that might indicate patterns
    if (type === 'parent-child') {
      // Age difference suggests generation gap
      const ageDiff = Math.abs((p1.age || 0) - (p2.age || 0));
      return ageDiff > 15;
    }
    return false;
  };

  const buildRelationDescription = (
    p1: Person,
    p2: Person,
    type: string,
    quality: RelationDynamic['quality']
  ): string => {
    const descriptions: Record<string, string> = {
      'partner-supportive': `${p1.name} and ${p2.name} share a secure partnership built on mutual support and emotional availability.`,
      'partner-conflicted': `${p1.name} and ${p2.name} have a romantic relationship with significant conflict and unresolved issues.`,
      'parent-child-supportive': `${p1.name} receives support and healthy guidance from parental figure ${p2.name}.`,
      'parent-child-conflicted': `${p1.name} has an emotionally charged parent-child relationship with ${p2.name}, possibly involving control or rejection.`,
      'sibling-supportive': `${p1.name} and ${p2.name} share a close sibling bond with mutual support and loyalty.`,
      'sibling-conflicted': `${p1.name} and ${p2.name} experience sibling rivalry or competition that creates tension.`,
      'close-supportive': `${p1.name} is emotionally close to ${p2.name}, providing mutual support and understanding.`,
      'distant-distant': `${p1.name} and ${p2.name} maintain a distant emotional relationship with limited connection.`,
      'fused-fused': `${p1.name} and ${p2.name} have enmeshed boundaries, making it difficult to maintain individual identity.`,
    };

    return descriptions[`${type}-${quality}`] || `${p1.name} and ${p2.name} have a ${type.replace('-', ' ')} relationship.`;
  };

  const dynamics = analyzeRelationDynamics();

  if (relations.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-ocean-300">{person.name} has no relationships defined yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-ocean-800/50 to-transparent">
        <h2 className="text-2xl font-bold text-white mb-2">🤝 Relationship Dynamics</h2>
        <p className="text-ocean-300">Total relationships: {relations.length}</p>
      </Card>

      {/* Relationship Quality Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Relationship Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-900/20 rounded border border-green-700/30">
            <p className="text-green-400 text-sm">Supportive</p>
            <p className="text-2xl font-bold text-green-300">
              {dynamics.filter(d => d.quality === 'supportive').length}
            </p>
          </div>
          <div className="p-4 bg-red-900/20 rounded border border-red-700/30">
            <p className="text-red-400 text-sm">Conflicted</p>
            <p className="text-2xl font-bold text-red-300">
              {dynamics.filter(d => d.quality === 'conflicted').length}
            </p>
          </div>
          <div className="p-4 bg-gray-900/20 rounded border border-gray-700/30">
            <p className="text-gray-400 text-sm">Distant</p>
            <p className="text-2xl font-bold text-gray-300">
              {dynamics.filter(d => d.quality === 'distant').length}
            </p>
          </div>
          <div className="p-4 bg-purple-900/20 rounded border border-purple-700/30">
            <p className="text-purple-400 text-sm">Fused</p>
            <p className="text-2xl font-bold text-purple-300">
              {dynamics.filter(d => d.quality === 'fused').length}
            </p>
          </div>
        </div>
      </Card>

      {/* Primary Relationships */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">👥 Primary Relationships</h3>
        {dynamics.map((dynamic) => {
          const relInfo = relationTypeLabels[dynamic.type];
          const qualityColors: Record<RelationDynamic['quality'], string> = {
            supportive: 'border-green-600',
            conflicted: 'border-red-600',
            distant: 'border-gray-600',
            fused: 'border-purple-600',
            neutral: 'border-ocean-600',
          };

          return (
            <Card
              key={dynamic.relation.id}
              className={`p-6 border-l-4 ${qualityColors[dynamic.quality]} bg-gradient-to-r ${relInfo.color} bg-opacity-10`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{relInfo.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-ocean-400 text-sm font-medium">{relInfo.label}</p>
                      <p className="text-white font-semibold text-lg">{dynamic.targetPerson.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dynamic.quality === 'supportive' ? 'bg-green-900/30 text-green-300' :
                        dynamic.quality === 'conflicted' ? 'bg-red-900/30 text-red-300' :
                        dynamic.quality === 'distant' ? 'bg-gray-900/30 text-gray-300' :
                        'bg-purple-900/30 text-purple-300'
                      }`}>
                        {dynamic.quality === 'supportive' && '✓ Supportive'}
                        {dynamic.quality === 'conflicted' && '⚠️ Conflicted'}
                        {dynamic.quality === 'distant' && '↔️ Distant'}
                        {dynamic.quality === 'fused' && '🔗 Fused'}
                      </span>
                      {dynamic.transgenerational && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300">
                          📚 Transgenerational
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Intensity Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-ocean-400 text-xs">Emotional Intensity</p>
                      <p className="text-ocean-300 text-xs">{dynamic.intensity}%</p>
                    </div>
                    <div className="w-full h-2 bg-ocean-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          dynamic.quality === 'supportive' ? 'bg-green-500' :
                          dynamic.quality === 'conflicted' ? 'bg-red-500' :
                          dynamic.quality === 'distant' ? 'bg-gray-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${dynamic.intensity}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-ocean-200 text-sm leading-relaxed">{dynamic.description}</p>

                  {/* Additional Context */}
                  {dynamic.targetPerson.occupation && (
                    <p className="text-ocean-400 text-sm mt-2">
                      Occupation: <span className="text-ocean-200">{dynamic.targetPerson.occupation}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Transgenerational Patterns */}
      {dynamics.some(d => d.transgenerational) && (
        <Card className="p-6 border-l-4 border-amber-600 bg-amber-900/10">
          <h3 className="text-lg font-bold text-amber-300 mb-3">📚 Transgenerational Patterns</h3>
          <p className="text-ocean-200 text-sm mb-3">
            Some of {person.name}'s relationships show patterns that may reflect intergenerational transmission. These patterns often repeat across generations and are valuable targets for therapeutic work.
          </p>
          <ul className="space-y-2 text-ocean-300 text-sm">
            {dynamics.filter(d => d.transgenerational).map((dynamic, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">→</span>
                <span>
                  Pattern with {dynamic.targetPerson.name}: {dynamic.type.replace('-', ' ')} dynamic that may reflect family history
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Relationship Health Summary */}
      <Card className="p-6 bg-accent-blue/10 border border-accent-blue/30">
        <h3 className="text-lg font-bold text-accent-blue mb-3">💡 Relational Health Summary</h3>
        <ul className="space-y-2 text-ocean-200 text-sm">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              {dynamics.filter(d => d.quality === 'supportive').length > 0
                ? `${dynamics.filter(d => d.quality === 'supportive').length} supportive relationship${dynamics.filter(d => d.quality === 'supportive').length !== 1 ? 's' : ''} provide a strong relational foundation.`
                : 'Limited supportive relationships - may benefit from building secure connections.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              {dynamics.filter(d => d.quality === 'conflicted').length > 0
                ? `${dynamics.filter(d => d.quality === 'conflicted').length} conflicted relationship${dynamics.filter(d => d.quality === 'conflicted').length !== 1 ? 's' : ''} require attention and potential therapeutic resolution.`
                : 'Conflict-free relationship landscape suggests relational peace.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              {dynamics.filter(d => d.quality === 'fused').length > 0
                ? 'Fused relationships may indicate boundary issues that could benefit from differentiation work.'
                : 'Healthy boundaries appear to be maintained across relationships.'}
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
