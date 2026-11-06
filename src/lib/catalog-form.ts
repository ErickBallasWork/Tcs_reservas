import { z } from 'zod';
import type { CreateBuildingBody, CreateResourceBody, ResourceType } from '@/api/types';
import { catalogAdminLabels as labels } from '@/lib/labels';

const MAX_NAME_LENGTH = 150;
const MAX_ADDRESS_LENGTH = 300;
const MAX_TEXT_LENGTH = 500;
const MAX_ASSET_TAG_LENGTH = 50;

export interface BuildingForm {
  name: string;
  address: string;
}

export interface RoomOrLabForm {
  type: Exclude<ResourceType, 'LAPTOP'> | '';
  name: string;
  buildingId: string;
  capacity: string;
  equipment: string;
  rules: string;
}

export interface LaptopForm {
  name: string;
  assetTag: string;
  labId: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormParse<Form, Body> =
  { success: true; data: Body } | { success: false; errors: FormErrors<Form> };

const name = z
  .string()
  .trim()
  .min(1, { error: labels.errors.nameRequired })
  .max(MAX_NAME_LENGTH, { error: labels.errors.nameTooLong });

const buildingSchema = z.object({
  name,
  address: z.string().trim().max(MAX_ADDRESS_LENGTH, { error: labels.errors.addressTooLong }),
});

const roomOrLabSchema = z.object({
  type: z.enum(['MEETING_ROOM', 'AI_LAB'], { error: labels.errors.typeRequired }),
  name,
  buildingId: z.string().min(1, { error: labels.errors.buildingRequired }),
  capacity: z
    .string()
    .trim()
    .regex(/^[1-9]\d{0,5}$/, { error: labels.errors.capacityInvalid })
    .transform(Number),
  equipment: z.string().trim().max(MAX_TEXT_LENGTH, { error: labels.errors.equipmentTooLong }),
  rules: z.string().trim().max(MAX_TEXT_LENGTH, { error: labels.errors.rulesTooLong }),
});

const laptopSchema = z.object({
  name,
  assetTag: z.string().trim().max(MAX_ASSET_TAG_LENGTH, { error: labels.errors.assetTagTooLong }),
  labId: z.string().min(1, { error: labels.errors.labRequired }),
});

function firstErrors<Form extends object>(
  issues: readonly { path: PropertyKey[]; message: string }[],
): FormErrors<Form> {
  const errors: FormErrors<Form> = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof Form;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function parseBuildingForm(form: BuildingForm): FormParse<BuildingForm, BuildingForm> {
  const result = buildingSchema.safeParse(form);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: firstErrors(result.error.issues) };
}

export function parseRoomOrLabForm(
  form: RoomOrLabForm,
): FormParse<RoomOrLabForm, CreateResourceBody> {
  const result = roomOrLabSchema.safeParse(form);
  if (!result.success) return { success: false, errors: firstErrors(result.error.issues) };
  const { equipment, rules, ...rest } = result.data;
  return {
    success: true,
    data: { ...rest, equipment: equipment || undefined, rules: rules || undefined },
  };
}

export function parseLaptopForm(form: LaptopForm): FormParse<LaptopForm, CreateResourceBody> {
  const result = laptopSchema.safeParse(form);
  if (!result.success) return { success: false, errors: firstErrors(result.error.issues) };
  return {
    success: true,
    data: {
      type: 'LAPTOP',
      name: result.data.name,
      parentResourceId: result.data.labId,
      assetTag: result.data.assetTag || undefined,
    },
  };
}

export function toCreateBuildingBody(form: BuildingForm): CreateBuildingBody {
  return { name: form.name, address: form.address || undefined };
}
