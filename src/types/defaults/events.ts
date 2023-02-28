export interface DefaultEvents {
  ready?: DefaultReady;
  messageCreate?: { enabled: boolean };
  interactionCreate?: { enabled: boolean };
}

export interface DefaultReady {
  enabled: boolean;
  slashCommands: DefaultSlashCommands;
}

export interface DefaultSlashCommands {
  register: boolean;
  guildId?: string;
}
