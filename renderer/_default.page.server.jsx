import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import Layout from '../components/Layout'
import { getPageTitle } from './getPageTitle'


export { render }
export { passToClient }

const passToClient = ['pageProps', 'documentProps', 'customParams']

function render(pageContext) {
  const { Page, pageProps } = pageContext
  const pageHtml = ReactDOMServer.renderToString(
    <Layout pageContext={pageContext}>
      <Page {...pageProps} />
    </Layout>,
  )
  
  const title = getPageTitle(pageContext)
  
  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="franklin-esr demo">
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
  
  return {
    documentHtml,
    pageContext: {
      customParams: pageContext.customParams
    }
  }
}
