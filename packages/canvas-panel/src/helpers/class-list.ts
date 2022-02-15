export class ClassList {
  _className = '';
  onChange: (className: string) => void | undefined;

  set className(className: string) {
    this._className = className;
  }

  get className() {
    return this._className;
  }

  constructor(onChange?: (className: string) => void, classes?: string | string[]) {
    this.onChange = onChange || (() => void 0);
    this.className = Array.isArray(classes) ? classes.join(' ') : classes || '';
  }

  add(className: string) {
    const classes = this.className.split(' ');
    if (!classes.includes(className.trim())) {
      this.className += ' ' + className.trim();
    }
  }
  remove(className: string) {
    this.className = this.className
      .split(' ')
      .filter((c) => c && c !== className)
      .join(' ');
  }

  toggle(className: string, shouldToggle?: boolean) {
    const classes = this.className.split(' ');
    if (shouldToggle && !classes.includes(className)) {
      this.className += ' ' + className.trim();
    }
  }
  contains(className: string) {
    const classes = this.className.split(' ');
    return classes.includes(className.trim());
  }

  getClassName() {
    return this.className;
  }
}
