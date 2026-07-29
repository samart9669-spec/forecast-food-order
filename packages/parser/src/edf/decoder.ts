import { BinarySampleReader } from "./sample-reader";
import { mapSignals, type EdfSignalDefinition } from "./signal-map";
import { EdfSignalReader } from "./signal-reader";

export type EdfHeader = { version: string; patientId: string; recordingId: string; startDate: string; startTime: string; headerBytes: number; recordCount: number; recordDurationSeconds: number; signalCount: number; signals: EdfSignalDefinition[] };
export type DecodedEdf = { header: EdfHeader; reader: EdfSignalReader };

const parseNumber = (value: string): number => Number.parseFloat(value.trim()) || 0;
const field = (reader: BinarySampleReader, offset: number, length: number): string => reader.ascii(offset, length);

export function decodeEdf(bytes: Uint8Array): DecodedEdf {
  if (bytes.byteLength < 256) throw new Error("EDF file is too small to contain a header");
  const reader = new BinarySampleReader(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  const headerBytes = Number.parseInt(field(reader, 184, 8), 10);
  const recordCount = Number.parseInt(field(reader, 236, 8), 10);
  const recordDurationSeconds = parseNumber(field(reader, 244, 8));
  const signalCount = Number.parseInt(field(reader, 252, 4), 10);
  if (!Number.isFinite(headerBytes) || !Number.isFinite(signalCount) || signalCount <= 0) throw new Error("Invalid EDF header");
  const readSignalFields = (start: number, width: number): string[] => Array.from({ length: signalCount }, (_, index) => field(reader, start + index * width, width));
  let cursor = 256;
  const labels = readSignalFields(cursor, 16); cursor += signalCount * 16;
  cursor += signalCount * 80; // transducer
  const units = readSignalFields(cursor, 8); cursor += signalCount * 8;
  const physicalMinimums = readSignalFields(cursor, 8).map(parseNumber); cursor += signalCount * 8;
  const physicalMaximums = readSignalFields(cursor, 8).map(parseNumber); cursor += signalCount * 8;
  const digitalMinimums = readSignalFields(cursor, 8).map(parseNumber); cursor += signalCount * 8;
  const digitalMaximums = readSignalFields(cursor, 8).map(parseNumber); cursor += signalCount * 8;
  cursor += signalCount * 80; // prefilter
  const samplesPerRecords = readSignalFields(cursor, 8).map((value) => Number.parseInt(value, 10) || 0);
  const baseSignals = labels.map((label, index) => ({ index, label, unit: units[index] ?? "", physicalMinimum: physicalMinimums[index] ?? 0, physicalMaximum: physicalMaximums[index] ?? 0, digitalMinimum: digitalMinimums[index] ?? 0, digitalMaximum: digitalMaximums[index] ?? 0, samplesPerRecord: samplesPerRecords[index] ?? 0, sampleRate: recordDurationSeconds > 0 ? (samplesPerRecords[index] ?? 0) / recordDurationSeconds : 0 }));
  const signals = mapSignals(baseSignals);
  const header: EdfHeader = { version: field(reader, 0, 8), patientId: field(reader, 8, 80), recordingId: field(reader, 88, 80), startDate: field(reader, 168, 8), startTime: field(reader, 176, 8), headerBytes, recordCount, recordDurationSeconds, signalCount, signals };
  return { header, reader: new EdfSignalReader(bytes, headerBytes, Math.max(0, recordCount), recordDurationSeconds, signals) };
}
