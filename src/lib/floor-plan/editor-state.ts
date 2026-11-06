import type { FloorZoneKind, Rect } from '@/lib/floor-plan/types';
import { RESOURCE_TYPE_FOR_KIND, type EditorZone } from '@/lib/floor-plan/zone-schema';

export interface EditorState {
  zones: EditorZone[];
  baseline: EditorZone[];
  selectedKey: string | null;
  createdCount: number;
}

export type EditorAction =
  | { type: 'load'; zones: EditorZone[] }
  | { type: 'select'; key: string | null }
  | { type: 'add'; rect: Rect; name: string }
  | { type: 'update'; key: string; patch: Partial<Omit<EditorZone, 'key' | 'id'>> }
  | { type: 'remove'; key: string }
  | { type: 'discard' };

export function initialEditorState(zones: EditorZone[]): EditorState {
  return { zones, baseline: zones, selectedKey: null, createdCount: 0 };
}

function canBeReservable(kind: FloorZoneKind): boolean {
  return RESOURCE_TYPE_FOR_KIND[kind] !== undefined;
}

function applyZonePatch(
  zone: EditorZone,
  patch: Partial<Omit<EditorZone, 'key' | 'id'>>,
): EditorZone {
  const next = { ...zone, ...patch };
  if (!canBeReservable(next.kind)) return { ...next, isReservable: false, resourceId: null };
  if (next.kind !== zone.kind || !next.isReservable) return { ...next, resourceId: null };
  return next;
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'load':
      return initialEditorState(action.zones);
    case 'select':
      return { ...state, selectedKey: action.key };
    case 'add': {
      const key = `new-${state.createdCount + 1}`;
      const zone: EditorZone = {
        key,
        name: action.name,
        kind: 'DECORATIVE',
        ...action.rect,
        isReservable: false,
        resourceId: null,
      };
      return {
        ...state,
        zones: [...state.zones, zone],
        selectedKey: key,
        createdCount: state.createdCount + 1,
      };
    }
    case 'update':
      return {
        ...state,
        zones: state.zones.map((zone) =>
          zone.key === action.key ? applyZonePatch(zone, action.patch) : zone,
        ),
      };
    case 'remove':
      return {
        ...state,
        zones: state.zones.filter((zone) => zone.key !== action.key),
        selectedKey: state.selectedKey === action.key ? null : state.selectedKey,
      };
    case 'discard':
      return { ...state, zones: state.baseline, selectedKey: null };
  }
}

export function isDirty(state: EditorState): boolean {
  return JSON.stringify(state.zones) !== JSON.stringify(state.baseline);
}

export function selectedZone(state: EditorState): EditorZone | null {
  return state.zones.find((zone) => zone.key === state.selectedKey) ?? null;
}
