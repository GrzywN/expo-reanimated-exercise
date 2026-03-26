import { SkiaMap } from '@/features/skia-map/skia-map';
import { useGpxTrack } from '@/features/skia-map/hooks/use-gpx-track';

const GPX: number = require('../../../assets/PBR_sub_20.gpx');

export default function SkiaMapScreen() {
  const track = useGpxTrack(GPX);

  if (track.length < 2) {
    return null;
  }

  return <SkiaMap track={track} />;
}
