import { CompositeResource, GetTile, SingleImage, TiledImage, useAtlas, WorldObject } from '@atlas-viewer/atlas';
import { FC, useLayoutEffect, useMemo } from 'preact/compat';

export const TileSet: FC<{
  tiles: GetTile;
  x: number;
  y: number;
  width: number;
  height: number;
}> = (props) => {
  const atlas = useAtlas();
  const scale = props.width / props.tiles.width;
  const tiles = props.tiles.imageService.tiles || [];
  const sizes = props.tiles.imageService.sizes || [];
  const canonicalId = useMemo(() => {
    const id = props.tiles.imageService.id;
    if (id.endsWith('/info.json')) {
      return id.slice(0, -1 * '/info.json'.length);
    }
    return id;
  }, [props.tiles.imageService.id]);

  useLayoutEffect(() => {
    if (atlas.runtime) {
      const runtime = atlas.runtime;
      const world = atlas.runtime.world;

      const images = [];

      if (props.tiles.thumbnail) {
        const thumbnail = new SingleImage();
        thumbnail.applyProps({
          uri: props.tiles.thumbnail.id,
          target: { width: props.tiles.width, height: props.tiles.height },
          display: { width: props.tiles.thumbnail.width, height: props.tiles.thumbnail.height },
        });
        images.push(thumbnail);
      }

      if (sizes) {
        for (const size of sizes) {
          const image = new SingleImage();
          image.applyProps({
            uri: `${canonicalId}/full/${size.width},${size.height}/0/default.jpg`,
            target: { width: props.tiles.width, height: props.tiles.height },
            display: { width: size.width, height: size.height },
          });
          images.push(image);
        }
      }

      if (tiles) {
        for (const tile of tiles) {
          for (const scaleFactor of tile.scaleFactors || []) {
            const image = TiledImage.fromTile(
              props.tiles.imageService.id,
              { width: props.tiles.width, height: props.tiles.height },
              tile,
              scaleFactor
            );
            images.push(image);
          }
        }
      }

      const compositeImage = new CompositeResource({
        id: props.tiles.imageService.id,
        width: props.tiles.width,
        height: props.tiles.height,
        images: images,
      });

      const worldObject = new WorldObject();
      worldObject.applyProps({
        id: props.tiles.imageService.id,
        scale,
        height: props.tiles.height,
        width: props.tiles.width,
        x: props.x,
        y: props.y,
      });
      worldObject.appendChild(compositeImage);
      world.appendChild(worldObject);

      runtime.pendingUpdate = true;
      if (runtime.world) {
        if (runtime.world.needsRecalculate) {
          runtime.world.recalculateWorldSize();
          runtime.world.triggerRepaint();
        }
      }

      return () => {
        world.removeChild(worldObject);
        runtime.pendingUpdate = true;
        if (runtime.world) {
          if (runtime.world.needsRecalculate) {
            runtime.world.recalculateWorldSize();
            runtime.world.triggerRepaint();
          }
        }
      };
    }

    return () => {
      // no-op
    };
  });

  return null;
};
