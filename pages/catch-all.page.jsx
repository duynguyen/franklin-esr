import Container from "../components/Container";
import CoreComponent from "../components/render-components";

export default function Page({model}) {
  if (model?.header?.path === '/content/demo-site/en/home') {

    const content = model.body.content;
    return (
      <Container>
        <CoreComponent key={content.ref} node={content} type={content.type} />
      </Container>
    )
  }
  
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
