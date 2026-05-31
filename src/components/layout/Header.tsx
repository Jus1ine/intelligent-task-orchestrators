import React from 'react';
import { ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { DroppableTab } from '../kanban/DroppableTab';
import type { Project } from '../../types';

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onEditProject: () => void;
  onDeleteProject: (id: string) => void;

  // Tabs
  activeTab: string;
  setActiveTab: (tab: string) => void;
  taskCounts: {
    all: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  tabs: Record<string, string>;
}

export function Header({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  activeTab,
  setActiveTab,
  taskCounts,
  tabs,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // ── Shared dropdown pieces (rendered in two places; only one visible at a time) ──

  const renderTrigger = () => (
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="project-trigger"
    >
      <div
        className="project-color-dot"
        style={{ backgroundColor: selectedProject?.color || '#cbd5e1' }}
      />
      <span className="project-trigger-label">
        {selectedProject ? selectedProject.title : 'Select a project…'}
      </span>
      <ChevronDown size={14} className="project-trigger-chevron" />
    </button>
  );

  const renderMenu = () =>
    dropdownOpen && (
      <>
        <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
        <div className="project-dropdown-menu">
          <div className="dropdown-section-header">
            <p className="dropdown-section-label">Your Projects</p>
          </div>

          <div className="dropdown-list">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`dropdown-item-row${
                  selectedProject?.id === project.id ? ' selected' : ''
                }`}
              >
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    onSelectProject(project.id);
                    setDropdownOpen(false);
                  }}
                >
                  <div
                    className="project-color-dot"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="dropdown-item-title">{project.title}</span>
                </button>

                <div className="dropdown-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project.id);
                      onEditProject();
                      setDropdownOpen(false);
                    }}
                    className="dropdown-action-btn"
                    title="Edit project"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this project and all its tasks?')) {
                        onDeleteProject(project.id);
                      }
                    }}
                    className="dropdown-action-btn danger"
                    title="Delete project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="dropdown-footer">
            <button
              onClick={() => {
                onCreateProject();
                setDropdownOpen(false);
              }}
              className="dropdown-create-btn"
            >
              <Plus size={15} />
              Create New Project
            </button>
          </div>
        </div>
      </>
    );

  return (
    <header className="header">
      <div className="header-container">
        {/* ── Left: Brand + Desktop-only Inline Project Selector ── */}
        <div className="header-left">
          <span className="system-name">Orchestrator</span>

          {/* Desktop only (hidden on mobile via max-md:hidden) */}
          <div className="project-dropdown-wrapper max-md:hidden">
            {renderTrigger()}
            {renderMenu()}
          </div>
        </div>

        {/* ── Center: Tabs ── */}
        <nav className="tab-nav">
          <DroppableTab
            id={tabs.ALL}
            isActive={activeTab === tabs.ALL}
            onClick={() => setActiveTab(tabs.ALL)}
          >
            All
            <span className="tab-count">{taskCounts.all}</span>
          </DroppableTab>
          <DroppableTab
            id={tabs.TODO}
            isActive={activeTab === tabs.TODO}
            onClick={() => setActiveTab(tabs.TODO)}
          >
            To Do
            <span className="tab-count">{taskCounts.todo}</span>
          </DroppableTab>
          <DroppableTab
            id={tabs.IN_PROGRESS}
            isActive={activeTab === tabs.IN_PROGRESS}
            onClick={() => setActiveTab(tabs.IN_PROGRESS)}
          >
            In Progress
            <span className="tab-count">{taskCounts.inProgress}</span>
          </DroppableTab>
          <DroppableTab
            id={tabs.DONE}
            isActive={activeTab === tabs.DONE}
            onClick={() => setActiveTab(tabs.DONE)}
          >
            Done
            <span className="tab-count">{taskCounts.done}</span>
          </DroppableTab>
        </nav>

        {/* ── Right: Placeholder to keep center tabs centered (hidden on mobile) ── */}
        <div className="header-right w-[150px] max-md:hidden">
        </div>

        {/* ── Mobile only: Project Dropdown below tabs (hidden on desktop via md:hidden) ── */}
        <div className="project-dropdown-wrapper header-mobile-dropdown md:hidden">
          {renderTrigger()}
          {renderMenu()}
        </div>
      </div>
    </header>
  );
}
