import style from "./index.module.css"

export default function Header({children}) {
  return <header className={style.header}>
    {children}
  </header>
}