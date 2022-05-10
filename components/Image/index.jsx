import styles from "./index.module.css"

export default function Image({src, style, caption}) {
  return <div className={styles["image-container"]}>
    <img alt="" src={src} className={styles["image"]} />
    <span className={styles.caption}>{caption}</span>
  </div>
}
