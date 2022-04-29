import express from 'express'
import vite from 'vite'
import { createPageRenderer } from 'vite-plugin-ssr'
import fetch from 'node-fetch'
import { fileURLToPath, format } from 'url'
import { dirname } from 'path'

const isProduction = process.env.NODE_ENV === 'production'
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = `${__dirname}/..`

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
  
  app.get('/api/model', async(req, res) => {
    const path = req.query.path
    const endpoint = 'https://runtime.adobe.io/api/v1/web/bdelacre/default/ibiza-content-services/wknd/live/graphql';
    const gql = `
        {
            pageByPath: documents(path: "${path}") {
                header { id path role tags }
                properties { schema data }
                ... on Page { body { contentType content } }
            }
        }
      `;
  
    const reqModel = await fetch(`${endpoint}?query=${gql}`)
    const model = await reqModel.json();
    
    res.json(model);
  })
  
  const renderPage = createPageRenderer({ viteDevServer, isProduction, root })
  app.get('*', async (req, res, next) => {
    const url = format({
      protocol: req.protocol,
      host: req.get('host'),
      pathname: req.originalUrl
    });
    const pageContextInit = {
      url,
      fetch
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
