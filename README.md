# Kita

A Discord.JS wrapper to speed up development process by getting the basics readily done. A revision of the monorepo 'yor' renamed to Kita.

Kita was made with TypeScript in mind and is best used while coding in TypeScript for developer experience.

**Further recommendation:**

- Install [ts-node](https://www.npmjs.com/package/ts-node)
- Install [nodemon](https://www.npmjs.com/package/nodemon)
- Set up a `dev` script to run `npx nodemon src/index.ts`.

## Getting Started

To create a Kita client to connect to a Discord application as a bot, simply import it, fill in the necessary constructor parameters and use the `login` method:

```ts
import { KitaClient } from 'kita';

const client = new KitaClient({
  root: __dirname,
  defaults: {
    events: {
      interactionCreate: { enabled: true },
      messageCreate: { enabled: true },
      ready: {
        enabled: true,
        slashCommands: { register: true, guildId: 'guild_id' }
      }
    },
    helpCommand: {
      enabled: true
    }
  },
  intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers']
});

client.login('bot_token');
```

You do not need to export the client instance as the it is automatically exposed to all commands and events you create.

### KitaClient constructor properties

KitaClient comes with a custom constructor parameter that extends the default `ClientOptions` constructor parameter. This means that anything that any options that works in the default client from [Discord.JS](https://discord.js.org/#/docs/discord.js/main/typedef/ClientOptions) will also work on KitaClient.

#### Root

The root property is **required** and must **always** be set to `__dirname`. This is used as a way to scan your project structure.

#### Defaults

The defaults property allows you to enable or disable pre-made commands or events (disabled by default).

If you enable defaults and you have your own commands or events with the same name, the defaults will be ignored.

**events.interactionCreate:**
This will enable the default `interactionCreate` event and handle command execution only. Useful if you only need this event to handle command execution. If you need more control over this event to handle other types of interaction, leave this disabled.

**events.messageCreate:**
This will enable the default `messageCreate` event and handle command execution only. Useful if you only need this event to handle command execution. If you need more control over this event to handle messages, leave this disabled.

**events.ready:**
This will enable the default `ready` event. Useful if you only need this event to notify that the bot is ready and to register a slash commands. If you need more control over this event, leave this disabled.

**events.ready.slashCommands.guildId:**
Optional. If provided, slash commands will be registered for this guild only. If not provided, slash commands will be registered globally.

**helpCommand:**
This will enable the default `help` command. Useful if you do not want to code your own help command. This is a classic message command and **NOT** a slash command. This will automatically sort commands by category. Slash commands will not be listed in the list of commands.

<details>
  <summary>Help Message Preview</summary>
![help-list](https://cdn.spimy.dev/screenshots/Discord_5OjtgxNoY9.png)
![help-detailed](https://cdn.spimy.dev/screenshots/Discord_8VOY03TYNC.png)
</details>

## Project Structure

Your project structure is important in order to be scanned to load commands and events you create.

Here's an example of your project structure should look like:

```
my-bot/
├── node_modules/
├── src/
│   ├── commands/
│   ├── events/
│   └── index.ts
├── .env
├── .gitignore
├── .prettierrc
├── package.json
├── tsconfig.json
└── yarn.lock
```

### Commands folder

This is where all your commands you create reside in. Any sub-folders created inside will be considered a category for your command. This means that in the command info, the category will be automatically set to the sub-folder's name if it was not set when creating the command. Category is used by the default `help` command.

In the following example, `ban.ts` will be categorised as a `moderation` command:

```
src/
├── commands/
│   └── moderation/
│       └── ban.ts
├── events/
└── index.ts
```

If your bot contains both classic message commands and slash commands simultaneously, it is recommended to create a `slash` folder where you store your slash commands.

### Events folder

This is where all your events you create reside in. You may categorise your events into sub-folders and they will still be scanned.

## Creating Commands

All command classes should be exported as `default`. After execution of a command, always return a boolean where `true` signifies the command was executed successfully and `false` signifies that something went wrong while executing the command.

If a command execution returns `false`, the default `messageCreate` event will send a detailed help embed for that command.

You may return `true` if you handled the error within the command execution itself.

The `KitaClient` instance can be accessed by adding it to the constructor of the command. See the example in the next section.

### Classic message commands

To create a classic message command, your command class must extend the `Command` class:

```ts
import { Command, Message, KitaClient, EmbedBuilder } from 'kita';

export default class extends Command {
  constructor(private client: KitaClient) {
    super({
      name: 'test',
      description: 'A test command that replies with "Hello World" in an embed.',
      aliases: ['t'],
      usage: [
        {
          argument: 'custom',
          required: false,
          description: 'Reply with the argument instead.'
        }
      ]
    });
  }

  async execute(message: Message, args: string[]): Promise<boolean> {
    if (!this.client.user) return true;

    const avatar = this.client.user.displayAvatarURL({ size: 1024 });
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setAuthor({ name: 'Test Command', iconURL: avatar })
      .setDescription(args.join(' ') || 'Hello World')
      .setTimestamp();

    message.reply({ embeds: [embed] });
    return true;
  }
}
```

### Slash commands

To create aslash command, your command class must extend the `SlashCommand` class:

```ts
import { CommandInteraction, SlashCommand, SlashCommandBuilder } from 'kita';

export default class extends SlashCommand {
  constructor() {
    super({
      ...new SlashCommandBuilder()
        .setName('test')
        .setDescription('Very simple test slash command replying with "Hello World"')
        .setDMPermission(false)
        .toJSON(),
      custom: { data: 'some custom data' }
    });
  }

  async execute(interaction: CommandInteraction): Promise<boolean> {
    interaction.reply('Hello World');
    return true;
  }
}
```

In addition, you can see that the constructor can take a property called `custom`. This is useful for any additional data that your slash command may require. For example, you can set a guild id custom data so that this command can only be registered for that guild. You will need to write your own custom register commands function instead of using the one provided.

## Creating Events

All command classes should be exported as `default` and should extend the `Event` class:

```ts
import { Event } from 'kita';

export default class extends Event {
  constructor() {
    super('ready');
  }

  async execute(): Promise<any> {}
}
```

The `KitaClient` instance can be accessed by adding it to the constructor of the event. See the example in the next section.

### Register slash commands manually

If you do not wish to use the default `ready` event, slash commands will not be registered. Instead, in your custom `ready` event, import the `registerCommand` function in order to register them manually:

```ts
import { KitaClient, Event, registerCommands } from 'kita';

export default class extends Event {
  constructor(private client: KitaClient) {
    super('ready');
  }

  async execute(): Promise<any> {
    if (this.client.user) {
      console.log(`${this.client.user.username} is now ready!`);
    }
    return registerCommands(this.client, 'guildId');
  }
}
```

The `registerCommands` function takes an optional `guildId` parameter:

```ts
export declare const registerCommands: (
  client: KitaClient,
  guildId?: string
) => Promise<void>;
```
