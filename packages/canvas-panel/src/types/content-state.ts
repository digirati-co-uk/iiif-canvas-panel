import { ContentState, NormalisedContentState } from "@iiif/helpers";
import { BoxSelector } from "@iiif/helpers/annotation-targets";

export interface ContentStateEvent {
  contentState: ContentState;
  normalisedContentState: NormalisedContentState;
  encodedContentState: string;
  selection: BoxSelector;
}

export type ContentStateCallback = (event: ContentStateEvent) => void;
