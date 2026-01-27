import type { Task } from '@apl-gui/shared';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Tasks</h3>
        <p className="text-gray-500 text-center py-8">No tasks yet. Waiting for planning phase...</p>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Tasks</h3>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400">{completedTasks.length} completed</span>
          <span className="text-blue-400">{inProgressTasks.length} in progress</span>
          <span className="text-gray-400">{pendingTasks.length} pending</span>
          {failedTasks.length > 0 && (
            <span className="text-red-400">{failedTasks.length} failed</span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {/* In Progress Tasks First */}
        {inProgressTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* Pending Tasks */}
        {pendingTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* Completed Tasks */}
        {completedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* Failed Tasks */}
        {failedTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
