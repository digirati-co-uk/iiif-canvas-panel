---
sidebar_position: 4
---

# Simple viewer - common features

Canvas Panel is a component of a IIIF viewer, rather than a viewer in its own right.

However, there are several expected viewer features, that Canvas Panel helps implement. 

## Placing buttons on top of the Canvas

If you want to mimic OpenSeadragon:

(TBC)

## Full screen

This make Canvas Panel invoke the browser's full screen "F11" API and take up the entire _screen_ (not browser).

```js
cp.setFullScreen(true);
// ...
cp.setFullScreen(false);
```

This can be seen in the Book Reader example.

## Zoom in/out buttons

TBC


## Viewport navigator

This is described at [Viewport Navigator](../examples/navigator).

## Reset

The `goHome()` function will return the viewport to the initial condition:

```js
cp.goHome();
```


