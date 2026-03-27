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

function parseGpx(xml: string): GpsPoint[] {
  const points: GpsPoint[] = [];

  const latAttribute = 'lat="' as const;
  const lonAttribute = 'lon="' as const;
  const timeOpenTag = '<time>' as const;
  const timeCloseTag = '</time>' as const;
  const trackPointOpenTag = '<trkpt ' as const;
  const trackPointCloseTag = '</trkpt>' as const;

  let position = 0;
  const notFound = -1 as const;

  while (true) {
    const trackPointStart = xml.indexOf(trackPointOpenTag, position);

    if (trackPointStart === notFound) {
      break;
    }

    const openingTagEnd = xml.indexOf('>', trackPointStart);

    if (openingTagEnd === notFound) {
      break;
    }

    const trackPointEnd = xml.indexOf(trackPointCloseTag, openingTagEnd);

    if (trackPointEnd === notFound) {
      break;
    }

    const openingTag = xml.slice(trackPointStart, openingTagEnd);

    const latStart = openingTag.indexOf(latAttribute);
    const lonStart = openingTag.indexOf(lonAttribute);

    if (latStart === notFound || lonStart === notFound) {
      position = trackPointEnd + trackPointCloseTag.length;

      continue;
    }

    const lat = parseFloat(openingTag.slice(latStart + latAttribute.length));
    const lng = parseFloat(openingTag.slice(lonStart + lonAttribute.length));

    const innerContent = xml.slice(openingTagEnd + 1, trackPointEnd);
    const timeStart = innerContent.indexOf(timeOpenTag);
    const timeEnd = innerContent.indexOf(timeCloseTag);

    const foundTimeStart = timeStart !== notFound;
    const foundTimeEnd = timeEnd !== notFound;

    const timestamp =
      foundTimeStart && foundTimeEnd
        ? parseIsoTimestamp(
            innerContent.slice(timeStart + timeOpenTag.length, timeEnd)
          )
        : 0;

    points.push({ lat, lng, timestamp });
    position = trackPointEnd + trackPointCloseTag.length;
  }

  return points;
}

// Parses "YYYY-MM-DDTHH:MM:SSZ" without allocating a Date object.
// new Date(string) on Hermes is ~10-50x slower than Date.UTC with plain numbers.
function parseIsoTimestamp(iso: string): number {
  return Date.UTC(
    +iso.slice(0, 4),
    +iso.slice(5, 7) - 1,
    +iso.slice(8, 10),
    +iso.slice(11, 13),
    +iso.slice(14, 16),
    +iso.slice(17, 19)
  );
}
