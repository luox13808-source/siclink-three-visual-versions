type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

export function isLowBandwidth() {
  if (typeof navigator === "undefined") return false;

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!connection) return false;

  if (connection.saveData) return true;

  const effectiveType = connection.effectiveType ?? "";
  return effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g";
}

export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}
