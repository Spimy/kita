import { ClientOptions } from '../index';
import { DefaultHelpCommand } from './defaults/help-command';
import { DefaultEvents } from './defaults/events';

export interface KitaClientOptions extends ClientOptions {
  root: string;
  prefix?: string;
  defaults?: {
    helpCommand?: DefaultHelpCommand;
    events?: DefaultEvents;
  };
}

export enum KitaClientModules {
  COMMANDS = 'commands',
  EVENTS = 'events'
}
