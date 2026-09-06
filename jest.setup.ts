import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

// Polyfill for Next.js Request/Response in Node environment
if (typeof global.Request === 'undefined') {
  const { Request, Response, Headers } = require('next/dist/compiled/@edge-runtime/primitives');
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}
