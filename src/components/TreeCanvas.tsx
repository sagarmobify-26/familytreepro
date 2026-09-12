import React, { useMemo, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFamily } from '../store/familyContext';
import { calculateTreeLayout } from '../layout/treeLayout';
import { FamilyMemberNode } from './FamilyMemberNode';
import { FamilyNodeData, FamilyMember } from '../types/family';
import { Maximize2, Users, Layers, Heart } from 'lucide-react';

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

interface TreeCanvasProps {
  onFocusMemberCallback?: (fn: (id: string) => void) => void;
}

export const TreeCanvasInner: React.FC<TreeCanvasProps> = ({ onFocusMemberCallback }) => {
  const {
    members,
    relationships,
    selectedMember,
    searchQuery,
    openAddRelativeModal,
    openProfileDrawer,
    deleteMember,
  } = useFamily();

  const { fitView, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FamilyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Compute Layout when data changes
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = calculateTreeLayout(
      members,
      relationships
    );

    // Attach interactive callbacks into node.data
    const interactiveNodes = layoutNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onAddRelative: (m: FamilyMember) => openAddRelativeModal(m),
        onViewProfile: (m: FamilyMember) => openProfileDrawer(m, false),
        onEditMember: (m: FamilyMember) => openProfileDrawer(m, true),
        onDeleteMember: (m: FamilyMember) => deleteMember(m.id),
        isSelected: selectedMember?.id === n.id,
        isHighlighted:
          Boolean(searchQuery.trim()) &&
          (n.data.member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.data.member.lastName.toLowerCase().includes(searchQuery.toLowerCase())),
      },
    }));

    setNodes(interactiveNodes);
    setEdges(layoutEdges);
  }, [
    members,
    relationships,
    selectedMember,
    searchQuery,
    openAddRelativeModal,
    openProfileDrawer,
    deleteMember,
    setNodes,
    setEdges,
  ]);

  // Focus a specific member node smoothly
  const focusOnMember = useCallback(
    (memberId: string) => {
      const targetNode = nodes.find((n) => n.id === memberId);
      if (targetNode) {
        setCenter(targetNode.position.x + 120, targetNode.position.y + 70, {
          zoom: 1.15,
          duration: 800,
        });
      }
    },
    [nodes, setCenter]
  );

  useEffect(() => {
    if (onFocusMemberCallback) {
      onFocusMemberCallback(focusOnMember);
    }
  }, [onFocusMemberCallback, focusOnMember]);

  // Initial fit view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 150);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Statistics
  const stats = useMemo(() => {
    const totalMembers = Object.keys(members).length;
    const marriages = relationships.filter((r) => r.type === 'spouse').length;
    // Estimate generations
    return {
      totalMembers,
      marriages,
    };
  }, [members, relationships]);

  return (
    <div className="canvas-wrapper">
      {/* Top Floating Stats & Controls */}
      <div className="canvas-overlay-panel">
        <div className="stat-badge">
          <Users size={14} className="text-indigo-600" />
          <span>{stats.totalMembers} Members</span>
        </div>
        <div className="stat-badge">
          <Heart size={14} className="text-rose-500" />
          <span>{stats.marriages} Marriages</span>
        </div>
        <button
          type="button"
          className="canvas-action-btn"
          title="Fit view to entire tree"
          onClick={() => fitView({ padding: 0.2, duration: 600 })}
        >
          <Maximize2 size={14} />
          <span>Fit View</span>
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#cbd5e1"
        />
        <Controls showInteractive={false} position="bottom-right" className="custom-flow-controls" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as FamilyNodeData;
            if (data.member?.isFamilyHead) return '#f59e0b';
            return data.member?.gender === 'female' ? '#f43f5e' : '#6366f1';
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
          position="bottom-left"
          className="custom-minimap"
        />
      </ReactFlow>
    </div>
  );
};
