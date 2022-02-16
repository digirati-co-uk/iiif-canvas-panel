---
sidebar_position: 15
---

# Working with Annotation Pages

TODO - THIS IS NOT DONE YET!!!!

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

Discussion and examples for loading whole anno pages, styling them, wiring up events

Displaying 1000s of annos without them being display annos
Best practices

Converting to display annos

```
ref = cp.loadAnnotationPage(annotationPageId);
cp.applyStyles(ref, {
  backgroundColor: 'red',
  border: '1px solid blue',
});
cp.setPageEnabled(ref):
```

<GitHubDiscussion ghid="99" />