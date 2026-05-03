import { ScreenWrapper } from '@/components/screen-wrapper';
import { AUTH_UI } from '@/constants/auth-ui';
import { MOCK_EXAMS } from '@/data/exams.mock';
import { Exam, ExamType, LicenseClass } from '@/models/exam.model';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const LICENSE_CLASSES: LicenseClass[] = ['B1', 'B2', 'A1', 'A2', 'C'];

function passRateColor(rate: number): string {
  if (rate >= 90) return AUTH_UI.colors.success;
  if (rate >= 75) return AUTH_UI.colors.accent;
  return AUTH_UI.colors.danger;
}

export default function ExamScreen() {
  const [activeClass, setActiveClass] = useState<LicenseClass>('B1');
  const [activeType, setActiveType] = useState<ExamType>('on-tap');
  const [searchText, setSearchText] = useState('');

  const filteredExams = useMemo(
    () =>
      MOCK_EXAMS.filter(
        (e) =>
          e.licenseClass === activeClass &&
          e.examType === activeType &&
          e.name.toLowerCase().includes(searchText.toLowerCase().trim()),
      ),
    [activeClass, activeType, searchText],
  );

  return (
    <ScreenWrapper backgroundColor={AUTH_UI.colors.background} edges={['top']} scroll={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đề Thi Lý Thuyết</Text>
          <Text style={styles.headerSub}>Chọn hạng bằng và loại đề để bắt đầu</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={17} color={AUTH_UI.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đề thi..."
            placeholderTextColor={AUTH_UI.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={16} color={AUTH_UI.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* License class tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classTabs}
          style={styles.classTabsScroll}
        >
          {LICENSE_CLASSES.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={[styles.classTab, activeClass === cls && styles.classTabActive]}
              onPress={() => setActiveClass(cls)}
            >
              <Text style={[styles.classTabText, activeClass === cls && styles.classTabTextActive]}>
                {cls}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exam type toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeOption, activeType === 'on-tap' && styles.typeOptionActive]}
            onPress={() => setActiveType('on-tap')}
          >
            <Ionicons
              name="book-outline"
              size={15}
              color={activeType === 'on-tap' ? AUTH_UI.colors.accentText : AUTH_UI.colors.textSecondary}
            />
            <Text style={[styles.typeOptionText, activeType === 'on-tap' && styles.typeOptionTextActive]}>
              Ôn tập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeOption, activeType === 'sat-hach' && styles.typeOptionActive]}
            onPress={() => setActiveType('sat-hach')}
          >
            <Ionicons
              name="trophy-outline"
              size={15}
              color={activeType === 'sat-hach' ? AUTH_UI.colors.accentText : AUTH_UI.colors.textSecondary}
            />
            <Text style={[styles.typeOptionText, activeType === 'sat-hach' && styles.typeOptionTextActive]}>
              Sát hạch
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        {activeType === 'on-tap' ? (
          <View style={styles.bannerOnTap}>
            <Ionicons name="book-outline" size={18} color={AUTH_UI.colors.accent} />
            <Text style={styles.bannerText}>
              Không giới hạn lần làm. Xem đáp án ngay sau mỗi câu.
            </Text>
          </View>
        ) : (
          <View style={styles.bannerSatHach}>
            <Ionicons name="trophy-outline" size={18} color="#A78BFA" />
            <Text style={[styles.bannerText, styles.bannerTextPurple]}>
              Mô phỏng sát hạch thực tế. Có câu điểm liệt. Thời gian giới hạn.
            </Text>
          </View>
        )}

        {/* Exam list */}
        <FlatList
          data={filteredExams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExamCard exam={item} activeType={activeType} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          ListEmptyComponent={<EmptyState />}
        />
      </View>
    </ScreenWrapper>
  );
}

function ExamCard({ exam, activeType }: { exam: Exam; activeType: ExamType }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      {/* Badges */}
      <View style={styles.badgeRow}>
        {activeType === 'on-tap' ? (
          <View style={styles.badgeOnTap}>
            <Text style={styles.badgeOnTapText}>Ôn tập</Text>
          </View>
        ) : (
          <View style={styles.badgeSatHach}>
            <Text style={styles.badgeSatHachText}>Sát hạch</Text>
          </View>
        )}
        {exam.hasCriticalQuestions && (
          <View style={styles.badgeCritical}>
            <Text style={styles.badgeCriticalText}>⚡ Có câu liệt</Text>
          </View>
        )}
      </View>

      {/* Name + pass rate */}
      <View style={styles.nameRow}>
        <Text style={styles.examName} numberOfLines={2}>
          {exam.name}
        </Text>
        <View style={styles.passRateBox}>
          <Text style={[styles.passRate, { color: passRateColor(exam.passRate) }]}>
            {exam.passRate}%
          </Text>
          <Text style={styles.passRateLabel}>tỷ lệ đạt</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="help-circle-outline" size={13} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.totalQuestions} câu</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="time-outline" size={13} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.durationMinutes} phút</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="people-outline" size={13} color={AUTH_UI.colors.textMuted} />
          <Text style={styles.statText}>{exam.attemptCount.toLocaleString()} lượt</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push(`/exam-take/${exam.id}` as never)}
        >
          <Text style={styles.primaryBtnText}>
            {activeType === 'on-tap' ? '🚀 Ôn tập ngay' : '🚀 Vào thi'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push(`/exam-preview/${exam.id}` as never)}
        >
          <Ionicons name="eye-outline" size={15} color={AUTH_UI.colors.textSecondary} />
          <Text style={styles.secondaryBtnText}>Xem đề</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color={AUTH_UI.colors.disabled} />
      <Text style={styles.emptyText}>Không tìm thấy đề thi phù hợp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AUTH_UI.colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: AUTH_UI.colors.textSecondary,
    marginTop: 3,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: AUTH_UI.radius.lg,
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AUTH_UI.colors.textPrimary,
    padding: 0,
  },

  // License class tabs
  classTabsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  classTabs: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  classTab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: AUTH_UI.colors.surface,
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
  },
  classTabActive: {
    backgroundColor: AUTH_UI.colors.accent,
    borderColor: AUTH_UI.colors.accent,
  },
  classTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_UI.colors.textSecondary,
  },
  classTabTextActive: {
    color: AUTH_UI.colors.accentText,
  },

  // Type toggle
  typeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: AUTH_UI.radius.lg,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  typeOptionActive: {
    backgroundColor: AUTH_UI.colors.accent,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_UI.colors.textSecondary,
  },
  typeOptionTextActive: {
    color: AUTH_UI.colors.accentText,
  },

  // Banners
  bannerOnTap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#2D2A0F',
    borderWidth: 1,
    borderColor: '#4A3F10',
    borderRadius: AUTH_UI.radius.lg,
    padding: 12,
    gap: 10,
  },
  bannerSatHach: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1A1040',
    borderWidth: 1,
    borderColor: '#2D1F6B',
    borderRadius: AUTH_UI.radius.lg,
    padding: 12,
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: AUTH_UI.colors.textSecondary,
    lineHeight: 19,
  },
  bannerTextPurple: {
    color: '#C4B5FD',
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: AUTH_UI.colors.surface,
    borderRadius: AUTH_UI.radius.xl,
    padding: 14,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badgeOnTap: {
    backgroundColor: '#2D2A0F',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#4A3F10',
  },
  badgeOnTapText: {
    fontSize: 11,
    fontWeight: '600',
    color: AUTH_UI.colors.accent,
  },
  badgeSatHach: {
    backgroundColor: '#1A1040',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#2D1F6B',
  },
  badgeSatHachText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A78BFA',
  },
  badgeCritical: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  badgeCriticalText: {
    fontSize: 11,
    fontWeight: '600',
    color: AUTH_UI.colors.danger,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  examName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: AUTH_UI.colors.textPrimary,
    lineHeight: 22,
  },
  passRateBox: {
    alignItems: 'flex-end',
  },
  passRate: {
    fontSize: 18,
    fontWeight: '800',
  },
  passRateLabel: {
    fontSize: 10,
    color: AUTH_UI.colors.textMuted,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: AUTH_UI.colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: AUTH_UI.colors.accent,
    borderRadius: AUTH_UI.radius.lg,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: AUTH_UI.colors.accentText,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_UI.colors.surfaceMuted,
    borderRadius: AUTH_UI.radius.lg,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: AUTH_UI.colors.border,
    gap: 5,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_UI.colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: AUTH_UI.colors.textMuted,
    textAlign: 'center',
  },
});
