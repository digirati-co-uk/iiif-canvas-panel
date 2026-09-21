import { FC, ReactNode } from "react";
import { ManifestContext, useExternalManifest } from "react-iiif-vault/core";
import { Spinner } from "./spinner";
import { createElement as h } from "react";
import { ErrorFallback } from "./ErrorFallback/ErrorFallback";
import { useEffect } from "react";

export type ManifestLoaderProps = {
  manifestId: string;
  children?: ReactNode;
};

export const ManifestLoader: FC<ManifestLoaderProps> = ({ manifestId, children }) => {
  const { manifest, isLoaded, error } = useExternalManifest(manifestId, {});

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (error) {
    return <ErrorFallback error={new Error(`Unable to load Manifest: ${manifestId} \n \n ${error.toString()}`)} />;
  }

  if (!isLoaded || !manifest) {
    return <Spinner />;
  }

  return <ManifestContext manifest={manifest.id}>{children}</ManifestContext>;
};
