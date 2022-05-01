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
  
  const pagePath = `${pathname}.html`;
  const pageBody = await env.PAGES.get(pagePath);
  
  if (pageBody !== null) {
    return new Response(pageBody, {
      headers: {
        'content-encoding': 'gzip',
        'content-type': 'text/html;charset=UTF-8',
        'x-cache': 'hit'
      }
    });
  }
  
  const response = await handleSsr(request.url);
  if (response !== null) return response;
  
  return new Response("Internal Error", { status: 500 });
}

async function handleAPIEvent(request, env) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const authorization = request.headers.get('authorization');
  const modelPath = `${path}.model.json`;
  const pagePath = `${path}.html`;
  
  // const query = async () => {
  //   const endpoint = 'https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/wknd/live/graphql';
  //   const gql = `
  //     {
  //         pageByPath: documents(path: "${path}") {
  //             header { id path role tags }
  //             properties { schema data }
  //             ... on Page { body { contentType content } }
  //         }
  //     }
  //   `;
  //
  //   const req = await fetch(`${endpoint}?query=${gql}`)
  //   return await req.text();
  // };
  
  if (url.pathname === '/api/publish') {
    if (request.method !== 'PUT') {
      return new Response('Method not allowed', {
        status: 405
      });
    }
  
    if (!authorization) {
      return new Response(JSON.stringify({
        error: `Unauthorized`
      }), {
        status: 401,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
    
    if (!path) {
      return new Response(JSON.stringify({
        error: `Missing parameter "path"`
      }), {
        status: 400,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  
  
    const reqModel = await fetch(`https://author-p63943-e534691.adobeaemcloud.com${modelPath}?configid=ims`, {
      headers: {
        authorization
      }
    });
  
    if (reqModel.status !== 200) {
      return new Response(JSON.stringify({
        error: reqModel.statusText
      }), {
        status: reqModel.status,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  
    const model = await reqModel.text();
  
    await env.MODELS.put(modelPath, model);
    
    const {origin} = new URL(request.url)
    const pageResponse = await handleSsr(`${origin}${path}`)
    
    if (pageResponse === null) {
      return new Response("Internal Error", { status: 500 });
    }
    
    await env.PAGES.put(pagePath, pageResponse.body);
  
    return new Response(`Page and model published for path: ${path}`);
  }
  else if (url.pathname === '/api/model') {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405
      });
    }
    
    if (!path) {
      return new Response(JSON.stringify({
        error: `Missing parameter "path"`
      }), {
        status: 400,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  
    let model = await env.MODELS.get(modelPath);
    
    if (model !== null) {
      return new Response(model, {
        headers: {
          'content-type': 'application/json',
          'x-cache': 'hit'
        }
      });
    }
  
    const reqModel = await fetch(`https://publish-p63943-e534691.adobeaemcloud.com${modelPath}`);
  
    if (reqModel.status !== 200) {
      return new Response(JSON.stringify({
        error: reqModel.statusText
      }), {
        status: reqModel.status,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
  
    model = await reqModel.text();
  
    return new Response(model, {
      headers: {
        'content-type': 'application/json',
        'x-cache': 'miss'
      }
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
    return new Response(readable, {
      headers: {
        'content-encoding': 'gzip',
        'content-type': 'text/html;charset=UTF-8',
        'x-cache': 'miss'
      }
    });
  }
}
