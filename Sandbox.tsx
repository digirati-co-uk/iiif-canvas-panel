import React from 'react';
import { Sandpack, SandpackProps } from "@codesandbox/sandpack-react";
import useThemeContext from '@theme/hooks/useThemeContext';

export function Sandbox(_props: { project: SandpackProps } & SandpackProps) {
  const { isDarkTheme } = useThemeContext();
  const { project, ...props } = _props;

  const options = { editorHeight: 540, ...project.options, ...props.options };

  return <Sandpack theme={isDarkTheme ? 'dark' : 'light'}  {...project} {...props} options={options} />
}

export function parseFiles(req: any) {
  return req.keys().reduce((state, key) => {
    if (key.indexOf('_load') !== -1) {
      return state;
    }

    return {
      ...state,
      [key.slice(1)]: req(key).default,
    };
  }, {});
}
