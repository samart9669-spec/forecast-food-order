export class BinarySampleReader {
  constructor(private readonly view: DataView) {}
  int16(offset: number): number { return this.view.getInt16(offset, true); }
  ascii(offset: number, length: number): string {
    let value = "";
    for (let index = 0; index < length; index += 1) value += String.fromCharCode(this.view.getUint8(offset + index));
    return value.trim();
  }
}

export function scaleDigitalSample(digital: number, digitalMinimum: number, digitalMaximum: number, physicalMinimum: number, physicalMaximum: number): number {
  if (digitalMaximum === digitalMinimum) return physicalMinimum;
  return ((digital - digitalMinimum) * (physicalMaximum - physicalMinimum)) / (digitalMaximum - digitalMinimum) + physicalMinimum;
}
