import type { CatalogBuilding, ResourceType } from '@/api/types';

export interface BookableResource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  buildingId: string;
  buildingName: string;
  labName: string | null;
}

export function bookableResources(tree: readonly CatalogBuilding[]): BookableResource[] {
  return tree
    .filter((building) => building.isActive)
    .flatMap((building) =>
      building.resources
        .filter((resource) => resource.isActive)
        .flatMap((resource) => {
          const own: BookableResource = {
            id: resource.id,
            name: resource.name,
            type: resource.type,
            capacity: resource.capacity,
            buildingId: building.id,
            buildingName: building.name,
            labName: null,
          };
          const laptops = resource.children
            .filter((laptop) => laptop.isActive)
            .map((laptop): BookableResource => ({
              id: laptop.id,
              name: laptop.name,
              type: laptop.type,
              capacity: laptop.capacity,
              buildingId: building.id,
              buildingName: building.name,
              labName: resource.name,
            }));
          return [own, ...laptops];
        }),
    );
}

export function resourceLabel(resource: BookableResource): string {
  const place = resource.labName ?? resource.buildingName;
  return `${resource.name} · ${place}`;
}
