import AIRecommendationsScreen from '../(ai-flow)/recommendations';

/**
 * Explore tab — reuses the canonical Recommendations swipe deck
 * with a trending-nearby dataset (no tall-card list).
 */
export default function ExploreScreen() {
  return <AIRecommendationsScreen isTab mode="trending" />;
}
