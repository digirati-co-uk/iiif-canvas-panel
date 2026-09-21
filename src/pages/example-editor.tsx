import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { loadProject } from '../components/example-project';
import catalog from '../../.docs-examples/catalog.json';

export default function ExampleEditor() {
  const base = useBaseUrl('/');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const example = catalog.examples.find((example) => example.id === id);
    if (!example) {
      setError('Unknown example.');
      return;
    }
    setError('');
    Promise.all([import('@stackblitz/sdk'), loadProject(base, example.id)])
      .then(([{ default: sdk }, project]) => {
        if (active)
          sdk.openProject(project, {
            newWindow: false,
            openFile: [...example.visibleFiles].reverse().join(','),
            theme: params.get('theme') === 'dark' ? 'dark' : 'light',
          });
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [attempt, base]);
  return (
    <Layout title="Open example">
      <main className="container margin-vert--lg">
        <h1>Opening StackBlitz</h1>
        {error ? (
          <p role="alert">
            {error}{' '}
            <button onClick={() => setAttempt(attempt + 1)}>Retry</button>
          </p>
        ) : (
          <p>Preparing the example and its package…</p>
        )}
        <a href={`${base}all-sandboxes`}>Back to examples</a>
      </main>
    </Layout>
  );
}
