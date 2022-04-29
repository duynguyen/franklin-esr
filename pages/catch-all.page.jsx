export default function Page({model}) {
  return (
    <>
      <h1>Model</h1>
      <pre>{JSON.stringify(model, null, 4)}</pre>
    </>
  )
}

export async function onBeforeRender({routeParams, fetch = window.fetch, urlParsed}) {
  let model = {}
  
  try {
    const req = await fetch(`${urlParsed.origin || location.origin}/api/model?path=${routeParams.path}`);
    model = await req.json();
  }
  catch(e) {
    console.error(e)
  }
  
  return {
    pageContext: {
      pageProps: {
        model
      }
    },
  }
}
