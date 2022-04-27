import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { escapeInject, dangerouslySkipEscape, pipeNodeStream } from 'vite-plugin-ssr'
import { PageShell } from './PageShell'
import { getPageTitle } from './getPageTitle'

const passToClient = ['pageProps', 'documentProps']

async function render(pageContext) {
  const { Page, pageProps } = pageContext

  const pageHtml = ReactDOMServer.renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>,
  )

  // let didError = false;
  // const pipe = pipeNodeStream((res) => {
  //   const stream = ReactDOMServer.renderToPipeableStream(
  //     <PageShell pageContext={pageContext}>
  //       <Page {...pageProps} />
  //     </PageShell>,
  //     {
  //       onCompleteShell() {
  //         stream.pipe(res)
  //       },
  //       onError(x) {
  //         didError = true;
  //         console.error(x)
  //       }
  //     }
  //   )
  // })
  
  const title = getPageTitle(pageContext)

  return escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="AEM WKND built in Vite SSR">
        <meta property="cq:pagemodel_router" content="disabled" />
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
        // <div id="page-view">${pipe}</div>
}

export { render }
export { passToClient }