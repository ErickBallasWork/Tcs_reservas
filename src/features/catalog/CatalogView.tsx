'use client';

import { messageForError } from '@/api/error-messages';
import type { CatalogBuilding, CatalogResource } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCatalogTree } from '@/features/catalog/useCatalogTree';
import { catalogLabels, catalogResourceTypeLabels } from '@/lib/labels';

function ResourceItem({ resource }: { resource: CatalogResource }) {
  const laptops = resource.children;
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{resource.name}</span>
        <div className="flex gap-2">
          <Tag variant={resource.type === 'AI_LAB' ? 'gold' : 'default'}>
            {catalogResourceTypeLabels[resource.type]}
          </Tag>
          <Tag variant="dark">{catalogLabels.capacity(resource.capacity)}</Tag>
        </div>
      </div>
      {resource.equipment && <p className="text-sm text-muted-foreground">{resource.equipment}</p>}
      {laptops.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-muted-foreground">
            {catalogLabels.laptops(laptops.length)}
          </span>
          <ul className="flex flex-wrap gap-2">
            {laptops.map((laptop) => (
              <li key={laptop.id}>
                <Tag>{laptop.name}</Tag>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function BuildingCard({ building }: { building: CatalogBuilding }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{building.name}</CardTitle>
        {building.address && <p className="text-sm text-muted-foreground">{building.address}</p>}
      </CardHeader>
      <CardContent>
        {building.resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">{catalogLabels.noResources}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {building.resources.map((resource) => (
              <ResourceItem key={resource.id} resource={resource} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CatalogView() {
  const { data, error, isPending, isFetching, refetch } = useCatalogTree();

  if (isPending && !error) {
    return <p role="status">{catalogLabels.loading}</p>;
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p>{messageForError(error)}</p>
        <Button className="min-h-11" disabled={isFetching} onClick={() => void refetch()}>
          {catalogLabels.retry}
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return <p>{catalogLabels.empty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((building) => (
        <BuildingCard key={building.id} building={building} />
      ))}
    </div>
  );
}
