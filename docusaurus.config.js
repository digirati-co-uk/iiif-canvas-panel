const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Canvas Panel",
  tagline: "A Web Component that renders a IIIF Canvas",
  url: "https://canvas-panel.digirati.com/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  stylesheets: [
    "https://cdn.jsdelivr.net/npm/@codesandbox/sandpack-react/dist/index.css",
  ],
  scripts: [
    // 'https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest',
    "https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@1.0.49",
    // 'https://cdn.jsdelivr.net/npm/@iiif/vault-helpers@latest/dist/index.umd.js'
  ],
  // clientModules: [
  //   require.resolve('./packages/canvas-panel/dist/bundle.js'),
  // ],
  onBrokenMarkdownLinks: "warn",
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
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  plugins: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        //
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
          editUrl:
            "https://github.com/digirati-co-uk/iiif-canvas-panel/edit/main/",
          admonitions: {
            tag: ":::",
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
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/digirati-co-uk/iiif-canvas-panel/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
