import style from "./index.module.css"

export default function Title({children}) {
  return <h2 className={style.title}>{children}</h2>
}
