import { content } from '../../content';
export default function Mechanism() {
  return (
    <section data-section="Mechanism">
      <div className="fps-mechanism-first">
        <div className="fps-mechanism-first-inner">
          <div className="fps-mechanism-title" data-fade="">
            <span>{content.brand.shortName}</span>
            <br />
            {'Heart'}
            <br />
          </div>{' '}
          <div className="fps-dial-icons-wrapper" data-fade="">
            <svg
              className="fps-dial-alpha"
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity=".2" stroke="#fff">
                <circle cx="21.996" cy="21.81" r="20.73"></circle>
                <circle cx="22" cy="16.186" r="4.203"></circle>
                <circle cx="22" cy="27.432" r="4.203"></circle>
              </g>
              <path
                d="M22 4.343v3.455m8.734-1.115-1.727 2.992m8.118 3.401-2.992 1.728m5.336 7.005h-3.456m1.112 8.733-2.992-1.728m-3.399 8.122-1.727-2.993M22 35.82v3.456m-7.008-5.334-1.728 2.993m-3.397-8.12-2.992 1.727m1.109-8.733H4.53m5.337-7.005-2.992-1.728m8.117-3.4-1.728-2.993"
                opacity=".15"
                stroke="#fff"
              ></path>
            </svg>
          </div>{' '}
          <div className="fps-mechanism-wrapper" data-fade="">
            <p className="fps-caption caption">
              {content.mechanism.firstLabel}
            </p>{' '}
            <p className="fps-movement-title small-title">
              {content.mechanism.firstText}
            </p>
          </div>{' '}
          <div className="fps-movement-wrapper" data-fade="">
            <p className="fps-caption caption">
              {content.mechanism.secondLabel}
            </p>{' '}
            <p className="fps-movement-title small-title">
              {content.diameter}
              <span>{'mm'}</span>
            </p>
          </div>
        </div>{' '}
        <div className="fps-seconds-wrapper" data-fade="">
          <p className="fps-seconds">
            <span>{'8'}</span>
            <span>{'9'}</span>
            {'’'}
          </p>
        </div>
      </div>
    </section>
  );
}
