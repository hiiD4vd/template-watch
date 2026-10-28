import { content } from '../../content';
export default function MovementWatchRight() {
  return (
    <section data-section="MovementWatchRight">
      <div className="fps-vertical-inner">
        <div className="fps-left-infos-wrapper">
          <div className="fps-mechanism-wrapper">
            <p className="fps-caption caption">
              {content.watchRight.firstLabel}
            </p>{' '}
            <p className="fps-movement-content">
              {content.watchRight.firstText}
            </p>
          </div>{' '}
          <div className="fps-mechanism-wrapper">
            <p className="fps-caption caption">
              {content.watchRight.secondLabel}
            </p>{' '}
            <p className="fps-movement-title small-title">
              {content.watchRight.secondText}
            </p>
          </div>{' '}
          <div className="fps-movement-wrapper">
            <p className="fps-caption caption">
              {content.watchRight.thirdLabel}
            </p>{' '}
            <p className="fps-movement-title small-title">
              {content.watchRight.thirdText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
