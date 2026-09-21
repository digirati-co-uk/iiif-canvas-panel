import type { Project } from '@stackblitz/sdk';

export async function loadProject(base: string, id: string): Promise<Project> {
  async function json(path: string) {
    const response = await fetch(`${base}examples/${path}`);
    if (!response.ok)
      throw new Error(`Could not load project (${response.status})`);
    return response.json();
  }
  const project: Project = await json(
    `projects/${encodeURIComponent(id)}.json`,
  );
  const pkg = JSON.parse(project.files['package.json']);
  if (
    pkg.dependencies['@digirati/canvas-panel-web-components'] ===
    'file:./canvas-panel'
  ) {
    const snapshot: Record<string, string> = await json('package.json');
    for (const [name, code] of Object.entries(snapshot))
      project.files[`canvas-panel/${name}`] = code;
  }
  return project;
}
