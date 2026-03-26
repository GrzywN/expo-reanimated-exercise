// Web Mercator (EPSG:3857) tile/coordinate conversion formulas
// Source: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Mathematics

/**
 * Longitude → tile X at given zoom.
 *
 * Longitude is linear: the range 0°–360° maps directly onto 0–2^zoom tiles.
 *
 * @param fractional - false (default): floors to integer for tile URLs.
 *                     true: returns fractional position for sub-tile pixel precision.
 */
export function lon2tile(lon: number, zoom: number, fractional = false) {
  const x = ((lon + 180) / 360) * Math.pow(2, zoom);

  return fractional ? x : Math.floor(x);
}

/**
 * Latitude → tile Y at given zoom.
 *
 * Latitude is non-linear — this formula (Gudermannian inverse) stretches the
 * poles toward infinity and compresses the equator. It's the same formula used
 * by OSM, Google Maps, and Strava, which is why GPS coordinates align with tile
 * imagery.
 *
 * Note: Y axis is flipped — higher latitude = smaller Y value.
 *
 * @param fractional - false (default): floors to integer for tile URLs.
 *                     true: returns fractional position for sub-tile pixel precision.
 */
export function lat2tile(lat: number, zoom: number, fractional = false) {
  const y =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    Math.pow(2, zoom);

  return fractional ? y : Math.floor(y);
}

/**
 * Integer tile X → longitude of tile's west (left) edge.
 */
export function tile2long(x: number, z: number) {
  return (x / Math.pow(2, z)) * 360 - 180;
}

/**
 * Integer tile Y → latitude of tile's north (top) edge.
 */
export function tile2lat(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);

  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}
