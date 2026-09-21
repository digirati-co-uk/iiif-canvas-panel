import path from "node:path";
import ts from "typescript";
import { createHighlighter } from "shiki";
import { transformerTwoslash } from "@shikijs/twoslash";
import { createTwoslasher } from "twoslash";
import { createTwoslasher as createVueTwoslasher } from "twoslash-vue";

const packageName = "@digirati/canvas-panel-web-components";
const languages = ["ts", "tsx", "js", "jsx", "vue", "html", "css", "json", "md", "text"];

export async function createExampleHighlighter(packageDir) {
  const highlighter = await createHighlighter({ themes: ["github-light", "github-dark"], langs: languages });
  return {
    dispose: () => highlighter.dispose(),
    highlight(example, directory) {
      const compilerOptions = {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        skipLibCheck: true,
        allowJs: true,
        checkJs: false,
        resolveJsonModule: true,
        types: ["vite/client"],
        ignoreDeprecations: "6.0",
        paths: { [packageName]: [packageDir] },
      };
      const options = { tsModule: ts, vfsRoot: directory, compilerOptions, fsCache: false };
      const twoslash = createTwoslasher(options);
      const html = {};
      for (const [name, code] of Object.entries(example.files)) {
        const extension = name.split(".").pop();
        const lang = languages.includes(extension) ? extension : "text";
        const typed = ["js", "jsx", "ts", "tsx", "vue"].includes(lang);
        const transformers = [];
        const vue =
          lang === "vue"
            ? createVueTwoslasher({ ...options, vfsRoot: path.dirname(path.join(directory, name)) })
            : null;
        if (typed)
          transformers.push(
            transformerTwoslash({
              langs: [lang],
              twoslasher(source) {
                const extraFiles = Object.fromEntries(
                  Object.entries(example.files).filter(([file]) => file !== name && /\.[cm]?[jt]sx?$/.test(file)),
                );
                const result =
                  lang === "vue"
                    ? vue(source, lang, { compilerOptions, handbookOptions: { noErrors: true }, extraFiles })
                    : twoslash(`// @filename: ${name}\n// ---cut---\n${source}`, lang, {
                        extraFiles,
                        handbookOptions: { noErrors: lang === "js" || lang === "jsx" },
                      });
                if (result.code !== source) throw new Error(`${example.id}/${name}: highlighting changed the source`);
                return result;
              },
              renderer: {
                nodeStaticInfo(info, node) {
                  return {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: "twoslash-hover",
                      tabIndex: 0,
                      role: "button",
                      "data-type": info.text,
                      "data-docs": info.docs || "",
                      "aria-label": `${info.target}: ${info.text}`,
                    },
                    children: [node],
                  };
                },
              },
            }),
          );
        const ranges = (example.highlights[name] || "")
          .split(",")
          .filter(Boolean)
          .map((range) => range.split("-").map(Number));
        transformers.push({
          line(node, line) {
            if (ranges.some(([start, end = start]) => line >= start && line <= end))
              this.addClassToHast(node, "highlighted");
          },
        });
        html[name] = highlighter.codeToHtml(code, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
          transformers,
        });
        vue?.getCacheMap()?.clear();
      }
      twoslash.getCacheMap()?.clear();
      return html;
    },
  };
}
