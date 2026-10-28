import NextPartIcon from '../icons/NextPartIcon';
import PreviousPartIcon from '../icons/PreviousPartIcon';
import MovementDiagramIcon from '../icons/MovementDiagramIcon';
import CloseIcon from '../icons/CloseIcon';
import { content } from '../../content';
export default function Disassembly() {
  return (
    <section data-section="Disassembly">
      <div className="hovers-w">
        <div className="instruction">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 26 28"
          >
            <path
              stroke="#000"
              d="M25.3065 13.9537c0 6.9632-5.4519 12.5787-12.1415 12.5787-6.6897 0-12.1416-5.6155-12.1416-12.5787S6.4753 1.375 13.165 1.375c6.6896 0 12.1415 5.6155 12.1415 12.5787Z"
              opacity=".3"
            ></path>
            <rect
              width="2"
              height="2"
              x="13.1641"
              y="12.5391"
              fill="#000"
              rx=".3"
              transform="rotate(45 13.1641 12.5391)"
            ></rect>
            <rect
              width="2"
              height="2"
              x="13.1641"
              y="17.5391"
              fill="#000"
              opacity=".25"
              rx=".3"
              transform="rotate(45 13.1641 17.5391)"
            ></rect>
            <rect
              width="2"
              height="2"
              x="9.5781"
              y="13.9531"
              fill="#000"
              opacity=".25"
              rx=".3"
              transform="rotate(135 9.5781 13.9531)"
            ></rect>
            <rect
              width="2"
              height="2"
              x="13.1641"
              y="7.5391"
              fill="#000"
              opacity=".25"
              rx=".3"
              transform="rotate(45 13.1641 7.539)"
            ></rect>
            <rect
              width="2"
              height="2"
              x="19.5781"
              y="13.9531"
              fill="#000"
              opacity=".25"
              rx=".3"
              transform="rotate(135 19.5781 13.9531)"
            ></rect>
          </svg>{' '}
          <p className="hide-desktop">
            {'Drag & tap '}
            <br />
            <span>{'to explore'}</span>
          </p>{' '}
          <p className="hide-tablet hide-mobile">
            {'Click '}
            <span>{'to explore'}</span>
          </p>
        </div>{' '}
        <div className="hovers-second-w">
          <div data-hover-id="tourbillon">
            <p>{'Tourbillon'}</p>{' '}
          </div>
          <div data-hover-id="mainplate">
            <p>{'Mainplate'}</p>{' '}
          </div>
          <div data-hover-id="dial">
            <p>{'Dial'}</p>{' '}
          </div>
          <div data-hover-id="barrel">
            <p>{'Barrel'}</p>{' '}
          </div>
          <div data-hover-id="backplate">
            <p>{'Backplate'}</p>{' '}
          </div>
          <div data-hover-id="weight">
            <p>{'Weight'}</p>{' '}
          </div>
        </div>
      </div>{' '}
      <div data-mesh="tourbillon">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Tourbillon'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Tourbillon'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>
      <div data-mesh="mainplate">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Mainplate'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Mainplate'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>
      <div data-mesh="dial">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Dial'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Dial'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>
      <div data-mesh="barrel">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Barrel'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Barrel'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>
      <div data-mesh="backplate">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Backplate'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Backplate'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>
      <div data-mesh="weight">
        <button className="close-button">
          {content.close + ' '}
          <CloseIcon />
        </button>{' '}
        <div className="content">
          <MovementDiagramIcon />{' '}
          <p className="caption">{content.disassembly.name}</p>{' '}
          <h4 className="small-title">{'Weight'}</h4>{' '}
          <p className="caption">{content.disassembly.function}</p>{' '}
          <p className="body-text">
            {
              'The crown of a watch, often referred to as the watch crown is a small, knob-like component typically located on the side of the watch case.'
            }
          </p>
        </div>{' '}
        <h3 className="mesh-title">{'Weight'}</h3>{' '}
        <div className="hide-desktop buttons-w">
          <button>
            <PreviousPartIcon />
          </button>{' '}
          <button>
            <NextPartIcon />
          </button>
        </div>
      </div>{' '}
      <div className="background">
        <svg
          className="cut-circle"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 705 705"
        >
          <path
            className="circle"
            stroke="currentColor"
            d="M703.847 352.165c0-194.2-157.43-351.6299-351.63-351.6299S.587 157.965.587 352.165c0 194.2 157.43 351.63 351.63 351.63s351.63-157.43 351.63-351.63Z"
          ></path>
          <path
            stroke="currentColor"
            className="line"
            d="m103.224 104.038 497.394 497.394"
          ></path>
          <path
            stroke="currentColor"
            className="line"
            d="M601.212 104.042 352.62 352.634 104.027 601.226"
          ></path>
          <path
            stroke="currentColor"
            className="line"
            d="M704.282 352.877H352.376L.47 352.876"
          ></path>
          <path
            stroke="currentColor"
            className="line"
            d="M352.376 704.783V.9707"
          ></path>
        </svg>{' '}
        <button data-direction="1"></button>{' '}
        <button data-direction="-1"></button>
      </div>{' '}
      <div className="background-text">
        <span>{'P'}</span> <span>{'0'}</span> <span>{'6'}</span> <div></div>{' '}
        <span>{'S'}</span> <span>{'F'}</span> <div></div> <span>{'P'}</span>{' '}
        <span>{'0'}</span> <span>{'6'}</span> <div></div> <span>{'S'}</span>{' '}
        <span>{'F'}</span>
      </div>
    </section>
  );
}
