export default function Page({model}) {
  return (
    <>
      <h1>Model</h1>
      <pre>{JSON.stringify(model, null, 4)}</pre>
    </>
  )
}

export async function onBeforeRender({routeParams, fetch = window.fetch, customParams = {}}) {
  if (!import.meta.env.SSR) {
    customParams = JSON.parse(sessionStorage.getItem('customParams'))
  }
  
  let model = {};
  const origin = customParams.origin;
  const preview = customParams.preview;
  const live = customParams.live;
  
  const previewParam = preview ? `&preview=${preview}` : '';
  const liveParam = live ? `&live` : '';
  
  const req = await fetch(`${origin}/api/model?path=${routeParams.path}${previewParam}${liveParam}`);
  if (req.ok) {
    model = await req.json();
  }
  
  return {
    pageContext: {
      pageProps: {
        model
      }
    },
  }
}
