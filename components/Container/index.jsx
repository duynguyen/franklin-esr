import style from "./index.module.css"
import containerGlobalStyle from "./container-global.css"

export default function Container({id, children}) {
  return <div className={style.centerContainer}>
    <div id={id} className={style.container} >
      {children}
    </div>
  </div>
}