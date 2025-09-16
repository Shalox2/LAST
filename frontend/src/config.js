const defaultApi = 'http://127.0.0.1:8000/api';
const envApi = process.env.REACT_APP_API_BASE;
export const API_BASE_URL = envApi || defaultApi;

const inferWsFromApi = (apiUrl) => {
  try {
    const u = new URL(apiUrl);
    const wsProtocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${u.host}/ws`;
  } catch (_) {
    return 'ws://127.0.0.1:8000/ws';
  }
};

const envWs = process.env.REACT_APP_WS_BASE;
export const WS_BASE_URL = envWs || inferWsFromApi(API_BASE_URL);

