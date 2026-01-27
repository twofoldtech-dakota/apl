import { useAplStore } from '../../store/aplStore';
import { Lightbulb, XCircle, HelpCircle } from 'lucide-react';

export default function ScratchpadPanel() {
  const { state } = useAplStore();
  const { scratchpad } = state;

  const hasContent =
    scratchpad.learnings.length > 0 ||
    scratchpad.failed_approaches.length > 0 ||
    scratchpad.open_questions.length > 0;

  if (!hasContent) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Agent Scratchpad</h3>
        <p className="text-gray-500 text-sm text-center py-4">
          The agent's working memory will appear here as it learns during execution
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Agent Scratchpad</h3>

      <div className="space-y-4">
        {/* Learnings */}
        {scratchpad.learnings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-yellow-400 uppercase tracking-wide">
                Learnings ({scratchpad.learnings.length})
              </span>
            </div>
            <ul className="space-y-1.5">
              {scratchpad.learnings.map((learning, i) => (
                <li key={i} className="text-sm text-gray-300 pl-6 relative">
                  <span className="absolute left-0 text-yellow-600">•</span>
                  {learning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Failed Approaches */}
        {scratchpad.failed_approaches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs font-medium text-red-400 uppercase tracking-wide">
                Failed Approaches ({scratchpad.failed_approaches.length})
              </span>
            </div>
            <ul className="space-y-1.5">
              {scratchpad.failed_approaches.map((approach, i) => (
                <li key={i} className="text-sm text-gray-300 pl-6 relative">
                  <span className="absolute left-0 text-red-600">•</span>
                  {approach}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Open Questions */}
        {scratchpad.open_questions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                Open Questions ({scratchpad.open_questions.length})
              </span>
            </div>
            <ul className="space-y-1.5">
              {scratchpad.open_questions.map((question, i) => (
                <li key={i} className="text-sm text-gray-300 pl-6 relative">
                  <span className="absolute left-0 text-blue-600">?</span>
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
