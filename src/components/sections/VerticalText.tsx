import DialIcon from '../icons/DialIcon';
import { content } from '../../content';
export default function VerticalText() {
  return (
    <section data-section="VerticalText">
      <div className="fps-vertical-inner">
        <div className="fps-left-infos-wrapper">
          <div className="fps-dial-icons-wrapper" data-fade="">
            <DialIcon /> <div className="fps-dial-color"></div>
          </div>{' '}
          <div className="fps-mechanism-wrapper" data-fade="">
            <p className="fps-caption caption">{content.vertical.firstLabel}</p>{' '}
            <p className="fps-movement-title small-title">
              {content.vertical.firstText}
            </p>
          </div>{' '}
          <div className="fps-movement-wrapper" data-fade="">
            <p className="fps-caption caption">
              {content.vertical.secondLabel}
            </p>{' '}
            <p className="fps-movement-title small-title">
              {content.vertical.secondText}
            </p>
          </div>
        </div>{' '}
        <div className="fps-right-infos-wrapper" data-fade="">
          <p>{'FS'}</p>{' '}
          <p>
            <span></span>
            {'60P'}
          </p>
        </div>
      </div>
    </section>
  );
}
