import { Vault } from '@iiif/vault';

export function sortAnnotationPages(availablePageIds: string[], vault: Vault) {
  const pagesWithTypes = [];
  const pageMapping: Record<string, string[]> = {};

  for (const anno of availablePageIds) {
    const typeMap = {} as any;
    const allTypes = [] as string[];
    const full = vault.get(anno) as any;
    const items = full?.items || [];
    for (const _item of items) {
      const item = vault.get(_item) as any;
      if (item.motivation) {
        for (const motiv of item.motivation) {
          if (!allTypes.includes(motiv)) {
            allTypes.push(motiv);
          }
          typeMap[motiv] = typeMap[motiv] ? typeMap[motiv] : [];
          typeMap[motiv].push(item.id);
        }
      }
    }
    pagesWithTypes.push({ typeMap, allTypes, id: anno });
    for (const type of allTypes) {
      pageMapping[type] = pageMapping[type] || [];
      pageMapping[type].push(anno);
    }
  }

  return { pagesWithTypes, pageMapping };
}
