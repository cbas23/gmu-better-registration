export function normalizeTableProf(name: string): string {
  return splitTableProf(name).join(" ");
}

function splitTableProf(name: string): string[] {
  const cleaned = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  const commaIndex = cleaned.indexOf(",");
  if (commaIndex !== -1) {
    const last = cleaned.slice(0, commaIndex).trim().split(/\s+/);
    const first = cleaned
      .slice(commaIndex + 1)
      .trim()
      .split(/\s+/);
    return [...first, ...last];
  }
  return cleaned.split(/\s+/);
}

function splitRMPProf(name: string): string[] {
  return name.split(/\s+/);
}

export function matchProfessorName(
  tableProfName: string,
  rmpProfName: string,
): boolean {
  const a = splitTableProf(tableProfName.trim()).map((w) => w.toLowerCase());
  const b = splitRMPProf(rmpProfName.trim()).map((w) => w.toLowerCase());

  // console.log("comp prof: ", a, b);

  if (a.length === 0 || b.length === 0) return false;
  if (a[0] !== b[0]) return false;

  const restA = new Set(a.slice(1));
  const restB = new Set(b.slice(1));

  return (
    [...restA].some((w) => restB.has(w)) || [...restB].some((w) => restA.has(w))
  );
}
