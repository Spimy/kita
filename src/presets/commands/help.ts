import { Collection, EmbedBuilder, Message, StageChannel, KitaClient } from '../../index';
import { Command } from '../../abstract/commands/command';

export class HelpCommand extends Command {
  constructor(private client: KitaClient, description?: string) {
    super({
      name: 'help',
      description:
        description ||
        'View a list of commands and get a detailed description of each of them.',
      category: 'Misc',
      usage: [
        {
          argument: 'command',
          required: false,
          description: 'Get detailed view of the command.'
        }
      ]
    });
  }

  async execute(message: Message<boolean>, args: string[]): Promise<boolean> {
    if (message.channel instanceof StageChannel) return true;

    const prefix = this.client.prefix;
    const thumbnail = this.client.user?.displayAvatarURL({ size: 2048 });

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setFooter({
        text: `Requested by ${message.author.tag}`
      })
      .setTimestamp();
    if (thumbnail) embed.setThumbnail(thumbnail);

    if (args.length === 0) {
      const categories = [
        ...new Set(this.client.classicCommands.map((command) => command.info.category))
      ];

      embed.setTitle('COMMAND LIST');
      embed.setDescription(
        [
          `**Prefix:** \`${prefix}\``,
          `<> : Required | [] : Optional`,
          `Use \`${prefix}${this.info.name} ${this.info.usage
            ?.map((usage) => usage.argument)
            .join(' ')}\` to view command help with more detail.`
        ].join('\n')
      );

      let categorisedCommands: Collection<string, Command>;
      let uncategorised: { info: string; commands: string };

      for (const category of categories) {
        categorisedCommands = this.client.classicCommands.filter(
          (command) => command.info.category === category
        );

        const info = category || 'Uncategorised';
        const commands: string = categorisedCommands
          .map((command) => `\`${command.info.name}\``)
          .join(', ');

        if (info === 'Uncategorised') {
          uncategorised = { info, commands };
          continue;
        }

        embed.addFields({
          name: info,
          value: commands
        });
      }

      if (uncategorised!)
        embed.addFields({
          name: uncategorised.info,
          value: uncategorised.commands
        });

      message.channel.send({ embeds: [embed] });
      return true;
    }

    const command =
      this.client.classicCommands.get(args[0]) ||
      this.client.classicCommands.get(this.client.aliases.get(args[0])!);
    if (!command) return await this.execute(message, []);

    const hasUsage = command.info.usage && command.info.usage.length > 0;
    const hasAliases = command.info.aliases && command.info.aliases.length > 0;
    const hasPerms = command.info.permissions && command.info.permissions.length > 0;

    const formattedUsage = hasUsage
      ? command.info.usage!.map((usage) => usage.argument).join(' ')
      : '';

    const fullCommand = `${prefix}${command.info.name} ${formattedUsage}`.trim();

    embed.setTitle(`${command.info.name.toUpperCase()} COMMAND`);
    embed.setDescription(
      [
        `${command.info.description.replace(/{prefix}/gi, prefix)}`,
        `Full command: \`${fullCommand}\``,
        `Aliases: ${hasAliases ? `\`${command.info.aliases?.join(' | ')}\`` : '`None`'}`,
        `Permissions required: ${
          hasPerms ? `\`${command.info.permissions!.join(' | ')}\`` : '`None`'
        }`
      ].join('\n')
    );

    if (hasUsage) {
      embed.addFields(
        command.info
          .usage!.filter((usage) => usage.description)
          .map((usage) => {
            return {
              name: usage.argument,
              value: usage.description!,
              inline: true
            };
          })
      );
    }

    message.channel.send({ embeds: [embed] });
    return true;
  }
}
