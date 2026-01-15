import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import DailyTracker from './DailyTracker';
import ProgressStats from './ProgressStats';
import MotivationalQuote from './MotivationalQuote';
import { LogOut, Settings, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Journey {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  start_date: string;
}

interface Profile {
  username: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user!.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: journeyData } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (journeyData) {
      setJourney(journeyData);
    }

    setLoading(false);
  };

  const changeDate = (days: number) => {
    if (!journey) return;

    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);

    const startDate = new Date(journey.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + journey.duration_days - 1);
    const today = new Date();

    if (newDate >= startDate && newDate <= endDate && newDate <= today) {
      setSelectedDate(newDate.toISOString().split('T')[0]);
    }
  };

  const getDayNumber = () => {
    if (!journey) return 0;
    const start = new Date(journey.start_date);
    const current = new Date(selectedDate);
    return Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  const canNavigateBack = () => {
    if (!journey) return false;
    const start = new Date(journey.start_date);
    const current = new Date(selectedDate);
    return current > start;
  };

  const canNavigateForward = () => {
    if (!journey) return false;
    const start = new Date(journey.start_date);
    const end = new Date(start);
    end.setDate(end.getDate() + journey.duration_days - 1);
    const current = new Date(selectedDate);
    const today = new Date();
    return current < end && current < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#00D4FF] border-r-transparent"></div>
      </div>
    );
  }

  if (!journey) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1E293B]">{journey.title}</h1>
              <p className="text-sm text-[#64748B] mt-1">
                Welcome back, {profile?.username || 'there'}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <MotivationalQuote />

        <ProgressStats
          journeyId={journey.id}
          startDate={journey.start_date}
          durationDays={journey.duration_days}
          refreshTrigger={refreshTrigger}
        />

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeDate(-1)}
                disabled={!canNavigateBack()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#1E293B]" />
              </button>

              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00D4FF]" />
                  <h2 className="text-xl font-bold text-[#1E293B]">
                    Day {getDayNumber()} of {journey.duration_days}
                  </h2>
                </div>
                <p className="text-sm text-[#64748B] mt-1">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {isToday() && (
                    <span className="ml-2 text-[#00D4FF] font-medium">Today</span>
                  )}
                </p>
              </div>

              <button
                onClick={() => changeDate(1)}
                disabled={!canNavigateForward()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#1E293B]" />
              </button>
            </div>
          </div>

          <DailyTracker
            journeyId={journey.id}
            selectedDate={selectedDate}
            onUpdate={() => setRefreshTrigger(prev => prev + 1)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#1E293B] mb-3">Journey Details</h3>
          <div className="space-y-2 text-[#64748B]">
            <p>
              <span className="font-medium text-[#1E293B]">Goal:</span> {journey.description}
            </p>
            <p>
              <span className="font-medium text-[#1E293B]">Started:</span>{' '}
              {new Date(journey.start_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
