import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions, LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Sun, Leaf, Car, MapPin, ShieldCheck, ArrowRight, Map } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RecommendationData, IntelligenceStatus } from '@/data/mockRecommendations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

function getStatusColor(status: IntelligenceStatus): string {
  switch (status) {
    case 'Excellent':
    case 'Clear':
    case 'Available':
    case 'High':
      return '#10B981'; // Green
    case 'Good':
      return '#3B82F6'; // Blue
    case 'Moderate':
    case 'Limited':
      return '#F59E0B'; // Orange
    case 'Poor':
    case 'None':
      return '#EF4444'; // Red
    default:
      return '#64748B';
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 70) return '#3B82F6'; // Blue
  if (score >= 50) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
}

export type HeroRecommendationCardProps = {
  data: RecommendationData;
  onExplore: () => void;
  onViewDetails: () => void;
};

export function HeroRecommendationCard({
  data,
  onExplore,
  onViewDetails,
}: HeroRecommendationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Re-trigger animations when data changes
  const imageScale = useSharedValue(1.1);
  const imageOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 26;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  // React to data changes
  useEffect(() => {
    // Reset image animations
    setImageLoaded(false);
    imageOpacity.value = 0;
    imageScale.value = 1.1;
    
    // Animate Score
    progress.value = 0;
    progress.value = withDelay(
      300,
      withTiming(data.score / 100, { duration: 1500, easing: Easing.out(Easing.cubic) })
    );

    // Score Counter
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setDisplayScore(current);
      if (current >= data.score) {
        clearInterval(interval);
      }
    }, 1500 / Math.max(data.score, 1));

    return () => clearInterval(interval);
  }, [data.id]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference - progress.value * circumference,
    };
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
    imageOpacity.value = withTiming(1, { duration: 400 });
    imageScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  };

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const handlePrimaryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onExplore();
  };

  const handleSecondaryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails();
  };

  const scoreColor = getScoreColor(data.score);

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: data.image }}
          style={[styles.image, animatedImageStyle]}
          onLoad={handleImageLoad}
          resizeMode="cover"
        />
        {!imageLoaded && <View style={styles.imagePlaceholder} />}
        
        {/* Gradient Overlay for Top */}
        <LinearGradient
          colors={['rgba(15,23,42,0.6)', 'transparent']}
          style={styles.imageGradient}
        />

        {/* Top Badges */}
        <View style={styles.imageTopOverlay}>
          <View style={styles.weatherBadge}>
            <Sun size={12} color="#FFFFFF" />
            <Text style={styles.weatherBadgeText}>{data.intelligence.weather}</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ AI Recommended</Text>
          </View>
        </View>
      </View>

      {/* Destination & AI Score */}
      <View style={styles.destinationRow}>
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationTitle}>{data.name}</Text>
          <Text style={styles.destinationSub}>
            Travel {data.travelTime} • {data.budget}
          </Text>
        </View>

        {/* Circular Score */}
        <View style={styles.scoreContainer}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Circle cx={30} cy={30} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
            <AnimatedCircle
              cx={30}
              cy={30}
              r={radius}
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              transform="rotate(-90 30 30)"
            />
          </Svg>
          <View style={styles.scoreTextWrap}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{displayScore}%</Text>
          </View>
        </View>
      </View>

      {/* Quick Intelligence Row */}
      <View style={styles.intelligenceGrid}>
        <IntelligenceChip
          icon={<Leaf size={14} color={getStatusColor(data.intelligence.aqiStatus)} />}
          label="AQI"
          value={data.intelligence.aqiStatus}
          color={getStatusColor(data.intelligence.aqiStatus)}
        />
        <IntelligenceChip
          icon={<Car size={14} color={getStatusColor(data.intelligence.trafficStatus)} />}
          label="Traffic"
          value={data.intelligence.trafficStatus}
          color={getStatusColor(data.intelligence.trafficStatus)}
        />
        <IntelligenceChip
          icon={<MapPin size={14} color={getStatusColor(data.intelligence.parkingStatus)} />}
          label="Parking"
          value={data.intelligence.parkingStatus}
          color={getStatusColor(data.intelligence.parkingStatus)}
        />
        <IntelligenceChip
          icon={<ShieldCheck size={14} color={getStatusColor(data.intelligence.safetyStatus)} />}
          label="Safety"
          value={data.intelligence.safetyStatus}
          color={getStatusColor(data.intelligence.safetyStatus)}
        />
      </View>

      {/* Recommended Because Checklist */}
      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Recommended because</Text>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.checklistText}>Pleasant weather</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.checklistText}>Excellent AQI</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.checklistText}>Low traffic</Text>
        </View>
        <View style={styles.checklistItem}>
          <Ionicons name="checkmark" size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.checklistText}>Parking available</Text>
        </View>
      </View>

      {/* AI Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>{data.summary}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <AnimatedPressable style={styles.primaryBtn} onPress={handlePrimaryPress}>
          <Map size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Explore Journey</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.secondaryBtn} onPress={handleSecondaryPress}>
          <Text style={styles.secondaryBtnText}>View Details</Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

function IntelligenceChip({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View style={styles.intelChip}>
      <View style={styles.intelChipHeader}>
        {icon}
        <Text style={styles.intelChipLabel}>{label}</Text>
      </View>
      <Text style={[styles.intelChipValue, { color }]}>{value}</Text>
    </View>
  );
}

// Wrapper for animated pressable
const AnimatedPressable = ({ children, style, onPress }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      onPress={onPress}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginVertical: 16,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E2E8F0',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  weatherBadgeText: {
    fontFamily: CLOUD.fonts.number,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiBadge: {
    backgroundColor: 'rgba(124,58,237,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  destinationInfo: {
    flex: 1,
    paddingRight: 16,
  },
  destinationTitle: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  destinationSub: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  scoreContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: CLOUD.fonts.number,
    fontSize: 16,
    fontWeight: '800',
  },
  intelligenceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  intelChip: {
    alignItems: 'flex-start',
  },
  intelChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  intelChipLabel: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  intelChipValue: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryContainer: {
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  checklistContainer: {
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checklistText: {
    fontSize: 14,
    color: '#475569',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#0F172A', // Very premium dark button
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
