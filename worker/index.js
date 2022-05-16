// TODO Use CDN cache https://developers.cloudflare.com/workers/runtime-apis/cache/

import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'

import { createPageRenderer } from "vite-plugin-ssr";
// `importBuild.js` enables us to bundle our worker code into a single file, see https://vite-plugin-ssr.com/cloudflare-workers and https://vite-plugin-ssr.com/importBuild.js
import "../dist/server/importBuild.js";

const renderPage = createPageRenderer({ isProduction: true });
const assetManifest = JSON.parse(manifestJSON)
const api = 'https://demo.project-franklin-api.workers.dev'

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const live = url.searchParams.has('live');
      const isPreview = url.searchParams.has('preview');
      const previewKey = url.searchParams.get('preview') ?? '';
  
      if (isPreview && !previewKey) {
        return new Response('Preview key is missing', {status: 400});
      }
  
      if (pathname !== '/' && !pathname.startsWith('/content/')) {
        return await handleAsset(request, env, ctx)
      }
  
      if (live) {
        const response = await handleSsr(request.url, {
          api,
          preview: previewKey,
          live,
        }, env);
  
        if (response === null) {
          return new Response("Page rendering failed", { status: 500 });
        }
  
        return response;
      }
  
      const reqPublishedPage = await fetch(`${api}/page?path=${pathname}&preview=${previewKey}`)
      if (reqPublishedPage.ok) {
        return reqPublishedPage
      }
      
      return new Response('Page not found', { status: 404 });
    }
    catch (e) {
      console.error(e);
      return new Response("Internal Error", { status: 500 });
    }
  },
};

async function handleAsset(request, env, ctx) {
  try {
    return await getAssetFromKV(
      {
        request,
        waitUntil(promise) {
          return ctx.waitUntil(promise)
        },
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      },
    )
  } catch (e) {
    console.error(e)
    return new Response('An unexpected error occurred', { status: 500 })
  }
}

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
