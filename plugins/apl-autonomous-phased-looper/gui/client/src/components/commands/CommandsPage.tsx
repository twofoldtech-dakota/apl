import CommandPanel from '../control/CommandPanel';
import ProjectSelector from '../control/ProjectSelector';
import ControlBar from '../control/ControlBar';

export default function CommandsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Commands & Control</h1>
        <p className="text-gray-400 mt-1">
          Start workflows, run commands, and manage your project
        </p>
      </div>

      {/* Main Control Bar */}
      <ControlBar />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Commands */}
        <div className="space-y-6">
          <CommandPanel />
        </div>

        {/* Right Column - Project */}
        <div className="space-y-6">
          <ProjectSelector />

          {/* Help Section */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Quick Reference</h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-white font-medium mb-1">/apl Commands</h4>
                <ul className="text-gray-400 space-y-1">
                  <li><code className="text-apl-400">/apl &lt;goal&gt;</code> - Start autonomous coding</li>
                  <li><code className="text-apl-400">/apl status</code> - View current state</li>
                  <li><code className="text-apl-400">/apl reset</code> - Clear and start fresh</li>
                  <li><code className="text-apl-400">/apl rollback &lt;id&gt;</code> - Restore checkpoint</li>
                  <li><code className="text-apl-400">/apl forget</code> - Clear learned patterns</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-1">/meta Commands</h4>
                <ul className="text-gray-400 space-y-1">
                  <li><code className="text-apl-400">/meta &lt;goal&gt;</code> - Plan enterprise project</li>
                  <li><code className="text-apl-400">/meta loop</code> - Execute next Epic</li>
                  <li><code className="text-apl-400">/meta status</code> - View progress</li>
                  <li><code className="text-apl-400">/meta answer &lt;id&gt; &lt;answer&gt;</code> - Answer questions</li>
                  <li><code className="text-apl-400">/meta export</code> - Generate docs</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-medium mb-1">Workflow Tips</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>Use <strong>Goal Templates</strong> (✨ button) for common tasks</li>
                  <li>Use <strong>Goal History</strong> (🕒 button) to repeat previous goals</li>
                  <li>Use <strong>Quick Actions</strong> for one-click common operations</li>
                  <li>Switch to <strong>Agentic View</strong> to see agent activity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
