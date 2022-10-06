import { SingleVideo, useSimpleMediaPlayer } from 'react-iiif-vault';
import { h } from 'preact';
import { useRegisterPublicApi } from '../../hooks/use-register-public-api';

export function RenderVideo({ media }: { media: SingleVideo }) {
  const [{ element, currentTime, progress }, state, actions] = useSimpleMediaPlayer({ duration: media.duration });
  const playPause = actions.playPause;

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

  const Component = 'div' as any;
  return (
    <Component className="video-container" part="video-container" onClick={playPause}>
      <style>
        {`
            .video-container {
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              background: #000;
              z-index: 13;
              display: flex;
              justify-content: center;
              pointer-events: visible;
            }
          `}
      </style>
      <video ref={element as any} src={media.url} style={{ width: '100%', objectFit: 'contain' }} />
    </Component>
  );
}
