import { CanvasPanelProps } from '../web-components/canvas-panel';

export async function resolveConfig(preset: string): Promise<Partial<CanvasPanelProps> | null> {
  if (!preset) {
    return null;
  }

  switch (preset) {
    case 'static': {
      return {
        render: 'static',
        interactive: false,
        viewport: true,
      };
    }
    case 'responsive': {
      return {
        render: 'static',
        interactive: false,
        viewport: false,
      };
    }
    case 'zoom': {
      return {
        render: 'canvas',
        interactive: true,
        viewport: true,
      };
    }
  }

  if (preset.startsWith('http')) {
    // load remote?

    return fetch(preset).then((r) => r.json());
  }

  if (preset.startsWith('#')) {
    const el = document.getElementById(preset.slice(1));
    if (el) {
      try {
        return JSON.parse(el.innerText);
      } catch (e) {
        console.error('Invalid JSON on element', el);
      }
    }
  }
  return null;
}
