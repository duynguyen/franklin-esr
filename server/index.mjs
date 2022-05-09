import express from 'express'
import vite from 'vite'
import { createPageRenderer } from 'vite-plugin-ssr'
import fetch from 'node-fetch'
import { fileURLToPath, format } from 'url'
import { dirname } from 'path'

const isProduction = process.env.NODE_ENV === 'production'
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = `${__dirname}/..`

const ucmQuery = `
      query GetUCMDocument($path: String!) {
        documents(resolve: true, path: $path) {
          header {
            id
            path
            role
            generator
            filename
          }
          properties {
            schema
            data
          }
          ... on Page {
            body {
              contentType
              content
            }
          }
        }
      }
    `

startServer()

async function startServer() {
  const app = express()
  
  let viteDevServer
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`))
  } else {
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: 'ssr' },
    })
    app.use(viteDevServer.middlewares)
  }

  app.get('/api/model', async (req, res) => {
    const path = req.query.path
    const preview = req.query.preview

    const reqModel = await fetch(
        `https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/demo-site/${
            preview ? 'preview' : 'live'
        }/graphql`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: ucmQuery,
                variables: {
                    path: path
                }
            })
        }
    );

    if (!reqModel.ok) {
      res.status(reqModel.status).send(reqModel.statusText)
    }
    else {
      const model = await reqModel.json();
      res.json(model.data.documents[0]);
    }
  })
  
  const renderPage = createPageRenderer({ viteDevServer, isProduction, root })
  app.get('*', async (req, res, next) => {
    const host = req.get('host');
    const url = format({
      protocol: req.protocol,
      host,
      pathname: req.originalUrl
    });
    
    const pageContextInit = {
      url,
      fetch,
      customParams: {
        origin: format({
          protocol: req.protocol,
          host
        })
      }
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) return next()
    const stream = await httpResponse.getNodeStream()
    const { statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType)
    stream.pipe(res)
  })
  
  const port = 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
