// Leio fontes VHF NALMA processadas (full-rate/NRT), sem confundir fontes com flashes.
// Referência de campos: NASA GHRC NALMA Dataset Collection Data User Guide (2022), Tabela 6.
import { gunzipSync } from "node:zlib";

const filenamePattern = /(?:^|[/\\])NALMA_(\d{2})(\d{2})(\d{2})_\d{6}_\d{4}\.dat(?:\.gz)?$/i;

function dateFromFilename(filename) {
  const match = filenamePattern.exec(filename ?? "");
  if (!match) throw new Error("Nome NALMA processado inválido; informe dateUtc explicitamente");
  const year = 2000 + Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("Data UTC inválida no nome do arquivo");
  }
  return date.toISOString().slice(0, 10);
}

function normalizeDate(dateUtc) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateUtc)) throw new Error("dateUtc deve ser AAAA-MM-DD");
  const d = new Date(dateUtc + "T00:00:00.000Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== dateUtc) throw new Error("dateUtc inválida");
  return d.getTime();
}

function countMaskBits(hex) {
  let bits = BigInt("0x" + hex.replace(/^0x/i, ""));
  let n = 0;
  while (bits > 0n) { n += Number(bits & 1n); bits >>= 1n; }
  return n;
}

export function parseNalmaAscii(text, { filename = null, dateUtc = null } = {}) {
  if (typeof text !== "string") throw new TypeError("Conteúdo NALMA deve ser texto ASCII");
  const day = normalizeDate(dateUtc ?? dateFromFilename(filename));
  const lines = text.split(/\r?\n/);
  const marker = lines.findIndex(line => /^\s*\*{3}\s*data\s*\*{3}\s*$/i.test(line));
  if (marker < 0) throw new Error("Marcador *** data *** não encontrado");
  const header = lines.slice(0, marker).join("\n");
  const count = /number\s+of\s+events\s*:\s*(\d+)/i.exec(header);
  const format = /data\s+format\s*:\s*(.+)/i.exec(header);
  const sources = [];
  for (let i = marker + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const fields = line.split(/\s+/);
    if (fields.length !== 7) throw new Error(`Linha ${i + 1}: esperados 7 campos, recebidos ${fields.length}`);
    const [seconds, lat, lon, alt, chi2, power] = fields.slice(0, 6).map(Number);
    const mask = fields[6];
    if (![seconds, lat, lon, alt, chi2, power].every(Number.isFinite) ||
        seconds < 0 || seconds >= 86400 || Math.abs(lat) > 90 || Math.abs(lon) > 180 ||
        chi2 < 0 || !/^(?:0x)?[0-9a-f]+$/i.test(mask)) {
      throw new Error(`Linha ${i + 1}: fonte VHF com campos inválidos`);
    }
    sources.push({
      source_id: `${filename ?? "nalma"}:${sources.length + 1}`,
      source_file: filename,
      time_seconds_of_day: seconds,
      // UTC em milissegundos para integração JS; manter segundos originais para precisão sub-ms.
      time_utc: new Date(day + Math.round(seconds * 1000)).toISOString(),
      latitude: lat, longitude: lon, altitude_m: alt,
      reduced_chi2: chi2, power_dbw: power,
      station_mask_hex: mask.replace(/^0x/i, "").toUpperCase(),
      station_count: countMaskBits(mask)
    });
  }
  if (count && Number(count[1]) !== sources.length) {
    throw new Error(`Contagem inconsistente: cabeçalho=${count[1]}, lidas=${sources.length}`);
  }
  return {
    metadata: {
      filename, date_utc: new Date(day).toISOString().slice(0, 10),
      header_event_count: count ? Number(count[1]) : null,
      header_data_format: format?.[1]?.trim() ?? null,
      source_count: sources.length,
      time_precision_note: "UTC ISO arredondado a milissegundos; usar time_seconds_of_day para precisão original"
    },
    sources
  };
}

export function parseNalmaGzip(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw new TypeError("Arquivo gzip deve ser Buffer ou Uint8Array");
  }
  return parseNalmaAscii(gunzipSync(buffer).toString("utf8"), options);
}
