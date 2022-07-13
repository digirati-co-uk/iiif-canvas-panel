import { ContentState, NormalisedContentState } from '@iiif/vault-helpers';
import { BoxSelector } from '@iiif/vault-helpers/.build/types/annotation-targets/selector-types';

export interface ContentStateEvent {
  contentState: ContentState;
  normalisedContentState: NormalisedContentState;
  encodedContentState: string;
  selection: BoxSelector;
}

export type ContentStateCallback = (event: ContentStateEvent) => void;
