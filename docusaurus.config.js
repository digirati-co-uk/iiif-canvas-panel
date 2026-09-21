const { themes } = require("prism-react-renderer");

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: "Canvas Panel",
  tagline: "A Web Component that renders a IIIF Canvas",
  url: "https://canvas-panel.digirati.com/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  // Docusaurus serves and watches the workspace build in development and copies it
  // into the production site. Documentation uses these assets; examples are separately built Vite pages.
  staticDirectories: ["static", "packages/canvas-panel/dist", ".docs-runtime", ".docs-examples"],
  stylesheets: ["/index.css"],
  scripts: ["/index.iife.js", "/docs-helpers.iife.js"],
  markdown: { hooks: { onBrokenMarkdownLinks: "warn" } },
  favicon: "img/favicon.ico",
  organizationName: "digirati-co-uk", // Usually your GitHub org/user name.
  projectName: "iiif-canvas-panel", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "Canvas Panel",
      logo: {
        alt: "Logo of a canvas frame",
        src: "img/canvas-panel-box.png",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Documentation",
        },
        { to: "/about", label: "About", position: "left" },
        { to: "/glossary", label: "Glossary", position: "left" },
        { to: "/all-sandboxes", label: "Examples", position: "left" },
        {
          href: "https://github.com/digirati-co-uk/iiif-canvas-panel",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Documentation",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "Links",
          items: [
            {
              label: "IIIF",
              href: "https://iiif.io",
            },
            {
              label: "Digirati",
              href: "https://digirati.com",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/digirati_uk",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "An Introduction to IIIF",
              to: "https://resources.digirati.com/iiif/an-introduction-to-iiif/",
            },
            {
              label: "Canvas Panel on GitHub",
              href: "https://github.com/digirati-co-uk/iiif-canvas-panel",
            },
          ],
        },
      ],
      copyright: `Built by Digirati and funded by J. Paul Getty Trust`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
    },
  },
  plugins: [
    function workspaceReload() {
      return {
        name: "canvas-panel-workspace-reload",
        configureWebpack() {
          // Docusaurus disables this by default; our watched browser bundle is
          // a static asset, so it needs a full reload rather than React HMR.
          return { devServer: { liveReload: true } };
        },
      };
    },
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexBlog: false,
      },
    ],
  ],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/digirati-co-uk/iiif-canvas-panel/edit/main/",
          admonitions: {
            keywords: [
              "question",
              "secondary",
              "info",
              "success",
              "danger",
              "note",
              "tip",
              "warning",
              "important",
              "caution",
            ],
          },
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
