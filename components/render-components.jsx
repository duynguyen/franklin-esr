import React from "react";
import Teaser from "./Teaser";
import Separator from "./Separator";
import Title from "./Title";
import Text from "./Text";
import Container from "./Container";

const ComponentHandlers = {
  'core/wcm/components/separator/v1/separator': (node) => {return [Separator, node.props, node.children]},
  'core/wcm/components/title/v3/title': (node) => {return [Title, node.props, node.children]},
  'core/wcm/components/text/v2/text': (node) => {return [Text, node.props, node.children]},
  'core/wcm/components/teaser/v2/teaser': (node) => {
    // TODO: Verify that this structure always exists in this way if buttons are added
    const buttons = node.children[1]?.children?.map((c) => {
      return {"text": c.props.self.text, "link": c.props.self.link, "target": c.props.self.linkTarget}
    })
    return [Teaser, {buttons, ...node.props}, null]
  }
};

function CoreComponent({node}) {
  let nodeContent = <></>
  const [component, newProps, newChildren] = (ComponentHandlers[node.type]?.(node)) ?? ([undefined, undefined, undefined])

  if (typeof component !== "undefined") {
    nodeContent = React.createElement(
      component,
      {
        ...newProps,
        key: node.ref
      }
    );
  }

  const nestedNodes = (newChildren || node.children || []).map(child => {
    return <CoreComponent key={child.ref} node={child} type='child' />
  })

  const fixStyleId = (name) => {
    return name.replaceAll("/", "-sl-").replaceAll(":", "-cl-")
  }

  const nodeId = fixStyleId(node.ref)

  return (
    (node.type == 'core/wcm/components/container/v1/container') ?
      <Container id={nodeId}>
        <>
          {nodeContent}
        </>
        {nestedNodes}
      </Container>
      :
      <div id={nodeId}>
        <>
          {nodeContent}
        </>
        {nestedNodes}
      </div>
  )
}

export default CoreComponent;
