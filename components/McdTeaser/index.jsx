const MCD_SCENE7_SERVER = "https://s7d1.scene7.com";
const MCD_SCENE7_INSTANCE = "mcdonaldsstage";

const getImgSrcSet = (imageServerUrl, fileReference) => {
  const serverUrl = imageServerUrl.includes('https://') ? imageServerUrl : `${MCD_SCENE7_SERVER}${imageServerUrl}`;
  const fileReferenceSplits = fileReference.split('/');
  const fileName = fileReferenceSplits[fileReferenceSplits.length - 1].split('.')[0];
  return {
    desktop: `${serverUrl}${MCD_SCENE7_INSTANCE}/${fileName}:2-column-desktop`,
    mobile: `${serverUrl}${MCD_SCENE7_INSTANCE}/${fileName}:2-column-mobile`,
  };
}

export default function Teaser(props) {
  const {id, jcr_title, jcr_description, textIsRich, imageServerUrl, fileReference, alt, aria, cta, ctaLink} = props.self
  const hasImage = !!fileReference;
  const imgSrcSet = hasImage ? getImgSrcSet(imageServerUrl, fileReference) : {};

  return <div className="teaser cmp-teaser--publication-default"><div className="cmp-teaser" id={id}>
    {hasImage && <div className="cmp-teaser__image">
      <picture>
        <source srcSet={imgSrcSet.desktop}/>
        <source srcSet={imgSrcSet.mobile} media="(max-width: 767px)"/>
        <img alt={alt} src={imgSrcSet.desktop} className="cmp-image__image"/>
      </picture>
    </div>}
    <div className="cmp-teaser__content">
      <div className="cmp-teaser__body">

        { (!textIsRich || !textIsRich[0]) && <div className="cmp-teaser__title"><h2>{jcr_title}</h2></div> }
        { textIsRich && textIsRich[0] && <div className="cmp-teaser__title" dangerouslySetInnerHTML={{__html: jcr_title}} /> }
  
        { (!textIsRich || !textIsRich[1]) && <p className="cmp-teaser__description">{jcr_description}</p> }
        { textIsRich && textIsRich[1] && <div className="cmp-teaser__description" dangerouslySetInnerHTML={{__html: jcr_description}} /> }
      </div>
      {cta && <div className="cmp-teaser__action-container">
        <a href={ctaLink} target="_blank" className="cmp-teaser__action-link" aria-label={aria}>
          {cta}
        </a>
      </div>}
        
    </div>
  </div>
  </div>


}
