import style from "./index.module.css"

export default function Container({children}) {
  return <div className={style.centerContainer}>
    <div className={style.container}>
      {children}
    </div>
  </div>
}