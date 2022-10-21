import { MediaPlayerProvider, SingleAudio, useSimpleMediaPlayer } from 'react-iiif-vault';
import { ReactNode } from 'react';
import { h } from 'preact';
import { useRegisterPublicApi } from '../../hooks/use-register-public-api';

export function RenderAudio({ media, children }: { media: SingleAudio; children?: ReactNode }) {
  const [{ element, currentTime, progress }, state, actions] = useSimpleMediaPlayer({ duration: media.duration });

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
