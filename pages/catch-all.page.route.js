export default pageContext => {
  const { url } = pageContext
  
  return {
    routeParams: { path: url }
  }
}
