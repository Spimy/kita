import { CommandInteraction } from '../../index';
import { SlashCommandInfo } from '../../types';

export abstract class SlashCommand {
  constructor(private commandInfo: SlashCommandInfo) {}

  abstract execute(interaction: CommandInteraction): Promise<boolean>;

  get info(): SlashCommandInfo {
    return this.commandInfo;
  }
}
