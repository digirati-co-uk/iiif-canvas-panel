import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { Example, examples } from '@site/Example';

export default function AllSandboxes() {
  const [current, setCurrent] = useState('');
  const [search, setSearch] = useState('');
  const [framework, setFramework] = useState('');
  useEffect(() => {
    const update = () => setCurrent(window.location.hash.slice(1));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const filtered = examples.filter(
    (example) =>
      (!framework || example.framework === framework) &&
      `${example.title} ${example.group}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const groups = [...new Set(filtered.map((example) => example.group))];
  const selected = examples.find((example) => example.id === current);
  return (
    <Layout
      title="Examples"
      description="Explore Canvas Panel examples and edit them in StackBlitz."
    >
      <div className="docs-example-gallery">
        <aside aria-label="Find an example">
          <h1>Examples</h1>
          <label>
            Search examples
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            Framework
            <select
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
            >
              <option value="">All frameworks</option>
              <option value="vanilla">HTML / JavaScript</option>
              <option value="react">React</option>
              <option value="vue">Vue</option>
            </select>
          </label>
          <nav aria-label="Examples by topic">
            {groups.map((group) => (
              <div key={group}>
                <h2>{group}</h2>
                <ul>
                  {filtered
                    .filter((example) => example.group === group)
                    .map((example) => (
                      <li key={example.id}>
                        <a
                          href={`#${example.id}`}
                          aria-current={
                            current === example.id ? 'page' : undefined
                          }
                        >
                          {example.title}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            {!filtered.length && <p>No matching examples.</p>}
          </nav>
        </aside>
        <main>
          {selected ? (
            <Example id={selected.id} />
          ) : (
            <p>Choose an example to explore its source and live preview.</p>
          )}
        </main>
      </div>
    </Layout>
  );
}
