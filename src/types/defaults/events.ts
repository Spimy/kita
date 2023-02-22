import { DefaultReady } from './events/ready';

export interface DefaultEvents {
  ready?: DefaultReady;
  messageCreate?: { enabled: boolean };
  interactionCreate?: { enabled: boolean };
}
