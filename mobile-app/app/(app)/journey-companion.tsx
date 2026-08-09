import { findDestinationByName } from '@/mocks/destinations';
import { useDashboardStore } from '@/store/dashboardStore';
import { Redirect, type Href } from 'expo-router';

/**
 * Legacy Journey Companion — features live inside Route Navigation's
 * JourneyCompanionSheet (alerts, env stats, emergency hub, complete trip).
 */
export default function JourneyCompanionRedirect() {
  const destination = useDashboardStore((s) => s.destination);
  const matched = destination?.placeName
    ? findDestinationByName(destination.placeName)
    : undefined;
  const id = matched?.id || 'ooty';

  return (
    <Redirect
      href={`/(app)/(ai-flow)/route-navigation?destinationId=${id}` as Href}
    />
  );
}
