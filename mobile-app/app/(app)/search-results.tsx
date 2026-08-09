import { findDestinationByName } from '@/mocks/destinations';
import { useDashboardStore } from '@/store/dashboardStore';
import { Redirect, type Href } from 'expo-router';

/**
 * Legacy Search Results — merged into Recommendations swipe deck.
 * Keeps a redirect so any old deep links still land correctly.
 */
export default function SearchResultsRedirect() {
  const destination = useDashboardStore((s) => s.destination);
  const matched = destination?.placeName
    ? findDestinationByName(destination.placeName)
    : undefined;

  if (matched) {
    return (
      <Redirect
        href={
          `/(app)/(ai-flow)/recommendations?mode=seed&seedIds=${matched.id}&phrase=${encodeURIComponent(matched.name)}` as Href
        }
      />
    );
  }

  return <Redirect href={'/(app)/(ai-flow)/recommendations?mode=trending' as Href} />;
}
