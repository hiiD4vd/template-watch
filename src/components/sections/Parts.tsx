import { assetUrl } from '../../lib/assets';
import PlusIcon from '../icons/PlusIcon';
import DialIcon from '../icons/DialIcon';
import { content } from '../../content';
export default function Parts() {
  return (
    <section data-section="Parts">
      <div className="top-w">
        <h3>
          <span className="grey">{'MODEL'}</span>
          <br />
          <span>{content.brand.left}</span>
        </h3>{' '}
        <div className="img-w">
          <img alt="" src={assetUrl('images/gallery/first_5.webp')} />{' '}
          <div className="description-w">
            <div className="left">
              <div className="circle"></div>{' '}
              <p>
                {content.color}
                <br />{' '}
                <span
                  data-color-text=""
                  className="selected"
                  data-config="first"
                >
                  {content.colors.silver}
                </span>{' '}
                <span data-color-text="" data-config="second">
                  {content.colors.black}
                </span>{' '}
                <span data-color-text="" data-config="third">
                  {content.colors.gold}
                </span>{' '}
                <span data-color-text="" data-config="fourth">
                  {content.colors.rose}
                </span>
              </p>
            </div>{' '}
            <DialIcon />
          </div>
        </div>
      </div>{' '}
      <ul>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/dial.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Dial'}
          </p>{' '}
          <p className="index">{'01'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'11 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/hands.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Hands'}
          </p>{' '}
          <p className="index">{'02'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'1 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/crystal.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Crystal'}
          </p>{' '}
          <p className="index">{'03'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'12 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/bezel.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Bezel'}
          </p>{' '}
          <p className="index">{'04'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'16 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/lugs.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Lugs'}
          </p>{' '}
          <p className="index">{'05'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'18 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/strap.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Strap'}
          </p>{' '}
          <p className="index">{'06'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'34 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/buckle.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Buckle'}
          </p>{' '}
          <p className="index">{'07'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'8 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/crown.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Crown'}
          </p>{' '}
          <p className="index">{'08'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'3 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/caseback.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Caseback'}
          </p>{' '}
          <p className="index">{'09'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'14 Gr'}</p>
        </li>
        <li>
          <picture>
            <img alt="" src={assetUrl('images/parts/movement.jpg')} />
          </picture>{' '}
          <p className="name">
            <span className="plus-wrapper hide-mobile hide-tablet">
              <PlusIcon />
            </span>
            {' Movement'}
          </p>{' '}
          <p className="index">{'10'}</p> <p className="type">{'Mechanism'}</p>{' '}
          <p className="weight">{'29 Gr'}</p>
        </li>
      </ul>
    </section>
  );
}
