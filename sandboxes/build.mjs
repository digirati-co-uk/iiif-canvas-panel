import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { build } from "vite";
import vue from "@vitejs/plugin-vue";
import { createExampleHighlighter } from "./highlight.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, "../.docs-examples");
const packageName = "@digirati/canvas-panel-web-components";

export async function filesIn(directory) {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const [name, code] of Object.entries(await filesIn(fullPath))) files[`${entry.name}/${name}`] = code;
    } else if (/\.(html|[cm]?[jt]sx?|css|json|vue|svg|md)$/.test(entry.name)) {
      files[entry.name] = await readFile(fullPath, "utf8");
    }
  }
  return files;
}

export function validatePackageSpec(spec) {
  if (spec === "workspace" || /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(spec)) return spec;
  if (/^https:\/\/pkg\.pr\.new\/[\w.-]+\/[\w.-]+\/(?:@[\w.-]+\/)?[\w.-]+@[a-f0-9]{7,40}$/.test(spec)) return spec;
  throw new Error("EXAMPLE_PACKAGE must be workspace, an exact version, or a full commit-pinned pkg.pr.new URL.");
}

export async function collectExamples(directory = root) {
  const examples = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || ["node_modules", "dist"].includes(entry.name)) continue;
    const dir = path.join(directory, entry.name);
    if (!entry.name.endsWith(".csb")) {
      examples.push(...(await collectExamples(dir)));
      continue;
    }
    const files = await filesIn(dir);
    const pkg = JSON.parse(files["package.json"]);
    const metadata = JSON.parse(files["example.json"]);
    for (const name of metadata.files) {
      if (!(name in files)) throw new Error(`${pkg.name}: missing visible file ${name}`);
    }
    delete files["example.json"];
    examples.push({
      id: pkg.name,
      title: metadata.title,
      group: metadata.group || "Examples",
      framework: metadata.framework || "vanilla",
      description: metadata.description || "",
      visibleFiles: metadata.files,
      height: metadata.height || 520,
      autorun: metadata.autorun !== false,
      highlights: metadata.highlights || {},
      path: path.relative(root, dir),
      files,
    });
  }
  return examples.sort((a, b) => a.path.localeCompare(b.path));
}

export function exportProject(example, spec, packageFiles = {}) {
  const files = { ...example.files };
  const pkg = JSON.parse(files["package.json"]);
  pkg.dependencies[packageName] = spec === "workspace" ? "file:./canvas-panel" : spec;
  files["package.json"] = JSON.stringify(pkg, null, 2);
  if (spec === "workspace") {
    for (const [name, code] of Object.entries(packageFiles)) files[`canvas-panel/${name}`] = code;
  }
  return {
    title: example.title,
    description: example.description || example.title,
    template: "node",
    files,
  };
}

async function main() {
  const spec = validatePackageSpec(process.env.EXAMPLE_PACKAGE || "workspace");
  // A remote selection is installed and used for the inline build as well as the exported project.
  const consumer = path.resolve(root, "../.example-consumer");
  if (spec !== "workspace") {
    await mkdir(consumer, { recursive: true });
    await writeFile(path.join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
    execFileSync(
      "npm",
      [
        "install",
        "--prefix",
        consumer,
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        `${packageName}@${spec}`,
        "react@19.2.8",
      ],
      { stdio: "inherit" },
    );
  }
  const examples = await collectExamples();
  const packageDir =
    spec === "workspace"
      ? path.resolve(root, "../packages/canvas-panel")
      : path.join(consumer, "node_modules", packageName);
  await mkdir(output, { recursive: true });
  await build({
    configFile: false,
    root,
    base: "./",
    logLevel: "warn",
    resolve: { dedupe: ["react", "react-dom", "vue"] },
    plugins: [
      vue({
        template: {
          compilerOptions: { isCustomElement: (tag) => tag.includes("-") },
        },
      }),
      {
        name: "documentation-examples",
        enforce: "pre",
        generateBundle: {
          order: "post",
          handler(_options, bundle) {
            // Canonical directory URLs work with both static servers and clean-URL redirects.
            for (const example of examples) {
              const original = `${example.path}/index.html`;
              const page = bundle[original];
              if (!page || page.type !== "asset") throw new Error(`Missing preview: ${example.id}`);
              delete bundle[original];
              this.emitFile({
                type: "asset",
                fileName: `${example.id}/index.html`,
                source: String(page.source).replace(/(?:\.\.\/)+assets\//g, "../assets/"),
              });
            }
          },
        },
        transformIndexHtml() {
          return [
            {
              tag: "script",
              injectTo: "head-prepend",
              children: `
            function reportExampleError(message) {
              if (parent !== window) parent.postMessage({ type: 'example-error', message }, location.origin);
            }
            addEventListener('error', (event) => { if (event.message) reportExampleError(event.message); });
            addEventListener('unhandledrejection', (event) => reportExampleError(String(event.reason?.message || event.reason)));
          `,
            },
          ];
        },
        async resolveId(source) {
          if (spec !== "workspace" && (source === packageName || source.startsWith(`${packageName}/`))) {
            return this.resolve(source, path.join(consumer, "index.js"), {
              skipSelf: true,
            });
          }
        },
        async buildStart() {
          const current = await collectExamples();
          const manifest = JSON.parse(await readFile(path.join(packageDir, "package.json"), "utf8"));
          const dist = await filesIn(path.join(packageDir, "dist"));
          const { scripts, devDependencies, ...published } = manifest;
          const highlighter = await createExampleHighlighter(packageDir);
          const snapshot = {
            "package.json": JSON.stringify(published, null, 2),
          };
          for (const [name, code] of Object.entries(dist)) {
            snapshot[`dist/${name}`] = code;
            this.addWatchFile(path.join(packageDir, "dist", name));
          }
          for (const example of current) {
            example.highlightedFiles = highlighter.highlight(example, path.join(root, example.path));
            for (const name of [...Object.keys(example.files), "example.json"])
              this.addWatchFile(path.join(root, example.path, name));
            this.emitFile({
              type: "asset",
              fileName: `projects/${example.id}.json`,
              source: JSON.stringify(exportProject(example, spec)),
            });
          }
          highlighter.dispose();
          // The large package snapshot is fetched only when opening an editor.
          this.emitFile({
            type: "asset",
            fileName: "package.json",
            source: JSON.stringify(spec === "workspace" ? snapshot : {}),
          });
          const catalog = JSON.stringify(
            {
              package: spec === "workspace" ? "Local workspace build" : spec,
              examples: current,
            },
            null,
            2,
          );
          const catalogPath = path.join(output, "catalog.json");
          if ((await readFile(catalogPath, "utf8").catch(() => "")) !== catalog) await writeFile(catalogPath, catalog);
        },
      },
    ],
    build: {
      outDir: path.join(output, "examples"),
      // ponytail: retain old hashed assets for open docs tabs during rebuilds.
      // Remove .docs-examples with the servers stopped when a clean output is needed.
      emptyOutDir: false,
      target: "es2022",
      // The shared Canvas Panel runtime is ~686 kB minified; warn on growth beyond this budget.
      chunkSizeWarningLimit: 800,
      watch: process.argv.includes("--watch") ? {} : null,
      rolldownOptions: {
        input: examples.map((example) => path.join(root, example.path, "index.html")),
      },
    },
  });
  console.log(`Built ${examples.length} documentation examples (${spec}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
