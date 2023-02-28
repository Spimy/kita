import { ClientOptions } from '../index';
import { Defaults } from './defaults';

export interface KitaClientOptions extends ClientOptions {
  root: string;
  prefix?: string;
  defaults?: Defaults;
}

export enum KitaClientModules {
  COMMANDS = 'commands',
  EVENTS = 'events'
}
