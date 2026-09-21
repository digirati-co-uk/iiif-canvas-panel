---
sidebar_position: 10
---

# Working with Vue.js

import { GitHubDiscussion } from "../../GitHubDiscussion.js"; import { Example }
from '@site/Example';

Register the browser bundle once in your client entry:

```js
import '@digirati/canvas-panel-web-components/dist/index.iife.js';
import '@digirati/canvas-panel-web-components/dist/index.css';
```

Bind string attributes with Vue's usual syntax. The carousel below shares a
Vault from `@iiif/helpers/vault` and uses `@iiif/helpers/thumbnail` for
thumbnail images.

```html
<canvas-panel :manifest-id="manifestId" :canvas-id="canvasId"></canvas-panel>
```

For Vue single-file components compiled by Vite, configure Vue's
`template.compilerOptions.isCustomElement` to recognize Canvas Panel's tags
(`canvas-panel`, `image-service`, `sequence-panel`, `range-panel`,
`metadata-panel`, and `layout-container`). For runtime-compiled templates, set
`app.config.compilerOptions.isCustomElement` instead. Custom events can be bound
with `@choice="onChoice"`; their payload is in `event.detail`.

<Example id="vue-3-carousel" />
