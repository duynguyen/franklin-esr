import React from 'react'
import { PageContextProvider } from '../../hooks/usePageContext'
// import './index.css'
import McdHeader from "../McdHeader";
import McdFooter from "../McdFooter";

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


export default function McdLayout({ pageContext, children }) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <link rel="stylesheet" type="text/css" href="/vars.css"/>
        <link rel="stylesheet" type="text/css" href="/mcd-site-us.css"/>
        <link rel="stylesheet" type="text/css" href="/mcd-grid.css"/>
        <link rel="stylesheet" type="text/css" href="/mcd-dependencies.css"/>
        <McdHeader />
        <Main>
          {/*<Breadcrumbs path={pageContext.urlPathname}/>*/}
          {children}
        </Main>
        <McdFooter />
      </PageContextProvider>
    </React.StrictMode>
  )
}
