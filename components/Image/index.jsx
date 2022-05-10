import styles from "./index.module.css"

export default function Image({src, style, caption}) {
  return <div className={styles["image-container"]}>
    <img loading="lazy" width="296" height="68" alt="" src={src} className={styles["image"]} />
    <span className={styles.caption}>{caption}</span>
  </div>
}
