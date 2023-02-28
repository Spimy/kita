import { KitaClient, registerCommands } from '../../index';
import { DefaultSlashCommands } from '../../types/defaults/events';
import { Listener } from '../../abstract/listener';

export class ReadyEvent extends Listener {
  constructor(private client: KitaClient, private slashCommands: DefaultSlashCommands) {
    super('ready');
  }

  async execute(): Promise<any> {
    if (this.client.user) {
      console.log(`${this.client.user.username} is now ready!`);
    }
    if (!this.slashCommands.register) return;
    return registerCommands(this.client, this.slashCommands.guildId);
  }
}
