import { ClientEvents, Collection } from '../index';
import { Command, Listener, SlashCommand } from '../abstract';
import { KitaClient } from '../client';
import { KitaClientModules, Defaults } from '../types';
import { InvalidPathError } from '../errors/invalid-path-error';
import { DefaultsHandler } from './defaults-handler';

import path from 'path';
import glob from 'glob';

export class ModulesHandler {
  private readonly _classicCommands: Collection<string, Command> = new Collection();
  private readonly _commandAliases: Collection<string, string> = new Collection();
  private readonly _slashCommands: Collection<String, SlashCommand> = new Collection();

  private readonly registeredEvents: (keyof ClientEvents)[] = [];

  constructor(
    private client: KitaClient,
    private root: string,
    private defaultsConfig?: Defaults
  ) {
    this.loadModule(KitaClientModules.COMMANDS);
    this.loadModule(KitaClientModules.EVENTS);
  }

  private loadModule(module: KitaClientModules) {
    const folderPath = path.join(this.root, module);

    glob(path.join(folderPath, '**', '*.{js,ts}'), (err, files) => {
      if (err) throw new InvalidPathError('Path provided not found');

      files.forEach((file) => {
        const module = require(file).default;

        if (!module) {
          const moduleName = path.basename(file);
          return console.warn(`Please export your '${moduleName}' module as default.`);
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

        if (module.prototype instanceof Listener) {
          const event: Listener = new module(this);
          this.registerEvent(event);
          return;
        }
      });

      new DefaultsHandler(this.client, this, this.defaultsConfig);
    });
  }

  public registerCommand(command: Command | SlashCommand, filePath?: string) {
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

  public registerEvent(event: Listener) {
    // Check if event is already registered to prevent duplicate events from being registered
    if (this.hasRegisteredEvent(event.name)) {
      return console.warn(`The event '${event.name}' has already been registered.`);
    }

    // Listen to the event and mark the event as registered to prevent duplicate listeners
    this.client.on(event.name, async (...args) => event.execute(...args));
    this.registeredEvents.push(event.name);
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

  public hasRegisteredEvent(event: keyof ClientEvents): boolean {
    return this.registeredEvents.includes(event);
  }
}
