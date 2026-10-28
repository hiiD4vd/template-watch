import PlusIcon from '../icons/PlusIcon';
import { content } from '../../content';
export default function Curves() {
  return (
    <section className="single-part-section" data-section="Curves">
      <div className="fps-single-part-section-wrapper">
        <div className="fps-single-part-section-pretitle">
          <PlusIcon /> <p>{content.curves.preTitle}</p>
        </div>{' '}
        <h2 className="fps-single-part-section-title">
          {content.curves.title}
        </h2>{' '}
        <p className="fps-single-part-section-text">
          {content.curves.description}
        </p>
      </div>
    </section>
  );
}
