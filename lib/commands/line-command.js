import '../typedef';

import colors from 'colors';

import Command from './command';
import ImageHelper from '../image-helper';
import LINEInitOperation from '../operations/line-init-operation';
import LINETokenOperation from '../operations/line-token-operation';
import theme from '../theme';

export default class LINECommand extends Command {
  /**
   * @return {operation:string, options:LINECommandOptions, _unknown: Array<string>}
   */
  static getCommandLineArgs() {
    const commandLineArgs = require('command-line-args');

    const { operation, _unknown } = commandLineArgs(
      [{ name: 'operation', defaultOption: true }],
      { stopAtFirstUnknown: true }
    );
    const argv = _unknown || [];
    const options = commandLineArgs(
      [
        { name: 'help', alias: 'h', type: Boolean },
        { name: 'version', alias: 'v', type: Boolean },
        { name: 'issue', type: Boolean },
        { name: 'revoke', type: Boolean }
      ],
      { argv }
    );

    return { operation, options, _unknown };
  }

  static async cli() {
    try {
      colors.setTheme(theme);

      const { operation, options } = this.getCommandLineArgs();

      if (options.help) {
        const commandLineUsage = require('command-line-usage');

        await ImageHelper.draw('chick-helps');

        switch (operation) {
          case 'init':
            console.log(commandLineUsage(LINEInitOperation.usage));
            break;
          case 'token':
            console.log(commandLineUsage(LINETokenOperation.usage));
            break;
          default:
            console.log(
              commandLineUsage([
                ...LINEInitOperation.usage,
                ...LINETokenOperation.usage
              ])
            );
        }
        process.exit(0);
        return;
      }

      if (options.version) {
        await ImageHelper.draw('chick-helps');
        console.log(this.versionText);
        process.exit(0);
        return;
      }

      if (operation === 'init') {
        await LINEInitOperation.run(options);
      } else if (operation === 'token') {
        await LINETokenOperation.run(options);
      } else {
        await ImageHelper.draw('chick-helps');
        console.log(
          `Unknown operation: ${(operation || 'undefined').code}`.warn
        );
      }
      return;
    } catch (error) {
      await ImageHelper.draw('chick-helps');
      console.error(error);
      process.exit(1);
      return;
    }
  }
}
