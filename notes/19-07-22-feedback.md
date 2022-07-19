I reviewed [the repo backlog](https://github.com/orgs/digirati-co-uk/projects/18/views/1?sortedBy%5Bdirection%5D=asc&sortedBy%5BcolumnId%5D=Milestone) with the teams and we developed the following notes.
In order to help focus our direction, I asked the teams to explicitly indicate what they cannot implement with things in their current state. The result of that exercise is below.

## Essential Items

* Keyboard navigation (on the list)
* Content State Selection (on the list)
* Get current state (not on the list)
  * An essential feature for a generic viewer (which is what wanted)
  * Useful in UI nav (buttons: if someone is fully zoomed out, eg)
 
In the current state it is impossible to build the basic functions of an ImageViewer on top of canvas panel. [CanvasPanel: Simple Viewer Common Features](https://iiif-canvas-panel.netlify.app/docs/applications/simple-viewer-with-common-features/)

* We do not know how to put a button on-top of the canvas:
  * Missing documentation
* We could NOT implement a zoom in or zoom out button because:
  * We do not know the current state of the canvas (what the min zoom, or max zoom is) so we can’t enable or disable the button initially or know whether the zoom should do anything
  * We do not have access to a ‘zoom’ method, or access to enough information from the documentation to calculate what the zoom in or zoom out would be as to formulate it by a target. (though these do appear as part of the Atlas storybook)
  * We also don’t have an event model for the ImageService or Canvas that allows us to know that the state changed so we can ask whether the button should be enabled or disabled or not
* We could NOT use the Viewport Navigation as it currently is implemented on this page (buggy) or, based on the “event” and other APIs implement our own.
* We could NOT make the viewer work well where it covers most of the width of a page because:
  * The ImageService and CanvasPanel do not have a documented event model that might allow zooming by double-clicking, or zooming out to work with a modifier key to provide alternate methods of interaction.  E.g. what Google Maps does to help us prevent:
    * The ImageService and CanvasPanel capture the mousewheel focus and prevents the user from scrolling. 
    * On mobile, the ImageService and CanvasPanel capture the drag in such a way that when it takes up the majority of the screen it prevents the user from navigating down the page
 
In the current state of CanvasPanel it is impossible to implement the basic functions of a book viewer.

* We could NOT make a side-by-side bookviewer because:
  * It is not clear how to use Atlas from the documentation to layout items either side-by-side or in a more complex configuration
  * It is not clear if it is possible to update content in Atlas when a user wants to move between pages

* We could NOT make a thumbnail viewer for the entire book because:
  * It is not clear how to layout items in a more complex layout in Atlas
  * It is not clear how to add and style text on the layout (page #’s or title)
  * It is not clear how to make the pages displayed interactive – i.e. add annotations that are ‘click-able’ or touch-able to take the user to a given page of the book or add mouse events to show other forms of interactivity [does this work?](https://iiif-canvas-panel.netlify.app/docs/examples/annotations/)
