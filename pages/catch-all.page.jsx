import {lazy, Suspense} from 'react'
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
  
  const Heading = lazy(() => import('../components/Heading'))
  
  return (
    <>
      <Suspense>
        <Heading>Model</Heading>
      </Suspense>
      <pre>{JSON.stringify(model, null, 4)}</pre>
    </>
  )
}

export async function onBeforeRender({routeParams, fetch = window.fetch, customParams = {}}) {
  if (!import.meta.env.SSR) {
    customParams = JSON.parse(sessionStorage.getItem('customParams'))
  }
  
  let model = {};
  const path = routeParams.path;
  const api = customParams.api;
  const preview = customParams.preview;
  const live = customParams.live;
  
  const previewParam = preview ? `&preview=${preview}` : '';
  const liveParam = live ? `&live=true` : '';
  
  const req = await fetch(`${api}/model?path=${path}${previewParam}${liveParam}`);
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
