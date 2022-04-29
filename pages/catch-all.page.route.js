export default pageContext => {
  const { url } = pageContext
  
  return {
    routeParams: { url }
  }
}
