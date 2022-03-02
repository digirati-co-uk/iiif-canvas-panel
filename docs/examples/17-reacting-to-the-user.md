---
sidebar_position: 16
---

# Reacting to the user
<!-- TODO: GH-110 -->

import { GitHubDiscussion } from "../../GitHubDiscussion.js";

:::danger

The features on this page are still in development and not available in release versions.

:::

Types of interaction:

 - Movement - panning and zooming
 - Clicking a particular point
 - Clicking a particular point that is the target of an annotation that the component has rendered
 - Box selection
 - Shape selection
 - Text selection (#15)

 - _Any_ user interaction might be something the developer wants to respond to for some reason
 - _Many_ user interactions aren't important and will be left unobserved by the developer's code in most scenarios (e.g., panning and zooming actions)
 - _Some_ click interactions could be left to the component - e.g., #13 a click on a rendered hyperlink could just bubble up to browser and cause a page navigation, _or_ developer might want to handle this explicitly through handling the event
 - _Some_ user interactions are meaningless unless the component is in a particular mode and being used to accept user input (e.g., in an annotation tool)


## Event handling

Write up:

https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/45#discussioncomment-1164643


<GitHubDiscussion ghid="16" />