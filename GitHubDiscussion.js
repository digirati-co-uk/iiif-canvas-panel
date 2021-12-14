import React from "react";

export const GitHubDiscussion = ({ghid}) => (
  <a 
    className="button button--secondary button--lg"
    href={`https://github.com/digirati-co-uk/iiif-canvas-panel/discussions/${ghid}`}>Discuss on GitHub
  </a>
);

export const GitHubIssue = ({ghid}) => (
  <a 
    className="button button--secondary button--lg"
    href={`https://github.com/digirati-co-uk/iiif-canvas-panel/issues/${ghid}`}>Issue on GitHub
  </a>
);