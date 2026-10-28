import PlusIcon from '../icons/PlusIcon';
import { content } from '../../content';
export default function Straps() {
  return (
    <section className="single-part-section" data-section="Straps">
      <div className="fps-single-part-section-wrapper">
        <div className="fps-single-part-section-pretitle">
          <PlusIcon /> <p>{content.bracelet.preTitle}</p>
        </div>{' '}
        <h2 className="fps-single-part-section-title">
          {content.bracelet.title}
        </h2>{' '}
        <p className="fps-single-part-section-text">
          {content.bracelet.description}
        </p>
      </div>
    </section>
  );
}
