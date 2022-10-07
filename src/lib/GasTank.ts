import { GasTankProps } from '../types';

export class GasTank {
  #gasTankName: string;
  #apiKey: string;
  #fundingKey: string;

  constructor(gasTank: GasTankProps) {
    this.#gasTankName = gasTank.gasTankName;
    this.#apiKey = gasTank.apiKey;
    this.#fundingKey = gasTank.fundingKey;
  }

  get gasTankName(): string {
    return this.#gasTankName;
  }

  set gasTankName(gasTankName: string) {
    this.#gasTankName = gasTankName;
  }

  get apiKey(): string {
    return this.#apiKey;
  }

  set apiKey(apiKey: string) {
    this.#apiKey = apiKey;
  }

  get fundingKey(): string {
    return this.#fundingKey;
  }

  set fundingKey(fundingKey: string) {
    this.#fundingKey = fundingKey;
  }

  public toString(): string {
    return `GasTank: ${this.#gasTankName}, apiKey: ${
      this.#apiKey
    }, fundingKey: ${this.#fundingKey}`;
  }
}
