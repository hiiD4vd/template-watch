import { SplitText } from '../SplitText';
import { events, storeKeys } from './config';
import { engine, project } from '../engine';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { translate } from '../../content';
import { debounce } from '../materials/helpers';
import Lenis from '@studio-freight/lenis';
class WatchCursor {
  constructor() {
    this.onPointerMove = ({ dom: value }) => {
      engine.tools.viewport.breakpoint === 'desktop' &&
        (this.xTo(value.x), this.yTo(value.y));
    };
    this.onSetCursorIcon = (icon) => {
      this.icon = icon;
    };
    engine.state.register(this);
    project.state.register(this);
    this.el = document.querySelector('[data-cursor]');
    this.xTo = gsap.quickTo(this.el, 'x', {
      duration: 1.3,
      ease: 'power4.out',
    });
    this.yTo = gsap.quickTo(this.el, 'y', {
      duration: 1.3,
      ease: 'power4.out',
    });
    this.icons = Array.from(
      this.el.querySelectorAll('.inside [data-icon]'),
    ).map((element) => ({
      el: element,
      icon: element.dataset.icon,
      isLarge: element.dataset.large !== void 0,
      isTransparent: element.dataset.transparent !== void 0,
    }));
  }
  init() {}
  attach() {}
  set icon(iconValue) {
    if (iconValue !== this.iconValue) {
      this.iconValue = iconValue;
      this.el.classList.toggle('visible', !!iconValue);
      let e = null;
      this.icons.forEach((item) => {
        item.el.classList.toggle('visible', item.icon == iconValue);
        item.icon == iconValue && (e = item);
      });
      this.el.classList.toggle('large', e && e.isLarge);
      this.el.classList.toggle('transparent', e && e.isTransparent);
    }
  }
  get icon() {
    return this.iconValue;
  }
}
class DOMSection {
  constructor({
    el: options,
    i: index,
    isFirstSection: options2,
    isLastSection: options3,
  }) {
    this.createDebug = () => {
      const element4 = document.createElement('div');
      element4.classList.add('debug-progress');
      const element5 = document.createElement('div');
      element5.classList.add('debug-text');
      element4.appendChild(element5);
      this.el.appendChild(element4);
      this.debugText = this.el.querySelector('.debug-text');
    };
    var element, element2, element3;
    this.el = options;
    this.index = index;
    this.presentationCircle = project.dom.el.querySelector(
      '.presentation-circle',
    );
    this.isActive = false;
    ScrollTrigger.create({
      trigger: this.el,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => this.enter(),
      onLeave: () => this.leave(),
      onEnterBack: () => this.enter(),
      onLeaveBack: () => this.leave(),
    });
    this.bottomInformations = this.el.querySelector(
      '.fps-timeless-informations-wrapper',
    );
    this.dialSvg =
      (element = this.bottomInformations) == null
        ? void 0
        : element.querySelector('.fps-dial');
    this.firstWrapper =
      (element2 = this.bottomInformations) == null
        ? void 0
        : element2.querySelector('.fps-movement-wrapper');
    this.secondWrapper =
      (element3 = this.bottomInformations) == null
        ? void 0
        : element3.querySelector('.fps-informations-wrapper');
  }
  setupTimeline() {
    const timeline = gsap.timeline({
      onUpdate: () => {
        this.debugText &&
          (this.debugText.textContent = this.timeline.progress().toFixed(2));
      },
    });
    this.tlD = this.el.offsetHeight + engine.tools.viewport.height;
    timeline.add(() => {}, this.tlD);
    return timeline;
  }
  createBottomTl() {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.bottomInformations,
        scrub: true,
        start: 'top 90%',
        end: 'bottom 10%',
      },
    });
    timeline.fromTo(
      [this.dialSvg, this.firstWrapper, this.secondWrapper],
      {
        opacity: 0,
      },
      {
        opacity: 1,
        stagger: 0.15,
      },
      0,
    );
    timeline.to([this.dialSvg, this.firstWrapper, this.secondWrapper], {
      opacity: 0,
      stagger: 0.15,
    });
  }
  enter() {}
  leave() {}
  init() {}
  attach() {
    project.state.register(this);
    this.bottomInformations && this.createBottomTl();
  }
  detach() {
    project.state.unregister(this);
  }
}
const finishGradients = {
  first: ['#2B282E', '#B9B6BD', '#ffffff', '#B9B6BD', '#2B282E'],
  second: ['#000000', '#2B2B2B', '#ffffff', '#2B2B2B', '#000000'],
  third: ['#B3A07C', '#FFFFE1', '#ffffff', '#FFFFE1', '#B3A07C'],
  fourth: ['#D7CFC8', '#B3A99F', '#333333', '#B3A99F', '#D7CFC8'],
};
class ColorsSection extends DOMSection {
  constructor(options) {
    super(options);
    this.onConfigClick = (event) => {
      project.state.emit(events.CONFIG_CHANGE, {
        configName: event.currentTarget.dataset.config,
        duration: 1,
      });
    };
    this.onConfigMouseEnter = (event) => {
      clearTimeout(this.mouseEnterTO);
      project.state.emit(
        events.SET_CURSOR_ICON,
        event.currentTarget.dataset.config,
      );
    };
    this.onConfigMouseLeave = (value) => {
      clearTimeout(this.mouseEnterTO);
      this.mouseEnterTO = setTimeout(() => {
        project.state.emit(
          events.SET_CURSOR_ICON,
          this.el.contains(value.target) ? 'select' : null,
        );
      }, 50);
    };
    this.onConfigChange = ({ configName: value }) => {
      var n, r;
      this.configs.forEach((item) => {
        item.svg.classList.toggle('selected', value === item.id);
        item.name.classList.toggle('selected', value === item.id);
        item.counter.classList.toggle('selected', value === item.id);
        item.introSvg.classList.toggle('selected', value === item.id);
        item.introName.classList.toggle('selected', value === item.id);
      });
      const match = this.configs.find((item) => item.id === value);
      (r = (n = this.changeConfigTl) == null ? void 0 : n.kill) == null ||
        r.call(n);
      this.changeConfigTl = gsap.timeline();
      this.changeConfigTl.to(
        [this.el, engine.currentProject.dom.el],
        {
          '--first-color': finishGradients[`${value}`][0],
          '--second-color': finishGradients[`${value}`][1],
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0,
      );
      this.changeConfigTl.set(
        this.el,
        {
          color: finishGradients[`${value}`][2],
        },
        0,
      );
      this.changeConfigTl.to(
        this.lastConfig.text,
        {
          opacity: 0,
          duration: 0.5,
          ease: 'none',
        },
        0,
      );
      this.changeConfigTl.set(
        this.lastConfig.text,
        {
          display: 'none',
        },
        0.5,
      );
      this.changeConfigTl.set(
        match.text,
        {
          display: 'block',
        },
        0.5,
      );
      this.changeConfigTl.to(
        match.text,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'none',
        },
        0.5,
      );
      this.lastConfig = this.configs.find((item) => item.id === value);
    };
    this.contentWrapper = this.el.querySelector('.content-wrapper');
    this.configs = Array.from(
      this.contentWrapper.querySelectorAll('.circle-svg [data-config]'),
    ).map((element) => ({
      svg: element,
      text: this.contentWrapper.querySelector(
        `.texts-w [data-config="${element.dataset.config}"]`,
      ),
      id: element.dataset.config,
      name: this.contentWrapper.querySelector(
        `.info-w .name [data-config="${element.dataset.config}"]`,
      ),
      counter: this.contentWrapper.querySelector(
        `.info-w .counter [data-config="${element.dataset.config}"]`,
      ),
      introSvg: project.dom.el.querySelector(
        `[data-section="Intro"] .circle-svg [data-config="${element.dataset.config}"]`,
      ),
      introName: project.dom.el.querySelector(
        `[data-section="Intro"] .fps-color-wrapper [data-config="${element.dataset.config}"]`,
      ),
    }));
    this.configs.forEach((item, index) => {
      item.text.style.setProperty(
        '--text-first-color',
        finishGradients[item.id][3],
      );
      item.text.style.setProperty(
        '--text-second-color',
        finishGradients[item.id][4],
      );
    });
    this.lastConfig = this.configs[0];
    gsap.set(this.lastConfig.text, {
      display: 'block',
      opacity: 1,
    });
    gsap.set([this.el, engine.currentProject.dom.el], {
      '--first-color': finishGradients.first[0],
      '--second-color': finishGradients.first[1],
    });
    this.buttons = this.el.querySelectorAll('.circle-svg [data-config]');
    this.svg = this.el.querySelector('.circle-svg');
    this.mouseEnterTO = null;
  }
  attach() {
    super.attach();
    this.configs.forEach((item) => {
      item.svg.addEventListener('click', this.onConfigClick);
      item.svg.addEventListener('mouseenter', this.onConfigMouseEnter);
      item.svg.addEventListener('mouseleave', this.onConfigMouseLeave);
      item.introSvg.addEventListener('click', this.onConfigClick);
      item.introSvg.addEventListener('mouseenter', this.onConfigMouseEnter);
      item.introSvg.addEventListener('mouseleave', this.onConfigMouseLeave);
    });
  }
  detach() {
    super.detach();
    this.configs.forEach((item) => {
      item.svg.removeEventListener('click', this.onConfigClick);
      item.svg.removeEventListener('mouseenter', this.onConfigMouseEnter);
      item.svg.removeEventListener('mouseleave', this.onConfigMouseLeave);
      item.introSvg.removeEventListener('click', this.onConfigClick);
      item.introSvg.removeEventListener('mouseenter', this.onConfigMouseEnter);
      item.introSvg.removeEventListener('mouseleave', this.onConfigMouseLeave);
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.contentWrapper,
      {
        opacity: 1,
        duration: 0.1 * this.tlD,
        display: 'block',
      },
      0.25 * this.tlD,
    );
    timeline.set(
      [engine.$wrapper, engine.webgl.renderer.domElement],
      {
        pointerEvents: 'none',
      },
      0.35 * this.tlD,
    );
    timeline.add(() => {
      this.svg.classList.toggle('active');
      project.state.emit(
        events.SET_CURSOR_ICON,
        this.svg.classList.contains('active') ? 'select' : null,
      );
    }, 0.35 * this.tlD);
    timeline.to(
      this.contentWrapper,
      {
        opacity: 0,
        duration: 0.1 * this.tlD,
        display: 'block',
      },
      0.6 * this.tlD,
    );
    timeline.set(
      [engine.$wrapper, engine.webgl.renderer.domElement],
      {
        pointerEvents: '',
      },
      0.6 * this.tlD,
    );
    timeline.add(() => {
      this.svg.classList.toggle('active');
      project.state.emit(
        events.SET_CURSOR_ICON,
        this.svg.classList.contains('active') ? 'select' : null,
      );
    }, 0.6 * this.tlD);
    return timeline;
  }
}
class SinglePartSection extends DOMSection {
  constructor(options) {
    super(options);
    this.wrapper = this.el.querySelector('.fps-single-part-section-wrapper');
    this.title = this.wrapper.querySelector('h2');
    this.description = this.wrapper.querySelector(
      '.fps-single-part-section-text',
    );
    this.preTitle = this.wrapper.querySelector(
      '.fps-single-part-section-pretitle',
    );
  }
  init() {
    this.titleSplit = new SplitText(this.title, {
      type: 'chars',
    });
    super.init();
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.wrapper,
      {
        display: 'block',
      },
      0,
    );
    timeline.fromTo(
      [this.preTitle, this.description],
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: window.innerHeight,
      },
      window.innerHeight * 0.5,
    );
    timeline.fromTo(
      this.titleSplit.chars,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: window.innerHeight,
        stagger: this.tlD * 0.005,
      },
      window.innerHeight * 0.5,
    );
    timeline.fromTo(
      this.titleSplit.chars,
      {
        y: '50%',
      },
      {
        y: 0,
        duration: window.innerHeight,
        stagger: this.tlD * 0.005,
        ease: 'power4.out',
      },
      window.innerHeight * 0.5,
    );
    timeline.to(
      this.titleSplit.chars,
      {
        y: '-50%',
        duration: window.innerHeight,
        stagger: {
          each: this.tlD * 0.005,
          from: 'end',
        },
        ease: 'power4.in',
      },
      this.tlD - window.innerHeight * 1.5,
    );
    timeline.to(
      this.titleSplit.chars,
      {
        opacity: 0,
        duration: window.innerHeight,
        stagger: {
          each: this.tlD * 0.005,
          from: 'end',
        },
      },
      this.tlD - window.innerHeight * 1.5,
    );
    timeline.to(
      [this.preTitle, this.description],
      {
        opacity: 0,
        duration: window.innerHeight * 0.5,
      },
      this.tlD - window.innerHeight,
    );
    timeline.set(
      this.wrapper,
      {
        display: 'none',
      },
      this.tlD,
    );
    return timeline;
  }
}
class CurvesSection extends SinglePartSection {
  constructor(options) {
    super(options);
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.presentationCircle,
      {
        display: 'block',
        opacity: 1,
        duration: 0.2 * this.tlD,
      },
      0,
    );
    return timeline;
  }
}
class DisassemblySection extends DOMSection {
  constructor(options) {
    super(options);
    this.onHoverPosition = ({ id: value, x: value2, y: value3 }) => {
      const r = value2 * engine.tools.viewport.width * 0.5;
      this.hovers[`${value}`].style.transform = `translate3d(${r}px, 0px, 0px)`;
    };
    this.onSetClickedMesh = (value) => {
      var s, n;
      (n = (s = this.changeClickedMeshTl) == null ? void 0 : s.kill) == null ||
        n.call(s);
      this.changeClickedMeshTl = gsap.timeline();
      this.changeClickedMeshTl.to(
        this.hoversWrapper,
        {
          opacity: value !== null ? 0 : 1,
          ease: 'linear',
          duration: 0.8,
        },
        0,
      );
      value !== null && project.state.emit(events.SET_CURSOR_ICON, '');
      this.background.classList.toggle('active', value !== null);
      this.clickedMeshOverlays.forEach((item) => {
        item.el.classList.toggle('active', item.id === value);
        item.visible &&
          (this.changeClickedMeshTl.to(
            item.el,
            {
              opacity: 0,
              duration: 1,
            },
            0,
          ),
          this.changeClickedMeshTl.set(
            item.el,
            {
              display: 'none',
            },
            1,
          ),
          this.changeClickedMeshTl.set(
            item,
            {
              visible: false,
            },
            1,
          ));
      });
      this.activeMeshOverlay = this.clickedMeshOverlays.find(
        (item) => item.id === value,
      );
      this.activeMeshOverlay &&
        (this.changeClickedMeshTl.set(this.activeMeshOverlay, {
          visible: true,
        }),
        this.changeClickedMeshTl.set(this.activeMeshOverlay.el, {
          display: 'flex',
        }),
        this.changeClickedMeshTl.fromTo(
          this.activeMeshOverlay.el,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1,
          },
        ));
    };
    this.onCloseHover = () => {
      project.state.emit(events.SET_CURSOR_ICON, 'cross');
    };
    this.onButtonOver = (event) => {
      project.state.emit(
        events.SET_CURSOR_ICON,
        (event.currentTarget.dataset.direction === '-1' ? 'right' : 'left') +
          '-arrow',
      );
    };
    this.closeClickedMesh = () => {
      project.state.emit(events.LEAVE_CLICKED_MESH);
    };
    this.onButtonClick = (event) => {
      project.state.emit(
        events.NEXT_PREVIOUS_CLICKED_MESH,
        parseInt(event.currentTarget.dataset.direction),
      );
    };
    this.hoversWrapper = this.el.querySelector('.hovers-w');
    this.hoversSecondWrapper =
      this.hoversWrapper.querySelector('.hovers-second-w');
    this.hovers = {};
    this.hoversSecondWrapper.querySelectorAll('div').forEach((element) => {
      this.hovers[`${element.dataset.hoverId}`] = element;
    });
    this.background = this.el.querySelector('.background');
    this.circle = this.background.querySelector('.cut-circle');
    this.changeIndexButtons = this.el.querySelectorAll('[data-direction]');
    this.clickedMeshOverlays = Array.from(
      this.el.querySelectorAll('[data-mesh]'),
    ).map((element) => ({
      el: element,
      id: element.dataset.mesh,
      closeButton: element.querySelector('.close-button'),
      visible: false,
    }));
    this.activeMeshOverlay = null;
    project.store.set(storeKeys.IS_ALL_XPLODED, false);
    this.backgroundLetters = this.el.querySelectorAll('.background-text span');
  }
  attach() {
    super.attach();
    this.circle.addEventListener('click', this.closeClickedMesh);
    this.circle.addEventListener('mouseover', this.onCloseHover);
    this.changeIndexButtons.forEach((item) => {
      item.addEventListener('click', this.onButtonClick);
      item.addEventListener('mouseover', this.onButtonOver);
    });
    this.clickedMeshOverlays.forEach((item) => {
      item.closeButton.addEventListener('click', this.closeClickedMesh);
      item.closeButton.addEventListener('mouseover', this.onCloseHover);
    });
  }
  detach() {
    super.detach();
    this.circle.removeEventListener('click', this.closeClickedMesh);
    this.circle.removeEventListener('mouseover', this.onCloseHover);
    this.changeIndexButtons.forEach((item) => {
      item.removeEventListener('click', this.onButtonClick);
      item.removeEventListener('mouseover', this.onButtonOver);
    });
    this.clickedMeshOverlays.forEach((item) => {
      item.closeButton.removeEventListener('click', this.closeClickedMesh);
      item.closeButton.removeEventListener('mouseover', this.onCloseHover);
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.hoversWrapper,
      {
        display: 'none',
      },
      0,
    );
    timeline.set(
      this.hoversWrapper,
      {
        display: 'block',
      },
      0.01,
    );
    this.backgroundLetters.forEach((item, index) => {
      timeline.to(
        item,
        {
          x: index % 2 == 0 ? '-60vw' : '60vw',
          duration: this.tlD * 0.5 + index * this.tlD * 0.03,
          ease: 'power3.in',
        },
        0,
      );
      timeline.to(
        item,
        {
          opacity: 0.2,
          duration: this.tlD * 0.3 + index * this.tlD * 0.03,
          ease: 'power3.in',
        },
        0,
      );
    });
    timeline.add(() => this.el.classList.toggle('active'), 0.5 * this.tlD);
    timeline.add(() => this.el.classList.toggle('active'), 0.75 * this.tlD);
    timeline.set(
      this.hoversWrapper,
      {
        display: 'none',
      },
      this.tlD,
    );
    return timeline;
  }
}
class FooterSection extends DOMSection {
  constructor(options) {
    super(options);
    this.textWrapper = this.el.querySelector('.text-wrapper');
    this.textSplit = new SplitText(this.textWrapper, {
      type: 'words chars',
      secondCharWrapper: true,
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.fromTo(
      this.textSplit.chars,
      {
        x: '-100%',
      },
      {
        x: 0,
        ease: 'power3.out',
        duration: this.tlD,
        stagger: 0.1 * this.tlD,
      },
      0,
    );
    timeline.fromTo(
      this.textSplit.chars,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: 'linear',
        duration: this.tlD * 0.5,
        stagger: 0.1 * this.tlD,
      },
      0,
    );
    return timeline;
  }
}
class HandsSection extends SinglePartSection {
  constructor(options) {
    super(options);
  }
}
const imageTextColors = [
  '#BCBCBC',
  '#DDDDDD',
  '#BCBCBC',
  '#DDDDDD',
  '#BCBCBC',
  '#DDDDDD',
];
const imageAccentColors = [15, 25, 15, 25, 15, 25, 15, 25];
class ImagesSection extends DOMSection {
  constructor(options) {
    super(options);
    this.content = translate('images.description');
    this.contentHTML = this.el.querySelector('.fps-timeless-content');
    this.imgsWrapper = this.el.querySelector('.images-w');
    this.imgs = this.imgsWrapper.querySelectorAll('img');
  }
  init() {
    super.init();
    this.greyLines = this.el.querySelectorAll('.grey-line');
    this.greyLines.forEach((item, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          start: `-100% ${50 + imageAccentColors[index]}%`,
          end: `100% ${50 - imageAccentColors[index]}%`,
          scrub: 2,
          trigger: item,
        },
      });
      timeline.from(item, {
        color: imageTextColors[index],
        ease: 'power3.inOut',
      });
      timeline.to(item, {
        color: imageTextColors[index],
        ease: 'power3.inOut',
      });
    });
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.imgsWrapper,
      {
        display: 'grid',
      },
      0,
    );
    this.imgs.forEach((item, index) => {
      timeline.to(
        item,
        {
          '--translate-progress': 1,
          duration:
            engine.tools.viewport.breakpoint !== 'desktop'
              ? this.tlD * 0.35
              : this.tlD * 0.25,
          ease: 'linear',
        },
        this.tlD * 0.2 +
          index *
            0.25 *
            (engine.tools.viewport.breakpoint !== 'desktop'
              ? this.tlD * 0.45
              : this.tlD * 0.65),
      );
    });
    timeline.set(
      this.imgsWrapper,
      {
        display: 'none',
      },
      this.tlD,
    );
    return timeline;
  }
}
class IntroSection extends DOMSection {
  constructor(options) {
    super(options);
    this.openAnimation = () => {
      this.svg.classList.add('active');
      const timeline = gsap.timeline({
        delay: 1,
      });
      timeline.fromTo(
        this.textSplit.chars,
        {
          x: '-100%',
        },
        {
          x: 0,
          ease: 'power3.out',
          duration: 1.2,
          stagger: 0.12,
        },
        0,
      );
      timeline.to(
        this.fadeElements,
        {
          opacity: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          stagger: 0.4,
        },
        0.8,
      );
    };
    this.textWrapper = this.el.querySelector('.fps-watch-title');
    this.contentWrapper = this.el.querySelector('.content-wrapper');
    this.svg = this.el.querySelector('.circle-svg');
    this.svgWrapper = this.el.querySelector('.circle-svg-w');
    project.state.on(events.OPEN_PROJECT, this.openAnimation);
    this.textSplit = new SplitText(this.textWrapper, {
      type: 'words chars',
      secondCharWrapper: true,
    });
    this.fadeElements = this.el.querySelectorAll('[data-fade]');
    this.fadeElementsSecond = this.el.querySelectorAll('[data-fade] div');
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.svgWrapper,
      {
        opacity: 0,
        duration: this.tlD * 0.3,
      },
      this.tlD * 0.6,
    );
    timeline.to(
      this.fadeElementsSecond,
      {
        opacity: 0,
        duration: this.tlD * 0.2,
        stagger: this.tlD * 0.05,
      },
      this.tlD * 0.6,
    );
    timeline.set(
      this.svgWrapper,
      {
        display: 'none',
      },
      this.tlD * 0.9,
    );
    return timeline;
  }
}
class MechanismSection extends DOMSection {
  constructor(options) {
    super(options);
    this.updateSeconds = () => {
      const e = Math.trunc(
        ((-project.webgl.scene.watchParts.secondsHand.rotation.z %
          (Math.PI * 2)) /
          (Math.PI * 2)) *
          60,
      )
        .toString()
        .padStart(2, '0');
      this.secondsFirstDigit.innerText = e[0];
      this.secondsSecondDigit.innerText = e[1];
    };
    this.wrapper = this.el.querySelector('.fps-mechanism-first');
    this.fadeElements = this.el.querySelectorAll('[data-fade]');
    this.secondsFirstDigit = this.el.querySelector(
      '.fps-seconds-wrapper span:nth-of-type(1)',
    );
    this.secondsSecondDigit = this.el.querySelector(
      '.fps-seconds-wrapper span:nth-of-type(2)',
    );
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.wrapper,
      {
        display: 'flex',
      },
      window.innerHeight,
    );
    timeline.fromTo(
      this.fadeElements,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: window.innerHeight,
        stagger: window.innerHeight * 0.1,
      },
      window.innerHeight,
    );
    timeline.to(
      this.fadeElements,
      {
        opacity: 0,
        duration: window.innerHeight,
        stagger: {
          each: window.innerHeight * 0.1,
          from: 'end',
        },
      },
      this.tlD - window.innerHeight * 2.5,
    );
    timeline.to(
      this.wrapper,
      {
        display: 'none',
      },
      this.tlD - window.innerHeight,
    );
    return timeline;
  }
  enter() {
    super.enter();
    project.state.on(events.UPDATE_ROTATIONS, this.updateSeconds);
  }
  leave() {
    super.leave();
    project.state.off(events.UPDATE_ROTATIONS, this.updateSeconds);
  }
}
class MovementSection extends DOMSection {
  constructor(options) {
    super(options);
    this.content = translate('movement.description');
    this.contentHTML = this.el.querySelector('.fps-movement-content');
  }
  init() {
    super.init();
    this.greyLines = this.el.querySelectorAll('.grey-line');
    this.greyLines.forEach((item, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          start: '-100% 55%',
          end: '100% 45%',
          scrub: 2,
          trigger: item,
        },
      });
      timeline.from(item, {
        color: '#323232',
        ease: 'power3.inOut',
      });
      timeline.to(item, {
        color: '#323232',
        ease: 'power3.inOut',
      });
    });
  }
}
class MovementDetailsSection extends DOMSection {
  constructor(options) {
    super(options);
    this.wrapper = this.el.querySelector('.fps-vertical-inner');
    this.texts = this.el.querySelectorAll('p');
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.wrapper,
      {
        display: 'flex',
      },
      0,
    );
    timeline.fromTo(
      this.texts,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: window.innerHeight,
        stagger: window.innerHeight * 0.1,
      },
      window.innerHeight * 0.5,
    );
    timeline.to(
      this.texts,
      {
        opacity: 0,
        duration: window.innerHeight,
        stagger: {
          each: window.innerHeight * 0.1,
          from: 'end',
        },
      },
      this.tlD - window.innerHeight * 2,
    );
    timeline.to(
      this.wrapper,
      {
        display: 'none',
      },
      this.tlD,
    );
    return timeline;
  }
}
class PartsSection extends DOMSection {
  constructor(options) {
    super(options);
    this.titleLines = this.el.querySelectorAll('h3 span');
    this.titleSplits = Array.from(this.titleLines).map(
      (item) =>
        new SplitText(item, {
          type: 'chars',
          secondCharWrapper: true,
        }),
    );
    this.parts = this.el.querySelectorAll('li');
    this.imgWrapper = this.el.querySelector('.img-w');
  }
  init() {
    super.init();
  }
  attach() {
    super.attach();
    this.titleSplits.forEach((item) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: item.el,
            scrub: true,
            start: 'start 90%',
            end: 'bottom 50%',
          },
        })
        .from(
          item.chars,
          {
            x: '-100%',
            ease: 'power3.out',
            stagger: 0.03,
          },
          0,
        );
    });
    this.parts.forEach((item) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          scrub: true,
          start: 'start 90%',
          end: 'bottom 50%',
        },
      });
      timeline.from(
        item,
        {
          '--bar-scale': 0,
          ease: 'power3.out',
          duration: 1,
        },
        0,
      );
      timeline.from(
        item.children,
        {
          opacity: 0,
          stagger: 0.05,
          duration: 0.8,
        },
        0,
      );
    });
    gsap
      .timeline({
        scrollTrigger: {
          trigger: this.imgWrapper,
          scrub: true,
          start: 'start bottom',
          end: 'bottom 50%',
        },
      })
      .from(
        this.imgWrapper.children,
        {
          y: 300,
          stagger: 0.1,
          ease: 'power3.out',
        },
        0,
      );
  }
  setupTimeline() {
    return super.setupTimeline();
  }
}
class StrapsSection extends SinglePartSection {
  constructor(options) {
    super(options);
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.to(
      this.presentationCircle,
      {
        display: 'none',
        opacity: 0,
        duration: 0.2 * this.tlD,
      },
      this.tlD * 0.65,
    );
    return timeline;
  }
}
const timelessTextColors = [
  '#BCBCBC',
  '#FFFFFF',
  '#BCBCBC',
  '#FFFFFF',
  '#BCBCBC',
  '#FFFFFF',
];
const timelessAccentColors = [15, 25, 15, 25, 15, 25, 15, 25];
class TimelessSection extends DOMSection {
  constructor(options) {
    super(options);
    this.content = translate('timeless.description');
    this.contentHTML = this.el.querySelector('.fps-timeless-content');
  }
  init() {
    super.init();
    this.greyLines = this.el.querySelectorAll('.grey-line');
    this.greyLines.forEach((item, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          start: `-100% ${50 + timelessAccentColors[index]}%`,
          end: `100% ${50 - timelessAccentColors[index]}%`,
          scrub: 2,
          trigger: item,
        },
      });
      timeline.from(item, {
        color: timelessTextColors[index],
        ease: 'power3.inOut',
      });
      timeline.to(item, {
        color: timelessTextColors[index],
        ease: 'power3.inOut',
      });
    });
  }
}
class VerticalTextSection extends DOMSection {
  constructor(options) {
    super(options);
    this.wrapper = this.el.querySelector('.fps-vertical-inner');
    this.fadeElements = this.el.querySelectorAll('[data-fade]');
    this.rightInfo = this.el.querySelector('.fps-right-infos-wrapper');
  }
  setupTimeline() {
    const timeline = super.setupTimeline();
    timeline.set(
      this.wrapper,
      {
        display: 'flex',
      },
      window.innerHeight,
    );
    timeline.fromTo(
      this.fadeElements,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: window.innerHeight * 0.5,
        stagger: window.innerHeight * 0.2,
      },
      window.innerHeight,
    );
    timeline.to(
      this.fadeElements,
      {
        opacity: 0,
        duration: window.innerHeight * 0.5,
        stagger: {
          each: window.innerHeight * 0.2,
          from: 'end',
        },
      },
      this.tlD - window.innerHeight * 1.2,
    );
    timeline.to(
      this.wrapper,
      {
        display: 'none',
      },
      this.tlD,
    );
    return timeline;
  }
}
const domSections = Object.freeze({
  Colors: ColorsSection,
  Curves: CurvesSection,
  Disassembly: DisassemblySection,
  Footer: FooterSection,
  Hands: HandsSection,
  Images: ImagesSection,
  Intro: IntroSection,
  Mechanism: MechanismSection,
  Movement: MovementSection,
  MovementWatchRight: MovementDetailsSection,
  Parts: PartsSection,
  Straps: StrapsSection,
  Timeless: TimelessSection,
  VerticalText: VerticalTextSection,
});
class WatchDOM {
  constructor() {
    this.initializeSections = () => {
      var e;
      if (engine.debug) {
        const uRLSearchParams2 = new URLSearchParams(window.location.search);
        uRLSearchParams2.has('scroll') &&
          ((e = engine.$app.querySelector(
            `[data-webgl=${uRLSearchParams2.get('scroll')}]`,
          )) == null ||
            e.scrollIntoView());
      }
      this.el = document.querySelector('#the-watch');
      const t = Array.from(this.el.querySelectorAll(`[data-${this.selector}]`));
      this.sections = t.map((element, index) => ({
        el: element,
        name: element.dataset[this.selector],
        component: new domSections[element.dataset[this.selector]]({
          el: element,
          i: index,
          isFirstSection: index === 0,
          isLastSection: index === t.length - 1,
        }),
      }));
      this.cursor = new WatchCursor();
      this.cursor.init();
      this.sections.forEach((section) => {
        section.component.init();
      });
      this.sections.forEach((section) => {
        section.component.attach();
      });
      this.cursor.attach();
    };
    this.handleAttachProject = () => {};
    this.handleDetachProject = () => {
      engine.state.unregister(this);
      project.state.off(events.ATTACH_PROJECT, this.handleAttachProject);
      project.state.off(events.DETACH_PROJECT, this.handleDetachProject);
      project.state.off(events.VIEW_READY_PROJECT, this.initializeSections);
      this.sections?.forEach((section) => {
        section.component.detach();
      });
    };
    this.raf = (value) => {
      this.lenis.raf(value);
      this.frameId = requestAnimationFrame(this.raf);
    };
    this.autoScrollRaf = (value) => {
      this.lenis.raf(value);
      window.scrollTo(0, window.scrollY + this.autoScrollAdditivePx);
      this.frameId = requestAnimationFrame(this.autoScrollRaf);
    };
    this.onResize = () => {
      this.debouncedScrollTriggerRefresh();
    };
    var e;
    engine.state.register(this);
    project.state.on(events.ATTACH_PROJECT, this.handleAttachProject);
    project.state.on(events.DETACH_PROJECT, this.handleDetachProject);
    project.state.on(events.VIEW_READY_PROJECT, this.initializeSections);
    this.selector = 'section';
    this.autoScrollAdditivePx = 0;
    const uRLSearchParams = new URLSearchParams(window.location.search);
    if (uRLSearchParams.has('autoscroll')) {
      let s = 20;
      uRLSearchParams.has('autoscrollspeed') &&
        (s = Number(uRLSearchParams.get('autoscrollspeed')));
      gsap.to(this, {
        autoScrollAdditivePx: s,
        delay: 2.5,
        ease: 'sine.out',
        duration: 4,
      });
    }
    ((e = engine.debug) != null && e.urlParams.has('materials')) ||
      ((this.lenis = new Lenis({
        duration: 4,
      })),
      (this.frameId = requestAnimationFrame(
        uRLSearchParams.has('autoscroll') ? this.autoScrollRaf : this.raf,
      )));
    this.debouncedScrollTriggerRefresh = debounce(
      () => ScrollTrigger.refresh(),
      100,
    );
  }
}
export { SplitText, WatchDOM };
