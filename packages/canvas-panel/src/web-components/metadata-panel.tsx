import { useSyncedState } from '../hooks/use-synced-state';
import { parseBool, parseNumber } from '../helpers/parse-attributes';
import { ManifestContext, useExistingVault, useExternalManifest, VaultProvider } from 'react-iiif-vault';
import { globalVault, Vault } from '@iiif/vault';
import { Fragment, h } from 'preact';
import { MetaDataDisplay } from '../components/MetadataDisplay/MetadataDisplay';
import register from '../library/preact-custom-element';

export interface MetadataPanelProps {
  vault?: Vault;
  manifestId: string;
  configId?: string;
  separator?: string;
  variation?: 'table' | 'list';
  labelStyle?: 'muted' | 'bold' | 'caps' | 'small-caps';
  labelWidth?: number;
  bordered?: boolean;
  allowHtml?: boolean;
  showEmptyMessage?: boolean;
  children?: any;
}

export function MetadataPanel(props: MetadataPanelProps) {
  const existingVault = useExistingVault();
  const vault = props.vault || existingVault || globalVault();
  const [manifestId] = useSyncedState(props.manifestId);
  const [variation] = useSyncedState(props.variation);
  const [labelStyle] = useSyncedState(props.labelStyle);
  const [separator] = useSyncedState(props.separator);
  const [labelWidth] = useSyncedState(props.labelWidth, { parse: parseNumber });
  const [bordered] = useSyncedState(props.bordered, { parse: parseBool, defaultValue: false });
  const [allowHtml] = useSyncedState(props.allowHtml, { parse: parseBool, defaultValue: false });
  const [showEmptyMessage] = useSyncedState(props.showEmptyMessage, { parse: parseBool, defaultValue: false });

  if (!manifestId) {
    return <slot name="no-manifest" />;
  }

  return (
    <Fragment>
      <VaultProvider vault={vault}>
        <ManifestContext manifest={manifestId}>
          <ManifestMetadata
            manifestId={manifestId}
            variation={variation}
            labelStyle={labelStyle}
            labelWidth={labelWidth}
            bordered={bordered}
            showEmptyMessage={showEmptyMessage}
            allowHtml={allowHtml}
            separator={separator}
          />
        </ManifestContext>
      </VaultProvider>
    </Fragment>
  );
}

function ManifestMetadata(props: MetadataPanelProps) {
  const { manifest } = useExternalManifest(props.manifestId);

  return <MetaDataDisplay {...props} metadata={manifest?.metadata} />;
}

const metadataPanelProps = [
  'manifest-id',
  'config-id',
  'variation',
  'label-style',
  'label-width',
  'bordered',
  'show-empty-message',
];

if (typeof window !== 'undefined') {
  register(MetadataPanel, 'metadata-panel', metadataPanelProps, {
    shadow: false,
    onConstruct(instance: any) {
      Object.defineProperty(instance, 'vault', {
        get(): any {
          return instance._props.vault;
        },
        set(v): any {
          instance._props.vault = v;
        },
      });
      instance._props = {
        __registerPublicApi: (api: any) => {
          Object.assign(instance, api(instance));
        },
      };
    },
  } as any);
}
