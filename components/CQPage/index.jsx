import {createElement, lazy, Suspense} from 'react'

export default function Page({model, components}) {
  if (model?.header?.role !== 'cq:Page') {
    console.log('Unsupported role');
    
    return null
  }
  
  if (!model?.body?.content) {
    console.log('No content to render');
  
    return null
  }
  
  if (!model?.body?.content?.props?.self?.['cq:template']) {
    const template = model.body.content.props.self['cq:template'];
    
    console.log(`Template found "${template}" but ignored for the moment`);
    
    return null
  }
  
  export const title = model?.body?.content?.props?.self?.jcr_title
  
  const root = model?.body?.content?.children?.[0]
  
  if (!root) {
    console.log(`Root not found`);
    
    return null
  }
}
