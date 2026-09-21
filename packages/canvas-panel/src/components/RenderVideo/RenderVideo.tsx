import { createElement as h } from "react";
import type { SingleVideo } from "react-iiif-vault/core";
import { NativeMedia } from "../NativeMedia/NativeMedia";

export function RenderVideo({ media }: { media: SingleVideo }) {
  return <NativeMedia media={media} kind="video" />;
}
