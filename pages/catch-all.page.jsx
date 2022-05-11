// import {Suspense, lazy} from 'react'
import Teaser from "../components/Teaser";
import strings from "./strings";
import Container from "../components/Container";
import Title from "../components/Title";
import Separator from "../components/Separator";
import Flex from "../components/Grid/Flex";

export default function Page({model}) {
  if (model?.header?.path === '/content/demo-site/en/home') {
    const topTeaserProps = model.body.content.children[0].children[0].children[1].children[0].props
    const bottomTeaserProps = model.body.content.children[0].children[0].children[2].children[3].props
  
    // const Separator = lazy(() => import("../components/Separator"));
    // const Separator = lazy(() => import("https://franklin-project.pages.dev/components/Separator"));
    
    return (
      <>
        <Teaser {...topTeaserProps} buttons={strings.teaserButtons} useAltStyles={false} />
        <Container>
          <Title>Home</Title>
          <p>{strings.contentText}</p>
          {/*<Suspense>*/}
            <Separator />
          {/*</Suspense>*/}
          
          <Flex direction="row" gap={20}>
            <Teaser {...bottomTeaserProps} buttons={strings.teaserButtons} />
            <Teaser {...topTeaserProps} buttons={strings.teaserButtons} />
          </Flex>
        </Container>
      </>
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
