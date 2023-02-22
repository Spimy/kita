import { Message } from '../../index';
import { CommandInfo } from '../../types';

export abstract class Command {
  constructor(private commandInfo: CommandInfo) {
    if (commandInfo.usage) {
      commandInfo.usage = commandInfo.usage.map(({ required, description, argument }) => {
        return {
          required,
          argument: required ? `<${argument}>` : `[${argument}]`,
          description
        };
      });
    }
  }

  abstract execute(message: Message, args: string[]): Promise<boolean>;

  get info(): CommandInfo {
    return this.commandInfo;
  }
}
