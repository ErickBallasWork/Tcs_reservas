import type { FloorZoneInput } from '@/api/types';
import { z } from 'zod';
import { floorPlanAdminLabels } from '@/lib/labels';
import type { FloorResourceType, FloorZone, FloorZoneKind, Size } from '@/lib/floor-plan/types';
import { MIN_ZONE_SIZE } from '@/lib/floor-plan/editor-geometry';

const errors = floorPlanAdminLabels.errors;

export const MAX_ZONE_NAME_LENGTH = 100;
export const MIN_PLAN_DIMENSION = 100;
export const MAX_PLAN_DIMENSION = 100_000;

export interface EditorZone {
  key: string;
  id?: string;
  name: string;
  kind: FloorZoneKind;
  x: number;
  y: number;
  width: number;
  height: number;
  isReservable: boolean;
  resourceId: string | null;
}

export type ZoneInput = FloorZoneInput;

export type ZoneField = 'name' | 'x' | 'y' | 'width' | 'height' | 'isReservable' | 'resourceId';
const ZONE_FIELDS: readonly ZoneField[] = [
  'name',
  'x',
  'y',
  'width',
  'height',
  'isReservable',
  'resourceId',
];

function isZoneField(value: PropertyKey | undefined): value is ZoneField {
  return ZONE_FIELDS.some((field) => field === value);
}

export type ZoneFieldErrors = Partial<Record<ZoneField, string>>;
export type ZoneErrors = Record<string, ZoneFieldErrors>;

export type ZonesParse =
  { success: true; zones: ZoneInput[] } | { success: false; errors: ZoneErrors };

export const RESOURCE_TYPE_FOR_KIND: Partial<Record<FloorZoneKind, FloorResourceType>> = {
  ROOM: 'MEETING_ROOM',
  LAB: 'AI_LAB',
};

const integer = z.number({ error: errors.integer }).int({ error: errors.integer });

const zoneSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: errors.nameRequired })
    .max(MAX_ZONE_NAME_LENGTH, { error: errors.nameTooLong }),
  x: integer.min(0, { error: errors.outOfBounds }),
  y: integer.min(0, { error: errors.outOfBounds }),
  width: integer.min(MIN_ZONE_SIZE, { error: errors.sizeTooSmall }),
  height: integer.min(MIN_ZONE_SIZE, { error: errors.sizeTooSmall }),
});

function fieldErrors(zone: EditorZone): ZoneFieldErrors {
  const result = zoneSchema.safeParse(zone);
  const found: ZoneFieldErrors = {};
  if (result.success) return found;
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (isZoneField(field) && !(field in found)) found[field] = issue.message;
  }
  return found;
}

function boundsErrors(zone: EditorZone, plan: Size): ZoneFieldErrors {
  const found: ZoneFieldErrors = {};
  if (zone.x + zone.width > plan.width) found.width = errors.outOfBounds;
  if (zone.y + zone.height > plan.height) found.height = errors.outOfBounds;
  return found;
}

function resourceErrors(
  zone: EditorZone,
  resourceTypes: ReadonlyMap<string, FloorResourceType>,
  takenBy: ReadonlyMap<string, string>,
): ZoneFieldErrors {
  if (!zone.isReservable) return {};
  const expected = RESOURCE_TYPE_FOR_KIND[zone.kind];
  if (!expected) return { isReservable: errors.notReservableKind };
  if (!zone.resourceId) return { resourceId: errors.resourceRequired };
  if (resourceTypes.get(zone.resourceId) !== expected) return { resourceId: errors.resourceType };
  if (takenBy.get(zone.resourceId) !== zone.key) return { resourceId: errors.resourceTaken };
  return {};
}

export function toZoneInput(zone: EditorZone, sortOrder: number): ZoneInput {
  const reservable = zone.isReservable && RESOURCE_TYPE_FOR_KIND[zone.kind] !== undefined;
  return {
    ...(zone.id ? { id: zone.id } : {}),
    name: zone.name.trim(),
    kind: zone.kind,
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    isReservable: reservable,
    resourceId: reservable ? zone.resourceId : null,
    sortOrder,
  };
}

export function validateZones(
  zones: readonly EditorZone[],
  plan: Size,
  resourceTypes: ReadonlyMap<string, FloorResourceType>,
): ZonesParse {
  const takenBy = new Map<string, string>();
  for (const zone of zones) {
    if (zone.isReservable && zone.resourceId && !takenBy.has(zone.resourceId)) {
      takenBy.set(zone.resourceId, zone.key);
    }
  }
  const found: ZoneErrors = {};
  for (const zone of zones) {
    const zoneErrors = {
      ...resourceErrors(zone, resourceTypes, takenBy),
      ...boundsErrors(zone, plan),
      ...fieldErrors(zone),
    };
    if (Object.keys(zoneErrors).length > 0) found[zone.key] = zoneErrors;
  }
  if (Object.keys(found).length > 0) return { success: false, errors: found };
  return { success: true, zones: zones.map((zone, index) => toZoneInput(zone, index)) };
}

export function toEditorZone(zone: FloorZone): EditorZone {
  return {
    key: zone.id,
    id: zone.id,
    name: zone.name,
    kind: zone.kind,
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    isReservable: zone.isReservable,
    resourceId: zone.resourceId,
  };
}

const planDimension = z
  .string()
  .trim()
  .regex(/^\d+$/, { error: errors.dimensionInvalid })
  .transform(Number)
  .pipe(
    z
      .number()
      .min(MIN_PLAN_DIMENSION, { error: errors.dimensionInvalid })
      .max(MAX_PLAN_DIMENSION, { error: errors.dimensionInvalid }),
  );

const planSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: errors.nameRequired })
    .max(150, { error: errors.nameTooLong }),
  width: planDimension,
  height: planDimension,
});

export interface PlanForm {
  name: string;
  width: string;
  height: string;
}

export type PlanFormParse =
  | { success: true; data: { name: string; width: number; height: number } }
  | { success: false; errors: Partial<Record<keyof PlanForm, string>> };

export function parsePlanForm(form: PlanForm): PlanFormParse {
  const result = planSchema.safeParse(form);
  if (result.success) return { success: true, data: result.data };
  const found: Partial<Record<keyof PlanForm, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if ((field === 'name' || field === 'width' || field === 'height') && !(field in found)) {
      found[field] = issue.message;
    }
  }
  return { success: false, errors: found };
}

export interface LinkableResource {
  id: string;
  type: string;
  isActive: boolean;
}

export function linkableResources<T extends LinkableResource>(
  zone: EditorZone,
  zones: readonly EditorZone[],
  resources: readonly T[],
): T[] {
  const expected = RESOURCE_TYPE_FOR_KIND[zone.kind];
  if (!expected) return [];
  const taken = new Set(
    zones
      .filter((other) => other.key !== zone.key && other.isReservable && other.resourceId)
      .map((other) => other.resourceId),
  );
  return resources.filter(
    (resource) =>
      resource.type === expected &&
      !taken.has(resource.id) &&
      (resource.isActive || resource.id === zone.resourceId),
  );
}
