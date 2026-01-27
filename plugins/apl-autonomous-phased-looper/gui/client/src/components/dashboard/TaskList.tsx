import type { Task, ParallelGroup } from '@apl-gui/shared';
import { useAplStore } from '../../store/aplStore';
import TaskCard from './TaskCard';
import { Layers, GitBranch } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { state } = useAplStore();
  const parallelGroups = state.parallel_groups || [];

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

  // Check if we should show parallel group view
  const hasParallelGroups = parallelGroups.length > 0;

  // Group tasks by parallel group
  const getTaskGroup = (taskId: number): ParallelGroup | undefined => {
    return parallelGroups.find(g => g.task_ids.includes(taskId));
  };

  // Get color for parallel group
  const getGroupColor = (groupName: string): string => {
    const colors = [
      'border-l-blue-500',
      'border-l-green-500',
      'border-l-purple-500',
      'border-l-yellow-500',
      'border-l-pink-500',
      'border-l-cyan-500',
    ];
    const index = groupName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-400">Tasks</h3>
          {hasParallelGroups && (
            <div className="flex items-center gap-1 text-xs text-apl-400">
              <GitBranch className="h-3 w-3" />
              <span>{parallelGroups.length} parallel groups</span>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400">{completedTasks.length} completed</span>
          <span className="text-blue-400">{inProgressTasks.length} in progress</span>
          <span className="text-gray-400">{pendingTasks.length} pending</span>
          {failedTasks.length > 0 && (
            <span className="text-red-400">{failedTasks.length} failed</span>
          )}
        </div>
      </div>

      {/* Parallel Groups Legend */}
      {hasParallelGroups && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-700">
          {parallelGroups.map(group => (
            <div
              key={group.group}
              className={clsx(
                'flex items-center gap-2 px-2 py-1 rounded text-xs bg-gray-800',
                'border-l-2',
                getGroupColor(group.group)
              )}
            >
              <Layers className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Group {group.group.toUpperCase()}</span>
              <span className="text-gray-500">({group.task_ids.length} tasks)</span>
              <span className={clsx(
                'px-1.5 rounded text-[10px]',
                group.status === 'completed' && 'bg-green-900 text-green-300',
                group.status === 'in_progress' && 'bg-blue-900 text-blue-300',
                group.status === 'pending' && 'bg-gray-700 text-gray-400',
                group.status === 'failed' && 'bg-red-900 text-red-300',
              )}>
                {group.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {/* In Progress Tasks First */}
        {inProgressTasks.map(task => {
          const group = getTaskGroup(task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              parallelGroup={group}
              groupColor={group ? getGroupColor(group.group) : undefined}
            />
          );
        })}

        {/* Pending Tasks */}
        {pendingTasks.map(task => {
          const group = getTaskGroup(task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              parallelGroup={group}
              groupColor={group ? getGroupColor(group.group) : undefined}
            />
          );
        })}

        {/* Completed Tasks */}
        {completedTasks.map(task => {
          const group = getTaskGroup(task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              parallelGroup={group}
              groupColor={group ? getGroupColor(group.group) : undefined}
            />
          );
        })}

        {/* Failed Tasks */}
        {failedTasks.map(task => {
          const group = getTaskGroup(task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              parallelGroup={group}
              groupColor={group ? getGroupColor(group.group) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
