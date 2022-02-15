import { FC } from 'preact/compat';
import { AnnotationPage, AnnotationPageNormalized } from '@iiif/presentation-3';
import { Fragment, h } from 'preact';
import { RenderAnnotation } from '../RenderAnnotation/RenderAnnotation';
import { useStyles, useVaultSelector } from 'react-iiif-vault';
import { BoxStyle } from '@atlas-viewer/atlas';

export const RenderAnnotationPage: FC<{ page: AnnotationPage | AnnotationPageNormalized; className?: string }> = ({
  className,
  page,
}) => {
  const style = useStyles<BoxStyle>(page, 'atlas');
  const html = useStyles<{ className?: string }>(page, 'html');

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
          />
        );
      })}
    </Fragment>
  );
};
