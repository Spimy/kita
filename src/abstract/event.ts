import { ClientEvents } from '../index';

export abstract class Event {
  constructor(private eventName: keyof ClientEvents) {}

  abstract execute(...args: any): Promise<any>;

  get name() {
    return this.eventName;
  }
}
