import GreyLines from '../GreyLines';
import { content } from '../../content';
export default function Movement() {
  return (
    <section data-section="Movement">
      <div className="fps-movement-content-wrapper">
        <p className="fps-watch-title fps-movement-text grey-line">
          {content.brand.left}
          <span></span>
          {content.brand.right}
        </p>{' '}
        <div className="fps-movement-content fps-movement-text">
          <GreyLines description={content.movement.description} movement />
        </div>
      </div>{' '}
      <div className="fps-timeless-informations-wrapper dark">
        <svg
          className="fps-dial dark watch-dial"
          width="76"
          height="75"
          viewBox="0 0 76 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity=".15" className="watch-dial">
            <circle
              className="fps-dial-bg watch-dial"
              cx="37.898"
              cy="37.62"
              r="37.133"
              fill="#000"
            ></circle>
            <circle
              className="fps-dial-stroke-uni watch-dial"
              opacity=".5"
              cx="37.897"
              cy="37.62"
              r="34.365"
              stroke="#EBEBEB"
            ></circle>
            <path
              d="M37.93 6.537v6.116m15.453-1.974-3.058 5.296m14.37 6.019L59.4 25.052m9.436 12.398H62.72m1.975 15.455L59.4 49.847m-6.017 14.375-3.058-5.297M37.93 62.247v6.116m-12.399-9.437-3.058 5.296m-6.02-14.374-5.296 3.058m1.976-15.456H7.017m9.436-12.398-5.296-3.058m14.374-6.019-3.058-5.297"
              opacity=".75"
              stroke="#EBEBEB"
              className="fps-dial-stroke-uni watch-dial"
            ></path>
            <circle
              cx="37.902"
              cy="27.913"
              r="8.121"
              fill="#EBEBEB"
              className="fps-dial-uni watch-dial"
            ></circle>
            <circle
              cx="37.902"
              cy="47.329"
              r="8.121"
              fill="#EBEBEB"
              className="fps-dial-uni watch-dial"
            ></circle>
          </g>
        </svg>{' '}
        <div className="fps-timeless-informations">
          <div className="fps-movement-wrapper">
            <p className="fps-caption caption">{content.movement.firstLabel}</p>{' '}
            <p className="fps-movement-title small-title">
              {content.movement.firstText}
            </p>
          </div>{' '}
          <div className="fps-informations-wrapper">
            <p className="fps-caption caption">
              {content.movement.secondLabel}
            </p>{' '}
            <p className="fps-informations-content body-text">
              {content.movement.secondText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
