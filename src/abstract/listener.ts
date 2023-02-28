import { ClientEvents } from '../index';

export abstract class Listener {
  constructor(private eventName: keyof ClientEvents) {}

  abstract execute(...args: any): Promise<any>;

  get name() {
    return this.eventName;
  }
}
