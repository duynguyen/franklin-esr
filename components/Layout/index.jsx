import React from 'react'
import { PageContextProvider } from '../../hooks/usePageContext'
import './index.css'
import Header from "../Header";
import Image from "../Image";
import Nav from "../Nav";
import SearchBar from "../SearchBar";
import Footer from "../Footer";
import Flex from "../Grid/Flex";
// import Breadcrumbs from "../Breadcrumbs";

function Main({ children }) {
  return (
    <main
      id="page-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        lineHeight: '20px',
        fontSize: '16px',
      }}
    >
      {children}
    </main>
  )
}

export default function Layout({ pageContext, children }) {
  let customParams = pageContext?.customParams;
  if (!import.meta.env.SSR) {
    customParams = JSON.parse(sessionStorage.getItem('customParams'))
  }
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <link rel="stylesheet" type="text/css" href={`/api/css?project=${customParams.project}`}/>
        <Header>
          <img alt="" src="/logo.webp" loading="eager" width="296" height="68" style={{height: "80%"}} />
          <Nav items={[
            {name: "Home", link: "/content/demo-site/en/home", children: []},
            {name: "Article", link: "article", children: [
                {name: "Sample Article 1", link: "/content/demo-site/en/article/sample-article-1"},
                {name: "Sample Article 2", link: "/content/demo-site/en/article/sample-article-2"},
                {name: "Sample Article 3", link: "/content/demo-site/en/article/sample-article-3"},
                {name: "Sample Article 4", link: "/content/demo-site/en/article/sample-article-4"}
              ]},
            {name: "Contact Us", link: "/content/demo-site/en/contact-us", children: []}
          ]} />
          <SearchBar />
        </Header>
        <Main>
          {/*<Breadcrumbs path={pageContext.urlPathname}/>*/}
          {children}
        </Main>
        <Footer>
          <Image src="/logo.webp" style={{height: "90%"}} />
          <span style={{fontSize: "10px", color: `black`}}>© COMPANY NAME ADDRESS AVE, CITY NAME, STATE ZIP</span>
          <Flex gap={20} direction="row">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
          </Flex>
        </Footer>
      </PageContextProvider>
    </React.StrictMode>
  )
}
