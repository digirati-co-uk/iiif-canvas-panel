const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Canvas Panel',
  tagline: 'A Web Component that renders a IIIF Canvas',
  url: 'https://canvas-panel.digirati.com/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  stylesheets: [
    'https://cdn.jsdelivr.net/npm/@codesandbox/sandpack-react/dist/index.css'
  ],
  scripts: [
    // 'https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest',
    'https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@1.0.37',
    'https://cdn.jsdelivr.net/npm/@iiif/vault-helpers@latest/dist/index.umd.js'
  ],
  // clientModules: [
  //   require.resolve('./packages/canvas-panel/dist/bundle.js'),
  // ],
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'digirati-co-uk', // Usually your GitHub org/user name.
  projectName: 'iiif-canvas-panel', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Canvas Panel',
      logo: {
        alt: 'Logo of a canvas frame',
        src: 'img/canvas-panel-box.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/about', label: 'About', position: 'left'},
        {to: '/glossary', label: 'Glossary', position: 'left'},
        {
          href: 'https://github.com/digirati-co-uk/iiif-canvas-panel',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'IIIF',
              href: 'https://iiif.io',
            },
            {
              label: 'Digirati',
              href: 'https://digirati.com',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/digirati_uk',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'An Introduction to IIIF',
              to: 'https://resources.digirati.com/iiif/an-introduction-to-iiif/',
            },
            {
              label: 'Canvas Panel on GitHub',
              href: 'https://github.com/digirati-co-uk/iiif-canvas-panel',
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
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/digirati-co-uk/iiif-canvas-panel/edit/main/',
          admonitions: {
              customTypes: {
                question: {
                  alias: "info",
                  keyword: "question",
                  ifmClass: "admonition admonition-info alert alert--info",
                  svg: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>',
                },
              },
            },
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/digirati-co-uk/iiif-canvas-panel/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ]
};
