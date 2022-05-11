export default function Text(props) {
  const {textIsRich, text} = props.self
  
  if (textIsRich) {
    return <div dangerouslySetInnerHTML={{__html: text}} />
  }

  return <p>{text}</p>
}
