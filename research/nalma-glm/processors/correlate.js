// Correlaciono agrupamentos VHF e flashes GLM por proximidade temporal e espacial.
// Este módulo experimental não identifica descargas nuvem-solo.
export function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function correlate(clusters, flashes, options = {}) {
  const maxDistanceKm = options.maxDistanceKm ?? 25;
  const maxGapMs = options.maxGapMs ?? 1000;
  if (!(maxDistanceKm > 0) || !(maxGapMs >= 0)) throw new Error("Limites inválidos");
  const matches = [];
  for (const c of clusters) for (const f of flashes) {
    const cs = Date.parse(c.start_time_utc), ce = Date.parse(c.end_time_utc);
    const fs = Date.parse(f.start_time_utc), fe = Date.parse(f.end_time_utc);
    if (![cs, ce, fs, fe].every(Number.isFinite) || ce < cs || fe < fs) throw new Error("Intervalo UTC inválido");
    const overlap = Math.max(0, Math.min(ce, fe) - Math.max(cs, fs));
    const gap = Math.max(0, Math.max(cs, fs) - Math.min(ce, fe));
    const distance = distanceKm(c, f);
    if (gap > maxGapMs || distance > maxDistanceKm) continue;
    const score = Math.max(0, 1 - distance / maxDistanceKm) *
      (maxGapMs === 0 ? 1 : Math.max(0, 1 - gap / (maxGapMs + 1)));
    matches.push({
      match_id: c.nalma_cluster_id + "::" + f.flash_id,
      nalma_cluster_id: c.nalma_cluster_id, glm_flash_id: f.flash_id,
      time_difference_ms: gap, distance_km: distance, time_overlap_ms: overlap,
      match_score: score, classification: "unknown", algorithm_version: "0.1.0"
    });
  }
  return matches.sort((a, b) => b.match_score - a.match_score);
}
