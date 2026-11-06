import { describe, expect, it } from 'vitest';
import {
  parseBuildingForm,
  parseLaptopForm,
  parseRoomOrLabForm,
  toCreateBuildingBody,
  type RoomOrLabForm,
} from '@/lib/catalog-form';

const roomForm: RoomOrLabForm = {
  type: 'MEETING_ROOM',
  name: '  Sala Cotopaxi ',
  buildingId: 'b1',
  capacity: ' 8 ',
  equipment: '',
  rules: 'Sin comida',
};

describe('parseBuildingForm', () => {
  it('trims the fields', () => {
    const parsed = parseBuildingForm({ name: '  Torre  ', address: ' Av. 1 ' });

    expect(parsed).toEqual({ success: true, data: { name: 'Torre', address: 'Av. 1' } });
  });

  it('requires a name', () => {
    const parsed = parseBuildingForm({ name: '   ', address: '' });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.name).toBeDefined();
  });

  it('rejects an address over 300 characters', () => {
    const parsed = parseBuildingForm({ name: 'Torre', address: 'a'.repeat(301) });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.address).toBeDefined();
  });

  it('omits an empty address from the create body', () => {
    expect(toCreateBuildingBody({ name: 'Torre', address: '' })).toEqual({
      name: 'Torre',
      address: undefined,
    });
  });
});

describe('parseRoomOrLabForm', () => {
  it('builds the create body with a numeric capacity and without empty texts', () => {
    const parsed = parseRoomOrLabForm(roomForm);

    expect(parsed).toEqual({
      success: true,
      data: {
        type: 'MEETING_ROOM',
        name: 'Sala Cotopaxi',
        buildingId: 'b1',
        capacity: 8,
        equipment: undefined,
        rules: 'Sin comida',
      },
    });
  });

  it.each(['', '0', '-3', '2.5', 'abc', '1000000'])('rejects the capacity "%s"', (capacity) => {
    const parsed = parseRoomOrLabForm({ ...roomForm, capacity });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.capacity).toBeDefined();
  });

  it('requires a type and a building', () => {
    const parsed = parseRoomOrLabForm({ ...roomForm, type: '', buildingId: '' });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.errors.type).toBeDefined();
      expect(parsed.errors.buildingId).toBeDefined();
    }
  });

  it('rejects equipment over 500 characters', () => {
    const parsed = parseRoomOrLabForm({ ...roomForm, equipment: 'e'.repeat(501) });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.equipment).toBeDefined();
  });
});

describe('parseLaptopForm', () => {
  it('builds a laptop body that points at its lab', () => {
    const parsed = parseLaptopForm({ name: ' Laptop 7 ', assetTag: ' TAG-7 ', labId: 'lab-1' });

    expect(parsed).toEqual({
      success: true,
      data: { type: 'LAPTOP', name: 'Laptop 7', parentResourceId: 'lab-1', assetTag: 'TAG-7' },
    });
  });

  it('requires a lab', () => {
    const parsed = parseLaptopForm({ name: 'Laptop 7', assetTag: '', labId: '' });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.labId).toBeDefined();
  });

  it('rejects an asset tag over 50 characters', () => {
    const parsed = parseLaptopForm({ name: 'Laptop 7', assetTag: 't'.repeat(51), labId: 'lab-1' });

    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.errors.assetTag).toBeDefined();
  });
});
