import { content } from '../../content';
export default function Intro() {
  return (
    <section data-section="Intro">
      <div className="content-wrapper">
        <div className="circle-svg-w">
          <svg
            className="circle-svg"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 700 700"
          >
            <path
              className="outer-circle"
              strokeOpacity=".1"
              stroke="currentColor"
              d="M350 695c190.538 0 345-154.462 345-345S540.538 5 350 5 5 159.462 5 350s154.462 345 345 345Z"
            ></path>
            <g data-config="first" className="selected">
              <path
                className="fill"
                fill="currentColor"
                fillOpacity=".07"
                d="m105.341 106.048.354-.353C168.217 43.172 254.593 4.5 350 4.5h.5v346.707l-.854-.853-243.951-243.952z"
              ></path>
              <path
                className="stroke"
                stroke="currentColor"
                strokeOpacity=".1"
                d="M350 350v.001V350h-.001l-243.95-243.952C168.481 43.615 254.731 5 350 5z"
              ></path>
              <path
                className="border"
                stroke="#fff"
                strokeWidth="3"
                d="M106.401 107.112C168.772 43.525 254.984 5.995 350.505 5.995"
              ></path>
            </g>
            <g data-config="second">
              <path
                className="fill"
                fill="currentColor"
                fillOpacity=".07"
                d="M349.488 4.495h.5c88.42 0 176.842 33.732 244.305 101.194l.354.354-.354.354-243.952 243.951-.853.854-.001-1.207.001-345z"
              ></path>
              <path
                className="stroke"
                stroke="currentColor"
                strokeOpacity=".1"
                d="M349.988 349.995h-.001l.001-345c88.293 0 176.586 33.683 243.951 101.048z"
              ></path>
              <path
                className="border"
                stroke="#fff"
                strokeWidth="3"
                d="M349.484 5.997c89.066-.86 176.565 33.563 244.109 101.106"
              ></path>
            </g>
            <g data-config="third">
              <path
                className="fill"
                fill="currentColor"
                fillOpacity=".07"
                d="m594.654 594.109-.354.353c-62.522 62.523-148.898 101.195-244.305 101.195h-.5V348.95l.854.853L594.3 593.755z"
              ></path>
              <path
                className="stroke"
                stroke="currentColor"
                strokeOpacity=".1"
                d="M349.995 350.157v-.001l.001.001 243.951 243.951c-62.432 62.434-148.683 101.049-243.952 101.049z"
              ></path>
              <path
                className="border"
                stroke="#fff"
                strokeWidth="3"
                d="M593.595 593.044c-62.371 63.588-148.584 101.118-244.104 101.118"
              ></path>
            </g>
            <g data-config="fourth">
              <path
                className="fill"
                fill="currentColor"
                fillOpacity=".07"
                d="m350.508 695.662-.5-.001c-88.42.001-176.843-33.731-244.306-101.194l-.353-.353.353-.354 243.952-243.952.854-.853z"
              ></path>
              <path
                className="stroke"
                stroke="currentColor"
                strokeOpacity=".1"
                d="M350.008 350.162v-.001 345c-88.293.001-176.587-33.682-243.952-101.047z"
              ></path>
              <path
                className="border"
                stroke="#fff"
                strokeWidth="3"
                d="M350.511 694.16c-89.066.86-176.565-33.563-244.108-101.107"
              ></path>
            </g>
          </svg>
        </div>{' '}
        <h1 className="fps-watch-title">{content.brand.headline}</h1>
      </div>{' '}
      <div className="fps-bottom-wrapper">
        <div data-fade="">
          <div className="fps-color-wrapper">
            <span className="fps-label">{content.color}</span>{' '}
            <p className="selected" data-config="first">
              {content.colors.silver}
            </p>{' '}
            <p data-config="second">{content.colors.black}</p>{' '}
            <p data-config="third">{content.colors.gold}</p>{' '}
            <p data-config="fourth">{content.colors.rose}</p>
          </div>
        </div>{' '}
        <div data-fade="">
          <div className="fps-watch-weight-wrapper">
            <p className="fps-watch-weight">
              <span className="fps-watch-weight-text">{content.model}</span>
              {' ' + content.weight}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
