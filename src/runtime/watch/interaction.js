import { gsap } from 'gsap';
class LongPress {
  constructor(
    element,
    eventCallback,
    {
      activationDelay = 400,
      maxStartDelta = 1 / 0,
      duration = 3e3,
      lockAfterDelay = false,
      lockingDelay = 2e3,
      ease = 'power3.inOut',
    } = {},
  ) {
    this.isLongpressingValue = false;
    this.intensityValue = 0;
    this.pressTimeline = null;
    this.pressCoordinates = {
      start: {
        x: 0,
        y: 0,
      },
      current: {
        x: 0,
        y: 0,
      },
      last: {
        x: 0,
        y: 0,
      },
    };
    this.handlePressStart = (event) => {
      const { clientX: e, clientY: s } = event.targetTouches
        ? event.targetTouches[0]
        : event;
      this.firstDown &&
        ((this.pressCoordinates.current.x = e),
        (this.pressCoordinates.current.y = s),
        (this.firstDown = false));
      this.pressCoordinates.start.x = e;
      this.pressCoordinates.start.y = s;
      this.timeout = setTimeout(() => {
        this.startDelta < this.maxStartDelta && (this.isLongpressing = true);
      }, this.activationDelay);
    };
    this.handlePressEnd = () => {
      clearTimeout(this.timeout);
      this.isLongpressing = false;
    };
    this.handlePressMove = (event) => {
      this.pressCoordinates.last.x = this.pressCoordinates.current.x;
      this.pressCoordinates.last.y = this.pressCoordinates.current.y;
      const { clientX: e, clientY: s } = event.targetTouches
        ? event.targetTouches[0]
        : event;
      this.pressCoordinates.current.x = e;
      this.pressCoordinates.current.y = s;
    };
    this.element = element;
    this.eventCallback = eventCallback;
    this.activationDelay = activationDelay;
    this.maxStartDelta = maxStartDelta;
    this.duration = duration;
    this.lockAfterDelay = lockAfterDelay;
    this.lockingDelay = lockingDelay;
    this.ease = ease;
    this.ended = false;
    this.enabled = true;
    this.firstDown = true;
    this.element.addEventListener('touchstart', this.handlePressStart, {
      passive: true,
    });
    this.element.addEventListener('touchmove', this.handlePressMove, {
      passive: true,
    });
    this.element.addEventListener('touchend', this.handlePressEnd, {
      passive: false,
    });
    this.element.addEventListener('mousedown', this.handlePressStart, {
      passive: false,
    });
    this.element.addEventListener('mousemove', this.handlePressMove, {
      passive: false,
    });
    this.element.addEventListener('mouseup', this.handlePressEnd, {
      passive: false,
    });
    this.element.addEventListener('mouseleave', this.handlePressEnd, {
      passive: false,
    });
  }
  destroy() {
    clearTimeout(this.timeout);
    this.pressTimeline?.kill();
    this.element.removeEventListener('touchstart', this.handlePressStart, {
      passive: true,
    });
    this.element.removeEventListener('touchmove', this.handlePressMove, {
      passive: true,
    });
    this.element.removeEventListener('touchend', this.handlePressEnd, {
      passive: false,
    });
    this.element.removeEventListener('mousedown', this.handlePressStart, {
      passive: false,
    });
    this.element.removeEventListener('mousemove', this.handlePressMove, {
      passive: false,
    });
    this.element.removeEventListener('mouseup', this.handlePressEnd, {
      passive: false,
    });
    this.element.removeEventListener('mouseleave', this.handlePressEnd, {
      passive: false,
    });
  }
  get isLongpressing() {
    return this.isLongpressingValue;
  }
  set isLongpressing(isLongpressingValue) {
    this.isLongpressingValue === isLongpressingValue ||
      this.ended ||
      !this.enabled ||
      ((this.isLongpressingValue = isLongpressingValue),
      this.pressTimeline
        ? isLongpressingValue
          ? this.pressTimeline.play()
          : this.pressTimeline.reverse()
        : ((this.pressTimeline = gsap.timeline()),
          this.pressTimeline.to(this, {
            intensity: isLongpressingValue ? 1 : 0,
            duration: this.duration / 1e3,
            ease: this.ease,
          }),
          this.lockAfterDelay &&
            this.pressTimeline.set(
              this,
              {
                ended: true,
              },
              this.lockingDelay / 1e3,
            )));
  }
  get intensity() {
    return this.intensityValue;
  }
  set intensity(intensityValue) {
    this.intensityValue = intensityValue;
    this.eventCallback(this.intensityValue);
  }
  get startDelta() {
    return Math.sqrt(
      Math.pow(
        this.pressCoordinates.start.x - this.pressCoordinates.current.x,
        2,
      ) +
        Math.pow(
          this.pressCoordinates.start.y - this.pressCoordinates.current.y,
          2,
        ),
    );
  }
  get lastDelta() {
    return Math.sqrt(
      Math.pow(
        this.pressCoordinates.last.x - this.pressCoordinates.current.x,
        2,
      ) +
        Math.pow(
          this.pressCoordinates.last.y - this.pressCoordinates.current.y,
          2,
        ),
    );
  }
}
export { LongPress };
