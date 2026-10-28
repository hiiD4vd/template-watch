import { assetUrl } from '../../lib/assets';
import GreyLines from '../GreyLines';
import DialIcon from '../icons/DialIcon';
import { content } from '../../content';
export default function Images() {
  return (
    <section className="big-text-section" data-section="Images">
      <div className="fps-timeless-wrapper">
        <p className="fps-watch-title fps-timeless-text grey-line">
          {content.brand.left}
          <span></span>
          {content.brand.right}
        </p>{' '}
        <div className="fps-timeless-content fps-timeless-text">
          <GreyLines description={content.images.description} />
        </div>
      </div>{' '}
      <div className="fps-timeless-informations-wrapper ">
        <DialIcon />{' '}
        <div className="fps-timeless-informations">
          <div className="fps-movement-wrapper">
            <p className="fps-caption caption">{content.images.firstLabel}</p>{' '}
            <p className="fps-movement-title small-title">
              {content.images.firstText}
            </p>
          </div>{' '}
          <div className="fps-informations-wrapper">
            <p className="fps-caption caption">{content.images.secondLabel}</p>{' '}
            <p className="fps-informations-content body-text">
              {content.images.secondText}
            </p>
          </div>
        </div>
      </div>{' '}
      <div className="images-w">
        <div className="single-img-w">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={assetUrl('images/gallery/first_1.webp')}
            ></source>{' '}
            <img alt="" src={assetUrl('images/gallery/first_1.webp')} />
          </picture>
        </div>{' '}
        <div className="single-img-w">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={assetUrl('images/gallery/first_2.webp')}
            ></source>{' '}
            <img alt="" src={assetUrl('images/gallery/first_2.webp')} />
          </picture>
        </div>{' '}
        <div className="single-img-w">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={assetUrl('images/gallery/first_3.webp')}
            ></source>{' '}
            <img alt="" src={assetUrl('images/gallery/first_3.webp')} />
          </picture>
        </div>{' '}
        <div className="single-img-w">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={assetUrl('images/gallery/first_4.webp')}
            ></source>{' '}
            <img alt="" src={assetUrl('images/gallery/first_4.webp')} />
          </picture>
        </div>
      </div>
    </section>
  );
}
