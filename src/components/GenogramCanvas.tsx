import { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  type NodeChange,
} from 'reactflow';
import type { Connection, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGenogramStore } from '../store/genogramStore';
import { getLayoutedElements } from '../utils/layout';
import PersonNode from './PersonNode';
import { Moon, Sun, Lock, Unlock } from 'lucide-react';
import { getHiddenPeopleIds } from '../utils/siblingCollapse';

const nodeTypes: NodeTypes = {
  personNode: PersonNode,
};

type ThemeMode = 'light' | 'dark';

export const GenogramCanvas = () => {
  const { people, relations, updatePerson, siblingGroups, toggleSiblingGroupCollapse: _toggleCollapse } = useGenogramStore();
  const [nodes, setNodes, onNodesState] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Check system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('genogram-theme');
      if (stored === 'dark' || stored === 'light') return stored as ThemeMode;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [isInteractionLocked, setIsInteractionLocked] = useState(false);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('genogram-theme', theme);
  }, [theme]);

  // Get IDs of hidden people (collapsed siblings)
  const hiddenPeopleIds = useMemo(
    () => getHiddenPeopleIds(siblingGroups),
    [siblingGroups]
  );

  // Memoize layout calculation - only recalculate when people or relations actually change
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(people, relations),
    [people, relations]
  );

  // Filter out hidden nodes
  const filteredNodes = useMemo(
    () => layoutedNodes.filter(node => !hiddenPeopleIds.has(node.id)),
    [layoutedNodes, hiddenPeopleIds]
  );

  // Filter out edges to hidden nodes
  const filteredEdges = useMemo(
    () => layoutedEdges.filter(edge => !hiddenPeopleIds.has(edge.source) && !hiddenPeopleIds.has(edge.target)),
    [layoutedEdges, hiddenPeopleIds]
  );

  // Update nodes and edges only when layout changes
  useEffect(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (isInteractionLocked) return; // Disable relation creation when locked
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges, isInteractionLocked]);

  // Custom nodes change handler to save positions
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // If locked, filter out position changes (dragging)
    if (isInteractionLocked) {
      changes = changes.filter(change => change.type !== 'position');
    }

    // Update local state
    onNodesState(changes);
    
    // Save position changes to store (only if not locked)
    if (!isInteractionLocked) {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const person = people.find(p => p.id === change.id);
          if (person) {
            updatePerson(change.id, {
              position: { x: change.position.x, y: change.position.y }
            });
          }
        }
      });
    }
  }, [onNodesState, people, updatePerson, isInteractionLocked]);

  // Get gradient style based on theme - Professional gradients from uiGradients
  const getBackgroundGradient = () => {
    if (theme === 'light') {
      // Professional light gradient - visible transition
      return `linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)`;
    } else {
      // Ocean blue + black gradient - deep professional
      return `linear-gradient(135deg, #0a0e27 0%, #1a4d6d 50%, #0d2b3e 100%)`;
    }
  };

  return (
    <>
      <div 
        className="w-full h-full relative"
        style={{ background: getBackgroundGradient() }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={isInteractionLocked ? () => {} : onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          panOnDrag={!isInteractionLocked}
          panOnScroll={!isInteractionLocked}
          zoomOnScroll={!isInteractionLocked}
          zoomOnPinch={!isInteractionLocked}
          nodesDraggable={!isInteractionLocked}
          nodesConnectable={!isInteractionLocked}
          elementsSelectable={!isInteractionLocked}
        >
          <Background color="transparent" gap={20} size={1} />
          <Controls className={`${
            theme === 'light' 
              ? 'bg-white border border-slate-300 text-slate-700' 
              : 'bg-deep-surface border border-ocean-800 text-ocean-100'
          }`} />
          <MiniMap 
              nodeColor={(n) => {
                  if (n.data.gender === 'male') return '#3b82f6';
                  if (n.data.gender === 'female') return '#ec4899';
                  return '#a855f7';
              }}
              maskColor={theme === 'light' ? '#e2e8f0' : '#0B1120'}
              className={`${
                theme === 'light'
                  ? 'bg-white border border-slate-300'
                  : 'bg-deep-surface border border-ocean-800'
              }`}
          />
        </ReactFlow>
        
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-40 flex gap-3">
          <button
            onClick={() => setIsInteractionLocked(!isInteractionLocked)}
            className={`flex items-center justify-center p-3 rounded-lg font-semibold transition-all shadow-lg ${
              isInteractionLocked
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'btn-gradient-secondary hover:shadow-xl'
            }`}
            title={isInteractionLocked ? 'Canvas locked - Click to unlock' : 'Canvas unlocked - Click to lock'}
          >
            {isInteractionLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <Unlock className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center justify-center p-3 rounded-lg font-semibold transition-all shadow-lg btn-gradient-secondary hover:shadow-xl"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Lock Status Indicator */}
        {isInteractionLocked && (
          <div className="absolute bottom-4 left-4 z-40 px-4 py-2 bg-red-700/80 text-white rounded-lg text-sm font-semibold backdrop-blur">
            🔒 View-Only Mode
          </div>
        )}
      </div>
    </>
  );
};
