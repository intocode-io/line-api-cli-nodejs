import 'console-table';
import LINETvGetCategoryOperation from '../linetv-get-category-operation';
import Operation from '../operation';
import { EOL } from 'os';

const { spyOn, mock, unmock } = jest;

describe('linetv get:category', () => {
  it('extends Operation', () => {
    expect(LINETvGetCategoryOperation.prototype instanceof Operation).toEqual(
      true
    );
  });

  it('has usage', () => {
    expect(LINETvGetCategoryOperation.usage).toEqual([
      {
        header: 'Gets category home data.'.help,
        content:
          `To display category home data in table` +
          EOL +
          EOL +
          `linetv get:category`.code +
          EOL +
          EOL +
          `To get category home data in JSON format, you can run with --format option.` +
          EOL +
          EOL +
          `linetv get:category --format json`.code +
          EOL +
          EOL +
          `To get category home data start from selected page, you can run with --page option.` +
          EOL +
          EOL +
          `linetv get:category --page <number>`.code
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'format'.code,
            description: 'To display data in JSON format'
          },
          {
            name: 'page'.code,
            typeLabel: '{underline number}',
            description: 'To display data starts from selected page'
          }
        ]
      }
    ]);
  });

  it('runnable', () => {
    expect(typeof LINETvGetCategoryOperation.run).toEqual('function');
  });

  describe('when config is invalid', () => {
    beforeAll(() => {
      spyOn(LINETvGetCategoryOperation, 'validateConfig').mockReturnValue(
        false
      );
    });

    it('handles correctly', async () => {
      await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(false);
    });

    afterAll(() => {
      LINETvGetCategoryOperation.validateConfig.mockRestore();
    });
  });

  describe('when config is valid', () => {
    const mockConfig = {
      channel: {
        id: 1234,
        secret: 'mocked secret',
        accessToken: 'mocked access token'
      }
    };

    beforeAll(() => {
      spyOn(LINETvGetCategoryOperation, 'config', 'get').mockReturnValue(
        mockConfig
      );
      spyOn(LINETvGetCategoryOperation, 'validateConfig').mockReturnValue(true);
      spyOn(console, 'log').mockReturnValue(undefined);
      spyOn(console, 'table').mockReturnValue(undefined);
    });

    beforeEach(() => {
      console.log.mockClear();
      console.table.mockClear();
    });

    describe('when get error response', () => {
      let prompts;
      const error = new Error('Fail to get response');
      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts.mockResolvedValueOnce({ countryCode: 'th' });
        spyOn(LINETvGetCategoryOperation.listRequest, 'send').mockRejectedValue(
          error
        );
        spyOn(console, 'error').mockReturnValue(undefined);
      });

      it('handles error', async () => {
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(
          false
        );
        expect(console.error).toHaveBeenCalledWith(error);
      });

      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
        console.error.mockRestore();
      });
    });

    describe('when cannot get category data', () => {
      let prompts;
      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts.mockResolvedValueOnce({ countryCode: 'th' });
        spyOn(LINETvGetCategoryOperation.listRequest, 'send')
          .mockResolvedValueOnce({
            data: null
          })
          .mockResolvedValueOnce({
            data: {
              body: null
            }
          });
      });

      it('handles error', async () => {
        // Test no response data
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(true);
        expect(console.log).toHaveBeenCalledWith(
          'Category list not found'.warn
        );
        // Test response no data.body
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(true);
        expect(console.log).toHaveBeenCalledWith(
          'Category list not found'.warn
        );
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('when get no category', () => {
      let prompts;
      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts.mockResolvedValueOnce({ countryCode: 'th' });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce({
          data: {
            body: {
              tabs: null
            }
          }
        });
      });

      it('handles error', async () => {
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(true);
        expect(console.log).toHaveBeenCalledWith('No category'.warn);
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('when has category data', () => {
      let prompts;
      const mockListResponse = {
        data: {
          body: {
            tabs: [
              {
                categoryCode: 'DRAMA',
                categoryName: 'ละคร',
                categoryEnName: 'DRAMA',
                serviceUrl: 'https://tv.line.me/c/drama'
              }
            ]
          }
        }
      };
      const mockGetResponse = {
        data: {
          body: {
            representClip: {
              serviceUrl: 'https://tv.line.me/v/1234',
              clipNo: 123,
              clipTitle: 'one-two-three',
              playCount: 1234,
              thumbnailUrl: 'https://pic.net/123',
              clipSubtitle: '',
              displayPlayTime: '12:34',
              likeitPoint: 12345
            },
            channels: [
              {
                channelId: 'one',
                thumbnailUrl: 'https://pic.net/12345.png',
                channelName: 'one-one',
                channelEmblem: '',
                serviceUrl: 'https://tv.line.me/one',
                badgeType: 'NEW'
              }
            ]
          }
        }
      };
      const clip = mockGetResponse.data.body.representClip;

      const expectedRepresentClip = [
        { ' ': 'Represent Clip No.'.success, '  ': clip.clipNo },
        { ' ': 'Represent Clip Title.'.success, '  ': clip.clipTitle },
        { ' ': 'Represent Clip URL'.success, '  ': clip.serviceUrl },
        { ' ': 'Play Count'.success, '  ': clip.playCount },
        { ' ': 'Likeit Count'.success, '  ': clip.likeitPoint }
      ];

      const expectedChannel = mockGetResponse.data.body.channels.map(item => {
        const columnHeader = {};
        columnHeader['Channel ID'.success] = item.channelId;
        columnHeader['Channel Name'.success] = item.channelName;
        columnHeader['Badge'.success] = item.badgeType;
        columnHeader['URL'.success] = item.serviceUrl;
        return columnHeader;
      });

      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts
          .mockResolvedValueOnce({
            countryCode: 'th'
          })
          .mockResolvedValueOnce({
            selectedCategory: { categoryCode: 'DRAMA', categoryName: 'DM' }
          })
          .mockResolvedValueOnce({
            countPerPage: 10
          });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce(mockListResponse);
        spyOn(
          LINETvGetCategoryOperation.getRequest,
          'send'
        ).mockResolvedValueOnce(mockGetResponse);
      });
      it('handles data correctly', async () => {
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(true);
        expect(console.table).toHaveBeenCalledWith(expectedRepresentClip);
        expect(console.table).toHaveBeenCalledWith(expectedChannel);
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        LINETvGetCategoryOperation.getRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('When has category data and select next page', () => {
      let prompts;
      const mockListResponse = {
        data: {
          body: {
            tabs: [
              {
                categoryCode: 'DRAMA',
                categoryName: 'ละคร',
                categoryEnName: 'DRAMA',
                serviceUrl: 'https://tv.line.me/c/drama'
              }
            ]
          }
        }
      };
      const mockGetResponse = {
        data: {
          body: {
            representClip: {
              serviceUrl: 'https://tv.line.me/v/1234',
              clipNo: 123,
              clipTitle: 'one-two-three',
              playCount: 1234,
              thumbnailUrl: 'https://pic.net/123',
              clipSubtitle: '',
              displayPlayTime: '12:34',
              likeitPoint: 12345
            },
            channels: [
              {
                channelId: 'one',
                thumbnailUrl: 'https://pic.net/12345.png',
                channelName: 'one-one',
                channelEmblem: '',
                serviceUrl: 'https://tv.line.me/one',
                badgeType: 'NEW'
              }
            ],
            hasMore: true
          }
        }
      };
      const countryCode = 'th';
      const selectedCategory = { categoryCode: 'DRAMA', categoryName: 'DM' };
      const countPerPage = 11;

      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts
          .mockResolvedValueOnce({
            countryCode
          })
          .mockResolvedValueOnce({
            selectedCategory
          })
          .mockResolvedValueOnce({
            countPerPage
          })
          .mockResolvedValueOnce({
            nextPage: true
          })
          .mockResolvedValueOnce({
            nextPage: false
          });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce(mockListResponse);
        spyOn(LINETvGetCategoryOperation.getRequest, 'send')
          .mockResolvedValueOnce(mockGetResponse)
          .mockResolvedValueOnce(mockGetResponse);
      });
      it('display next page correctly', async () => {
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(true);
        expect(LINETvGetCategoryOperation.getRequest.send).toHaveBeenCalledWith(
          mockConfig.channel.id,
          countryCode,
          selectedCategory.categoryCode,
          2,
          countPerPage
        );
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        LINETvGetCategoryOperation.getRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('When error on next page', () => {
      const error = new Error('Fail to get response');
      let prompts;
      const mockListResponse = {
        data: {
          body: {
            tabs: [
              {
                categoryCode: 'DRAMA',
                categoryName: 'ละคร',
                categoryEnName: 'DRAMA',
                serviceUrl: 'https://tv.line.me/c/drama'
              }
            ]
          }
        }
      };
      const mockGetResponse = {
        data: {
          body: {
            representClip: {
              serviceUrl: 'https://tv.line.me/v/1234',
              clipNo: 123,
              clipTitle: 'one-two-three',
              playCount: 1234,
              thumbnailUrl: 'https://pic.net/123',
              clipSubtitle: '',
              displayPlayTime: '12:34',
              likeitPoint: 12345
            },
            channels: [
              {
                channelId: 'one',
                thumbnailUrl: 'https://pic.net/12345.png',
                channelName: 'one-one',
                channelEmblem: '',
                serviceUrl: 'https://tv.line.me/one',
                badgeType: 'NEW'
              }
            ],
            hasMore: true
          }
        }
      };
      const countryCode = 'th';
      const selectedCategory = { categoryCode: 'DRAMA', categoryName: 'DM' };
      const countPerPage = 11;

      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts
          .mockResolvedValueOnce({
            countryCode
          })
          .mockResolvedValueOnce({
            selectedCategory
          })
          .mockResolvedValueOnce({
            countPerPage
          })
          .mockResolvedValueOnce({
            nextPage: true
          })
          .mockResolvedValueOnce({
            nextPage: true
          });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce(mockListResponse);
        spyOn(LINETvGetCategoryOperation, 'logAxiosError').mockReturnValue();
        spyOn(LINETvGetCategoryOperation.getRequest, 'send')
          .mockResolvedValueOnce(mockGetResponse)
          .mockResolvedValueOnce(mockGetResponse)
          .mockRejectedValueOnce(error);
      });
      it('handle error', async () => {
        await expect(LINETvGetCategoryOperation.run({})).resolves.toEqual(
          false
        );
        expect(LINETvGetCategoryOperation.logAxiosError).toHaveBeenCalledWith(
          error
        );
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        LINETvGetCategoryOperation.getRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('when input options --format json', () => {
      let prompts;
      const mockListResponse = {
        data: {
          body: {
            tabs: [
              {
                categoryCode: 'DRAMA',
                categoryName: 'ละคร',
                categoryEnName: 'DRAMA',
                serviceUrl: 'https://tv.line.me/c/drama'
              }
            ]
          }
        }
      };
      const mockGetResponse = {
        data: {
          body: {
            representClip: {
              serviceUrl: 'https://tv.line.me/v/1234',
              clipNo: 123,
              clipTitle: 'one-two-three',
              playCount: 1234,
              thumbnailUrl: 'https://pic.net/123',
              clipSubtitle: '',
              displayPlayTime: '12:34',
              likeitPoint: 12345
            },
            channels: [
              {
                channelId: 'one',
                thumbnailUrl: 'https://pic.net/12345.png',
                channelName: 'one-one',
                channelEmblem: '',
                serviceUrl: 'https://tv.line.me/one',
                badgeType: 'NEW'
              }
            ]
          }
        }
      };

      const expectedFormatJSON = JSON.stringify(mockGetResponse.data, null, 2);

      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts
          .mockResolvedValueOnce({
            countryCode: 'th'
          })
          .mockResolvedValueOnce({
            selectedCategory: { categoryCode: 'DRAMA', categoryName: 'DM' }
          })
          .mockResolvedValueOnce({
            countPerPage: 10
          });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce(mockListResponse);
        spyOn(
          LINETvGetCategoryOperation.getRequest,
          'send'
        ).mockResolvedValueOnce(mockGetResponse);
      });
      it('display data correctly', async () => {
        await expect(
          LINETvGetCategoryOperation.run({ format: 'json' })
        ).resolves.toEqual(true);
        expect(console.log).toHaveBeenCalledWith(expectedFormatJSON);
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        LINETvGetCategoryOperation.getRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    describe('when input options --page <number>', () => {
      let prompts;
      const mockListResponse = {
        data: {
          body: {
            tabs: [
              {
                categoryCode: 'DRAMA',
                categoryName: 'ละคร',
                categoryEnName: 'DRAMA',
                serviceUrl: 'https://tv.line.me/c/drama'
              }
            ]
          }
        }
      };
      const mockGetResponse = {
        data: {
          body: {
            representClip: {
              serviceUrl: 'https://tv.line.me/v/1234',
              clipNo: 123,
              clipTitle: 'one-two-three',
              playCount: 1234,
              thumbnailUrl: 'https://pic.net/123',
              clipSubtitle: '',
              displayPlayTime: '12:34',
              likeitPoint: 12345
            },
            channels: [
              {
                channelId: 'one',
                thumbnailUrl: 'https://pic.net/12345.png',
                channelName: 'one-one',
                channelEmblem: '',
                serviceUrl: 'https://tv.line.me/one',
                badgeType: 'NEW'
              }
            ]
          }
        }
      };
      const expectedChannel = mockGetResponse.data.body.channels.map(item => {
        const columnHeader = {};
        columnHeader['Channel ID'.success] = item.channelId;
        columnHeader['Channel Name'.success] = item.channelName;
        columnHeader['Badge'.success] = item.badgeType;
        columnHeader['URL'.success] = item.serviceUrl;
        return columnHeader;
      });

      beforeAll(() => {
        mock('prompts');
        prompts = require('prompts');
        prompts
          .mockResolvedValueOnce({
            countryCode: 'th'
          })
          .mockResolvedValueOnce({
            selectedCategory: { categoryCode: 'DRAMA', categoryName: 'DM' }
          })
          .mockResolvedValueOnce({
            countPerPage: 10
          });
        spyOn(
          LINETvGetCategoryOperation.listRequest,
          'send'
        ).mockResolvedValueOnce(mockListResponse);
        spyOn(
          LINETvGetCategoryOperation.getRequest,
          'send'
        ).mockResolvedValueOnce(mockGetResponse);
      });
      it('handles data correctly', async () => {
        await expect(
          LINETvGetCategoryOperation.run({ page: 2 })
        ).resolves.toEqual(true);
        expect(console.table).toHaveBeenCalledWith(expectedChannel);
      });
      afterAll(() => {
        LINETvGetCategoryOperation.listRequest.send.mockRestore();
        LINETvGetCategoryOperation.getRequest.send.mockRestore();
        prompts.mockRestore();
        unmock('prompts');
      });
    });

    afterAll(() => {
      LINETvGetCategoryOperation.config.mockRestore();
      LINETvGetCategoryOperation.validateConfig.mockRestore();
      console.table.mockRestore();
      console.log.mockRestore();
    });
  });
});

describe('LINETvGetCategoryOperation validateNonZero', () => {
  it('handle zero correctly', () => {
    expect(LINETvGetCategoryOperation.validateNonZero(0)).toEqual(
      'Zero is not allowed'
    );
  });
  it('handle non-zero number correctly', () => {
    expect(LINETvGetCategoryOperation.validateNonZero(1)).toEqual(true);
  });
});

describe('LINETvGetCategoryOperation validate 2 character country code', () => {
  it('handle 2 characters correctly', () => {
    expect(LINETvGetCategoryOperation.validateCountryCode('cc')).toEqual(true);
  });
  it('handle error correctly', () => {
    expect(LINETvGetCategoryOperation.validateCountryCode('ccc')).toEqual(
      'Please input ISO 3166-2 (2 characters)'
    );
  });
});
