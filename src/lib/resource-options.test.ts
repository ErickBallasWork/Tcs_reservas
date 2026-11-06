import { describe, expect, it } from 'vitest';
import type { CatalogBuilding } from '@/api/types';
import { bookableResources, resourceLabel } from '@/lib/resource-options';

const base = { createdAt: '2026-11-01T00:00:00Z', equipment: null, rules: null, assetTag: null };

const tree: CatalogBuilding[] = [
  {
    id: 'b1',
    name: 'Edificio A',
    address: null,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
    resources: [
      {
        ...base,
        id: 'room-1',
        buildingId: 'b1',
        parentResourceId: null,
        type: 'MEETING_ROOM',
        name: 'Sala 101',
        capacity: 8,
        isActive: true,
        children: [],
      },
      {
        ...base,
        id: 'room-2',
        buildingId: 'b1',
        parentResourceId: null,
        type: 'MEETING_ROOM',
        name: 'Sala 102',
        capacity: 6,
        isActive: false,
        children: [],
      },
      {
        ...base,
        id: 'lab-1',
        buildingId: 'b1',
        parentResourceId: null,
        type: 'AI_LAB',
        name: 'Lab IA 1',
        capacity: 10,
        isActive: true,
        children: [
          {
            ...base,
            id: 'lap-1',
            buildingId: 'b1',
            parentResourceId: 'lab-1',
            type: 'LAPTOP',
            name: 'Laptop 01',
            capacity: 1,
            isActive: true,
          },
          {
            ...base,
            id: 'lap-2',
            buildingId: 'b1',
            parentResourceId: 'lab-1',
            type: 'LAPTOP',
            name: 'Laptop 02',
            capacity: 1,
            isActive: false,
          },
        ],
      },
    ],
  },
  {
    id: 'b2',
    name: 'Edificio B',
    address: null,
    isActive: false,
    createdAt: '2026-11-01T00:00:00Z',
    resources: [
      {
        ...base,
        id: 'room-3',
        buildingId: 'b2',
        parentResourceId: null,
        type: 'MEETING_ROOM',
        name: 'Sala 201',
        capacity: 4,
        isActive: true,
        children: [],
      },
    ],
  },
];

describe('bookableResources', () => {
  it('lists active rooms, labs and their active laptops only', () => {
    const resources = bookableResources(tree);

    expect(resources.map((r) => r.id)).toEqual(['room-1', 'lab-1', 'lap-1']);
  });

  it('skips the resources of an inactive building', () => {
    expect(bookableResources(tree).some((r) => r.buildingId === 'b2')).toBe(false);
  });

  it('links a laptop to its lab', () => {
    const laptop = bookableResources(tree).find((r) => r.id === 'lap-1');

    expect(laptop).toMatchObject({ labName: 'Lab IA 1', buildingName: 'Edificio A' });
  });
});

describe('resourceLabel', () => {
  it('shows the building for rooms and the lab for laptops', () => {
    const [room, , laptop] = bookableResources(tree);

    expect(resourceLabel(room)).toBe('Sala 101 · Edificio A');
    expect(resourceLabel(laptop)).toBe('Laptop 01 · Lab IA 1');
  });
});
