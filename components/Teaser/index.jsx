import defaultStyles from "./default-style.module.css"
import altStyles from "./alt-style.module.css"

export default function Teaser(props) {
  const {id, pretitle, title, description, imageUrl, buttons, useAltStyles = true} = props
  
  const selectedStyles = useAltStyles ? altStyles : defaultStyles;

  const imgStrSetOptions = ['320', '480', '600', '800', '1024', '1200', '1600']
  const getImgSrcSet = (path) => {
    return imgStrSetOptions.map(size => { return path + `?wid=`+  size + ' ' + size + 'w' }).join(', ')
  }

  return <div className={selectedStyles.teaserContainer} id={id}>
    <picture>
      <source srcSet={getImgSrcSet(imageUrl)} type="image/webp"/>
      <img loading={useAltStyles ? 'lazy' : 'eager'} alt="" src={`${imageUrl}?wid=${useAltStyles ? '480' : '1024'}`} className={selectedStyles.heroImage}/>
    </picture>
    <div className={selectedStyles.contentContainer}>
      <div className={selectedStyles.teaserTextContainer}>
        <p className={selectedStyles.teaserPreTitle}>{pretitle}</p>
        {useAltStyles ? <h3 className={selectedStyles.teaserTitle}>{title}</h3> : <h1 className={selectedStyles.teaserTitle}>{title}</h1>}
        <p className={selectedStyles.teaserParagraph}>{description}</p>
        <div>
          { buttons?.map((b, i) => (
            <button key={i} className={selectedStyles.teaserButton}>{b.title}</button>)) }
        </div>
      </div>
    </div>
  </div>

}
