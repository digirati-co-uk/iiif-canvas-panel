import { h } from 'preact';
import { FC, useEffect, useState } from 'preact/compat';
import { GetTile, getTileFromImageService } from '@atlas-viewer/atlas';
import { TileSet } from './tile-set';

export const ImageService: FC<{ id: string; width: number; height: number; x?: number; y?: number }> = (props) => {
  const [tiles, setTile] = useState<GetTile | undefined>();

  useEffect(() => {
    getTileFromImageService(props.id, props.width, props.height).then((s) => {
      setTile(s);
    });
  }, [props.height, props.id, props.width]);

  if (!tiles) {
    return null;
  }

  return <TileSet tiles={tiles} x={props.x || 0} y={props.y || 0} width={props.width} height={props.height} />;
};
