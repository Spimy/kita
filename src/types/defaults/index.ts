import { DefaultEvents } from './events';
import { DefaultHelpCommand } from './help-command';

export interface Defaults {
  helpCommand?: DefaultHelpCommand;
  events?: DefaultEvents;
}

export { DefaultEvents, DefaultHelpCommand };
