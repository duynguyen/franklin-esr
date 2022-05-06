import { createPageRenderer } from "vite-plugin-ssr";
// `importBuild.js` enables us to bundle our worker code into a single file, see https://vite-plugin-ssr.com/cloudflare-workers and https://vite-plugin-ssr.com/importBuild.js
import "../dist/server/importBuild.js";

export default {
  async fetch(request, env) {
    try {
      return handleFetchEvent(request, env);
    } catch (e) {
      console.log(e);
      return new Response("Internal Error", { status: 500 });
    }
  },
};

async function handleFetchEvent(
  request,
  env
) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isPreview = url.searchParams.has('preview');
  const previewKey = url.searchParams.get('preview') ?? '';
  
  if (isPreview && !previewKey) {
    return new Response('Preview key is missing', {status: 400});
  }
  
  if (pathname.startsWith('/assets/') || pathname === '/robots.txt' || pathname === '/favicon.ico') {
    return env.ASSETS.fetch(request);
  }
  
  if (pathname.startsWith('/api/')) {
    return handleAPIEvent(request, env, url, previewKey);
  }
  
  const pageBody = await env.PAGES.get(`${pathname}.html${previewKey}`);
  
  if (pageBody === null) {
    // TODO Redirect to custom 404 page ?
    return new Response('Page not found', {status: 404});
  }
  
  return new Response(pageBody, {
    headers: {
      'content-encoding': 'gzip',
      'content-type': 'text/html;charset=UTF-8',
      'x-cache': 'hit'
    }
  });
}

async function handleAPIEvent(request, env, url, previewKey) {
  const path = url.searchParams.get('path');
  const modelPath = `${path}.ucm.json`;
  
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {status: 405});
  }
  
  if (!path) {
    return new Response(`Missing parameter "path"`, {status: 400});
  }
  
  if (url.pathname === '/api/page') {
    const response = await handleSsr(`${url.origin}${path}`, {
      preview: previewKey,
      origin: url.origin
    });
  
    if (response === null) {
      return new Response("Page rendering failed", { status: 500 });
    }
    
    return response;
  }
  else if (url.pathname === '/api/model') {
    const model = await env.MODELS.get(`${modelPath}${previewKey}`);
    
    if (model === null) {
      return new Response('Model not found', {status: 404});
    }
  
    return new Response(model, {
      headers: {
        'content-type': 'application/json'
      }
    });
  }
  
  return new Response('Nothing here', { status: 404 })
}

const renderPage = createPageRenderer({ isProduction: true });

async function handleSsr(url, customParams) {
  const pageContextInit = { url, fetch: (...args) => fetch(...args), customParams };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return null;
  } else {
    const { readable, writable } = new TransformStream();
    httpResponse.pipeToWebWritable(writable);
    return new Response(readable, {
      headers: {
        'content-encoding': 'gzip',
        'content-type': 'text/html;charset=UTF-8',
        'x-cache': 'miss'
      }
    });
  }
}
