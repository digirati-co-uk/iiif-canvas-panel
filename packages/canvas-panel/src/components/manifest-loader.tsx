import { FC } from 'preact/compat';
import { ManifestContext, useExternalManifest } from 'react-iiif-vault';
import { Spinner } from './spinner';
import { h } from 'preact';
import { ErrorFallback } from './ErrorFallback/ErrorFallback';
import { useEffect } from 'react';

export type ManifestLoaderProps = {
  manifestId: string;
};

export const ManifestLoader: FC<ManifestLoaderProps> = ({ manifestId, children }) => {
  const { manifest, isLoaded, error } = useExternalManifest(manifestId, {});

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (error) {
    return <ErrorFallback error={new Error(`Unable to load Manifest: ${manifestId} \n \n ${error.toString()}`)} />;
  }

  if (!isLoaded || !manifest) {
    return <Spinner />;
  }

  return <ManifestContext manifest={manifest.id}>{children}</ManifestContext>;
};
