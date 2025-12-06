import dagre from 'dagre';
import { Position } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import type { Person, Relation, RelationType } from '../types/genogram';
import {
  calculateSiblingAlignment,
  calculatePartnerAlignment,
  calculateSiblingGroupYPosition,
  calculateSiblingGroupCenterX,
  getSiblingsForPerson,
  getPartnersForPerson,
} from './alignment';

const nodeWidth = 120;
const nodeHeight = 120;

// Helper functions to check relationship categories
const isSiblingRelation = (type: RelationType): boolean => {
  return ['biological-sibling', 'half-sibling', 'full-sibling', 'twin', 'fraternal-twin', 'identical-twin', 'step-sibling'].includes(type);
};

const isPartnerRelation = (type: RelationType): boolean => {
  return ['partner', 'married-couple', 'domestic-partnership', 'ex-partner', 'ex-spouse', 'engaged'].includes(type);
};
const generationSpacing = 220; // Vertical spacing between generations (increased from 150 for better visibility)

// Identify sibling groups (people who share parent relationships)

export const getLayoutedElements = (people: Person[], relations: Relation[]) => {
  // Step 1: Identify sibling groups
  
  // Step 2: Create dagre graph with better settings
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'TB',
    nodesep: 120,
    ranksep: generationSpacing,
    marginx: 80,
    marginy: 80,
  });

  people.forEach(person => {
    dagreGraph.setNode(person.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges with proper weights
  relations.forEach(rel => {
    if (rel.type === 'parent-child') {
      dagreGraph.setEdge(rel.sourceId, rel.targetId, { weight: 1 });
    } else if (isSiblingRelation(rel.type) || isPartnerRelation(rel.type)) {
      // Low weight to not override parent-child hierarchy
      dagreGraph.setEdge(rel.sourceId, rel.targetId, { weight: 0.1 });
    }
  });

  // Run dagre layout
  dagre.layout(dagreGraph);

  // Step 3: Position nodes
  const nodes: Node[] = people.map(person => {
    let x: number;
    let y: number;

    // Priority 1: Use saved position if exists
    if (person.position) {
      x = person.position.x;
      y = person.position.y;
    } else {
      const nodeWithPos = dagreGraph.node(person.id);
      x = nodeWithPos.x - nodeWidth / 2;
      y = nodeWithPos.y - nodeHeight / 2;

      // Priority 2: Apply sibling grouping using alignment utilities
      const siblings = getSiblingsForPerson(person.id, people, relations);
      if (siblings.length > 0) {
        const siblingGroupPeople = [person, ...siblings];
        
        // Calculate Y position based on parents
        y = calculateSiblingGroupYPosition(siblingGroupPeople, people, relations, generationSpacing);
        
        // Calculate center X based on parents
        const centerX = calculateSiblingGroupCenterX(siblingGroupPeople, people, relations);
        
        // Get alignment positions for entire sibling group
        const siblingAlignment = calculateSiblingAlignment(siblingGroupPeople, y, centerX);
        
        // Use this person's position from alignment
        const alignedPos = siblingAlignment.get(person.id);
        if (alignedPos) {
          x = alignedPos.x;
          y = alignedPos.y;
        }
      } else {
        // Priority 3: Center children under parents
        const parentRelations = relations.filter(r => r.type === 'parent-child' && r.targetId === person.id);
        if (parentRelations.length > 0) {
          // Get parent positions
          const parentXPositions = parentRelations.map(rel => {
            const parent = people.find(p => p.id === rel.sourceId);
            if (parent?.position) return parent.position.x;
            const parentNode = dagreGraph.node(rel.sourceId);
            return parentNode.x - nodeWidth / 2;
          });
          // Center under average parent X
          const avgParentX = parentXPositions.reduce((a, b) => a + b, 0) / parentXPositions.length;
          x = avgParentX;
        }
      }
      
      // Priority 4: Apply partner alignment if has a partner
      const partners = getPartnersForPerson(person.id, relations);
      if (partners.length > 0) {
        const partner = people.find(p => p.id === partners[0]);
        if (partner) {
          const partnerAlignment = calculatePartnerAlignment(person, partner, y, true);
          const alignedPartnerPos = partnerAlignment.get(person.id);
          if (alignedPartnerPos) {
            x = alignedPartnerPos.x;
            y = alignedPartnerPos.y;
          }
        }
      }
    }

    // Principal member centered
    if (person.isPrincipal) {
      x = 0;
      y = 0;
    }

    return {
      id: person.id,
      type: 'personNode',
      position: { x, y },
      data: { ...person },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      draggable: !person.isPrincipal,
    };
  });

  // Step 5: Create edges with proper styling
  const edges: Edge[] = relations.map((rel) => {
    let sourcePos: Position = Position.Bottom;
    let targetPos: Position = Position.Top;
    let sourceHandle: string | undefined = undefined;
    let targetHandle: string | undefined = undefined;

    if (isSiblingRelation(rel.type) || isPartnerRelation(rel.type)) {
      sourcePos = Position.Right;
      targetPos = Position.Left;
      sourceHandle = 'right';
      targetHandle = 'left';
    } else if (rel.type === 'conflict') {
      const sourcePerson = people.find(p => p.id === rel.sourceId);
      const targetPerson = people.find(p => p.id === rel.targetId);
      
      if (sourcePerson && targetPerson) {
        const sourceY = sourcePerson.position?.y ?? 0;
        const targetY = targetPerson.position?.y ?? 0;
        
        if (Math.abs(sourceY - targetY) < 50) {
          sourcePos = Position.Right;
          targetPos = Position.Left;
          sourceHandle = 'right';
          targetHandle = 'left';
        }
      }
    }

    return {
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      sourceHandle,
      targetHandle,
      type: rel.type === 'parent-child' ? 'smoothstep' : 'straight',
      animated: rel.type === 'conflict',
      style: getEdgeStyle(rel.type),
      sourcePosition: sourcePos,
      targetPosition: targetPos,
    };
  });

  return { nodes, edges };
};

const getEdgeStyle = (type: RelationType) => {
  // Sibling relations - purple tones
  if (isSiblingRelation(type)) {
    return { stroke: '#8b5cf6', strokeWidth: 2 };
  }
  
  // Partner/romance relations - pink/rose tones
  if (isPartnerRelation(type)) {
    return { stroke: '#ec4899', strokeWidth: 2.5 };
  }
  
  // Traumatic/Abusive relations (APA Clinical Standards) - distinct styles
  switch (type) {
    case 'physical-abuse': return { stroke: '#dc2626', strokeWidth: 3, strokeDasharray: '5,5' };
    case 'sexual-abuse': return { stroke: '#9333ea', strokeWidth: 2.5, strokeDasharray: '3,3' };
    case 'emotional-abuse': return { stroke: '#d97706', strokeWidth: 2.5, strokeDasharray: '4,4' };
    case 'neglect': return { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '2,4' };
    case 'violence': return { stroke: '#991b1b', strokeWidth: 3, strokeDasharray: '6,2' };
    
    case 'conflict': return { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' };
    case 'close': return { stroke: '#38bdf8', strokeWidth: 3 };
    case 'distant': return { stroke: '#94a3b8', strokeDasharray: '4,4' };
    case 'estranged': return { stroke: '#f97316', strokeDasharray: '5,5', strokeWidth: 2 };
    case 'dependent': return { stroke: '#14b8a6', strokeWidth: 2.5 };
    case 'supportive': return { stroke: '#10b981', strokeWidth: 2.5 };
    case 'parent-child': return { stroke: '#000', strokeWidth: 2 };
    case 'grandparent-grandchild': return { stroke: '#64748b', strokeWidth: 2 };
    case 'uncle-aunt-niece-nephew': return { stroke: '#64748b', strokeWidth: 1.5 };
    case 'cousin': return { stroke: '#94a3b8', strokeWidth: 1.5 };
    case 'adoptive-parent': return { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '3,3' };
    case 'adoptive-child': return { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '3,3' };
    case 'foster-parent': return { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '3,3' };
    case 'foster-child': return { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '3,3' };
    default: return { stroke: '#64748b' };
  }
};
