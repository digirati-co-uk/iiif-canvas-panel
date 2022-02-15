import { FC } from 'preact/compat';
import { ManifestContext, useExternalManifest } from 'react-iiif-vault';
import { Spinner } from './spinner';
import { h } from 'preact';

export type ManifestLoaderProps = {
  manifestId: string;
};

export const ManifestLoader: FC<ManifestLoaderProps> = ({ manifestId, children }) => {
  const { manifest, isLoaded, error } = useExternalManifest(manifestId, {});

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isLoaded || !manifest) {
    return <Spinner />;
  }

  return <ManifestContext manifest={manifest.id}>{children}</ManifestContext>;
};
