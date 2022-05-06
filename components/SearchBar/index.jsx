import style from "./index.module.css"

export default function SearchBar() {
  return <div className={style.container}>
    <section role="search">
      <form className={style.form}>
        <i className={style.icon} />
        <input type="text" className={style.input} placeholder="Search" />
      </form>
    </section>
  </div>
}