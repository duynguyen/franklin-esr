import { createPageRenderer } from "vite-plugin-ssr";
// `importBuild.js` enables us to bundle our worker code into a single file, see https://vite-plugin-ssr.com/cloudflare-workers and https://vite-plugin-ssr.com/importBuild.js
import "../dist/server/importBuild.js";

const ucmQuery = `
      query GetUCMDocument($path: String!) {
        documents(resolve: true, path: $path) {
          header {
            id
            path
            role
            generator
            filename
          }
          properties {
            schema
            data
          }
          ... on Page {
            body {
              contentType
              content
            }
          }
        }
      }
    `;

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
  const live = url.searchParams.has('live');
  const project = url.searchParams.get('project') ?? '';
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
  
  if (live) {
    const response = await handleSsr(`${url.origin}${pathname}`, {
      preview: previewKey,
      origin: url.origin,
      live,
      project
    });
  
    if (response === null) {
      return new Response("Page rendering failed", { status: 500 });
    }
  
    return response;
  }
  
  const page = await env.PAGES.get(`${pathname}.html${previewKey}`);
  
  if (page === null) {
    // TODO Redirect to custom 404 page ?
    return new Response('Page not found', {status: 404});
  }
  
  return new Response(page, {
    headers: {
      'content-encoding': 'gzip',
      'content-type': 'text/html;charset=UTF-8',
      'x-cache': 'hit'
    }
  });
}

async function handleAPIEvent(request, env, url, previewKey) {
  const path = url.searchParams.get('path');
  const project = url.searchParams.get('project');
  const live = url.searchParams.has('live');
  const modelPath = `${path}.ucm.json`;
  
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {status: 405});
  }
  
  if (url.pathname === '/api/css') {
    const defaultVars = () => env.ASSETS.fetch(new Request(`${url.origin}/vars.css`))
    
    if (!project) {
      return defaultVars()
    }
    
    const reqCSS = await fetch(`${project}/vars.css`);
    if (!reqCSS.ok) {
      return defaultVars()
    }
  
    const CSS = await reqCSS.text();
    
    if (!CSS) {
      return defaultVars()
    }
    
    return new Response(CSS, {
      headers: {
        'content-type': 'text/css'
      }
    });
  }
  else if (url.pathname === '/api/model') {
    if (!path) {
      return new Response(`Missing parameter "path"`, {status: 400});
    }
    
    if (live) {
      const reqModel = await fetch(
          `https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/demo-site/${
              previewKey ? 'preview' : 'live'
          }/graphql`,
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  query: ucmQuery,
                  variables: {
                      path: path
                  }
              })
          }
      );
      
      if (!reqModel.ok) {
        return new Response(reqModel.statusText, {status: reqModel.status});
      }
  
      const model = await reqModel.json();
      const doc = model?.data?.documents[0];
      
      return new Response(JSON.stringify(doc ? doc : {}), {
          headers: {
              'content-type': 'application/json',
              'x-cache': 'miss'
          }
      });
    }
    
    const model = await env.MODELS.get(`${modelPath}${previewKey}`);
    
    if (model === null) {
      return new Response('Model not found', {status: 404});
    }
  
    return new Response(model, {
      headers: {
        'content-type': 'application/json',
        'x-cache': 'hit'
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
