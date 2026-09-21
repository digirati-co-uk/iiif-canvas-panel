import { createElement, forwardRef } from "react";

// Compatibility names for existing annotation components; Atlas owns creation,
// updates and disposal of every scene node.
export const WorldObject = forwardRef<any, any>((props, ref) => createElement("world-object", { ...props, ref }));
export const Box = forwardRef<any, any>((props, ref) => createElement("box", { ...props, ref }));
export const Shape = forwardRef<any, any>((props, ref) => createElement("shape", { ...props, ref }));
export const SingleImage = forwardRef<any, any>((props, ref) => createElement("world-image", { ...props, ref }));
