import downloadFile from './download-file';
import { Services } from '@cpbd/bl-ui-lib';

jest.mock('@cpbd/bl-ui-lib', () => ({
  Services: {
    configurationService: {
      getConfiguration: jest.fn(),
    },
    cookieService: {
      getCookie: jest.fn(),
    },
  },
}));

describe('downloadFile', () => {
  const mockApiPath = '/test/path';
  const mockBaseUri = 'https://api.example.com';
  const mockToken = 'mockAccessToken';

  beforeEach(() => {
    // Mock session storage and configuration for each test
    window.sessionStorage.setItem('accessToken', mockToken);
    Services.configurationService.getConfiguration.mockReturnValue(mockBaseUri);
    Services.cookieService.getCookie.mockReturnValue('mockCsrfToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should normalize the path correctly', () => {
    const normalizePath = (path) => path ? `/${path}` : '';
    expect(normalizePath('test')).toBe('/test');
    expect(normalizePath('')).toBe('');
  });

  it('should get the correct endpoint URL', () => {
    const getEndPoint = (path) => `${mockBaseUri}/${path}`;
    expect(getEndPoint('test')).toBe(`${mockBaseUri}/test`);
  });

  it('should get the correct headers', () => {
    const getDefaultHeaders = () => ({
      'X-Zambezi-CSRF': 'mockCsrfToken',
      Authorization: `Bearer ${mockToken}`,
      'CPBD-ORIGIN-CHANNEL': 'WEB',
    });
    expect(getDefaultHeaders()).toEqual({
      'X-Zambezi-CSRF': 'mockCsrfToken',
      Authorization: `Bearer ${mockToken}`,
      'CPBD-ORIGIN-CHANNEL': 'WEB',
    });
  });

  it('should call fetch with correct parameters', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: 'mockData' }),
      })
    );

    await downloadFile(mockApiPath);

    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUri}${mockApiPath}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Zambezi-CSRF': 'mockCsrfToken',
          Authorization: `Bearer ${mockToken}`,
          'CPBD-ORIGIN-CHANNEL': 'WEB',
        },
      }
    );
  });

  it('should handle errors thrown by fetch', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Fetch error')));

    try {
      await downloadFile(mockApiPath);
    } catch (error) {
      expect(error.message).toBe('Fetch error');
    }
  });
});
