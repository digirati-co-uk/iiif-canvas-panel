import { describe, expect, it } from 'vitest';
import { Vault } from '@iiif/helpers/vault';
import { Vault as PreviewVault } from 'react-iiif-vault';
import { Vault as PreviewVault4 } from 'react-iiif-vault/presentation-4';
import { isVault4 } from '@iiif/helpers/vault-4';
import { getRangeTarget } from '../src/helpers/range-target';

const canvasId = 'https://example.org/canvas';
const rangeId = 'https://example.org/range';

describe('IIIF 4 dependency integration', () => {
  it('shares the Presentation 3 Vault with the preview and keeps Vault4 opt-in', () => {
    expect(PreviewVault).toBe(Vault);
    expect(isVault4(new PreviewVault())).toBe(false);
    expect(isVault4(new PreviewVault4())).toBe(true);
  });

  it('loads a Presentation 2 canvas through the preview default Vault', async () => {
    const vault = new PreviewVault();
    const canvas = await vault.load(canvasId, {
      '@context': 'http://iiif.io/api/presentation/2/context.json',
      '@id': canvasId,
      '@type': 'sc:Canvas',
      width: 1000,
      height: 800,
      images: [],
    });
    expect(canvas).toMatchObject({ id: canvasId, type: 'Canvas', width: 1000, height: 800 });
  });

  it('loads Presentation 4 canvas data natively and through the Presentation 3 compatibility model', async () => {
    const manifestId = 'https://example.org/manifest';
    const manifest = {
      '@context': 'http://iiif.io/api/presentation/4/context.json',
      id: manifestId,
      type: 'Manifest',
      label: { en: ['Compatibility'] },
      items: [{ id: canvasId, type: 'Canvas', width: 1000, height: 800, items: [] }],
    };
    for (const vault of [new PreviewVault(), new PreviewVault4()]) {
      await vault.load(manifestId, manifest);
      expect(vault.get({ id: canvasId, type: 'Canvas' })).toMatchObject({
        id: canvasId,
        type: 'Canvas',
        width: 1000,
        height: 800,
      });
    }
  });
});

describe('normalized range navigation', () => {
  it('preserves a fragment after the parser normalizes a canvas into a SpecificResource', async () => {
    const vault = new Vault();
    const range = await vault.load(
      { id: rangeId, type: 'Range' },
      {
        id: rangeId,
        type: 'Range',
        items: [{ id: `${canvasId}#xywh=10,20,300,400`, type: 'Canvas' }],
      }
    );
    expect(range?.items[0].type).toBe('SpecificResource');
    expect(getRangeTarget(vault, range!)).toMatchObject({
      canvasId,
      fragment: 'xywh=10,20,300,400',
      selector: `${canvasId}#xywh=10,20,300,400`,
      parsedSelector: { selector: { type: 'BoxSelector', spatial: { x: 10, y: 20, width: 300, height: 400 } } },
    });
  });

  it('finds a nested canvas without inventing a selector', async () => {
    const vault = new Vault();
    const range = await vault.load(
      { id: rangeId, type: 'Range' },
      {
        id: rangeId,
        type: 'Range',
        items: [{ id: `${rangeId}/child`, type: 'Range', items: [{ id: canvasId, type: 'Canvas' }] }],
      }
    );
    const target = getRangeTarget(vault, range!);
    expect(target?.canvasId).toBe(canvasId);
    expect(target?.fragment).toBeUndefined();
    expect(target?.parsedSelector?.selector).toBeNull();
  });

  it('returns no navigation target for an empty range', async () => {
    const vault = new Vault();
    const range = await vault.load({ id: rangeId, type: 'Range' }, { id: rangeId, type: 'Range', items: [] });
    expect(getRangeTarget(vault, range!)).toBeUndefined();
  });
});
