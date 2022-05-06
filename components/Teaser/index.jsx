import styles from "./index.module.css"
import altStyles from "./teaser.module.css"

export default function Teaser(props) {
  const {pretitle, title, description, heroImageUrl, buttons, altStyle = true} = props

  const customStyle = altStyle ? altStyles : null

  const selectClassName = (defaultStyle, customStyle) => {
    return customStyle ?? defaultStyle
  }

  return <div className={selectClassName(styles.teaserContainer, customStyle?.["teaserContainer"])}>
    <img src={heroImageUrl} className={selectClassName(styles.heroImage, customStyle?.["heroImage"])}/>
    <div className={selectClassName(styles.contentContainer, customStyle?.["contentContainer"])}>
      <div className={selectClassName(styles.teaserTextContainer, customStyle?.["teaserTextContainer"])}>
        <p className={selectClassName(styles.teaserPreTitle, customStyle?.["teaserPreTitle"])}>{pretitle}</p>
        <h3 className={selectClassName(styles.teaserTitle, customStyle?.["teaserTitle"])}>{title}</h3>
        <p className={selectClassName(styles.teaserParagraph, customStyle?.["teaserParagraph"])}>{description}</p>
        <div>
          { buttons?.map((b, i) => (
            <button key={b.title} className={selectClassName(styles.teaserButton, customStyle?.["teaserButton"])} id={`button-${i}`}>{b.title}</button>)) }
        </div>
      </div>
    </div>
  </div>

}