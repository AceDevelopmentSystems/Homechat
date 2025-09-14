// Returns true if two positions are within a given distance
export function isWithinProximity(pos1, pos2, maxDist = 3) {
  if (!pos1 || !pos2) return false;
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz) <= maxDist;
}
