import '@digirati/canvas-panel-web-components';

const panel = document.querySelector('canvas-panel');
if (panel) {
  panel.setCanvas('https://example.org/canvas');
  panel.addEventListener('choice', (event) => {
    if (event.detail.choice.type === 'single-choice')
      panel.makeChoice(event.detail.choice.items[0].id, { deselect: true });
    // @ts-expect-error The real choice payload has no invented property.
    event.detail.invented;
  });
  // @ts-expect-error Canvas IDs must be strings.
  panel.setCanvas(123);
  // @ts-expect-error Catch method typos in documentation.
  panel.setCanavs('canvas');
  // @ts-expect-error Opacity is numeric.
  panel.applyStyles('image', { opacity: 'half' });
}
