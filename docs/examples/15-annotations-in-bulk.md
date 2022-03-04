---
sidebar_position: 15
---

# Working with Annotation Pages

import { GitHubDiscussion } from "../../GitHubDiscussion.js";
import annoPages from '@site/sandboxes/15-annotations-in-bulk/annoPage.csb/_load';
import { Sandbox } from '@site/Sandbox';

<!-- Stephen: anno page styling not working! -->

The preferred way of dealing with large numbers of annotations is to separate them into multiple AnnotationPage resources. For example, one AnnotationPage for the English transcription, another AnnotationPage for the French translation, and another page for the German translation.

AnnotationPages can be used to partition annotations for any purpose, and should have labels to describe what they are for.

Canvas Panel can then load, display and style whole annotation pages - that is, display all the annotations in one AnnotationPage, and style all the annotations in one AnnotationPage.


<Sandbox stacked project={annoPages} />


Canvas Panel's `AnnotationPageManager` has the following helpers:

```js
const allPages = cp.annotationPageManager.availablePageIds; 
const activePages = cp.annotationPageManager.enabledPageIds;
cp.annotationPageManager.setPageEnabled(myPageId); // make visible
cp.annotationPageManager.setPageDisabled(myPageId); // make invisible
```

<!-- Stephen or Tom: a demo with two anno pages -->

<GitHubDiscussion ghid="99" />