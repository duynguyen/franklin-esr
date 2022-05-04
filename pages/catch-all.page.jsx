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
  
  const origin = customParams.origin;
  const preview = customParams.preview;
  
  const formData = new FormData();
  formData.append('path', routeParams.path);
  
  if (preview) {
    formData.append('preview', preview);
  }
  
  const req = await fetch(`${origin}/api/model?${new URLSearchParams(formData).toString()}`);
  const model = await req.json();
  
  return {
    pageContext: {
      pageProps: {
        model
      }
    },
  }
}
