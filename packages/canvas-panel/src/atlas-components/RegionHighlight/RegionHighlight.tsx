import React, { useCallback } from 'preact/compat';
import { ResizeWorldItem } from '../ResizeWorldItem';
import { BoxStyle, useMode } from '@atlas-viewer/atlas';
import { h } from 'preact';
import { Box } from '..';

type RegionHighlightType = {
  id: any;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const RegionHighlight: React.FC<{
  id?: string;
  region: RegionHighlightType;
  isEditing: boolean;
  onSave?: (annotation: RegionHighlightType) => void;
  onClick?: (annotation: RegionHighlightType) => void;
  interactive?: boolean;
  style?: BoxStyle;
  className?: string;
}> = ({ interactive, region, onClick, onSave, isEditing, className, style, ...props }) => {
  const mode = useMode();

  const saveCallback = useCallback(
    (bounds: any) => {
      if (onSave) {
        onSave({ id: region.id, x: region.x, y: region.y, height: region.height, width: region.width, ...bounds });
      }
    },
    [onSave, region.id, region.x, region.y, region.height, region.width]
  );

  return (
    <ResizeWorldItem
      x={region.x}
      y={region.y}
      width={region.width}
      height={region.height}
      resizable={isEditing}
      onSave={saveCallback}
    >
      <Box
        className={className}
        interactive={interactive}
        relativeStyle
        onClick={
          mode === 'explore' && onClick
            ? (e: any) => {
                // e.preventDefault();
                // e.stopPropagation();
                onClick(region);
              }
            : () => void 0
        }
        target={{ x: 0, y: 0, width: region.width, height: region.height }}
        style={style}
        {...(props as any)}
      />
    </ResizeWorldItem>
  );
};
