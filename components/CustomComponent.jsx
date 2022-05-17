import React, {Suspense, lazy} from 'react'

export default function CustomComponent(props) {
  const {customComponentName} = props
  const Component = lazy(() => import(`custom:${customComponentName}`))

  return <Suspense fallback={<div>Loading...</div>}>
    <Component {...props} />
  </Suspense>
}
