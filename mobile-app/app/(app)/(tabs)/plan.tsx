import { HOME, HomeShell } from '@/components/HomeDashboard';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlanScreen() {
  return (
    <HomeShell>
      <SafeAreaView style={styles.safe}>
        <View style={styles.box}>
          <Text style={styles.title}>Plan</Text>
          <Text style={styles.body}>
            Multi-stop planning and the decision engine come in later phases. Your Home route card is
            the start of every journey.
          </Text>
        </View>
      </SafeAreaView>
    </HomeShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  box: {
    marginTop: 24,
    backgroundColor: HOME.cardSolid,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: HOME.line,
  },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '600' },
  body: { color: HOME.muted, fontSize: 15, marginTop: 10, lineHeight: 22 },
});
