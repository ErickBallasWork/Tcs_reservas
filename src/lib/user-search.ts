interface Searchable {
  fullName: string;
  email: string;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function matchesSearch(user: Searchable, query: string): boolean {
  const needle = normalize(query.trim());
  if (!needle) return true;
  return normalize(`${user.fullName} ${user.email}`).includes(needle);
}
