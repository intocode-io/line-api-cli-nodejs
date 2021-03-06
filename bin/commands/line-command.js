"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../typedef");

var _colors = _interopRequireDefault(require("colors"));

var _command = _interopRequireDefault(require("./command"));

var _imageHelper = _interopRequireDefault(require("../image-helper"));

var _lineInitOperation = _interopRequireDefault(require("../operations/line-init-operation"));

var _lineTokenOperation = _interopRequireDefault(require("../operations/line-token-operation"));

var _theme = _interopRequireDefault(require("../theme"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LINECommand extends _command.default {
  /**
   * @return {operation:string, options:LINECommandOptions, _unknown: Array<string>}
   */
  static getCommandLineArgs() {
    const commandLineArgs = require('command-line-args');

    const {
      operation,
      _unknown
    } = commandLineArgs([{
      name: 'operation',
      defaultOption: true
    }], {
      stopAtFirstUnknown: true
    });
    const argv = _unknown || [];
    const options = commandLineArgs([{
      name: 'help',
      alias: 'h',
      type: Boolean
    }, {
      name: 'version',
      alias: 'v',
      type: Boolean
    }, {
      name: 'issue',
      type: Boolean
    }, {
      name: 'revoke',
      type: Boolean
    }], {
      argv
    });
    return {
      operation,
      options,
      _unknown
    };
  }

  static async cli() {
    try {
      _colors.default.setTheme(_theme.default);

      const {
        operation,
        options
      } = this.getCommandLineArgs();

      if (options.help) {
        const commandLineUsage = require('command-line-usage');

        await _imageHelper.default.draw('chick-helps');

        switch (operation) {
          case 'init':
            console.log(commandLineUsage(_lineInitOperation.default.usage));
            break;

          case 'token':
            console.log(commandLineUsage(_lineTokenOperation.default.usage));
            break;

          default:
            console.log(commandLineUsage([..._lineInitOperation.default.usage, ..._lineTokenOperation.default.usage]));
        }

        process.exit(0);
        return;
      }

      if (options.version) {
        await _imageHelper.default.draw('chick-helps');
        console.log(this.versionText);
        process.exit(0);
        return;
      }

      if (operation === 'init') {
        await _lineInitOperation.default.run(options);
      } else if (operation === 'token') {
        await _lineTokenOperation.default.run(options);
      } else {
        await _imageHelper.default.draw('chick-helps');
        console.log(`Unknown operation: ${(operation || 'undefined').code}`.warn);
      }

      return;
    } catch (error) {
      await _imageHelper.default.draw('chick-helps');
      console.error(error);
      process.exit(1);
      return;
    }
  }

}

exports.default = LINECommand;
//# sourceMappingURL=line-command.js.map