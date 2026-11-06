import { describe, expect, it } from 'vitest';
import {
  editorReducer,
  initialEditorState,
  isDirty,
  selectedZone,
} from '@/lib/floor-plan/editor-state';
import type { EditorZone } from '@/lib/floor-plan/zone-schema';

const room: EditorZone = {
  key: 'z1',
  id: 'z1',
  name: 'Board',
  kind: 'ROOM',
  x: 0,
  y: 0,
  width: 100,
  height: 80,
  isReservable: true,
  resourceId: 'room-1',
};

const start = () => initialEditorState([room]);

describe('editorReducer', () => {
  it('starts clean and without a selection', () => {
    expect(isDirty(start())).toBe(false);
    expect(selectedZone(start())).toBeNull();
  });

  it('adds a decorative zone with a local key and selects it', () => {
    const state = editorReducer(start(), {
      type: 'add',
      rect: { x: 10, y: 20, width: 30, height: 40 },
      name: 'Nueva zona',
    });

    expect(state.zones).toHaveLength(2);
    expect(selectedZone(state)).toMatchObject({
      key: 'new-1',
      kind: 'DECORATIVE',
      isReservable: false,
      x: 10,
    });
    expect(selectedZone(state)).not.toHaveProperty('id');
    expect(isDirty(state)).toBe(true);
  });

  it('gives each new zone a different key', () => {
    const add = { type: 'add', rect: { x: 0, y: 0, width: 10, height: 10 }, name: 'n' } as const;
    const state = editorReducer(editorReducer(start(), add), add);

    expect(state.zones.map((zone) => zone.key)).toEqual(['z1', 'new-1', 'new-2']);
  });

  it('unlinks the resource when the zone stops being reservable', () => {
    const state = editorReducer(start(), {
      type: 'update',
      key: 'z1',
      patch: { isReservable: false },
    });

    expect(state.zones[0]).toMatchObject({ isReservable: false, resourceId: null });
  });

  it('turns a zone that becomes decorative into a non reservable one', () => {
    const state = editorReducer(start(), {
      type: 'update',
      key: 'z1',
      patch: { kind: 'DECORATIVE' },
    });

    expect(state.zones[0]).toMatchObject({ isReservable: false, resourceId: null });
  });

  it('unlinks the resource when a room becomes a lab', () => {
    const state = editorReducer(start(), { type: 'update', key: 'z1', patch: { kind: 'LAB' } });

    expect(state.zones[0]).toMatchObject({ kind: 'LAB', isReservable: true, resourceId: null });
  });

  it('keeps the resource on a geometry change', () => {
    const state = editorReducer(start(), { type: 'update', key: 'z1', patch: { x: 40 } });

    expect(state.zones[0]).toMatchObject({ x: 40, resourceId: 'room-1' });
  });

  it('removes a zone and clears its selection', () => {
    const selected = editorReducer(start(), { type: 'select', key: 'z1' });
    const state = editorReducer(selected, { type: 'remove', key: 'z1' });

    expect(state.zones).toEqual([]);
    expect(state.selectedKey).toBeNull();
  });

  it('discards the changes back to the loaded zones', () => {
    const changed = editorReducer(start(), { type: 'update', key: 'z1', patch: { name: 'X' } });
    const state = editorReducer(changed, { type: 'discard' });

    expect(state.zones).toEqual([room]);
    expect(isDirty(state)).toBe(false);
  });

  it('takes the saved zones as the new baseline', () => {
    const changed = editorReducer(start(), { type: 'update', key: 'z1', patch: { name: 'X' } });
    const state = editorReducer(changed, { type: 'load', zones: changed.zones });

    expect(isDirty(state)).toBe(false);
  });
});
