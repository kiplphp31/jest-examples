import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import reduxApi from 'redux-api-middleware';
import * as Services from '@cpbd/bl-ui-lib';
import middleware from './middleware'; // adjust this path if needed

// Mock configurations
const middlewares = [thunk, logger, reduxApi.middleware, ...middleware];
const mockStore = configureMockStore(middlewares);

describe('API Middleware', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  it('dispatches API_REQUEST and API_RESPONSE on successful API call', async () => {
    // Mock Services API call
    Services.api.endpointProvider.getEndpoint = jest.fn(() => 'mockEndpoint');
    Services.api.requestHeaderService.getRequestHeaders = jest.fn(() => ({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }));

    const action = {
      type: 'API_REQUEST',
      meta: { uri: 'mockUri' },
    };

    await store.dispatch(action);

    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'API_REQUEST' });
    expect(actions[1].type).toBe('API_RESPONSE');
  });

  it('dispatches API_ERROR on failed API call', async () => {
    Services.api.endpointProvider.getEndpoint = jest.fn(() => {
      throw new Error('API Error');
    });

    const action = {
      type: 'API_REQUEST',
      meta: { uri: 'mockUri' },
    };

    try {
      await store.dispatch(action);
    } catch (error) {
      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: 'API_REQUEST' });
      expect(actions[1].type).toBe('API_ERROR');
    }
  });

  it('dispatches API_UNHANDLED_ERROR for unexpected errors', async () => {
    Services.api.endpointProvider.getEndpoint = jest.fn(() => {
      throw new Error('Unhandled Error');
    });

    const action = {
      type: 'API_REQUEST',
      meta: { uri: 'mockUri' },
    };

    try {
      await store.dispatch(action);
    } catch (error) {
      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: 'API_REQUEST' });
      expect(actions[2].type).toBe('API_UNHANDLED_ERROR');
    }
  });
});
