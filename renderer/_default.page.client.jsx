import {hydrateRoot, createRoot} from 'react-dom/client'
import { useClientRouter } from 'vite-plugin-ssr/client/router'
import Layout from '../components/Layout'
import { getPageTitle } from './getPageTitle'

let root
const { hydrationPromise } = useClientRouter({
  render(pageContext) {
    const { Page, pageProps, customParams } = pageContext
    
    const customParamsString = sessionStorage.getItem('customParams');
    if (!customParamsString) {
      // Use cached model for CSR
      customParams.live = undefined;
      sessionStorage.setItem('customParams', JSON.stringify(customParams))
    }
    
    const page = (
      <Layout pageContext={pageContext}>
        <Page {...pageProps} />
      </Layout>
    )
    const container = document.getElementById('page-view')
    if (pageContext.isHydration) {
      root = hydrateRoot(container, page)
    } else {
      if (!root) {
        root = createRoot(container)
      }
      root.render(page)
    }
    document.title = getPageTitle(pageContext)
  },
  onTransitionStart,
  onTransitionEnd,
})

hydrationPromise.then(() => {
  console.log('Hydration finished; page is now interactive.')
})

function onTransitionStart() {
  console.log('Page transition start')
  document.querySelector('#page-content').classList.add('page-transition')
}
function onTransitionEnd() {
  console.log('Page transition end')
  document.querySelector('#page-content').classList.remove('page-transition')
}
