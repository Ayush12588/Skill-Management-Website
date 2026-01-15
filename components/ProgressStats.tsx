import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Flame, Calendar, Award } from 'lucide-react';

interface ProgressStatsProps {
  journeyId: string;
  startDate: string;
  durationDays: number;
  refreshTrigger: number;
}

interface DayStatus {
  date: string;
  isComplete: boolean;
  hasFailed: boolean;
}

export default function ProgressStats({ journeyId, startDate, durationDays, refreshTrigger }: ProgressStatsProps) {
  const [stats, setStats] = useState({
    daysCompleted: 0,
    daysFailed: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    daysElapsed: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [journeyId, refreshTrigger]);

  const calculateStats = async () => {
    const { data: tasks } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('journey_id', journeyId);

    if (!tasks || tasks.length === 0) return;

    const { data: completions } = await supabase
      .from('task_completions')
      .select('completion_date, status, daily_task_id')
      .eq('journey_id', journeyId)
      .order('completion_date');

    if (!completions) return;

    const completionsByDate = new Map<string, Map<string, string>>();
    completions.forEach(c => {
      if (!completionsByDate.has(c.completion_date)) {
        completionsByDate.set(c.completion_date, new Map());
      }
      completionsByDate.get(c.completion_date)!.set(c.daily_task_id, c.status);
    });

    const start = new Date(startDate);
    const today = new Date();
    const daysElapsed = Math.min(
      Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      durationDays
    );

    const dayStatuses: DayStatus[] = [];
    for (let i = 0; i < daysElapsed; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayCompletions = completionsByDate.get(dateStr);

      if (dayCompletions) {
        const allCompleted = tasks.every(task =>
          dayCompletions.get(task.id) === 'completed'
        );
        const anyFailed = Array.from(dayCompletions.values()).some(
          status => status === 'failed'
        );

        dayStatuses.push({
          date: dateStr,
          isComplete: allCompleted && !anyFailed,
          hasFailed: anyFailed,
        });
      }
    }

    const daysCompleted = dayStatuses.filter(d => d.isComplete).length;
    const daysFailed = dayStatuses.filter(d => d.hasFailed).length;
    const completionRate = daysElapsed > 0 ? (daysCompleted / daysElapsed) * 100 : 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = dayStatuses.length - 1; i >= 0; i--) {
      if (dayStatuses[i].isComplete) {
        tempStreak++;
        if (i === dayStatuses.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        if (i === dayStatuses.length - 1) {
          currentStreak = 0;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    setStats({
      daysCompleted,
      daysFailed,
      currentStreak,
      longestStreak,
      completionRate: Math.round(completionRate),
      daysElapsed,
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-[#00D4FF]" />
          <span className="text-sm text-[#64748B]">Progress</span>
        </div>
        <div className="text-2xl font-bold text-[#1E293B]">
          {stats.daysElapsed}/{durationDays}
        </div>
        <div className="text-xs text-[#64748B] mt-1">Days elapsed</div>
      </div>

      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          <span className="text-sm text-[#64748B]">Completion</span>
        </div>
        <div className="text-2xl font-bold text-[#1E293B]">{stats.completionRate}%</div>
        <div className="text-xs text-[#64748B] mt-1">
          {stats.daysCompleted} complete, {stats.daysFailed} failed
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-[#EF4444]" />
          <span className="text-sm text-[#64748B]">Current Streak</span>
        </div>
        <div className="text-2xl font-bold text-[#1E293B]">{stats.currentStreak}</div>
        <div className="text-xs text-[#64748B] mt-1">Days in a row</div>
      </div>

      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-[#0A2540]" />
          <span className="text-sm text-[#64748B]">Best Streak</span>
        </div>
        <div className="text-2xl font-bold text-[#1E293B]">{stats.longestStreak}</div>
        <div className="text-xs text-[#64748B] mt-1">Personal record</div>
      </div>
    </div>
  );
}
