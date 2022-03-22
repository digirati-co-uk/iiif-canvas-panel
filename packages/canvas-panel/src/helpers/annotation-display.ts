import { Vault } from '@iiif/vault';
import { ClassList } from './class-list';
import { AnnotationNormalized, Reference } from '@iiif/presentation-3';
import { BoxStyle, mergeStyles } from '@atlas-viewer/atlas';
import { createStylesHelper, StyledHelper, createEventsHelper } from '@iiif/vault-helpers';

export class AnnotationDisplay {
  __vault: Vault | null = null;
  __annotation: Reference<'Annotation'>;
  __eventsHelper: ReturnType<typeof createEventsHelper> | null = null;
  __stylesHelper: StyledHelper<BoxStyle> | null = null;
  __e: any = {};

  // Properties.
  classList: ClassList;
  source: string | AnnotationNormalized | Reference<'Annotation'>;
  style?: BoxStyle;
  htmlProps: {
    className?: string;
    href?: string;
    title?: string;
    target?: string;
  } = {};
  handlers: Array<[string, (e: any) => void]> = [];
  onBeforeRemove?: () => void;

  constructor(source: string | AnnotationNormalized | Reference<'Annotation'>) {
    this.__annotation =
      typeof source === 'string' ? { id: source, type: 'Annotation' } : { id: source.id, type: 'Annotation' };
    this.classList = new ClassList((className: string) => {
      if (this.__stylesHelper) {
        this.__stylesHelper.applyStyles(this.__annotation, 'html', { ...this.htmlProps, className });
      }
    });
    this.source = source;
  }

  get className() {
    return this.classList.getClassName();
  }

  set className(value: string) {
    this.classList.className = value;
  }

  set href(href: string) {
    if (this.__stylesHelper) {
      this.__stylesHelper.applyStyles(this.__annotation, 'html', { href });
    }
    this.htmlProps.href = href;
  }

  set title(title: string) {
    if (this.__stylesHelper) {
      this.__stylesHelper.applyStyles(this.__annotation, 'html', { title });
    }
    this.htmlProps.title = title;
  }

  set target(target: string) {
    if (this.__stylesHelper) {
      this.__stylesHelper.applyStyles(this.__annotation, 'html', { target });
    }
    this.htmlProps.target = target;
  }

  applyStyle(style: BoxStyle) {
    this.style = mergeStyles(this.style, style);
    if (this.__stylesHelper) {
      this.__stylesHelper.applyStyles(this.__annotation, 'atlas', this.style);
    }
  }

  addEventListener(name: string, handler: (e: any) => void) {
    if (this.__eventsHelper) {
      this.__eventsHelper.addEventListener(this.__annotation, name, handler);
    }
    this.handlers.push([name, handler]);
  }

  removeEventListener(name: string, handler: (e: any) => void) {
    if (this.__eventsHelper) {
      this.__eventsHelper.removeEventListener(this.__annotation, name, handler);
    }
    this.handlers = this.handlers.filter((h) => h[0] === name && h[1] === handler);
  }

  bindToVault(vault: Vault) {
    this.__vault = vault;
    this.__eventsHelper = createEventsHelper(vault);
    this.__stylesHelper = createStylesHelper<BoxStyle>(vault);
    // Add events.
    for (const [name, handler] of this.handlers) {
      this.__eventsHelper.addEventListener(this.__annotation, name, handler);
    }

    // Add style.
    this.__stylesHelper.applyStyles(this.__annotation, 'atlas', this.style);

    // Add class names?
    this.__stylesHelper.applyStyles(this.__annotation, 'html', {
      ...this.htmlProps,
      className: this.classList.getClassName(),
    });
  }

  getSource() {
    return this.source;
  }

  getAnnotation() {
    return this.__annotation;
  }

  beforeRemove() {
    if (this.onBeforeRemove) {
      this.onBeforeRemove();
    }
    if (this.__vault) {
      // @todo remove styles somehow?
      if (this.__eventsHelper) {
        for (const [name, handler] of this.handlers) {
          this.__eventsHelper.removeEventListener(this.__annotation, name, handler);
        }
      }

      this.__vault = null;
    }
  }
}
