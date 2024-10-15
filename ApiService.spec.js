import ApiService from './ApiService';
import { Services } from '@cpbd/bl-ui-lib';

jest.mock('@cpbd/bl-ui-lib', () => ({
  Services: {
    cookieService: {
      getCookie: jest.fn(() => 'mockCsrfToken'),
    },
    api: {
      endpointProvider: {
        getEndpoint: jest.fn(() => 'https://api.example.com'),
      },
    },
  },
}));

describe('ApiService', () => {
  let apiService;

  beforeEach(() => {
    apiService = new ApiService({
      requestHeaderService: Services.requestHeaderService,
      endpointProvider: Services.api.endpointProvider,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for passThroughError with status >= 500', () => {
    expect(apiService.passThroughError(500)).toBe(true);
    expect(apiService.passThroughError(499)).toBe(false);
  });

  it('should detect error for specific statuses', () => {
    apiService.sessionExpiredStatuses = [401, 403];
    expect(apiService.isError(401)).toBe(true);
    expect(apiService.isError(200)).toBe(false);
  });

  it('should get default headers with CSRF and Authorization', () => {
    const headers = apiService.getDefaultHeaders();
    expect(headers).toEqual({
      'X-Zambezi-CSRF': 'mockCsrfToken',
      Authorization: `Bearer ${window.sessionStorage.getItem('accessToken')}`,
    });
  });

  it('should build request parameters correctly', () => {
    const params = apiService.getRequestParameters('GET', {}, 'https://api.example.com');
    expect(params.method).toBe('GET');
    expect(params.credentials).toBe('include');
    expect(params.headers).toHaveProperty('Accept', 'application/json');
  });

  it('should handle response timeouts', async () => {
    global.fetch = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 31000))); // Simulate timeout
    await expect(apiService.get('/test')).rejects.toThrow('Timeout');
  });

  it('should handle successful response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );
    const response = await apiService.get('/test');
    expect(response.data).toBe('test');
  });

  it('should handle error response with status >= 400', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 404,
        json: () => Promise.resolve({ error: 'Not Found' }),
      })
    );
    await expect(apiService.get('/test')).rejects.toEqual({
      body: { error: 'Not Found' },
      status: 404,
    });
  });

  it('should extract body as JSON', async () => {
    const response = {
      clone: jest.fn(() => ({
        json: jest.fn(() => Promise.resolve({ data: 'jsonResponse' })),
      })),
    };
    const data = await apiService.extractBody({}, response);
    expect(data).toEqual({ data: 'jsonResponse' });
  });
});
