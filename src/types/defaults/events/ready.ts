export interface DefaultReady {
  enabled: boolean;
  slashCommands: DefaultSlashCommands;
}

export interface DefaultSlashCommands {
  register: boolean;
  guildId?: string;
}
