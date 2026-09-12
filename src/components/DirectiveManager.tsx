import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, ShieldAlert, Clock, Filter } from 'lucide-react';
import { Directive, DirectivePriority } from '../types';
import { soundEffects } from '../services/soundEffects';

interface DirectiveManagerProps {
  directives: Directive[];
  onAddDirective: (title: string, priority: DirectivePriority, category: Directive['category']) => void;
  onToggleStatus: (id: string) => void;
  onDeleteDirective: (id: string) => void;
}

export const DirectiveManager: React.FC<DirectiveManagerProps> = ({
  directives,
  onAddDirective,
  onToggleStatus,
  onDeleteDirective,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<DirectivePriority>('NORMAL');
  const [newCategory, setNewCategory] = useState<Directive['category']>('MISSION');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    soundEffects.playHudClick();
    onAddDirective(newTitle.trim(), newPriority, newCategory);
    setNewTitle('');
  };

  const filteredDirectives = directives.filter((d) => {
    if (filterCategory === 'ALL') return true;
    return d.category === filterCategory;
  });

  const getPriorityBadge = (priority: DirectivePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-500/50 text-red-400';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-400';
      case 'NORMAL':
        return 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300';
      case 'LOW':
      default:
        return 'bg-slate-900 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/25 rounded-lg p-3 flex flex-col h-full">
      {/* Header with Counter and Filter */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-200">
            DIRECTIVES MATRIX
          </h3>
          <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300">
            {directives.filter((d) => d.status !== 'COMPLETED').length} ACTIVE
          </span>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-cyan-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/60 border border-cyan-900/60 rounded px-1.5 py-0.5 text-[11px] font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="MISSION">MISSION</option>
            <option value="DIAGNOSTIC">DIAGNOSTIC</option>
            <option value="SECURITY">SECURITY</option>
            <option value="PERSONAL">PERSONAL</option>
          </select>
        </div>
      </div>

      {/* Add Directive Input */}
      <form onSubmit={handleAdd} className="mb-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Log new Stark directive or protocol..."
          className="flex-1 bg-black/60 border border-cyan-800/60 rounded px-2.5 py-1.5 text-xs text-cyan-200 placeholder-cyan-600/60 font-mono-tech focus:outline-none focus:border-cyan-400"
        />

        <div className="flex items-center gap-1.5">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as DirectivePriority)}
            className="bg-black/60 border border-cyan-800/60 rounded px-2 py-1.5 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Directive['category'])}
            className="bg-black/60 border border-cyan-800/60 rounded px-2 py-1.5 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="MISSION">MISSION</option>
            <option value="DIAGNOSTIC">DIAGNOSTIC</option>
            <option value="SECURITY">SECURITY</option>
            <option value="PERSONAL">PERSONAL</option>
          </select>

          <button
            type="submit"
            id="add-directive-btn"
            className="px-2.5 py-1.5 rounded bg-cyan-600/30 border border-cyan-400 text-cyan-200 text-xs font-mono-tech hover:bg-cyan-500/40 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>LOG</span>
          </button>
        </div>
      </form>

      {/* Directives List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
        {filteredDirectives.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono-tech text-cyan-600">
            NO ACTIVE DIRECTIVES IN THIS CLASSIFICATION.
          </div>
        ) : (
          filteredDirectives.map((directive) => {
            const isCompleted = directive.status === 'COMPLETED';

            return (
              <div
                key={directive.id}
                className={`p-2 rounded border transition-all flex items-center justify-between gap-2 group ${
                  isCompleted
                    ? 'bg-black/30 border-cyan-950/60 opacity-50'
                    : 'bg-black/50 border-cyan-900/40 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      soundEffects.playHudClick();
                      onToggleStatus(directive.id);
                    }}
                    className="text-cyan-400 hover:text-cyan-200 cursor-pointer transition-colors"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-cyan-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-mono-tech tracking-wide truncate ${
                        isCompleted ? 'line-through text-cyan-700' : 'text-cyan-200'
                      }`}
                    >
                      {directive.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono-tech text-cyan-500/70 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {directive.createdAt}
                      </span>
                      <span>•</span>
                      <span>{directive.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono-tech px-1.5 py-0.2 rounded border ${getPriorityBadge(
                      directive.priority
                    )}`}
                  >
                    {directive.priority}
                  </span>

                  <button
                    onClick={() => {
                      soundEffects.playHudClick();
                      onDeleteDirective(directive.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-cyan-700 hover:text-red-400 transition-opacity p-1"
                    title="Purge directive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
