import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { parseNalmaAscii, parseNalmaGzip } from "../processors/parse-nalma.js";
import { correlate } from "../processors/correlate.js";

const filename = "NALMA_250501_120000_3600.dat.gz";
const synthetic = [
  "Data start time: 05/01/25 12:00:00",
  "Number of events: 2",
  "Data format: time lat lon alt reduced_chi2 P mask",
  "*** data ***",
  "43200.123456 34.7000 -86.6000 4200 0.5 -15.0 00ff",
  "43200.223456 34.7010 -86.6010 4000 1.0 -12.5 000f"
].join("\n");

test("interpreta campos oficiais documentados em amostra sintética", () => {
  const result = parseNalmaAscii(synthetic, { filename });
  assert.equal(result.sources.length, 2);
  assert.equal(result.sources[0].time_utc, "2025-05-01T12:00:00.123Z");
  assert.equal(result.sources[0].time_seconds_of_day, 43200.123456);
  assert.equal(result.sources[0].station_count, 8);
  assert.equal(result.sources[1].altitude_m, 4000);
  assert.equal(result.sources[1].power_dbw, -12.5);
});

test("descompacta gzip de exemplo sintético", () => {
  const result = parseNalmaGzip(gzipSync(synthetic), { filename });
  assert.equal(result.metadata.source_count, 2);
});

test("arquivo sem eventos é válido", () => {
  const result = parseNalmaAscii("Number of events: 0\n*** data ***\n", { filename });
  assert.equal(result.sources.length, 0);
});

test("rejeita contagem divergente", () => {
  assert.throws(() => parseNalmaAscii(synthetic.replace("events: 2", "events: 3"), { filename }), /Contagem inconsistente/);
});

test("rejeita latitude inválida", () => {
  assert.throws(() => parseNalmaAscii(synthetic.replace("34.7000", "94.7000"), { filename }), /campos inválidos/);
});

test("rejeita linha incompleta", () => {
  assert.throws(() => parseNalmaAscii(synthetic.replace("-15.0 00ff", "-15.0"), { filename }), /7 campos/);
});

test("rejeita data impossível no nome do arquivo", () => {
  assert.throws(() => parseNalmaAscii(synthetic, { filename: "NALMA_250230_120000_3600.dat.gz" }), /Data UTC inválida/);
});

test("correlaciona cluster derivado de fontes sintéticas com flash sintético GLM", () => {
  const { sources } = parseNalmaAscii(synthetic, { filename });
  const cluster = [{
    nalma_cluster_id: "sintetico-1",
    latitude: sources.reduce((a, x) => a + x.latitude, 0) / sources.length,
    longitude: sources.reduce((a, x) => a + x.longitude, 0) / sources.length,
    start_time_utc: sources[0].time_utc,
    end_time_utc: sources[1].time_utc
  }];
  const flashes = [{
    flash_id: "glm-sintetico-1", latitude: 34.7, longitude: -86.6,
    start_time_utc: "2025-05-01T12:00:00.100Z",
    end_time_utc: "2025-05-01T12:00:00.300Z"
  }];
  const matches = correlate(cluster, flashes);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].classification, "unknown");
  assert.equal(matches[0].time_overlap_ms, 100);
  assert.ok(matches[0].distance_km < 1);
});
