import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

import { type GpsPoint } from '../types';

export function useGpxTrack(gpxModule: number): GpsPoint[] {
  const [points, setPoints] = useState<GpsPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const asset = Asset.fromModule(gpxModule);
      await asset.downloadAsync();
      const response = await fetch(asset.uri!);
      const xml = await response.text();

      if (cancelled) {
        return;
      }

      setPoints(parseGpx(xml));
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [gpxModule]);

  return points;
}

function parseGpx(
  xml: string,
  trackPointRegexp = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g,
  timeRegexp = /<time>([^<]+)<\/time>/
): GpsPoint[] {
  const points: GpsPoint[] = [];

  let match: RegExpExecArray | null;

  trackPointRegexp.lastIndex = 0;

  while ((match = trackPointRegexp.exec(xml)) !== null) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    const timeMatch = timeRegexp.exec(match[3]);
    const timestamp = timeMatch ? new Date(timeMatch[1]).getTime() : 0;

    points.push({ lat, lng, timestamp });
  }

  return points;
}
