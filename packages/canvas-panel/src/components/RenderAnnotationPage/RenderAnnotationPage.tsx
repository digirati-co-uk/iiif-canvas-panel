import { FC } from "react";
import { Fragment, createElement as h } from "react";
import { RenderAnnotation } from "../RenderAnnotation/RenderAnnotation";
import { useStyles, useVaultSelector } from "react-iiif-vault/core";
import { BoxStyle } from "@atlas-viewer/atlas/react";

export const RenderAnnotationPage: FC<{
  page: {
    id: string;
    type: "AnnotationPage";
    items?: ReadonlyArray<{ id: string }>;
  };
  className?: string;
  textSelectionEnabled?: boolean;
}> = ({ className, page, textSelectionEnabled }) => {
  const style = useStyles<BoxStyle>(page, "atlas");
  const html = useStyles<{ className?: string }>(page, "html");

  useVaultSelector((state) => (page.id ? state.iiif.entities.AnnotationPage[page.id] : null), []);

  return (
    <Fragment>
      {page.items?.map((annotation) => {
        return (
          <RenderAnnotation
            key={annotation.id}
            id={annotation.id}
            style={style}
            className={html?.className || className}
            textSelectionEnabled={textSelectionEnabled}
          />
        );
      })}
    </Fragment>
  );
};
