import { useLocalSearchParams } from 'expo-router';
import { CaseStudyDetailScreen } from '@/features/set/set';

export default function CaseStudyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CaseStudyDetailScreen id={id} />;
}
