import type { components } from '@/api/schema';

type Schemas = components['schemas'];

export type ResourceType = Schemas['ResourceType'];
export type Role = Schemas['Role'];
export type ErrorCode = Schemas['ErrorCode'];
export type ApiErrorBody = Schemas['ApiErrorResponseDto'];
export type CatalogBuilding = Schemas['CatalogBuildingNodeDto'];
export type CatalogResource = Schemas['CatalogResourceNodeDto'];
export type CatalogLaptop = Schemas['ResourceResponseDto'];
export type CurrentUser = Schemas['CurrentUserResponseDto'];
export type Session = Schemas['SessionResponseDto'];
