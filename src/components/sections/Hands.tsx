import PlusIcon from '../icons/PlusIcon';
import { content } from '../../content';
export default function Hands() {
  return (
    <section className="single-part-section" data-section="Hands">
      <div className="fps-single-part-section-wrapper">
        <div className="fps-single-part-section-pretitle">
          <PlusIcon /> <p>{content.hands.preTitle}</p>
        </div>{' '}
        <h2 className="fps-single-part-section-title">{content.hands.title}</h2>{' '}
        <p className="fps-single-part-section-text">
          {content.hands.description}
        </p>
      </div>
    </section>
  );
}
