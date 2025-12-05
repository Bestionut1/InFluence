import { memo, useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { Person } from '../types/genogram';
import { User, Skull, ExternalLink } from 'lucide-react';
import { PersonEditModal } from './PersonEditModal';
import { PROFILE_TEMPLATES } from '../services/profileTemplates';
import { CONDITION_COLORS } from '../constants/conditionColors';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PersonNode = ({ data, selected }: NodeProps<Person>) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const isDeceased = data.status === 'deceased';
  
  // Memoize computed values to prevent recalculation on every render
  const { bgColor, shapeStyle, emoji } = useMemo(() => {
    const bgColor = data.gender === 'male' ? 'bg-blue-900/40 border-blue-500' : 
                    data.gender === 'female' ? 'bg-pink-900/40 border-pink-500' : 'bg-purple-900/40 border-purple-500';
    
    const shapeStyle = data.gender === 'male' 
      ? { borderRadius: '0px', width: '120px', height: '120px' }
      : data.gender === 'female'
      ? { borderRadius: '50%', width: '120px', height: '120px' }
      : { borderRadius: '8px', width: '120px', height: '120px' };

    const emoji = data.templateCategory ? PROFILE_TEMPLATES[data.templateCategory]?.emoji : null;

    return { bgColor, shapeStyle, emoji };
  }, [data.gender, data.templateCategory]);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleViewProfile = () => {
    navigate(`/person/${data.id}`);
    setShowContextMenu(false);
  };

  return (
    <>
      <motion.div 
        className={`relative shadow-md border-2 ${bgColor} backdrop-blur-sm flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow ${data.isPrincipal ? 'ring-4 ring-yellow-400' : ''} ${selected ? 'ring-2 ring-ocean-300' : ''}`} 
        style={shapeStyle}
        onClick={handleNodeClick}
        onContextMenu={handleContextMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {/* Vertical handles for parent-child relationships (top/bottom) */}
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-ocean-300" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-ocean-300" />
        
        {/* Horizontal handles for sibling/partner relationships (left/right) */}
        <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-ocean-300" />
        <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-ocean-300" />
        
        {/* X for deceased */}
        {isDeceased && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="absolute">
              <line x1="10" y1="10" x2="110" y2="110" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
              <line x1="110" y1="10" x2="10" y2="110" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" />
            </svg>
          </div>
        )}
        
        <div className="flex flex-col items-center gap-2 text-center z-10">
          <div className={`p-1.5 rounded-full ${isDeceased ? 'bg-gray-700' : 'bg-ocean-600'}`}>
            {isDeceased ? <Skull className="w-4 h-4 text-gray-300" /> : <User className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className="font-bold text-ocean-50 text-sm flex items-center justify-center gap-1">
              {emoji && <span className="text-lg">{emoji}</span>}
              {data.name}
            </div>
            <div className="text-xs text-ocean-300">{data.age ? `${data.age} y.o` : 'Age N/A'}</div>
          </div>
        </div>
        {data.attributes && data.attributes.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap justify-center">
            {data.attributes.slice(0, 3).map(attr => (
              <span key={attr} className="text-[10px] px-1 rounded bg-deep text-ocean-200 border border-ocean-800">{attr}</span>
            ))}
          </div>
        )}

        {/* Health conditions indicators */}
        {data.healthHistory && data.healthHistory.length > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
            {data.healthHistory.slice(0, 3).map((record) => {
              const colors = CONDITION_COLORS[record.condition as keyof typeof CONDITION_COLORS];
              const color = colors?.light || '#9ca3af';
              return (
                <div
                  key={record.id}
                  className="w-2 h-2 rounded-full border border-opacity-50"
                  style={{
                    backgroundColor: color,
                    borderColor: color,
                  }}
                  title={`${record.condition} (${record.severity})`}
                />
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed bg-ocean-900 border border-ocean-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-max"
            style={{ top: `${contextPos.y}px`, left: `${contextPos.x}px` }}
          >
            <button
              onClick={handleViewProfile}
              className="w-full px-4 py-2 text-left text-white hover:bg-ocean-800 flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Profile Hub
            </button>
            <button
              onClick={() => {
                setShowDetails(true);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-ocean-800 flex items-center gap-2 transition-colors border-t border-ocean-700"
            >
              <User className="w-4 h-4" />
              Edit Details
            </button>
          </div>
        </>
      )}

      <PersonEditModal
        person={data}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default memo(PersonNode);
