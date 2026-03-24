export const PRIORITY = {
  low: { label: "Low", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  high: { label: "High", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
} as const;

export type Priority = keyof typeof PRIORITY;

export const ROLES = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
} as const;

export type Role = keyof typeof ROLES;
