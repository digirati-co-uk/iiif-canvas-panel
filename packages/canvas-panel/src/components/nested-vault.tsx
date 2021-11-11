import { FC, useContext } from 'preact/compat';
import { h } from 'preact';
import { ReactVaultContext, VaultProvider } from '@hyperion-framework/react-vault';

export const NestedVault: FC = ({ children }) => {
  const oldContext = useContext(ReactVaultContext);

  return (
    <VaultProvider vault={oldContext && oldContext.vault ? oldContext.vault : undefined}>{children}</VaultProvider>
  );
};
