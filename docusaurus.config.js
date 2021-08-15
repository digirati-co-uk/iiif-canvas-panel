const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Canvas Panel',
  tagline: 'Visual IIIF Components',
  url: 'https://canvas-panel.digirati.com/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'digirati-co-uk', // Usually your GitHub org/user name.
  projectName: 'iiif-canvas-panel', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Canvas Panel',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'How do I...?',
        },
        {to: '/about', label: 'About', position: 'left'},
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
              label: 'How do I...?',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
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
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/digirati-co-uk/iiif-canvas-panel',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Digirati. Built with Docusaurus.`,
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
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
