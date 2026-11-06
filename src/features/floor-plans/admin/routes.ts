export const FLOOR_PLANS_HREF = '/admin/floor-plans';

export function editorHref(planId: string): string {
  return `${FLOOR_PLANS_HREF}?id=${encodeURIComponent(planId)}`;
}
