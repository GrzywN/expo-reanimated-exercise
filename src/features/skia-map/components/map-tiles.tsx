import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { type TileDescriptor, TILE_SIZE } from '../utils/web-mercator';

export interface MapTilesProps {
  tiles: TileDescriptor[];
}

export function MapTiles({ tiles }: MapTilesProps) {
  return tiles.map((tile) => (
    <Image
      key={`${tile.zoom}/${tile.tileX}/${tile.tileY}`}
      source={{
        uri: `https://c.basemaps.cartocdn.com/light_all/${tile.zoom}/${tile.tileX}/${tile.tileY}.png`,
      }}
      style={[
        styles.tile,
        {
          left: tile.screenLeft,
          top: tile.screenTop,
          width: TILE_SIZE,
          height: TILE_SIZE,
        },
      ]}
      cachePolicy="disk"
      contentFit="fill"
    />
  ));
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
  },
});
