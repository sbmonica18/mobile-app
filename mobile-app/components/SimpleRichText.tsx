import { Text, StyleSheet, View } from 'react-native';
import { CLOUD } from '@/constants/cloudTheme';

/** Lightweight bold / bullet formatter — no Markdown dependency. */
export function SimpleRichText({ text }: { text: string }) {
  const blocks = text.split('\n').filter((line) => line.trim().length > 0);

  return (
    <View style={styles.wrap}>
      {blocks.map((line, index) => {
        const bullet = /^[-*]\s+/.test(line.trim());
        const content = bullet ? line.trim().replace(/^[-*]\s+/, '') : line;
        return (
          <View key={`${index}-${content.slice(0, 12)}`} style={styles.line}>
            {bullet ? <Text style={styles.bullet}>•</Text> : null}
            <Text style={[styles.body, bullet && styles.bulletBody]}>
              {renderInline(content)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function renderInline(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = /^\*\*[^*]+\*\*$/.test(part);
    const label = bold ? part.slice(2, -2) : part;
    return (
      <Text key={i} style={bold ? styles.bold : undefined}>
        {label}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { color: CLOUD.primary, fontWeight: '800', marginTop: 1 },
  body: { flex: 1, color: CLOUD.ink, fontSize: 15, lineHeight: 22 },
  bulletBody: { flex: 1 },
  bold: { fontWeight: '800', color: CLOUD.ink },
});
