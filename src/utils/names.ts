export function normalizeProfessorName(name: string): string {
  const commaIndex = name.indexOf(",");
  if (commaIndex !== -1) {
    const last = name.slice(0, commaIndex).trim();
    const first = name.slice(commaIndex + 1).trim();
    if (first && last) return `${first} ${last}`;
  }
  return name.trim();
}

export function normalizeName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[,.\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function matchProfessorName(
  searchName: string,
  rmpName: string,
): boolean {
  const searchWords = normalizeName(searchName);
  const rmpWords = normalizeName(rmpName);
  return searchWords.every((w) => rmpWords.includes(w));
}
