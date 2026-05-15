import { LicenseSelectorSheet, PracticeCard } from '@/components/practice';
import { ScreenWrapper } from '@/components/screen-wrapper';
import { AUTH_UI } from '@/constants/auth-ui';
import { ms, s, vs } from '@/utils/responsive';
import { PracticeCardType, PracticeLicense } from '@/models/practice.model';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Practice() {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [cardType, setCardType] = useState<PracticeCardType | null>(null);

  const handleCardPress = (type: PracticeCardType) => {
    setCardType(type);
    setSheetVisible(true);
  };

  const handleLicenseSelect = (license: PracticeLicense) => {
    setSheetVisible(false);
    if (cardType === 'circuit') {
      (router.push as any)({
        pathname: '/practice/circuit/[license]',
        params: { license },
      });
    } else {
      (router.push as any)({
        pathname: '/practice/errors/[license]',
        params: { license },
      });
    }
    setCardType(null);
  };

  return (
    <ScreenWrapper backgroundColor={AUTH_UI.colors.background} scroll>
      <View style={styles.container}>
        <Text style={styles.title}>Luyện Tập Ảo</Text>
        <Text style={styles.subtitle}>Thực hành sa hình và lệnh đường trường</Text>

        <View style={styles.cards}>
          <PracticeCard type="circuit" onPress={() => handleCardPress('circuit')} />
          <PracticeCard type="errors" onPress={() => handleCardPress('errors')} />
        </View>
      </View>

      <LicenseSelectorSheet
        visible={sheetVisible}
        onSelect={handleLicenseSelect}
        onClose={() => {
          setSheetVisible(false);
          setCardType(null);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingTop: vs(16),
  },
  title: {
    fontSize: ms(24),
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
    marginBottom: vs(4),
  },
  subtitle: {
    fontSize: ms(14),
    color: AUTH_UI.colors.textSecondary,
    marginBottom: vs(24),
  },
  cards: {
    gap: 0,
  },
});
