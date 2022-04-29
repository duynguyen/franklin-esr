import fetch from 'cross-fetch'

export default function Page({model}) {
  return (
    <>
      <h1>Welcome</h1>
      <pre>{JSON.stringify(model, null, 4)}</pre>
    </>
  )
}

export async function onBeforeRender({routeParams}) {
  let model = {}
  
  try {
    // const req = await fetch(`https://publish-p63943-e534691.adobeaemcloud.com/${routeParams.url}.model.json`)
    // model = await req.json();
  
    const gql = `
        {
            pageByPath: documents(path: "${routeParams.url}") {
                header { id path role tags }
                properties { schema data }
                ... on Page { body { contentType content } }
            }
        }
    `
    const req = await fetch(`https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/wknd/live/graphql?query=${gql}`)
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
