import { getPageModel } from '../../lib/pages'

async function onBeforeRender(pageContext) {
  const model = await getPageModel(import.meta.env.VITE_AEM_PATH, pageContext.fetch)
  
  return {
    pageContext: {
      pageProps: {
        model,
        ASSETS_SERVER: import.meta.env.VITE_AEM_HOST
      },
      documentProps: { title: `Home` },
    },
  }
}

export { onBeforeRender }

export const doNotPrerender = true