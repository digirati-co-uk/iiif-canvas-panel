import React, { useEffect, useRef, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import catalog from './.docs-examples/catalog.json';
import { loadProject } from './src/components/example-project';

export type ExampleDefinition = {
  id: string; title: string; description: string; group: string; framework: string;
  path: string; files: Record<string, string>; visibleFiles: string[];
  height: number; autorun: boolean; highlights: Record<string, string>;
};
export const examples = catalog.examples as unknown as ExampleDefinition[];

export function Example({ id, layout = 'stacked' }: { id: string; layout?: 'stacked' | 'split' }) {
  const example = examples.find((item) => item.id === id);
  if (!example) throw new Error(`Unknown documentation example: ${id}`);
  return <ExampleCard key={id} example={example} layout={layout} />;
}

function ExampleCard({ example, layout }: { example: ExampleDefinition; layout: string }) {
  const base = useBaseUrl('/');
  const { colorMode } = useColorMode();
  const [file, setFile] = useState(example.visibleFiles[0]);
  const [running, setRunning] = useState(example.autorun);
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [canEmbed, setCanEmbed] = useState(false);
  const preview = useRef<HTMLIFrameElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const previewUrl = `${base}examples/${example.id}.html`;
  const editorUrl = `${base}example-editor?id=${encodeURIComponent(example.id)}&theme=${colorMode}`;

  useEffect(() => setCanEmbed(window.crossOriginIsolated && /Chrome|Chromium|Edg\//.test(navigator.userAgent)), []);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === preview.current?.contentWindow && event.data?.type === 'example-error') {
        setError(String(event.data.message));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!editing || !editor.current) return;
    let active = true;
    const host = editor.current;
    const target = document.createElement('div');
    host.appendChild(target);
    setNotice('Starting StackBlitz…');
    const timer = window.setTimeout(() => {
      if (active) setNotice('The editor is taking longer than expected. You can open the project in a separate tab.');
    }, 30000);
    Promise.all([import('@stackblitz/sdk'), loadProject(base, example.id)])
      .then(async ([{ default: sdk }, project]) => {
        if (!active) return;
        await sdk.embedProject(target, project, {
          openFile: [...example.visibleFiles].reverse().join(','), theme: colorMode, height: 650,
          crossOriginIsolated: true,
          showSidebar: false, hideNavigation: true, terminalHeight: 0,
        });
        host.querySelector('iframe')?.setAttribute('title', `Edit ${example.title} in StackBlitz`);
        if (active) setNotice('');
      })
      .catch((error) => { if (active) setNotice(`Could not start the editor: ${error.message}. Try opening it in a separate tab.`); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; window.clearTimeout(timer); host.replaceChildren(); };
  }, [editing]);

  const language = ({ html: 'html', js: 'javascript', ts: 'typescript', tsx: 'tsx', json: 'json', vue: 'html' } as Record<string, string>)[file.split('.').pop()!] || 'css';
  function reset() { setError(''); setLoaded(false); setRunning(true); setRevision((value) => value + 1); }

  return (
    <section className={`docs-example docs-example--${layout}`} aria-label={example.title}>
      <header className="docs-example-header">
        <div><strong>{example.title}</strong>{example.description && <p>{example.description}</p>}</div>
        <div className="docs-example-actions">
          {!editing && <button type="button" onClick={reset}>Reset preview</button>}
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open preview ↗</a>
          {canEmbed && <button type="button" onClick={() => { setNotice(''); setEditing(!editing); }}>{editing ? 'Back to example' : 'Edit here'}</button>}
          <a href={editorUrl} target="_blank" rel="noopener noreferrer">{editing ? 'Open original in StackBlitz ↗' : 'Open in StackBlitz ↗'}</a>
        </div>
      </header>
      <div className="docs-example-status" role="status">{notice}</div>
      {editing ? <div className="docs-example-editor" ref={editor} /> : (
        <div className="docs-example-content">
          <div className="docs-example-preview" style={{ minHeight: example.height }}>
            {error && <div role="alert" className="docs-example-error">Preview error: {error} <button type="button" onClick={reset}>Retry</button></div>}
            {!running ? <button type="button" className="docs-example-run" onClick={reset}>Run example</button> : <>
              {!loaded && <p className="docs-example-loading">Loading preview…</p>}
              <iframe key={revision} ref={preview} src={previewUrl} title={`${example.title} preview`} loading="lazy"
                style={{ height: example.height }} onLoad={() => setLoaded(true)} onError={() => setError('Could not load the preview.')} />
            </>}
          </div>
          <div className="docs-example-source">
            <div className="docs-example-files" role="group" aria-label="Example source files">
              {example.visibleFiles.map((name) => <button type="button" key={name} aria-pressed={file === name} onClick={() => setFile(name)}>{name}</button>)}
              <label>All files <select value={file} onChange={(event) => setFile(event.target.value)}>
                {Object.keys(example.files).map((name) => <option key={name} value={name}>{name}</option>)}
              </select></label>
            </div>
            <CodeBlock language={language} title={file} metastring={example.highlights[file] ? `{${example.highlights[file]}}` : undefined}>{example.files[file]}</CodeBlock>
          </div>
        </div>
      )}
    </section>
  );
}
