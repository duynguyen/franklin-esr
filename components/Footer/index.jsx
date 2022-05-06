import style from "./index.module.css"

export default function Footer({children}) {
  return <footer className={style.footer}>
    {children}
  </footer>
}