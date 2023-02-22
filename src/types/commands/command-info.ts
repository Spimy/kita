import {
  ChatInputApplicationCommandData,
  CommandUsage,
  PermissionResolvable
} from '../../index';

export interface CommandInfo {
  name: string;
  description: string;
  usage?: CommandUsage[];
  aliases?: string[];
  permissions?: PermissionResolvable[];
  category?: string;
}

export interface SlashCommandInfo extends ChatInputApplicationCommandData {
  custom?: any;
}
