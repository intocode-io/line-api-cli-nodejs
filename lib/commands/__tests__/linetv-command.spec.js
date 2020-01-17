import colors from 'colors';

import Command from '../command';
import LINETvCommand from '../linetv-command';
import ImageHelper from '../../image-helper';
import LINETvListModulesOperation from '../../operations/linetv-list-modules-operation';
import LINETvGetSpotlightOperation from '../../operations/linetv-get-sportlight-operation';
import LINETvListCategoryOperation from '../../operations/linetv-list-category-operation';
import theme from '../../theme';

const { spyOn, mock, unmock } = jest;

describe('LINETvCommand', () => {
  const mockUsage = 'usage';
  let commandLineArgs;
  let commandLineUsage;

  test('extends Command', () => {
    expect(LINETvCommand.prototype instanceof Command).toEqual(true);
  });

  beforeAll(() => {
    spyOn(ImageHelper, 'draw').mockReturnValue(undefined);
    spyOn(console, 'log').mockReturnValue(undefined);

    mock('command-line-usage');
    commandLineUsage = require('command-line-usage');
    commandLineUsage.mockImplementation(() => mockUsage);
  });

  describe('getCommandLineArgs', () => {
    beforeAll(() => {
      colors.setTheme(theme);
      mock('command-line-args');
      commandLineArgs = require('command-line-args');
      commandLineArgs.mockImplementationOnce(() => {
        return {
          operation: 'add'
        };
      });
      commandLineArgs.mockImplementationOnce(() => {
        return {
          help: true
        };
      });

      spyOn(process, 'exit').mockReturnValue(undefined);
    });

    it('display helps', async () => {
      expect(LINETvCommand.getCommandLineArgs()).toEqual({
        operation: 'add',
        options: {
          help: true
        }
      });
      expect(commandLineArgs).toHaveBeenCalledWith(
        [{ name: 'operation', defaultOption: true }],
        { stopAtFirstUnknown: true }
      );
      expect(commandLineArgs).toHaveBeenCalledWith(
        [
          { name: 'help', alias: 'h', type: Boolean },
          { name: 'version', alias: 'v', type: Boolean },
          { name: 'format', type: String }
        ],
        { argv: [] }
      );
    });

    afterAll(() => {
      commandLineArgs.mockRestore();
      unmock('command-line-args');
      process.exit.mockRestore();
    });
  });

  describe('cli', () => {
    describe('when unknown error thrown', () => {
      const error = new Error('Unknown error');

      beforeAll(() => {
        spyOn(process, 'exit').mockReturnValue(undefined);
        spyOn(console, 'error').mockReturnValue(undefined);
        spyOn(colors, 'setTheme').mockImplementation(() => {
          throw error;
        });
      });

      it('handles error', async () => {
        await expect(LINETvCommand.cli());
        expect(ImageHelper.draw).toHaveBeenCalledWith('chick-helps');
        expect(console.error).toHaveBeenCalled();
        expect(process.exit).toHaveBeenCalledWith(1);
      });

      afterAll(() => {
        colors.setTheme.mockRestore();
        console.error.mockRestore();
        process.exit.mockRestore();
      });
    });

    describe('when run with list:modules operation', () => {
      beforeAll(() => {
        spyOn(LINETvCommand, 'getCommandLineArgs').mockReturnValue({
          operation: 'list:modules',
          options: {},
          _unknown: []
        });
        spyOn(LINETvListModulesOperation, 'run').mockResolvedValue(undefined);
      });

      it('run correctly', async () => {
        await expect(LINETvCommand.cli()).resolves.toEqual(undefined);
        expect(LINETvListModulesOperation.run).toHaveBeenCalled();
      });

      afterAll(() => {
        LINETvCommand.getCommandLineArgs.mockRestore();
        LINETvListModulesOperation.run.mockRestore();
      });
    });

    describe('when run with get:spotlight operation', () => {
      beforeAll(() => {
        spyOn(LINETvCommand, 'getCommandLineArgs').mockReturnValue({
          operation: 'get:spotlight',
          options: {},
          _unknown: []
        });
        spyOn(LINETvGetSpotlightOperation, 'run').mockResolvedValue(undefined);
      });

      it('run correctly', async () => {
        await expect(LINETvCommand.cli()).resolves.toEqual(undefined);
        expect(LINETvGetSpotlightOperation.run).toHaveBeenCalled();
      });

      afterAll(() => {
        LINETvCommand.getCommandLineArgs.mockRestore();
        LINETvGetSpotlightOperation.run.mockRestore();
      });
    });

    describe('when run with list:category operation', () => {
      beforeAll(() => {
        spyOn(LINETvCommand, 'getCommandLineArgs').mockReturnValue({
          operation: 'list:category',
          options: {},
          _unknown: []
        });
        spyOn(LINETvListCategoryOperation, 'run').mockResolvedValue(undefined);
      });

      it('run correctly', async () => {
        await expect(LINETvCommand.cli()).resolves.toEqual(undefined);
        expect(LINETvListCategoryOperation.run).toHaveBeenCalled();
      });

      afterAll(() => {
        LINETvCommand.getCommandLineArgs.mockRestore();
        LINETvListCategoryOperation.run.mockRestore();
      });
    });

    describe('when run with unknown operation', () => {
      beforeEach(() => {
        ImageHelper.draw.mockClear();
        console.log.mockClear();
      });

      it('handles unknown operation', async () => {
        spyOn(LINETvCommand, 'getCommandLineArgs').mockReturnValueOnce({
          operation: 'blahblah',
          options: {},
          _unknown: []
        });
        await expect(LINETvCommand.cli()).resolves.toEqual(undefined);
        expect(ImageHelper.draw).toHaveBeenCalledWith('chick-helps');
        expect(console.log).toHaveBeenCalledWith(
          `Unknown operation: ${'blahblah'.code}`.warn
        );
      });

      it('handles undefined', async () => {
        spyOn(LINETvCommand, 'getCommandLineArgs').mockReturnValueOnce({
          operation: undefined,
          options: {},
          _unknown: []
        });
        await expect(LINETvCommand.cli()).resolves.toEqual(undefined);
        expect(ImageHelper.draw).toHaveBeenCalledWith('chick-helps');
        expect(console.log).toHaveBeenCalledWith(
          `Unknown operation: ${'undefined'.code}`.warn
        );
      });

      afterAll(() => {
        LINETvCommand.getCommandLineArgs.mockRestore();
      });
    });
  });

  afterAll(() => {
    commandLineUsage.mockRestore();
    unmock('command-line-usage');
    ImageHelper.draw.mockRestore();
    console.log.mockRestore();
  });
});