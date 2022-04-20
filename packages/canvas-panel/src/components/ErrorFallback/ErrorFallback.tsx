import { h } from 'preact';
import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({
  error,
  resetErrorBoundary,
  aspectRatio,
  height = 512,
  width,
}: Partial<FallbackProps> & { aspectRatio?: number; height?: number; width?: number }) {
  const style = aspectRatio ? { paddingTop: `${aspectRatio * 100}%` } : { height, width };

  return (
    <slot name="fallback">
      <div
        role="alert"
        style={{
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          ...style,
        }}
      >
        <div style={{ padding: '1em', textAlign: 'center' }}>
          <img
            className="img-oops"
            width={11 * 3}
            height={8 * 3}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAICAYAAAAvOAWIAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAC6ADAAQAAAABAAAACAAAAADGHiDWAAAAO0lEQVQYGWP4DwQMQACjQWxkABOH0TgVwjRhKIQLwFRAaZg4jEaTphKXEWYOPmsYgQCmjnQPwnXiYQAAP/M3zvinPKAAAAAASUVORK5CYII="
          />
          <h2>Unable to load image</h2>
          <pre>{error?.message}</pre>
          {resetErrorBoundary ? (
            <button
              style={{
                color: '#fff',
                border: '2px solid #fff',
                background: '#000',
                fontFamily: 'monospace',
                padding: '0.25em 1em',
              }}
              onClick={resetErrorBoundary}
            >
              Try again
            </button>
          ) : null}
          <style>
            {`
          .img-oops {
            border: 3px solid white;
            padding: 15px;
            image-rendering: auto;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
            margin-bottom: 10px;
          }
        `}
          </style>
        </div>
      </div>
    </slot>
  );
}
