import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Library,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Configuration', path: '/config', icon: Settings },
  { name: 'Learnings', path: '/learnings', icon: BookOpen },
  { name: 'Patterns', path: '/patterns', icon: Library },
  { name: 'Checkpoints', path: '/checkpoints', icon: Clock },
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-gray-700 bg-gray-800">
      <nav className="flex flex-col gap-1 p-4">
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
    </aside>
  );
}
