import { type GpsPoint } from '../../types';
import { lat2tile, lon2tile } from './math';

/** Width and height of a single map tile in pixels. Standard across OSM/CartoDB/Google Maps. */
export const TILE_SIZE = 256 as const;

/** Smallest axis-aligned rectangle that contains all points of the track. */
export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Finds the 4 extreme GPS coordinates of a track, forming a bounding box around it. */
export function getTrackBounds(track: GpsPoint[]): BoundingBox {
  let [minLat, maxLat] = [Infinity, -Infinity];
  let [minLng, maxLng] = [Infinity, -Infinity];

  for (const { lat, lng } of track) {
    if (lat < minLat) {
      minLat = lat;
    }

    if (lat > maxLat) {
      maxLat = lat;
    }

    if (lng < minLng) {
      minLng = lng;
    }

    if (lng > maxLng) {
      maxLng = lng;
    }
  }

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Finds the highest zoom level at which the track's bounding box fits on screen.
 *
 * Iterates from maxZoom down to 1. Higher zoom = more detail, but the track
 * covers more pixels and may not fit. Returns the first zoom where it fits —
 * i.e. the most detailed view that still shows the whole track.
 *
 * @param padding - margin subtracted from each side of the screen (pixels)
 * @param minZoom - OSM min zoom is 1
 * @param maxZoom - OSM max zoom is 18; lower values reduce detail
 */
export function getOptimalZoom(
  bounds: BoundingBox,
  screenWidth: number,
  screenHeight: number,
  padding = 40,
  minZoom = 1,
  maxZoom = 18
): number {
  const usableWidth = screenWidth - padding * 2;
  const usableHeight = screenHeight - padding * 2;

  for (let zoom = maxZoom; zoom >= minZoom; zoom--) {
    const { minLat, maxLat, minLng, maxLng } = bounds;

    const trackWidthPx =
      (lon2tile(maxLng, zoom) - lon2tile(minLng, zoom)) * TILE_SIZE;
    const trackHeightPx =
      (lat2tile(minLat, zoom) - lat2tile(maxLat, zoom)) * TILE_SIZE;

    const fitsHorizontally = trackWidthPx <= usableWidth;
    const fitsVertically = trackHeightPx <= usableHeight;

    if (fitsHorizontally && fitsVertically) {
      return zoom;
    }
  }

  return minZoom;
}
