import defaultStyles from "./default-style.module.css"
import altStyles from "./alt-style.module.css"

const baseUrl = 'https://smartimaging.scene7.com/is/image/'

// const imgStrSetOptions = ['320', '480', '600', '800', '1024', '1200', '1600']
const imgStrSetOptions = ['320', '480', '600', '800']

const getImgSrcSet = (path) => {
  return imgStrSetOptions.map(size => { return path + `?wid=`+  size + ' ' + size + 'w' }).join(', ')
}

export default function Teaser(props) {
  const {buttons} = props
  const {id, pretitle, jcr_title, jcr_description, textIsRich} = props.self

  const useAltStyles = (id == 'custom-teaser' ? false : true)
  
  const imageUrl = baseUrl + props.resolved.fileReference.document.properties.data.metadata['dam:scene7File']

  const selectedStyles = useAltStyles ? altStyles : defaultStyles;
  
  return <div className={selectedStyles.teaserContainer} id={id}>
    <picture>
      <source srcSet={getImgSrcSet(imageUrl)} type="image/webp"/>
      <img loading={useAltStyles ? 'lazy' : 'eager'} alt={jcr_title} src={`${imageUrl}?wid=${useAltStyles ? '480' : '800'}`} className={selectedStyles.heroImage}/>
    </picture>
    <div className={selectedStyles.contentContainer}>
      <div className={selectedStyles.teaserTextContainer}>
        <p className={selectedStyles.teaserPreTitle}>{pretitle}</p>
        {useAltStyles ? <h3 className={selectedStyles.teaserTitle}>{jcr_title}</h3> : <h1 className={selectedStyles.teaserTitle}>{jcr_title}</h1>}
  
        { !textIsRich && <p className={selectedStyles.teaserParagraph}>{jcr_description}</p> }
        { textIsRich && <div className={selectedStyles.teaserParagraph} dangerouslySetInnerHTML={{__html: jcr_description}} /> }
        
        <div>
          { buttons?.map((b) => (
            <a key={b.text} href={b.link} target={b.target} className={selectedStyles.teaserButton}>
              {b.text}
            </a>
            )) }
        </div>
      </div>
    </div>
  </div>

}
