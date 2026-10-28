import GreyLines from '../GreyLines';
import DialIcon from '../icons/DialIcon';
import { content } from '../../content';
export default function Timeless() {
  return (
    <section className="big-text-section" data-section="Timeless">
      <div className="fps-timeless-wrapper">
        <p className="fps-watch-title fps-timeless-text grey-line">
          {content.brand.left}
          <span></span>
          {content.brand.right}
        </p>{' '}
        <div className="fps-timeless-content fps-timeless-text">
          <GreyLines description={content.timeless.description} />
        </div>
      </div>{' '}
      <div className="fps-timeless-informations-wrapper ">
        <DialIcon />{' '}
        <div className="fps-timeless-informations">
          <div className="fps-movement-wrapper">
            <p className="fps-caption caption">{content.timeless.firstLabel}</p>{' '}
            <p className="fps-movement-title small-title">
              {content.timeless.firstText}
            </p>
          </div>{' '}
          <div className="fps-informations-wrapper">
            <p className="fps-caption caption">
              {content.timeless.secondLabel}
            </p>{' '}
            <p className="fps-informations-content body-text">
              {content.timeless.secondText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
