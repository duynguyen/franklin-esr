import ReactDOMServer from 'react-dom/server'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr'
import Layout from '../components/Layout'
import { getPageTitle } from './getPageTitle'

export { render }
export { passToClient }

const passToClient = ['pageProps', 'documentProps', 'customParams']

async function render(pageContext) {
  const { Page, pageProps } = pageContext
  
  const title = getPageTitle(pageContext)
  
  let documentHtml;
  
  if (import.meta.env.MODE === 'worker') {
    const stream = await ReactDOMServer.renderToReadableStream(
      <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content="franklin-esr demo"/>
      </head>
      <body>
      <div id="page-view">
        <Layout pageContext={pageContext}>
          <Page {...pageProps} />
        </Layout>
      </div>
      </body>
      </html>
    );
    
    await stream.allReady;
    
    documentHtml = dangerouslySkipEscape(await new Response(stream).text())
  } else {
    const stream = ReactDOMServer.renderToNodeStream(
      <Layout pageContext={pageContext}>
        <Page {...pageProps} />
      </Layout>
    )

    documentHtml = escapeInject`<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="franklin-esr demo">
        </head>
        <body>
          <div id="page-view">${stream}</div>
        </body>
      </html>`
  }
  
  return {
    // TODO vite ssr documentHtml expects escaped string... but since we're doing on-demand SSG it's probably ok ...
    documentHtml,
    pageContext: {
      customParams: pageContext.customParams
    }
  }
}