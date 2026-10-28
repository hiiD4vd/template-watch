interface SplitTextOptions {
  type: string;
  noResize?: boolean;
  wordsClass?: string;
  linesClass?: string;
  charsClass?: string;
  secondCharWrapper?: boolean;
}

/** DOM spans provide animation targets; the original nodes are restored on disposal. */
export class SplitText {
  static instances = new Set<SplitText>();
  words: HTMLElement[] = [];
  lines: HTMLElement[] = [];
  chars: HTMLElement[] = [];
  charWrappers: HTMLElement[] = [];
  private readonly originalNodes: Node[];
  private readonly text: string;
  private readonly observer: ResizeObserver;

  constructor(
    private readonly element: HTMLElement,
    private readonly options: SplitTextOptions,
  ) {
    this.originalNodes = Array.from(element.childNodes);
    this.text = element.innerText.replace('-', '\u2011');
    this.splitWords();
    if (options.type.includes('lines')) this.splitLines();
    if (options.type.includes('chars')) this.splitChars();
    this.observer = new ResizeObserver(() => {
      if (options.noResize || !options.type.includes('lines')) return;
      this.words = Array.from(
        element.querySelectorAll<HTMLElement>('.st-word'),
      );
      if (!this.words.length) this.splitWords();
      this.splitLines();
    });
    this.observer.observe(element);
    SplitText.instances.add(this);
  }

  private span(className: string, text?: string) {
    const span = document.createElement('span');
    span.className = className;
    span.style.display = 'inline-block';
    if (text !== undefined) span.textContent = text;
    return span;
  }

  private splitWords() {
    const fragment = document.createDocumentFragment();
    this.words = this.text.split(' ').map((text, index) => {
      if (index) fragment.append(' ');
      const word = this.span(`st-word ${this.options.wordsClass || ''}`, text);
      fragment.append(word);
      return word;
    });
    this.element.replaceChildren(fragment);
  }

  private splitLines() {
    const groups: HTMLElement[][] = [];
    let previousTop: number | null = null;
    for (const word of this.words) {
      if (word.offsetTop !== previousTop) groups.push([]);
      previousTop = word.offsetTop;
      groups[groups.length - 1].push(word);
    }
    const fragment = document.createDocumentFragment();
    this.lines = groups.map((words) => {
      const line = this.span(`st-line ${this.options.linesClass || ''}`);
      for (const word of words) {
        if (
          this.options.type.includes('words') ||
          this.options.type.includes('chars')
        )
          line.append(word);
        else line.append(...Array.from(word.childNodes));
        line.append(' ');
      }
      fragment.append(line, ' ');
      return line;
    });
    this.element.replaceChildren(fragment);
    this.words = Array.from(
      this.element.querySelectorAll<HTMLElement>('.st-word'),
    );
  }

  private splitChars() {
    for (const word of this.words) {
      const fragment = document.createDocumentFragment();
      for (const text of (word.textContent || '').split('')) {
        const char = this.span(
          `st-char ${this.options.charsClass || ''}`,
          text,
        );
        this.chars.push(char);
        if (this.options.secondCharWrapper) {
          const wrapper = this.span('char-wrapper');
          wrapper.append(char);
          this.charWrappers.push(wrapper);
          fragment.append(wrapper);
        } else fragment.append(char);
      }
      word.replaceChildren(fragment);
    }
  }

  revert() {
    this.observer.disconnect();
    this.element.replaceChildren(...this.originalNodes);
    SplitText.instances.delete(this);
  }
}
