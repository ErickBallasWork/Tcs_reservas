import { catalogAdminLabels as labels } from '@/lib/labels';

interface CatalogItemActionsProps {
  isActive: boolean;
  toggleDisabled?: boolean;
  onEdit: () => void;
  onToggle: () => void;
}

export function CatalogItemActions({
  isActive,
  toggleDisabled = false,
  onEdit,
  onToggle,
}: CatalogItemActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      <button
        type="button"
        className="btn btn-outline"
        disabled={toggleDisabled}
        onClick={onToggle}
      >
        {isActive ? labels.toggle.confirmDeactivate : labels.toggle.confirmActivate}
      </button>
      <button type="button" className="btn btn-gold" onClick={onEdit}>
        {labels.edit}
      </button>
    </div>
  );
}
