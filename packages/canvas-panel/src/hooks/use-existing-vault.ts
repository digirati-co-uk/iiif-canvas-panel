import { useContext } from 'preact/compat';
import { ReactVaultContext } from 'react-iiif-vault';
import { globalVault } from '@iiif/vault';

export function useExistingVaultOrGlobal() {
  const oldContext: any = useContext(ReactVaultContext);

  return oldContext && oldContext.vault ? (oldContext.vault as any) : globalVault();
}
