import { Client } from './index';
import { KitaClientOptions } from './types/kita-client';
import { ModulesHandler } from './handlers/';

export class KitaClient extends Client {
  private readonly DEFAULT_PREFIX: string = '>';
  private readonly modulesHandler: ModulesHandler;

  constructor(private readonly clientOptions: KitaClientOptions) {
    super(clientOptions);
    this.clientOptions = clientOptions;

    this.modulesHandler = new ModulesHandler(
      this,
      this.clientOptions.root,
      this.clientOptions.defaults
    );
  }

  get prefix() {
    return this.clientOptions.prefix || this.DEFAULT_PREFIX;
  }

  get classicCommands() {
    return this.modulesHandler.classicCommands;
  }

  get aliases() {
    return this.modulesHandler.aliases;
  }

  get slashCommands() {
    return this.modulesHandler.slashCommands;
  }
}
