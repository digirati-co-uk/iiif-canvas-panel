import { createElement as h } from "react";
import type { SingleAudio } from "react-iiif-vault/core";
import { NativeMedia } from "../NativeMedia/NativeMedia";

export function RenderAudio({ media }: { media: SingleAudio }) {
  return <NativeMedia media={media} kind="audio" />;
}
