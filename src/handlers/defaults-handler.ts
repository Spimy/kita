import { HelpCommand } from '../presets';
import { ReadyEvent } from '../presets/events/ready';
import { MessageCreateEvent } from '../presets/events/message-create';
import { ModulesHandler } from './modules-handler';
import { Defaults } from '../types/defaults';
import { KitaClient } from '../client';
import { InteractionCreateEvent } from '../presets/events/interaction-create';

export class DefaultsHandler {
  constructor(
    private client: KitaClient,
    private modulesHandler: ModulesHandler,
    defaultsConfig?: Defaults
  ) {
    if (!defaultsConfig) return;
    this.loadDefaults(defaultsConfig);
  }

  private loadDefaults(defaultsConfig: Defaults) {
    this.loadDefaultCommands(defaultsConfig);
    this.loadDefaultEvents(defaultsConfig);
  }

  private loadDefaultCommands(defaultsConfig: Defaults) {
    const { helpCommand } = defaultsConfig;

    if (helpCommand?.enabled) {
      if (
        this.modulesHandler.classicCommands.size > 0 &&
        !this.modulesHandler.classicCommands.has('help')
      ) {
        const command = new HelpCommand(this.client, helpCommand.description);
        this.modulesHandler.registerCommand(command);
      }
    }
  }

  private loadDefaultEvents(defaultsConfig: Defaults) {
    const { events } = defaultsConfig;
    if (!events) return;

    if (events.ready?.enabled && !this.modulesHandler.hasRegisteredEvent('ready')) {
      this.modulesHandler.registerEvent(
        new ReadyEvent(this.client, events.ready.slashCommands)
      );
    }

    if (
      events.messageCreate?.enabled &&
      !this.modulesHandler.hasRegisteredEvent('messageCreate')
    ) {
      this.modulesHandler.registerEvent(new MessageCreateEvent(this.client));
    }

    if (
      events.interactionCreate?.enabled &&
      !this.modulesHandler.hasRegisteredEvent('interactionCreate')
    ) {
      this.modulesHandler.registerEvent(new InteractionCreateEvent(this.client));
    }
  }
}
