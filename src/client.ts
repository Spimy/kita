import path from 'path';
import glob from 'glob';

import { Client, ClientEvents, Collection, SlashCommand } from './index';
import { Command } from './abstract/commands/command';
import { KitaClientOptions, KitaClientModules } from './types/kita-client';
import { InvalidPathError } from './errors/invalid-path-error';
import { Event } from './abstract/event';
import { HelpCommand } from './presets/commands/help';
import { ReadyEvent } from './presets/events/ready';
import { MessageCreateEvent } from './presets/events/message-create';
import { InteractionCreateEvent } from './presets/events/interaction-create';

export class KitaClient extends Client {
  private readonly DEFAULT_PREFIX: string = '>';

  private readonly _classicCommands: Collection<string, Command> = new Collection();
  private readonly _commandAliases: Collection<string, string> = new Collection();
  private readonly _slashCommands: Collection<String, SlashCommand> = new Collection();

  private readonly registeredEvents: (keyof ClientEvents)[] = [];

  constructor(private readonly clientOptions: KitaClientOptions) {
    super(clientOptions);
    this.clientOptions = clientOptions;

    this.loadModule(KitaClientModules.COMMANDS);
    this.loadModule(KitaClientModules.EVENTS);
  }

  private loadModule(module: KitaClientModules) {
    const folderPath = path.join(this.clientOptions.root, module);

    glob(path.join(folderPath, '**', '*.{js,ts}'), (err, files) => {
      if (err) throw new InvalidPathError('Path provided not found');

      files.forEach((file) => {
        const module = require(file).default;
        if (!module) {
          return console.warn('Please export your command or event as default.');
        }

        if (module.prototype instanceof Command) {
          const command: Command = new module(this);
          this.registerCommand(command, file);
          return;
        }

        if (module.prototype instanceof SlashCommand) {
          const command: SlashCommand = new module(this);
          this.registerCommand(command);
          return;
        }

        if (module.prototype instanceof Event) {
          const event: Event = new module(this);
          this.registerEvent(event);
          return;
        }
      });

      this.loadDefaults();
    });
  }

  private registerCommand(command: Command | SlashCommand, filePath?: string) {
    if (command instanceof SlashCommand) {
      // Save the slash commands in a collection
      this.slashCommands.set(command.info.name, command);
      return;
    }

    // Automatically set category where applicable
    // i.e. where the folder the command resides in is not named 'commands'
    if (filePath) {
      const folderName = path.basename(path.join(filePath, '..')).toLowerCase();
      const category =
        folderName === KitaClientModules.COMMANDS
          ? undefined
          : folderName.charAt(0).toUpperCase() + folderName.slice(1);
      command.info.category ??= category;
    }

    // Save the commands in a collection
    this.classicCommands.set(command.info.name, command);

    // Save the aliases to redirect to the appropriate
    // command name in a collection
    if (!command.info.aliases) return;
    for (const alias of command.info.aliases) {
      this.aliases.set(alias, command.info.name);
    }
  }

  private registerEvent(event: Event) {
    this.on(event.name, async (...args) => event.execute(...args));
    this.registeredEvents.push(event.name);
  }

  private loadDefaults() {
    if (!this.clientOptions.defaults) return;
    const { helpCommand, events } = this.clientOptions.defaults;

    if (helpCommand?.enabled) {
      if (this.classicCommands.size > 0 && !this.classicCommands.has('help')) {
        const command = new HelpCommand(this, helpCommand.description);
        this.registerCommand(command);
      }
    }

    if (events?.ready?.enabled && !this.registeredEvents.includes('ready')) {
      this.registerEvent(new ReadyEvent(this, events.ready.slashCommands));
    }

    if (
      events?.messageCreate?.enabled &&
      !this.registeredEvents.includes('messageCreate')
    ) {
      this.registerEvent(new MessageCreateEvent(this));
    }

    if (
      events?.interactionCreate?.enabled &&
      !this.registeredEvents.includes('interactionCreate')
    ) {
      this.registerEvent(new InteractionCreateEvent(this));
    }
  }

  get prefix() {
    return this.clientOptions.prefix || this.DEFAULT_PREFIX;
  }

  get classicCommands() {
    return this._classicCommands;
  }

  get aliases() {
    return this._commandAliases;
  }

  get slashCommands() {
    return this._slashCommands;
  }
}
