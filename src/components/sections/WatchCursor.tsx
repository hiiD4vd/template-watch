import CursorRingIcon from '../icons/CursorRingIcon';
import { content } from '../../content';
export default function WatchCursor() {
  return (
    <div data-cursor="" className="hide-mobile hide-tablet">
      <svg
        className="circle"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 40 40"
      >
        <path
          fill="#fff"
          stroke="#000"
          strokeOpacity=".3"
          d="M39.305 20.168c0 10.5419-8.5468 19.0879-19.09 19.0879-10.54317 0-19.09-8.546-19.09-19.0879 0-10.54193 8.54683-19.08792 19.09-19.08792 10.5432 0 19.09 8.54599 19.09 19.08792Z"
        ></path>
      </svg>{' '}
      <div className="inside">
        <svg
          data-icon="right-arrow"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 15 12"
        >
          <path
            fill="#000"
            d="m9.40625 11.4697-.70573-.70573 5.30261-5.3026.70573.70572z"
          ></path>
          <path fill="#000" d="M14.2109 5.66895V6.667h-14v-.99805z"></path>
          <path
            fill="#000"
            d="m8.70312 1.57031.70573-.70573 5.3033 5.3033-.70573.70573z"
          ></path>
        </svg>{' '}
        <svg
          data-icon="left-arrow"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 15 12"
        >
          <path
            fill="#000"
            d="M6.29948 1.236 5.59375.53027.29115 5.83288l.70572.70573L6.29948 1.236Z"
          ></path>
          <path
            fill="#000"
            d="M.78906 5.33301v.99804H14.7891v-.99804H.78906Z"
          ></path>
          <path
            fill="#000"
            d="m5.59115 11.1354.70573-.7057-5.3033-5.30331-.70573.70572 5.3033 5.30329Z"
          ></path>
        </svg>{' '}
        <svg
          data-icon="cross"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            fill="#000"
            d="m.84375 1.31738.70573-.70573 9.8995 9.8995-.70574.70572z"
          ></path>
          <path
            fill="#000"
            d="m10.7422.61133.70573.70573-9.8995 9.8995-.70573-.70574z"
          ></path>
        </svg>{' '}
        <svg
          data-icon="plus"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 15 15"
        >
          <path fill="#000" d="M7.02344.27832h.99805v14h-.99805z"></path>
          <path fill="#000" d="M14.5234 6.7793v.99805h-14V6.7793z"></path>
        </svg>{' '}
        <svg
          data-icon="top-right-arrow"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 9 9"
        >
          <path fill="#000" d="M8.2324 6.333h-.7649V.5857h.765z"></path>
          <path
            fill="#000"
            d="m7.6875.5857.5409.5409-7.587 7.587-.541-.5409z"
          ></path>
          <path fill="#000" d="M2.4844 1.3506v-.765h5.748v.765z"></path>
        </svg>{' '}
        <div className="swap" data-icon="first">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 41 41"
          >
            <ellipse
              cx="20.7726"
              cy="20.8188"
              stroke="#444444"
              rx="19.59"
              ry="19.5879"
            ></ellipse>
          </svg>{' '}
          <p>{content.cursor.swap}</p>
        </div>{' '}
        <div className="swap" data-icon="second">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 41 41"
          >
            <ellipse
              cx="20.7726"
              cy="20.8188"
              stroke="#8a8a8a"
              rx="19.59"
              ry="19.5879"
            ></ellipse>
          </svg>{' '}
          <p>{content.cursor.swap}</p>
        </div>{' '}
        <div className="swap" data-icon="third">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 41 41"
          >
            <ellipse
              cx="20.7726"
              cy="20.8188"
              stroke="#fee9bf"
              rx="19.59"
              ry="19.5879"
            ></ellipse>
          </svg>{' '}
          <p>{content.cursor.swap}</p>
        </div>{' '}
        <div className="swap" data-icon="fourth">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 41 41"
          >
            <ellipse
              cx="20.7726"
              cy="20.8188"
              stroke="#fde2d2"
              rx="19.59"
              ry="19.5879"
            ></ellipse>
          </svg>{' '}
          <p>{content.cursor.swap}</p>
        </div>{' '}
        <div
          className="large"
          data-large=""
          data-icon="hold"
          data-transparent=""
        >
          <CursorRingIcon />{' '}
          <p>
            {'HOLD TO'}
            <br />
            {'EXPLORE'}
          </p>
        </div>{' '}
        <div className="large" data-large="" data-icon="select">
          <CursorRingIcon />{' '}
          <p>
            {'SELECT'}
            <br />
            {'MODEL'}
          </p>
        </div>
      </div>
    </div>
  );
}
