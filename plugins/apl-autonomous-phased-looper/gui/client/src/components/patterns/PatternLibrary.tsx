import { useEffect, useState } from 'react';
import { Search, RefreshCw, Code, BookOpen } from 'lucide-react';
import { api } from '../../api/client';
import type { Pattern, PatternIndex } from '@apl-gui/shared';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

export default function PatternLibrary() {
  const [patternIndex, setPatternIndex] = useState<PatternIndex | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pattern[] | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatternIndex();
  }, []);

  const loadPatternIndex = async () => {
    setIsLoading(true);
    try {
      const index = await api.getPatternIndex();
      setPatternIndex(index);
    } catch (error) {
      console.error('Failed to load pattern index:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await api.searchPatterns(searchQuery);
      setSearchResults(results);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Failed to search patterns:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patternIndex) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load pattern library
      </div>
    );
  }

  const displayPatterns = searchResults
    ? searchResults
    : selectedCategory && patternIndex.patterns_by_category[selectedCategory as keyof typeof patternIndex.patterns_by_category]
    ? patternIndex.patterns_by_category[selectedCategory as keyof typeof patternIndex.patterns_by_category]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pattern Library</h1>
          <p className="text-gray-400">
            {patternIndex.total_patterns} built-in patterns across {Object.keys(patternIndex.categories).length} categories
          </p>
        </div>
        <button onClick={loadPatternIndex} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search patterns..."
            className="input w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
      </div>

      {/* Category Cards */}
      {!searchResults && !selectedCategory && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(patternIndex.categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className="card p-4 hover:border-apl-500 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-apl-400" />
                <span className="font-medium text-white">{category?.name}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{category?.description}</p>
              <Badge variant="info">{category?.pattern_count} patterns</Badge>
            </button>
          ))}
        </div>
      )}

      {/* Back button when viewing category */}
      {(selectedCategory || searchResults) && (
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSearchResults(null);
            setSearchQuery('');
          }}
          className="text-apl-400 hover:text-apl-300 text-sm"
        >
          ← Back to categories
        </button>
      )}

      {/* Pattern List */}
      {(selectedCategory || searchResults) && (
        <div className="space-y-3">
          {displayPatterns && displayPatterns.length > 0 ? (
            displayPatterns.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className="card p-4 cursor-pointer hover:border-apl-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{pattern.name}</span>
                      <Badge variant="info">{pattern.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{pattern.description}</p>
                    <div className="flex gap-2">
                      {pattern.tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="default">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <Code className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No patterns found
            </div>
          )}
        </div>
      )}

      {/* Pattern Detail Modal */}
      <Modal
        isOpen={!!selectedPattern}
        onClose={() => setSelectedPattern(null)}
        title={selectedPattern?.name || 'Pattern Details'}
        size="lg"
      >
        {selectedPattern && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info">{selectedPattern.category}</Badge>
                {selectedPattern.tags.map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
              <p className="text-gray-300">{selectedPattern.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">When to use</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {selectedPattern.applicable_when.map((when, i) => (
                  <li key={i}>{when}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Approach</h4>
              <p className="text-gray-300 text-sm">{selectedPattern.approach}</p>
            </div>

            {selectedPattern.code_examples?.basic && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Code Example: {selectedPattern.code_examples.basic.title}
                </h4>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-gray-300">{selectedPattern.code_examples.basic.code}</code>
                </pre>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Success Indicators</h4>
              <ul className="list-disc list-inside text-green-300 text-sm space-y-1">
                {selectedPattern.success_indicators.map((indicator, i) => (
                  <li key={i}>{indicator}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Pitfalls to Avoid</h4>
              <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                {selectedPattern.pitfalls.map((pitfall, i) => (
                  <li key={i}>{pitfall}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
