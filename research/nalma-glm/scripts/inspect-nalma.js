// Inspeciono um arquivo NALMA local sem depender de credenciais ou bibliotecas externas.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";
import { parseNalmaAscii, parseNalmaGzip } from "../processors/parse-nalma.js";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node --experimental-default-type=module research/nalma-glm/scripts/inspect-nalma.js /caminho/NALMA_YYMMDD_hhmmss_####.dat.gz");
  process.exitCode = 2;
} else {
  try {
    const bytes = readFileSync(file);
    const filename = basename(file);
    const data = file.endsWith(".gz")
      ? parseNalmaGzip(bytes, { filename })
      : parseNalmaAscii(bytes.toString("utf8"), { filename });
    const { sources, metadata } = data;
    const range = (key) => sources.length
      ? sources.reduce(([lo, hi], s) => [Math.min(lo, s[key]), Math.max(hi, s[key])], [Infinity, -Infinity])
      : null;
    const timeRange = sources.length
      ? sources.reduce(([lo, hi], s) => [lo < s.time_utc ? lo : s.time_utc, hi > s.time_utc ? hi : s.time_utc], [sources[0].time_utc, sources[0].time_utc])
      : null;
    const summary = {
      ...metadata,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      time_range_utc: timeRange,
      latitude_range: range("latitude"),
      longitude_range: range("longitude"),
      altitude_range_m: range("altitude_m"),
      // Sem agrupamento por descarga ou correspondência GLM, apenas estatísticas de fontes.
      classification: "not_computed"
    };
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error("Falha na inspeção NALMA:", error.message);
    process.exitCode = 1;
  }
}
