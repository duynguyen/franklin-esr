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
  const { pathname } = new URL(request.url);
  
  if (pathname.startsWith('/assets/') || pathname === '/robots.txt' || pathname === '/favicon.ico') {
    return env.ASSETS.fetch(request);
  }
  
  if (pathname.startsWith('/api/')) {
    return handleAPIEvent(request, env);
  }
  
  const response = await handleSsr(request.url);
  if (response !== null) return response;
  
  return new Response("Internal Error", { status: 500 });
}

async function handleAPIEvent(request, env) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  
  if (url.pathname === '/api/model' && path) {
    const query = async () => {
      const endpoint = 'https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/wknd/live/graphql';
      const gql = `
        {
            pageByPath: documents(path: "${path}") {
                header { id path role tags }
                properties { schema data }
                ... on Page { body { contentType content } }
            }
        }
      `;
    
      const req = await fetch(`${endpoint}?query=${gql}`)
      return await req.text();
    };
    
    if (request.method === 'GET') {
      let model = await env.MODELS.get(path);
      if (!model) {
        model = await query(path);
      }
      
      return new Response(model, {
        headers: {
          'content-type': 'application/json'
        }
      });
    }
    else if (request.method === 'PUT') {
      const model = await query(path);
      await env.MODELS.put(path, model);
  
      return new Response(model, {
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  
    return new Response('Method not allowed', {
      status: 405
    });
  }
  
  return new Response('Nothing here', { status: 404 })
}

const renderPage = createPageRenderer({ isProduction: true });

async function handleSsr(url) {
  const pageContextInit = { url, fetch: (...args) => fetch(...args) };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return null;
  } else {
    const { readable, writable } = new TransformStream();
    httpResponse.pipeToWebWritable(writable);
    return new Response(readable);
  }
}
