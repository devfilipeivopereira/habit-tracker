import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';
import Animated, { FadeInDown } from 'react-native-reanimated';

type ViewMode = 'weekly' | 'monthly' | 'yearly';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function ChartBar({ label, value, maxValue, color, small }: { label: string; value: number; maxValue: number; color: string; small?: boolean }) {
  const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
  return (
    <View style={[chartBarStyles.col, small && { minWidth: 18 }]}>
      <Text style={[chartBarStyles.value, { color }, small && { fontSize: 9 }]}>{value}</Text>
      <View style={[chartBarStyles.barBg, small && { width: 16, height: 80 }]}>
        <View style={[chartBarStyles.barFill, { height: `${height}%`, backgroundColor: color }]} />
      </View>
      <Text style={[chartBarStyles.label, { color: '#9CA3AF' }, small && { fontSize: 9 }]}>{label}</Text>
    </View>
  );
}

const chartBarStyles = StyleSheet.create({
  col: { alignItems: 'center', flex: 1 },
  value: { fontSize: 11, fontWeight: '600' as const, marginBottom: 4 },
  barBg: {
    width: 24,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(150,150,150,0.12)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { borderRadius: 12, minHeight: 4 },
  label: { fontSize: 11, marginTop: 4, fontWeight: '500' as const },
});

function HeatmapCell({ value, maxValue, color, size }: { value: number; maxValue: number; color: string; size: number }) {
  const opacity = maxValue > 0 ? Math.max(value / maxValue, 0.08) : 0.08;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        backgroundColor: value > 0 ? color : 'rgba(150,150,150,0.12)',
        opacity: value > 0 ? 0.3 + opacity * 0.7 : 1,
        margin: 1,
      }}
    />
  );
}

