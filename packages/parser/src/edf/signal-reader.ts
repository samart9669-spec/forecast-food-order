import { scaleDigitalSample } from "./sample-reader";
import type { EdfSignalDefinition, NormalizedSignalName } from "./signal-map";

export type SignalChunk = { signal: EdfSignalDefinition; startSample: number; samples: Float32Array };

export class EdfSignalReader {
  constructor(private readonly bytes: Uint8Array, private readonly headerBytes: number, private readonly recordCount: number, private readonly recordDurationSeconds: number, private readonly signals: EdfSignalDefinition[]) {}

  readSignal(name: NormalizedSignalName, startRecord = 0, recordLimit = this.recordCount): SignalChunk | null {
    const signal = this.signals.find((candidate) => candidate.normalizedName === name);
    if (!signal) return null;
    return this.readSignalByIndex(signal.index, startRecord, recordLimit);
  }

  readSignalByIndex(signalIndex: number, startRecord = 0, recordLimit = this.recordCount): SignalChunk {
    const signal = this.signals[signalIndex];
    if (!signal) throw new Error(`Signal index ${signalIndex} is out of range`);
    const safeStart = Math.max(0, Math.min(startRecord, this.recordCount));
    const safeRecords = Math.max(0, Math.min(recordLimit, this.recordCount - safeStart));
    const samples = new Float32Array(safeRecords * signal.samplesPerRecord);
    const view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    const recordSize = this.signals.reduce((total, current) => total + current.samplesPerRecord * 2, 0);
    const beforeSignalBytes = this.signals.slice(0, signalIndex).reduce((total, current) => total + current.samplesPerRecord * 2, 0);
    let writeOffset = 0;
    for (let record = 0; record < safeRecords; record += 1) {
      let offset = this.headerBytes + (safeStart + record) * recordSize + beforeSignalBytes;
      for (let sample = 0; sample < signal.samplesPerRecord; sample += 1) {
        const digital = view.getInt16(offset, true);
        samples[writeOffset] = scaleDigitalSample(digital, signal.digitalMinimum, signal.digitalMaximum, signal.physicalMinimum, signal.physicalMaximum);
        offset += 2;
        writeOffset += 1;
      }
    }
    return { signal, startSample: safeStart * signal.samplesPerRecord, samples };
  }

  get durationSeconds(): number { return this.recordCount * this.recordDurationSeconds; }
}
