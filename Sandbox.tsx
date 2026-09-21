import React, { useEffect, useState } from "react";
import "@codesandbox/sandpack-react/dist/index.css";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackStack,
  SandpackProps,
  githubLightTheme,
  SandpackProviderProps,
  CodeEditorProps,
  PreviewProps,
  ClasserProvider,
  SandpackThemeProvider,
} from "@codesandbox/sandpack-react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

let runtimeFiles: Promise<string[]>;

export function Sandbox(
  _props: {
    stacked?: boolean;
    label?: string;
    project: SandpackProps;
  } & SandpackProps
) {
  const ctx = useDocusaurusContext();
  const { project, label, ...props } = _props;
  const isDarkTheme = false;

  // Transfer the local build through Sandpack's virtual files. A remote iframe
  // cannot fetch localhost scripts under browser private-network restrictions.
  const [runtime, setRuntime] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    runtimeFiles ||= Promise.all(
      ["index.iife.js", "docs-helpers.iife.js", "index.css"].map(
        async (file) => {
          const response = await fetch(`${ctx.siteConfig.baseUrl}${file}`);
          if (!response.ok)
            throw new Error(`Could not load ${file}: ${response.status}`);
          return response.text();
        }
      )
    );
    runtimeFiles
      .then((files) => {
        if (active) setRuntime(files);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [ctx.siteConfig.baseUrl]);
  const options = { editorHeight: 542, ...project.options, ...props.options };
  const customSetup = {
    ...project.customSetup,
    ...props.customSetup,
    dependencies: {
      ...project.customSetup?.dependencies,
      ...props.customSetup?.dependencies,
    },
  };
  delete customSetup.dependencies["@digirati/canvas-panel-web-components"];
  delete customSetup.dependencies["@iiif/helpers"];
  delete customSetup.dependencies["@iiif/parser"];
  const files = {
    ...project.files,
    ...props.files,
    "/node_modules/@digirati/canvas-panel-web-components/package.json": {
      code: JSON.stringify({
        name: "@digirati/canvas-panel-web-components",
        main: "index.js",
      }),
      hidden: true,
    },
    "/node_modules/@digirati/canvas-panel-web-components/index.js": {
      code: runtime
        ? `require('./dist/index.css'); module.exports = new Function(${JSON.stringify(
            runtime[0] + "; return CanvasPanel;"
          )})();`
        : "",
      hidden: true,
    },
    "/node_modules/@digirati/canvas-panel-web-components/dist/index.iife.js": {
      code: "module.exports = require('../index.js');",
      hidden: true,
    },
    "/node_modules/@digirati/canvas-panel-web-components/dist/index.css": {
      code: runtime?.[2] || "",
      hidden: true,
    },
    ...Object.fromEntries(
      ["vault", "i18n", "thumbnail"].map((name) => [
        `/node_modules/@iiif/helpers/${name}.js`,
        { code: "module.exports = require('./index.js');", hidden: true },
      ])
    ),
    "/node_modules/@iiif/helpers/index.js": {
      code: runtime
        ? `module.exports = new Function(${JSON.stringify(
            runtime[1] + "; return CanvasPanelHelpers;"
          )})();`
        : "",
      hidden: true,
    },
    "/node_modules/@iiif/helpers/package.json": {
      code: JSON.stringify({ name: "@iiif/helpers", main: "index.js" }),
      hidden: true,
    },
  };

  if (error) return <p role="alert">Example failed to load: {error}</p>;
  if (!runtime) return <p>Loading example…</p>;

  return (
    <div
      style={{
        marginBottom: 40,
        border: _props.stacked ? "1px solid rgb(229, 231, 235)" : "none",
        borderRadius: "5px",
        fontWeight: 600,
        color: "rgb(57, 58, 52)",
        overflow: "hidden",
      }}
    >
      {label ? (
        <div
          style={{
            background: "#F7F8FA",
            fontSize: "0.875em",
            padding: ".6em 1em",
          }}
        >
          {label}
        </div>
      ) : null}
      <CustomSandpack
        theme={
          isDarkTheme
            ? "dark"
            : {
                ...githubLightTheme,
                palette: {
                  ...githubLightTheme.palette,
                  defaultBackground: "rgb(246, 248, 250)",
                },
                typography: {
                  monoFont:
                    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                },
              }
        }
        {...project}
        {...props}
        customSetup={customSetup}
        files={files}
        options={options}
      />
    </div>
  );
}

export function CustomSandpack(props: SandpackProps & { stacked?: boolean }) {
  // Combine files with customSetup to create the user input structure
  const userInputSetup = props.files
    ? {
        ...props.customSetup,
        files: {
          ...props.customSetup?.files,
          ...props.files,
        },
      }
    : props.customSetup;

  const previewOptions: PreviewProps = {
    showNavigator: props.options?.showNavigator,
  };

  const codeEditorOptions: CodeEditorProps = {
    showTabs: props.options?.showTabs,
    showLineNumbers: props.options?.showLineNumbers,
    showInlineErrors: props.options?.showInlineErrors,
    wrapContent: props.options?.wrapContent,
    closableTabs: props.options?.closableTabs,
    initMode: props.options?.initMode,
    extensions: props.options?.codeEditor?.extensions,
    extensionsKeymap: props.options?.codeEditor?.extensionsKeymap,
    readOnly: props.options?.readOnly,
    showReadOnly: props.options?.showReadOnly,
  };

  const providerOptions: SandpackProviderProps = {
    openPaths: props.options?.openPaths,
    activePath: props.options?.activePath,
    recompileMode: props.options?.recompileMode,
    recompileDelay: props.options?.recompileDelay,
    autorun: props.options?.autorun ?? true,
    bundlerURL: props.options?.bundlerURL,
    startRoute: props.options?.startRoute,
    skipEval: props.options?.skipEval,
    fileResolver: props.options?.fileResolver,
    initMode: props.options?.initMode,
    initModeObserverOptions: props.options?.initModeObserverOptions,
    externalResources: props.options?.externalResources,
  };

  // Parts are set as `flex` values, so they set the flex shrink/grow
  // Cannot use width percentages as it doesn't work with
  // the automatic layout break when the component is under 700px
  const editorPart = props.options?.editorWidthPercentage || 50;
  const previewPart = 100 - editorPart;
  const editorHeight = props.options?.editorHeight;

  const Layout = props.stacked ? SandpackStack : SandpackLayout;

  return (
    <SandpackProvider
      customSetup={userInputSetup}
      template={props.template}
      {...providerOptions}
    >
      <ClasserProvider classes={props.options?.classes}>
        <SandpackThemeProvider theme={props.theme}>
          <Layout>
            <SandpackCodeEditor
              {...codeEditorOptions}
              customStyle={{
                height: props.stacked ? undefined : editorHeight,
                flexGrow: editorPart,
                flexShrink: editorPart,
                minWidth: 700 * (editorPart / (previewPart + editorPart)),
              }}
            />
            <SandpackPreview
              {...previewOptions}
              customStyle={{
                height: editorHeight,
                flexGrow: previewPart,
                flexShrink: previewPart,
                width: props.stacked ? "100%" : undefined,
                minWidth: 700 * (previewPart / (previewPart + editorPart)),
              }}
            />
          </Layout>
        </SandpackThemeProvider>
      </ClasserProvider>
    </SandpackProvider>
  );
}

export function parseFiles(req: any) {
  return req.keys().reduce((state, key) => {
    if (key.indexOf("_load") !== -1) {
      return state;
    }

    return {
      ...state,
      [key.slice(1)]: req(key).default,
    };
  }, {});
}