export default function StatsScreen() {
  const { theme, isDark, palette } = useTheme();
  const { habits, completions, getStreak, getCompletionRate, getHabitsForDate, getCompletedCount } = useHabits();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const today = new Date();
    const result: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const completed = getCompletedCount(dateStr);
      result.push({ label: days[d.getDay()], value: completed });
    }
    return result;
  }, [getCompletedCount, completions]);

  const monthlyData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: { label: string; days: { date: string; value: number }[] }[] = [];
    let currentWeek: { date: string; value: number }[] = [];
    let weekNum = 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const habitsForDay = getHabitsForDate(dateStr);
      const completed = getCompletedCount(dateStr);
      const total = habitsForDay.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      currentWeek.push({ date: dateStr, value: rate });

      const dayOfWeek = new Date(year, month, d).getDay();
      if (dayOfWeek === 6 || d === daysInMonth) {
        weeks.push({ label: `S${weekNum}`, days: currentWeek });
        currentWeek = [];
        weekNum++;
      }
    }
    return weeks;
  }, [getHabitsForDate, getCompletedCount, completions]);

  const monthlyBarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: { label: string; value: number }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const completed = getCompletedCount(dateStr);
      result.push({ label: d % 5 === 0 || d === 1 ? String(d) : '', value: completed });
    }
    return result;
  }, [getCompletedCount, completions]);

  const yearlyData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const result: { label: string; value: number; total: number; rate: number }[] = [];

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let totalCompleted = 0;
      let totalTracked = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const habitsForDay = getHabitsForDate(dateStr);
        const completed = getCompletedCount(dateStr);
        totalCompleted += completed;
        totalTracked += habitsForDay.length;
      }

      const rate = totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0;
      result.push({ label: MONTHS_SHORT[m], value: totalCompleted, total: totalTracked, rate });
    }
    return result;
  }, [getHabitsForDate, getCompletedCount, completions]);

  const yearlyHeatmap = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const months: { month: string; weeks: number[][] }[] = [];

    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const firstDay = new Date(year, m, 1).getDay();
      const weeks: number[][] = [];
      let week: number[] = [];

      for (let pad = 0; pad < firstDay; pad++) week.push(-1);

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const completed = getCompletedCount(dateStr);
        week.push(completed);
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(-1);
        weeks.push(week);
      }
      months.push({ month: MONTHS_SHORT[m], weeks });
    }
    return months;
  }, [getCompletedCount, completions]);

  const maxWeekly = useMemo(() => Math.max(...weeklyData.map(d => d.value), 1), [weeklyData]);
  const maxMonthlyBar = useMemo(() => Math.max(...monthlyBarData.map(d => d.value), 1), [monthlyBarData]);
  const maxYearly = useMemo(() => Math.max(...yearlyData.map(d => d.value), 1), [yearlyData]);
  const maxHeatmap = useMemo(() => {
    let mx = 1;
    yearlyHeatmap.forEach(m => m.weeks.forEach(w => w.forEach(v => { if (v > mx) mx = v; })));
    return mx;
  }, [yearlyHeatmap]);

  const periodStats = useMemo(() => {
    if (habits.length === 0) return { totalRate: 0, bestStreak: 0, todayDone: 0, todayTotal: 0 };
    const today = formatDate(new Date());
    const todayHabits = getHabitsForDate(today);
    const todayDone = getCompletedCount(today);

    const periodDays = viewMode === 'weekly' ? 7 : viewMode === 'monthly' ? 30 : 365;
    const rates = habits.map(h => getCompletionRate(h.id, periodDays));
    const totalRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const bestStreak = Math.max(...habits.map(h => getStreak(h.id)), 0);
    return { totalRate, bestStreak, todayDone, todayTotal: todayHabits.length };
  }, [habits, viewMode, getCompletionRate, getStreak, getHabitsForDate, getCompletedCount, completions]);

  const periodLabel = viewMode === 'weekly' ? '7d' : viewMode === 'monthly' ? '30d' : '365d';
  const currentMonthName = MONTHS_SHORT[new Date().getMonth()];

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 16 }}>
          <Text style={[styles.screenTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
            Progresso
          </Text>

          <View style={[styles.segmentContainer, { marginHorizontal: 16, marginBottom: 16 }]}>
            <View style={[styles.segmentBar, { backgroundColor: theme.card }]}>
              {(['weekly', 'monthly', 'yearly'] as ViewMode[]).map(mode => {
                const labels = { weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };
                const active = viewMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setViewMode(mode)}
                    style={[
                      styles.segmentBtn,
                      active && { backgroundColor: palette.teal },
                    ]}
                  >
                    <Text style={[
                      styles.segmentText,
                      { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' },
                      active && { color: '#fff' },
                    ]}>
                      {labels[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {habits.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Ionicons name="analytics-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Sem dados ainda
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Adicione habitos para ver suas estatisticas aqui
              </Text>
            </View>
          ) : (
            <>
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(400) : undefined} style={[styles.summaryCard, { backgroundColor: palette.teal }]}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{periodStats.todayDone}/{periodStats.todayTotal}</Text>
                    <Text style={styles.summaryLabel}>Hoje</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{periodStats.totalRate}%</Text>
                    <Text style={styles.summaryLabel}>Taxa ({periodLabel})</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{periodStats.bestStreak}</Text>
                    <Text style={styles.summaryLabel}>Melhor seq.</Text>
                  </View>
                </View>
              </Animated.View>

              {viewMode === 'weekly' && (
                <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                    Esta semana
                  </Text>
                  <View style={styles.barsRow}>
                    {weeklyData.map((d, i) => (
                      <ChartBar key={i} label={d.label} value={d.value} maxValue={maxWeekly} color={palette.teal} />
                    ))}
                  </View>
                </Animated.View>
              )}

              {viewMode === 'monthly' && (
                <>
                  <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                      {currentMonthName} - Habitos por dia
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={[styles.barsRow, { gap: 2, paddingRight: 8 }]}>
                        {monthlyBarData.map((d, i) => (
                          <ChartBar key={i} label={d.label} value={d.value} maxValue={maxMonthlyBar} color={palette.teal} small />
                        ))}
                      </View>
                    </ScrollView>
                  </Animated.View>

                  <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                      {currentMonthName} - Semanas
                    </Text>
                    {monthlyData.map((week, wi) => {
                      const avgRate = week.days.length > 0 ? Math.round(week.days.reduce((a, b) => a + b.value, 0) / week.days.length) : 0;
                      return (
                        <View key={wi} style={styles.weekRow}>
                          <Text style={[styles.weekLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                            {week.label}
                          </Text>
                          <View style={styles.weekBarContainer}>
                            <View style={[styles.weekBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                              <View style={[styles.weekBarFill, { width: `${avgRate}%`, backgroundColor: palette.teal }]} />
                            </View>
                          </View>
                          <Text style={[styles.weekRate, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                            {avgRate}%
                          </Text>
                        </View>
                      );
                    })}
                  </Animated.View>
                </>
              )}

              {viewMode === 'yearly' && (
                <>
                  <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                      {new Date().getFullYear()} - Taxa mensal
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={[styles.barsRow, { gap: 2, paddingRight: 8 }]}>
                        {yearlyData.map((d, i) => (
                          <ChartBar key={i} label={d.label} value={d.rate} maxValue={100} color={palette.teal} small />
                        ))}
                      </View>
                    </ScrollView>
                  </Animated.View>

                  <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                      Mapa de atividade
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {yearlyHeatmap.map((monthData, mi) => (
                          <View key={mi} style={{ alignItems: 'center' }}>
                            <View style={{ gap: 1 }}>
                              {monthData.weeks.map((week, wi) => (
                                <View key={wi} style={{ flexDirection: 'row', gap: 1 }}>
                                  {week.map((val, di) => (
                                    <View key={di}>
                                      {val === -1 ? (
                                        <View style={{ width: 10, height: 10, margin: 1 }} />
                                      ) : (
                                        <HeatmapCell value={val} maxValue={maxHeatmap} color={palette.teal} size={10} />
                                      )}
                                    </View>
                                  ))}
                                </View>
                              ))}
                            </View>
                            <Text style={[styles.heatmapMonth, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                              {monthData.month}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                    <View style={styles.heatmapLegend}>
                      <Text style={[styles.legendText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>Menos</Text>
                      {[0.08, 0.3, 0.55, 0.8, 1].map((op, i) => (
                        <View key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: palette.teal, opacity: op }} />
                      ))}
                      <Text style={[styles.legendText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>Mais</Text>
                    </View>
                  </Animated.View>

                  <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(400).duration(400) : undefined} style={[styles.chartCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                      Resumo por mes
                    </Text>
                    {yearlyData.map((m, i) => (
                      <View key={i} style={styles.weekRow}>
                        <Text style={[styles.weekLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold', width: 36 }]}>
                          {m.label}
                        </Text>
                        <View style={styles.weekBarContainer}>
                          <View style={[styles.weekBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                            <View style={[styles.weekBarFill, { width: `${m.rate}%`, backgroundColor: palette.teal }]} />
                          </View>
                        </View>
                        <Text style={[styles.weekRate, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                          {m.rate}%
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                </>
              )}

              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(viewMode === 'weekly' ? 300 : 500).duration(400) : undefined}>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                  Por habito
                </Text>
                {habits.map(habit => {
                  const streak = getStreak(habit.id);
                  const periodDays = viewMode === 'weekly' ? 7 : viewMode === 'monthly' ? 30 : 365;
                  const rate = getCompletionRate(habit.id, periodDays);
                  return (
                    <View key={habit.id} style={[styles.habitStatCard, { backgroundColor: theme.card }]}>
                      <View style={styles.habitStatHeader}>
                        <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                          <Ionicons name={habit.icon as any} size={20} color={habit.color} />
                        </View>
                        <Text style={[styles.habitStatName, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                          {habit.name}
                        </Text>
                      </View>
                      <View style={styles.habitStatRow}>
                        <View style={styles.habitStatItem}>
                          <Ionicons name="flame-outline" size={16} color={palette.coral} />
                          <Text style={[styles.habitStatValue, { color: theme.text }]}>{streak} dias</Text>
                        </View>
                        <View style={styles.habitStatItem}>
                          <Ionicons name="trending-up-outline" size={16} color={palette.teal} />
                          <Text style={[styles.habitStatValue, { color: theme.text }]}>{rate}% ({periodLabel})</Text>
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${rate}%`, backgroundColor: habit.color }]} />
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 28, marginHorizontal: 20, marginBottom: 16 },
  segmentContainer: {},
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  segmentText: { fontSize: 13 },
  emptyCard: {
    margin: 20,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '700' as const, color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summaryDivider: { width: 1, height: 40 },
  chartCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, marginBottom: 16 },
  barsRow: { flexDirection: 'row', gap: 4 },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  weekLabel: { fontSize: 12, width: 24 },
  weekBarContainer: { flex: 1 },
  weekBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  weekBarFill: { height: '100%', borderRadius: 4 },
  weekRate: { fontSize: 13, width: 38, textAlign: 'right' },
  heatmapMonth: { fontSize: 9, marginTop: 4 },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  legendText: { fontSize: 10 },
  sectionTitle: { fontSize: 20, marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  habitStatCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  habitStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitStatName: { fontSize: 16, flex: 1 },
  habitStatRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  habitStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  habitStatValue: { fontSize: 14, fontWeight: '500' as const },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150,150,150,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
