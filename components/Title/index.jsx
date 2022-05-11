import style from "./index.module.css"

export default function Title(props) {
  if(!props.self) return '';
  const { text, type } = props.self;
  
  if(type !== undefined) {
    const HeaderTag = type;
    return (<HeaderTag className={style.title}>{text || 'Home'}</HeaderTag>);
  }
}
