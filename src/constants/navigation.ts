export const sectionIds = ["hero", "position", "core", "open-source", "community"] as const;

export function buildNavItems(labels: string[], basePath = "") {
  const prefix = basePath || "/";
  return labels.map((label, index) => ({
    label,
    href: `${prefix}#${sectionIds[index]}`,
  }));
}
