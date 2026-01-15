import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Target, Plus, X } from 'lucide-react';

interface JourneySetupProps {
  onComplete: () => void;
}

export default function JourneySetup({ onComplete }: JourneySetupProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('Master Front-End Development');
  const [description, setDescription] = useState('Commit to daily practice and consistent learning');
  const [durationDays, setDurationDays] = useState(90);
  const [tasks, setTasks] = useState([
    'Complete one coding tutorial or lesson',
    'Build or improve a project feature',
    'Read technical documentation',
  ]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tasks.length === 0) {
      setError('Add at least one daily task');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: journey, error: journeyError } = await supabase
        .from('journeys')
        .insert({
          user_id: user!.id,
          title,
          description,
          duration_days: durationDays,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true,
        })
        .select()
        .single();

      if (journeyError) throw journeyError;

      const taskInserts = tasks.map((task, index) => ({
        journey_id: journey.id,
        task_text: task,
        order_index: index,
      }));

      const { error: tasksError } = await supabase
        .from('daily_tasks')
        .insert(taskInserts);

      if (tasksError) throw tasksError;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A2540] rounded-full mb-4">
            <Target className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            Design Your Journey
          </h1>
          <p className="text-[#64748B]">
            Define your goal and the daily actions that will get you there
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Journey Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all"
                placeholder="e.g., Master Front-End Development"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all resize-none"
                rows={2}
                placeholder="What are you trying to achieve?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all"
                min="1"
                max="365"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-2">
                Daily Tasks
              </label>
              <p className="text-sm text-[#64748B] mb-3">
                These tasks must be completed every day. Each must be marked complete or failed.
              </p>

              <div className="space-y-2 mb-3">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg group"
                  >
                    <span className="flex-1 text-[#1E293B]">{task}</span>
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-[#64748B] hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all"
                  placeholder="Add a daily task"
                />
                <button
                  type="button"
                  onClick={addTask}
                  className="px-4 py-2 bg-[#0A2540] text-white rounded-lg hover:bg-[#0d3051] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2540] text-white py-3 rounded-lg font-medium hover:bg-[#0d3051] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Journey...' : 'Start Journey'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
