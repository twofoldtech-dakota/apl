import { useState, useEffect } from 'react';
import { FolderOpen, Check, RefreshCw, Plus } from 'lucide-react';
import { api } from '../../api/client';
import { clsx } from 'clsx';

const STORAGE_KEY = 'apl-gui-recent-projects';
const MAX_RECENT = 5;

interface ProjectInfo {
  projectRoot: string;
  aplDir: string;
}

export default function ProjectSelector() {
  const [currentProject, setCurrentProject] = useState<ProjectInfo | null>(null);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [newProjectPath, setNewProjectPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Load current project and recent projects
  useEffect(() => {
    loadCurrentProject();
    loadRecentProjects();
  }, []);

  const loadCurrentProject = async () => {
    try {
      const project = await api.getProject();
      setCurrentProject(project);
    } catch (error) {
      console.error('Failed to load current project:', error);
    }
  };

  const loadRecentProjects = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecentProjects(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent projects:', e);
    }
  };

  const saveToRecent = (path: string) => {
    const updated = [path, ...recentProjects.filter(p => p !== path)].slice(0, MAX_RECENT);
    setRecentProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent projects:', e);
    }
  };

  const switchProject = async (path: string) => {
    setIsLoading(true);
    try {
      const result = await api.setProject(path);
      setCurrentProject({ projectRoot: result.projectRoot, aplDir: result.aplDir });
      saveToRecent(path);
      setShowInput(false);
      setNewProjectPath('');
      // Reload state for new project
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch project:', error);
      alert(`Failed to switch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectPath.trim()) {
      switchProject(newProjectPath.trim());
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-apl-400" />
            <h3 className="font-medium text-white">Project</h3>
          </div>
          <button
            onClick={loadCurrentProject}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Current Project */}
      <div className="p-4">
        {currentProject ? (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Current Project</p>
            <p className="text-sm text-white font-mono truncate" title={currentProject.projectRoot}>
              {currentProject.projectRoot}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              APL Dir: <span className="text-gray-400">{currentProject.aplDir}</span>
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-300">No project configured</p>
            <p className="text-xs text-yellow-400/70 mt-1">Enter a project path below</p>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recent Projects</p>
            <div className="space-y-1">
              {recentProjects.map((path) => (
                <button
                  key={path}
                  onClick={() => switchProject(path)}
                  disabled={isLoading || path === currentProject?.projectRoot}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                    path === currentProject?.projectRoot
                      ? 'bg-apl-900/30 border border-apl-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  )}
                >
                  {path === currentProject?.projectRoot && (
                    <Check className="h-4 w-4 text-apl-400 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-300 truncate font-mono">
                    {path}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Project */}
        {showInput ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={newProjectPath}
              onChange={(e) => setNewProjectPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="input w-full text-sm font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newProjectPath.trim() || isLoading}
                className="btn btn-primary btn-sm flex-1"
              >
                {isLoading ? 'Switching...' : 'Switch'}
              </button>
              <button
                type="button"
                onClick={() => { setShowInput(false); setNewProjectPath(''); }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
