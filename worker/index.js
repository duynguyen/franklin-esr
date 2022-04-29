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
  if (isAssetUrl(request.url) || request.url.endsWith('/robots.txt') || request.url.endsWith('/favicon.ico')) {
    return env.ASSETS.fetch(request);
  }
  
  const response = await handleSsr(request.url);
  if (response !== null) return response;
}
function isAssetUrl(url) {
  const { pathname } = new URL(url);
  return pathname.startsWith("/assets/");
}

const renderPage = createPageRenderer({ isProduction: true });

async function handleSsr(url) {
  const { searchParams } = new URL(url);
  const token = searchParams.get('token');
  
  const pageContextInit = { url, auth: token };
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
