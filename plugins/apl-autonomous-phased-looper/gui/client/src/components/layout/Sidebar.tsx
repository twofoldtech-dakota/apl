import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Library,
  Clock,
  Terminal,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAplStore } from '../../store/aplStore';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Commands', path: '/commands', icon: Terminal },
  { name: 'Configuration', path: '/config', icon: Settings },
  { name: 'Learnings', path: '/learnings', icon: BookOpen },
  { name: 'Patterns', path: '/patterns', icon: Library },
  { name: 'Checkpoints', path: '/checkpoints', icon: Clock },
];

export default function Sidebar() {
  const { aplRunning } = useAplStore();

  return (
    <aside className="w-56 border-r border-gray-700 bg-gray-800 flex flex-col">
      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-apl-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Status Indicator at bottom */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'h-2 w-2 rounded-full',
            aplRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          )} />
          <span className="text-xs text-gray-400">
            {aplRunning ? 'APL Running' : 'Idle'}
          </span>
        </div>
      </div>
    </aside>
  );
}
