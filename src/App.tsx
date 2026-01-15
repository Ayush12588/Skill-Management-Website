import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import JourneySetup from './components/JourneySetup';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [hasJourney, setHasJourney] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkJourney();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkJourney = async () => {
    const { data } = await supabase
      .from('journeys')
      .select('id')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .maybeSingle();

    setHasJourney(!!data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#00D4FF] border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!hasJourney) {
    return <JourneySetup onComplete={checkJourney} />;
  }

  return <Dashboard />;
}

export default App;
