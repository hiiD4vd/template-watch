import WatchCursor from './sections/WatchCursor';
import PresentationGuide from './sections/PresentationGuide';
import TransitionOverlay from './sections/TransitionOverlay';
import Intro from './sections/Intro';
import Timeless from './sections/Timeless';
import VerticalText from './sections/VerticalText';
import Disassembly from './sections/Disassembly';
import Mechanism from './sections/Mechanism';
import Movement from './sections/Movement';
import Curves from './sections/Curves';
import MovementWatchRight from './sections/MovementWatchRight';
import Hands from './sections/Hands';
import Straps from './sections/Straps';
import Images from './sections/Images';
import Colors from './sections/Colors';
import Parts from './sections/Parts';
import Footer from './sections/Footer';
export default function WatchContent() {
  return (
    <div id="the-watch">
      <WatchCursor /> <PresentationGuide /> <TransitionOverlay />{' '}
      <div data-webgl="Intro">
        <Intro /> <Timeless /> <VerticalText />
      </div>{' '}
      <div data-webgl="Disassembly">
        <Disassembly />
      </div>{' '}
      <div data-webgl="Particles">
        <Mechanism /> <Movement />
      </div>{' '}
      <div data-webgl="Presentation">
        <Curves /> <MovementWatchRight /> <Hands />
      </div>{' '}
      <div data-webgl="Straps">
        <Straps />
      </div>{' '}
      <div data-webgl="Images">
        <Images />
      </div>{' '}
      <div data-webgl="Colors">
        <Colors />
      </div>{' '}
      <div data-webgl="Parts">
        <Parts />
      </div>{' '}
      <div style={{ height: '80vh' }}></div>{' '}
      <div data-webgl="Footer">
        <Footer />
      </div>
    </div>
  );
}
