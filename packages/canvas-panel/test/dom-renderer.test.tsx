// @vitest-environment happy-dom
import { act, useEffect, useRef } from 'react';
import { expect, it, vi } from 'vitest';
import { render } from '../src/library/dom-renderer';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

it('updates native HTML/SVG, replaces listeners and cleans up refs/effects', async () => {
  const host = document.createElement('div');
  const clicked = vi.fn();
  const replacement = vi.fn();
  const cleanup = vi.fn();
  let ref: any;
  function Content({ reverse = false, onClick = clicked }: any) {
    ref = useRef(null);
    useEffect(() => cleanup, []);
    return <>
      <button ref={ref} disabled={reverse} aria-pressed={reverse} onClick={onClick}
        style={{ width: reverse ? 40 : 20, opacity: reverse ? undefined : 0.5 }}>Action</button>
      <svg><text x={5}>Selectable</text></svg>
      <ul>{(reverse ? ['b', 'a'] : ['a', 'b']).map(key => <li key={key}>{key}</li>)}</ul>
    </>;
  }
  await act(async () => render(<Content />, host));
  const button = host.querySelector('button')!;
  const firstItem = host.querySelector('li');
  expect(button.style.width).toBe('20px');
  expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(host.querySelector('text')?.namespaceURI).toBe('http://www.w3.org/2000/svg');
  button.click();
  expect(clicked).toHaveBeenCalledTimes(1);
  await act(async () => render(<Content reverse onClick={replacement} />, host));
  expect(host.querySelector('li:last-child')).toBe(firstItem);
  expect(button.hasAttribute('disabled')).toBe(true);
  expect(button.style.opacity).toBe('');
  button.dispatchEvent(new Event('click'));
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(replacement).toHaveBeenCalledTimes(1);
  await act(async () => render(null, host));
  expect(ref.current).toBeNull();
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(host.childNodes.length).toBe(0);
});
