export default function Text(props) {
  if(!props.self) return '';
  const { textIsRich, text } = props.self;
  const textCss = "";
  const richTextContent = () => (
      <div className={textCss} dangerouslySetInnerHTML={{__html: text}} />
  );
  const normalTextContent = () => (
      <div className={textCss}>{text}</div>
  );

  return textIsRich ? richTextContent() : normalTextContent();
}
