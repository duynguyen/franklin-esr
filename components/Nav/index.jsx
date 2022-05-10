import styles from "./index.module.css"
import {useState} from "react";
import Link from '../Link'

function NavDropdown({navItem}) {
  const [expanded, setExpanded] = useState(false)

  return <li
    className={[styles["nav-item"], styles["nav-dropdown-item"]].join(" ")}
    onMouseEnter={() => setExpanded(true)}
    onMouseLeave={() => setExpanded(false)}
    key={navItem.name}
  >
    <Link href={navItem.link}>{navItem.name}</Link>
    <ul style={{visibility: expanded ? "initial" : "collapse"}} className={styles["nav-dropdown"]}>
      { navItem.children.map(c =>
        <li className={[styles["nav-item"], styles["nav-item-in-dropdown"]].join(" ")} key={c}>
          <Link href={c.link}>{c.name}</Link>
        </li>
      ) }
    </ul>
  </li>
}

export default function Nav({items}) {
  return <ul className={styles["nav-group"]}>
    {items.map(i =>
      i.children.length > 0 ?
        <NavDropdown navItem={i}/> :
        <li className={styles["nav-item"]} key={i}>
          <Link href={i.link}>{i.name}</Link>
        </li>
    )}
  </ul>
}
