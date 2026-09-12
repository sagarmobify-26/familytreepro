import { Node, Edge } from '@xyflow/react';
import { FamilyMember, FamilyRelationship, FamilyNodeData } from '../types/family';

export interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  coupleSpacing: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  nodeWidth: 240,
  nodeHeight: 140,
  horizontalSpacing: 60,
  verticalSpacing: 260,
  coupleSpacing: 40,
};

export interface LayoutResult {
  nodes: Node<FamilyNodeData>[];
  edges: Edge[];
}

/**
 * Computes generational tiers and (x, y) coordinates for all family members.
 */
export function calculateTreeLayout(
  members: Record<string, FamilyMember>,
  relationships: FamilyRelationship[],
  options: Partial<LayoutOptions> = {}
): LayoutResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const memberList = Object.values(members);

  if (memberList.length === 0) {
    return { nodes: [], edges: [] };
  }

  // 1. Build Adjacency maps
  const parentsMap = new Map<string, string[]>(); // childId -> [parentId]
  const childrenMap = new Map<string, string[]>(); // parentId -> [childId]
  const spouseMap = new Map<string, string>(); // memberId -> spouseId

  memberList.forEach((m) => {
    parentsMap.set(m.id, []);
    childrenMap.set(m.id, []);
  });

  relationships.forEach((rel) => {
    if (rel.type === 'parent') {
      const p = rel.sourceMemberId;
      const c = rel.targetMemberId;
      if (parentsMap.has(c)) parentsMap.get(c)!.push(p);
      if (childrenMap.has(p)) childrenMap.get(p)!.push(c);
    } else if (rel.type === 'spouse') {
      spouseMap.set(rel.sourceMemberId, rel.targetMemberId);
      spouseMap.set(rel.targetMemberId, rel.sourceMemberId);
    }
  });

  // 2. Compute Generational Tiers (topological depth)
  const tiers = new Map<string, number>();

  function getTier(memberId: string, visited = new Set<string>()): number {
    if (tiers.has(memberId)) return tiers.get(memberId)!;
    if (visited.has(memberId)) return 0;
    visited.add(memberId);

    const parents = parentsMap.get(memberId) || [];
    if (parents.length === 0) {
      // If no parents, check if spouse has parents
      const spouseId = spouseMap.get(memberId);
      if (spouseId && !visited.has(spouseId)) {
        const spouseParents = parentsMap.get(spouseId) || [];
        if (spouseParents.length > 0) {
          const spouseTier = getTier(spouseId, new Set(visited));
          tiers.set(memberId, spouseTier);
          return spouseTier;
        }
      }
      tiers.set(memberId, 0);
      return 0;
    }

    const maxParentTier = Math.max(...parents.map((p) => getTier(p, new Set(visited))));
    const myTier = maxParentTier + 1;
    tiers.set(memberId, myTier);
    return myTier;
  }

  memberList.forEach((m) => getTier(m.id));

  // Sync spouse tiers so couples always appear on the same horizontal row
  memberList.forEach((m) => {
    const spouseId = spouseMap.get(m.id);
    if (spouseId) {
      const t1 = tiers.get(m.id) || 0;
      const t2 = tiers.get(spouseId) || 0;
      const maxTier = Math.max(t1, t2);
      tiers.set(m.id, maxTier);
      tiers.set(spouseId, maxTier);
    }
  });

  // 3. Group by Family Units per generation
  // A family unit consists of: Primary Member, Optional Spouse, and their Children
  const visitedForUnit = new Set<string>();
  interface FamilyUnit {
    id: string;
    primaryId: string;
    spouseId?: string;
    childIds: string[];
    tier: number;
    width: number;
    x: number;
    y: number;
  }

  const unitsByTier = new Map<number, FamilyUnit[]>();

  memberList.forEach((m) => {
    if (visitedForUnit.has(m.id)) return;

    const spouseId = spouseMap.get(m.id);
    visitedForUnit.add(m.id);
    if (spouseId) visitedForUnit.add(spouseId);

    // Get combined children of this union
    const c1 = childrenMap.get(m.id) || [];
    const c2 = spouseId ? childrenMap.get(spouseId) || [] : [];
    const childSet = new Set([...c1, ...c2]);
    const childIds = Array.from(childSet);

    const tier = tiers.get(m.id) || 0;
    const unitWidth = spouseId ? opts.nodeWidth * 2 + opts.coupleSpacing : opts.nodeWidth;

    const unit: FamilyUnit = {
      id: `unit-${m.id}`,
      primaryId: m.id,
      spouseId,
      childIds,
      tier,
      width: unitWidth,
      x: 0,
      y: tier * opts.verticalSpacing,
    };

    if (!unitsByTier.has(tier)) unitsByTier.set(tier, []);
    unitsByTier.get(tier)!.push(unit);
  });

  // 4. Position Family Units with proper spacing per tier
  const nodePositions = new Map<string, { x: number; y: number }>();
  const sortedTiers = Array.from(unitsByTier.keys()).sort((a, b) => a - b);

  sortedTiers.forEach((tier) => {
    const units = unitsByTier.get(tier)!;
    let currentX = 0;

    units.forEach((unit) => {
      unit.x = currentX;
      currentX += unit.width + opts.horizontalSpacing;

      // Assign position to primary member
      nodePositions.set(unit.primaryId, { x: unit.x, y: unit.y });

      // Assign position to spouse
      if (unit.spouseId) {
        nodePositions.set(unit.spouseId, {
          x: unit.x + opts.nodeWidth + opts.coupleSpacing,
          y: unit.y,
        });
      }
    });
  });

  // 5. Center tiers relative to the widest tier for balanced tree aesthetic
  let minGlobalX = Infinity;
  let maxGlobalX = -Infinity;
  nodePositions.forEach((pos) => {
    if (pos.x < minGlobalX) minGlobalX = pos.x;
    if (pos.x + opts.nodeWidth > maxGlobalX) maxGlobalX = pos.x + opts.nodeWidth;
  });

  // Shift all positions so top generation centers over children
  sortedTiers.forEach((tier) => {
    const units = unitsByTier.get(tier)!;
    if (units.length === 0) return;
    const tierMinX = units[0].x;
    const lastUnit = units[units.length - 1];
    const tierMaxX = lastUnit.x + lastUnit.width;
    const tierWidth = tierMaxX - tierMinX;
    const totalWidth = maxGlobalX - minGlobalX;
    const offset = Math.max(0, (totalWidth - tierWidth) / 2);

    units.forEach((u) => {
      const p1 = nodePositions.get(u.primaryId);
      if (p1) p1.x += offset;
      if (u.spouseId) {
        const p2 = nodePositions.get(u.spouseId);
        if (p2) p2.x += offset;
      }
    });
  });

  // 6. Build React Flow Nodes
  const nodes: Node<FamilyNodeData>[] = memberList.map((member) => {
    const pos = nodePositions.get(member.id) || { x: 0, y: 0 };
    return {
      id: member.id,
      type: 'familyMember',
      position: pos,
      data: {
        member,
        relationships,
        onAddRelative: () => {},
        onViewProfile: () => {},
        onEditMember: () => {},
        onDeleteMember: () => {},
      },
    };
  });

  // 7. Build React Flow Edges
  const edges: Edge[] = [];
  const processedSpouses = new Set<string>();

  relationships.forEach((rel) => {
    if (rel.type === 'spouse') {
      const pairKey = [rel.sourceMemberId, rel.targetMemberId].sort().join('--');
      if (!processedSpouses.has(pairKey)) {
        processedSpouses.add(pairKey);
        edges.push({
          id: `edge-spouse-${pairKey}`,
          source: rel.sourceMemberId,
          target: rel.targetMemberId,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: '#f43f5e',
            strokeWidth: 2.5,
            strokeDasharray: '4 4',
          },
          label: '⚭ Marriage',
          labelStyle: { fill: '#e11d48', fontWeight: 600, fontSize: 11 },
          labelBgStyle: { fill: '#fff1f2', rx: 6, ry: 6 },
          labelBgPadding: [4, 6],
        });
      }
    } else if (rel.type === 'parent') {
      edges.push({
        id: `edge-parent-${rel.id}`,
        source: rel.sourceMemberId,
        target: rel.targetMemberId,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'smoothstep',
        style: {
          stroke: '#6366f1',
          strokeWidth: 2,
        },
      });
    }
  });

  return { nodes, edges };
}
