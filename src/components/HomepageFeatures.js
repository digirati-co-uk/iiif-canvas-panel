import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        A family of useful component abstractions for rapid development
        of content that features IIIF resources.
      </>
    ),
  },
  {
    title: 'Accessible, lightweight, simple',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Components for working with annotations and text help you focus on 
        what your app does rather than on composition and drawing.
      </>
    ),
  },
  {
    title: 'Works with any framework',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Use with React, Vue and other frameworks. Great to use from 
        TypeScript or plain JavaScript.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
