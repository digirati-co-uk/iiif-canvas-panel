---
sidebar_position: 3
title: <sequence-panel />
---

import sequencePanel from '@site/sandboxes/sequence-panel.csb/_load';
import { Sandbox } from '@site/Sandbox';

Sequence panel is canvas panel for sequences of canvases, either inside a Manifest or a Range.

It supports many of the APIs that [Canvas panel](./canvas-panel.md) supports, with the following limitations:

* No content state (setting/getting)
* No dynamic declarative input using HTML attributes
* No default choice via props (only through events)
* No x or y can be passed in

You don't have access to the same APIs for creating display annotations with the sequence panel yet.

### Example
```html
<sequence-panel
  id='sequence'
  preset="zoom"
  text-enabled='true'
  text-selection-enabled='true'
  manifest-id='https://iiif.wellcomecollection.org/presentation/b18035723'
  start-canvas="https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2"
  margin='30'
></sequence-panel>
```

<Sandbox project={sequencePanel} />


With sequence panel you get access in javascript through the API to the current sequence of canvases, along with some
controls for navigating through the sequence.

## API
When the component and manifest is loaded, a new helper is available on the HTML element:
```js
const sp = document.getElementById('sequence');

sp.addEventListener('sequence', () => {
    sp.sequence.totalCanvases; // total canvases in the sequence.
});
```

The following events are added for sequences:
- `sequence` - This is fired when a sequence is detected and loaded, here you can access the `sp.sequence` helper
- `sequence-change` - This is fired any time the sequence changes (next/prev/navigation).

:::info
The `<sequence-panel />` will not fire `canvas-change` events like Canvas Panel does. This is because 2 events would fire at the same time and may conflict if you are using these to update UI.
:::

### items
`sp.sequence.items` is a flat list of Canvas references (id + type) that show the flat order of the canvases.
```js
const items = [
    { id: 'https://example.org/canvas-1', type: 'Canvas' },
    { id: 'https://example.org/canvas-2', type: 'Canvas' },
    { id: 'https://example.org/canvas-3', type: 'Canvas' },
    { id: 'https://example.org/canvas-4', type: 'Canvas' },
    { id: 'https://example.org/canvas-5', type: 'Canvas' },
    ...
]
```


### sequence
`sp.sequence.sequence` is a flat list of arrays of numbers.
```js
const sequence = [
    [0], // indicates the sequence.items[0] (https://example.org/canvas-1)
    [1, 2], // canvas-2 and canvas-3 (sequence.items[1], sequence.items[2])
    [3, 4], // canvas-4 and canvas-5 
    // ...
]
```

You can convert this to a canvases:
```js
sp.sequence.sequence.map(canvasIndexes => {
    // Vault.get() will return the full items
    return vault.get(
        // These index against `sp.sequence.items`
        canvasIndexes.map(idx => sp.sequence.items[idx])
    );
})
```

This can be useful if you want to create a thumbnail strip and keep the paging logic.

### totalCanvases
`sp.sequence.totalCanvases` simply return the total number of canvases. 

### currentSequenceIndex
`sp.sequence.currentSequenceIndex` returns the current sequence that is displayed. You can convert this into canvas indexes and canvases:

```js
const itemIndexes = sp.sequence.sequence[sequence.currentSequenceIndex]; // [1, 2]
const canvaseRefs = itemIndexes.map(idx => sequence.items[idx]); // [{id: 'https:/..canvas-1', type: 'Canvas'}, { id: '...' }]
const canvases = vault.get(canvaseRefs);
```

### nextCanvas()
`sp.sequence.nextCanvas()` will move you forward to the next canvas in the sequence (i.e. next spead of pages in a book). This can be hooked up to a "next" button in a paged viewer.

If you want to disable this button at the start, you can check the `sequence-change` event:
```js
sp.addEventListener('sequence-change', (e) => {
    if (e.detail.total -1 <= e.detail.index) {
        $nextButton.setAttribute('disabled', 'true');        
    } else {
        $nextButton.removeAttribute('disabled');
    }
})
```


### previousCanvas()
`sp.sequence.previousCanvas()` will move you backwards through the sequence.

If you want to disable this button at the end, you can check the `sequence-change` event:
```js
sp.addEventListener('sequence-change', (e) => {
    if (e.detail.index === 0) {
      $prevButton.setAttribute('disabled', 'true');
    } else {
      $prevButton.removeAttribute('disabled');
    }
})
```

### setCurrentCanvasId()
You can use this to go directly a the first sequence that contains the canvas ID chosen.
This can be useful for hooking up thumbnail navigation.
```js
sp.sequences.setCurrentCanvasId('https://example.org/canvas-5');
```

### setCurrentCanvasIndex()
You can use this to go to a canvas index (not sequence index).
```js
sp.sequences.setCurrentCanvasId(5);
```

