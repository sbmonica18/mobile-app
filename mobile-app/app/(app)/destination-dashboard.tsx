import { findDestinationByName } from '@/mocks/destinations';
import { useDashboardStore } from '@/store/dashboardStore';
import { Redirect, type Href } from 'expo-router';

/**
 * Legacy Destination Dashboard — merged into Destination Detail [id].
 */
export default function DestinationDashboardRedirect() {
  const destination = useDashboardStore((s) => s.destination);
  const matched = destination?.placeName
    ? findDestinationByName(destination.placeName)
    : undefined;

  if (matched) {
    return (
      <Redirect href={`/(app)/(ai-flow)/destination/${matched.id}` as Href} />
    );
  }

  return <Redirect href={'/(app)/(ai-flow)/recommendations?mode=trending' as Href} />;
}
