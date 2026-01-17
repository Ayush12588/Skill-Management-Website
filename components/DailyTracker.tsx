import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, X } from 'lucide-react';

interface DailyTask {
  id: string;
  task_text: string;
  order_index: number;
}

interface TaskCompletion {
  id: string;
  daily_task_id: string;
  status: 'completed' | 'failed';
}

interface DailyTrackerProps {
  journeyId: string;
  selectedDate: string;
  onUpdate: () => void;
}

export default function DailyTracker({ journeyId, selectedDate, onUpdate }: DailyTrackerProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completions, setCompletions] = useState<Map<string, TaskCompletion>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasksAndCompletions();
  }, [journeyId, selectedDate]);

  const loadTasksAndCompletions = async () => {
    setLoading(true);

    const { data: tasksData } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('journey_id', journeyId)
      .order('order_index');

    if (tasksData) {
      setTasks(tasksData);

      const { data: completionsData } = await supabase
        .from('task_completions')
        .select('*')
        .eq('journey_id', journeyId)
        .eq('completion_date', selectedDate);

      if (completionsData) {
        const completionsMap = new Map(
          completionsData.map(c => [c.daily_task_id, c])
        );
        setCompletions(completionsMap);
      }
    }

    setLoading(false);
  };

  const handleTaskStatus = async (taskId: string, status: 'completed' | 'failed') => {
    const existingCompletion = completions.get(taskId);

    try {
      if (existingCompletion) {
        if (existingCompletion.status === status) {
          await supabase
            .from('task_completions')
            .delete()
            .eq('id', existingCompletion.id);

          const newCompletions = new Map(completions);
          newCompletions.delete(taskId);
          setCompletions(newCompletions);
        } else {
          await supabase
            .from('task_completions')
            .update({ status })
            .eq('id', existingCompletion.id);

          const newCompletions = new Map(completions);
          newCompletions.set(taskId, { ...existingCompletion, status });
          setCompletions(newCompletions);
        }
      } else {
        const { data } = await supabase
          .from('task_completions')
          .insert({
            daily_task_id: taskId,
            journey_id: journeyId,
            user_id: user!.id,
            completion_date: selectedDate,
            status,
          })
          .select()
          .single();

        if (data) {
          const newCompletions = new Map(completions);
          newCompletions.set(taskId, data);
          setCompletions(newCompletions);
        }
      }

      onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };
  
  const getTaskStatus = (taskId: string) => {
    return completions.get(taskId)?.status;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00D4FF] border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = getTaskStatus(task.id);
        const isCompleted = status === 'completed';
        const isFailed = status === 'failed';

        return (
          <div
            key={task.id}
            className={`p-4 rounded-lg border-2 transition-all animate-scale-in ${
              isCompleted
                ? 'bg-green-50 border-[#22C55E]'
                : isFailed
                ? 'bg-red-50 border-[#EF4444]'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p
                  className={`${
                    isCompleted
                      ? 'text-[#166534] line-through'
                      : isFailed
                      ? 'text-[#991B1B] line-through'
                      : 'text-[#1E293B]'
                    }`}
                  >
                    {task.task_text}
                  </p>

                  {!status && (
                    <p className="text-xs text-[#64748B] mt-1">
                      Decide honestly. No partial credit.
                    </p>
                  )}
                </div>


              <div className="flex gap-2">
                <button
                  onClick={() => handleTaskStatus(task.id, 'completed')}
                  className={`p-2 rounded-lg transition-all ${
                    isCompleted
                      ? 'bg-[#22C55E] text-white scale-110'
                      : 'bg-gray-100 text-[#64748B] hover:bg-green-100 hover:text-[#22C55E]'
                  }`}
                  title="I did this today"
                >
                  <Check className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleTaskStatus(task.id, 'failed')}
                  className={`p-2 rounded-lg transition-all ${
                    isFailed
                      ? 'bg-[#EF4444] text-white scale-110'
                      : 'bg-gray-100 text-[#64748B] hover:bg-red-100 hover:text-[#EF4444]'
                  }`}
                  title="I didn’t do this"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
