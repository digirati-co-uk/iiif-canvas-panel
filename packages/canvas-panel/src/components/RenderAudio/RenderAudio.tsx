import { useLayoutEffect } from 'react';
import { MediaPlayerProvider, SingleAudio, useSimpleMediaPlayer } from 'react-iiif-vault/core';
import { ReactNode } from 'react';
import { createElement as h } from 'react';
import { useRegisterPublicApi } from '../../hooks/use-register-public-api';

export function RenderAudio({ media, children }: { media: SingleAudio; children?: ReactNode }) {
  const [{ element, currentTime, progress }, state, actions] = useSimpleMediaPlayer({ duration: media.duration });

  useLayoutEffect(() => {
    const player = element.current;
    return () => player?.pause();
  }, [media.url]);

  useRegisterPublicApi((el: any) => {
    el.mediaActions = actions;
    el.mediaElement = element;
    el.setMediaProgressElement = (el: HTMLDivElement) => {
      (progress as any).current = el;
    };

    el.dispatchEvent(new Event('media-displayed'));
    el.dispatchEvent(new Event('audio-displayed'));

    return {} as any;
  }, media.url);

  return (
    <MediaPlayerProvider
      state={state}
      actions={actions}
      currentTime={currentTime}
      progress={progress}
      element={element}
    >
      <video ref={element as any} src={media.url} />
      {children}
    </MediaPlayerProvider>
  );
}
