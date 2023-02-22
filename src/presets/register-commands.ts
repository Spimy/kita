import { REST, Routes, KitaClient } from '../index';

export const registerCommands = async (client: KitaClient, guildId?: string) => {
  if (!client.token || !client.user) return;

  const rest = new REST({ version: '10' }).setToken(client.token);
  const commands = client.slashCommands.map((command) => command.info);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data: unknown[];

    if (!guildId) {
      data = (await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands
      })) as unknown[];
    } else {
      data = (await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
        body: commands
      })) as unknown[];
    }

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(
      `Something went wrong while trying to refresh application commands: ${error}`
    );
  }
};
