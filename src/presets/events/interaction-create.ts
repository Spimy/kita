import { BaseInteraction, EmbedBuilder, KitaClient } from '../../index';
import { Event } from '../../abstract/event';

export class InteractionCreateEvent extends Event {
  constructor(private client: KitaClient) {
    super('interactionCreate');
  }

  async execute(interaction: BaseInteraction): Promise<any> {
    if (!interaction.isChatInputCommand()) return;

    const embed = new EmbedBuilder().setColor('Red').setTimestamp();

    const command = this.client.slashCommands.get(interaction.commandName);
    if (!command) {
      embed
        .setTitle('Unknown Command')
        .setDescription(
          `There were no command matching ${interaction.commandName} found.`
        );
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch {
      embed
        .setTitle('Command Error')
        .setDescription(`Something went wrong while trying to execute this command`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
