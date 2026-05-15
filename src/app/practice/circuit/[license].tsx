import { ExerciseListItem } from '@/components/practice';
import { ScreenHeader } from '@/components/layout';
import { AUTH_UI } from '@/constants/auth-ui';
import { PracticeLicense } from '@/models/practice.model';
import { practiceService } from '@/services/practice.service';
import { ms, s, vs } from '@/utils/responsive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function CircuitListScreen() {
  const { license } = useLocalSearchParams<{ license: string }>();
  const router = useRouter();

  const exercises = useMemo(
    () => practiceService.getExercisesByLicense(license as PracticeLicense),
    [license],
  );

  const handleOpenExercise = (id: string) => {
    (router.push as any)({
      pathname: '/practice/circuit-detail/[id]',
      params: { id, license },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={`Bằng ${license}`}
        subtitle={`${exercises.length} bài thi`}
        onBack={() => router.back()}
        centered
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>Bản đồ sa hình {license}</Text>
            </View>
            <Text style={styles.hint}>
              💡 Nhấn vào từng bài để xem chi tiết
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExerciseListItem
            exercise={item}
            onPress={() => handleOpenExercise(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_UI.colors.background,
  },
  list: {
    paddingHorizontal: s(16),
    paddingBottom: vs(32),
  },
  header: {
    marginBottom: vs(16),
  },
  mapPlaceholder: {
    width: '100%',
    height: vs(200),
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  mapPlaceholderText: {
    color: AUTH_UI.colors.textMuted,
    fontSize: ms(14),
  },
  hint: {
    fontSize: ms(12),
    color: AUTH_UI.colors.textMuted,
    marginBottom: vs(4),
  },
});
