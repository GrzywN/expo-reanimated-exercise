import { type BoundingBox, TILE_SIZE } from './bounds';
import { lat2tile, lon2tile } from './math';

export interface TileDescriptor {
  tileX: number;
  tileY: number;
  zoom: number;
  screenLeft: number;
  screenTop: number;
}

export interface MapLayout {
  zoom: number;
  tiles: TileDescriptor[];
  /** Projects a GPS coordinate to screen pixel position */
  project: (lat: number, lng: number) => { x: number; y: number };
}

export function buildMapLayout(
  bounds: BoundingBox,
  zoom: number,
  screenWidth: number,
  screenHeight: number
): MapLayout {
  const routeCenter = {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };

  const screenCenter = { x: screenWidth / 2, y: screenHeight / 2 };

  const originX =
    screenCenter.x - lon2tile(routeCenter.lng, zoom, true) * TILE_SIZE;
  const originY =
    screenCenter.y - lat2tile(routeCenter.lat, zoom, true) * TILE_SIZE;

  /**
   * Total number of tiles along one axis at this zoom level.
   * Each zoom level doubles the tile count: zoom 0 → 1 tile, zoom 1 → 2, zoom 15 → 32 768.
   * Used as an upper bound when filtering tiles outside the world boundary.
   */
  const maxTileCoord = Math.pow(2, zoom);

  const minTileX = Math.floor(-originX / TILE_SIZE);
  const minTileY = Math.floor(-originY / TILE_SIZE);

  const maxTileX = Math.ceil((screenWidth - originX) / TILE_SIZE);
  const maxTileY = Math.ceil((screenHeight - originY) / TILE_SIZE);

  const tiles: TileDescriptor[] = [];

  for (let tx = minTileX; tx < maxTileX; tx++) {
    for (let ty = minTileY; ty < maxTileY; ty++) {
      const isWithinHorizontalBounds = tx >= 0 && tx < maxTileCoord;
      const isWithinVerticalBounds = ty >= 0 && ty < maxTileCoord;
      const isWithinWorldBounds =
        isWithinHorizontalBounds && isWithinVerticalBounds;

      if (!isWithinWorldBounds) {
        continue;
      }

      tiles.push({
        tileX: tx,
        tileY: ty,
        zoom,
        screenLeft: tx * TILE_SIZE + originX,
        screenTop: ty * TILE_SIZE + originY,
      });
    }
  }

  const project = (lat: number, lng: number) => ({
    x: lon2tile(lng, zoom, true) * TILE_SIZE + originX,
    y: lat2tile(lat, zoom, true) * TILE_SIZE + originY,
  });

  return { zoom, tiles, project };
}
