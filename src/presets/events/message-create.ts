import { Message, KitaClient } from '../../index';
import { Listener } from '../../abstract/listener';

export class MessageCreateEvent extends Listener {
  constructor(private client: KitaClient) {
    super('messageCreate');
  }

  async execute(message: Message): Promise<any> {
    const prefix = this.client.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.split(' ');
    const commandName = args.shift()?.slice(1);
    if (!commandName) return;

    const command =
      this.client.classicCommands.get(commandName) ||
      this.client.classicCommands.get(this.client.aliases.get(commandName) || '');

    if (command) {
      const success = await command.execute(message, args);
      if (success) return;
      return this.client.classicCommands.get('help')?.execute(message, [commandName]);
    }

    return await this.client.classicCommands.get('help')?.execute(message, []);
  }
}
