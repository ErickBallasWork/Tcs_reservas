import { describe, expect, it } from 'vitest';
import type { FloorResourceType } from '@/lib/floor-plan/types';
import {
  linkableResources,
  parsePlanForm,
  toZoneInput,
  validateZones,
  type EditorZone,
} from '@/lib/floor-plan/zone-schema';

const plan = { width: 600, height: 400 };
const types = new Map<string, FloorResourceType>([
  ['room-1', 'MEETING_ROOM'],
  ['room-2', 'MEETING_ROOM'],
  ['lab-1', 'AI_LAB'],
]);

const zone = (overrides: Partial<EditorZone> = {}): EditorZone => ({
  key: 'k1',
  id: 'z1',
  name: 'Board',
  kind: 'ROOM',
  x: 10,
  y: 10,
  width: 100,
  height: 80,
  isReservable: true,
  resourceId: 'room-1',
  ...overrides,
});

const errorsOf = (zones: EditorZone[]) => {
  const result = validateZones(zones, plan, types);
  return result.success ? {} : result.errors;
};

describe('validateZones', () => {
  it('accepts valid zones and sends them in order with their sort order', () => {
    const result = validateZones(
      [
        zone(),
        zone({
          key: 'k2',
          id: undefined,
          name: ' Pasillo ',
          kind: 'LABEL',
          isReservable: false,
          resourceId: null,
        }),
      ],
      plan,
      types,
    );

    expect(result).toEqual({
      success: true,
      zones: [
        expect.objectContaining({ id: 'z1', sortOrder: 0, resourceId: 'room-1' }),
        {
          name: 'Pasillo',
          kind: 'LABEL',
          x: 10,
          y: 10,
          width: 100,
          height: 80,
          isReservable: false,
          resourceId: null,
          sortOrder: 1,
        },
      ],
    });
  });

  it('requires a name and caps its length', () => {
    expect(errorsOf([zone({ name: '  ' })]).k1?.name).toBe('Escribe un nombre.');
    expect(errorsOf([zone({ name: 'x'.repeat(101) })]).k1?.name).toBe(
      'El nombre es demasiado largo.',
    );
  });

  it('rejects non integer, tiny or out of bounds geometry', () => {
    expect(errorsOf([zone({ x: 1.5 })]).k1?.x).toBe('Usa un número entero.');
    expect(errorsOf([zone({ width: 5 })]).k1?.width).toBe('El tamaño mínimo es 10.');
    expect(errorsOf([zone({ x: 550 })]).k1?.width).toBe('La zona se sale del plano.');
    expect(errorsOf([zone({ y: -10 })]).k1?.y).toBe('La zona se sale del plano.');
  });

  it('requires a resource for a reservable zone', () => {
    expect(errorsOf([zone({ resourceId: null })]).k1?.resourceId).toBe(
      'Una zona reservable necesita un recurso.',
    );
  });

  it('requires the resource type to match the zone kind', () => {
    expect(errorsOf([zone({ kind: 'LAB' })]).k1?.resourceId).toBe(
      'El recurso no corresponde al tipo de zona.',
    );
    expect(errorsOf([zone({ kind: 'LAB', resourceId: 'lab-1' })])).toEqual({});
  });

  it('allows only rooms and labs to be reservable', () => {
    expect(errorsOf([zone({ kind: 'DECORATIVE' })]).k1?.isReservable).toBe(
      'Solo las salas y los laboratorios pueden ser reservables.',
    );
  });

  it('links a resource to a single zone', () => {
    const result = errorsOf([zone(), zone({ key: 'k2', id: 'z2' })]);

    expect(result.k1).toBeUndefined();
    expect(result.k2?.resourceId).toBe('Ese recurso ya está ligado a otra zona.');
  });

  it('ignores the resource of a zone that is not reservable', () => {
    expect(
      errorsOf([zone(), zone({ key: 'k2', id: 'z2', isReservable: false, resourceId: 'room-1' })]),
    ).toEqual({});
  });
});

describe('toZoneInput', () => {
  it('drops the resource of a zone that is not reservable', () => {
    expect(toZoneInput(zone({ isReservable: false }), 3)).toMatchObject({
      isReservable: false,
      resourceId: null,
      sortOrder: 3,
    });
  });

  it('leaves the id out for a new zone', () => {
    expect(toZoneInput(zone({ id: undefined }), 0)).not.toHaveProperty('id');
  });
});

describe('parsePlanForm', () => {
  it('parses a valid plan', () => {
    expect(parsePlanForm({ name: ' Planta ', width: '900', height: '600' })).toEqual({
      success: true,
      data: { name: 'Planta', width: 900, height: 600 },
    });
  });

  it('reports each invalid field', () => {
    expect(parsePlanForm({ name: '', width: '50', height: 'abc' })).toEqual({
      success: false,
      errors: {
        name: 'Escribe un nombre.',
        width: 'Indica un número entero entre 100 y 100000.',
        height: 'Indica un número entero entre 100 y 100000.',
      },
    });
  });
});

describe('linkableResources', () => {
  const resources = [
    { id: 'room-1', type: 'MEETING_ROOM', isActive: true },
    { id: 'room-2', type: 'MEETING_ROOM', isActive: true },
    { id: 'room-3', type: 'MEETING_ROOM', isActive: false },
    { id: 'lab-1', type: 'AI_LAB', isActive: true },
  ];

  it('offers the resources of the zone kind not linked to another zone', () => {
    const other = zone({ key: 'k2', id: 'z2', resourceId: 'room-2' });

    expect(
      linkableResources(zone({ resourceId: null }), [zone({ resourceId: null }), other], resources),
    ).toEqual([resources[0]]);
  });

  it('offers labs to a lab zone', () => {
    expect(linkableResources(zone({ kind: 'LAB', resourceId: null }), [], resources)).toEqual([
      resources[3],
    ]);
  });

  it('keeps the inactive resource already linked to the zone', () => {
    expect(
      linkableResources(zone({ resourceId: 'room-3' }), [], resources).map((r) => r.id),
    ).toEqual(['room-1', 'room-2', 'room-3']);
  });

  it('offers nothing to decorative zones and labels', () => {
    expect(linkableResources(zone({ kind: 'DECORATIVE' }), [], resources)).toEqual([]);
    expect(linkableResources(zone({ kind: 'LABEL' }), [], resources)).toEqual([]);
  });
});
