'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { DraggableSection } from './draggable-section';
import { Settings, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface CustomizableDashboardProps {
  summaryCards: React.ReactNode;
  performanceChart: React.ReactNode;
  portfolioList: React.ReactNode;
  topCryptos: React.ReactNode;
}

export function CustomizableDashboard({
  summaryCards,
  performanceChart,
  portfolioList,
  topCryptos
}: CustomizableDashboardProps) {
  const {
    enabledSections,
    isLoading,
    reorderSections,
    toggleSection,
    updateSectionSize,
    resetToDefault,
    layout
  } = useDashboardLayout();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      reorderSections(active.id as string, over?.id as string);
    }

    setActiveId(null);
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'summary-cards':
        return summaryCards;
      case 'performance-chart':
        return performanceChart;
      case 'portfolio-list':
        return portfolioList;
      case 'top-cryptos':
        return topCryptos;
      default:
        return <div>Unknown section: {sectionId}</div>;
    }
  };

  const activeSectionForOverlay = layout.sections.find(s => s.id === activeId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dashboard Header with Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your cryptocurrency investments</p>
        </div>
        
        {/* Dashboard Controls with Glassmorphism */}
        <div className="flex items-center space-x-2">
          {isCustomizing && (
            <>
              <button
                onClick={resetToDefault}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-600/50 rounded-lg shadow-lg hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all backdrop-blur-md backdrop-saturate-150"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-3 py-2 rounded-lg shadow border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-md backdrop-saturate-150 max-w-48">
                Drag to reorder • Click eye to hide/show
              </div>
            </>
          )}
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-all ${
              isCustomizing
                ? 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white hover:from-blue-600/90 hover:to-blue-700/90 border border-blue-400/50 backdrop-blur-sm'
                : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-800/90 backdrop-blur-md backdrop-saturate-150'
            }`}
          >
            <Settings className="w-4 h-4 mr-1" />
            {isCustomizing ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={enabledSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex gap-4">
            {/* Main content area - left side */}
            <div className="flex-1 space-y-4">
                {(isCustomizing ? layout.sections : enabledSections)
                  .filter(section => section.component !== 'top-cryptos')
                  .map((section) => (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    isDragging={activeId === section.id}
                    isCustomizing={isCustomizing}
                    onToggleVisibility={toggleSection}
                    onResizeSection={updateSectionSize}
                  >
                    {renderSectionContent(section.id)}
                  </DraggableSection>
                ))}
            </div>
            
            {/* Crypto list sidebar - right side (fixed, not draggable) */}
            {(isCustomizing ? layout.sections : enabledSections)
              .filter(section => section.component === 'top-cryptos')
              .map((section) => (
              <div key={section.id} className="w-80 flex-shrink-0">
                <div className="relative">
                  {isCustomizing && (
                    <div className="absolute -top-3 left-2 z-10 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-md backdrop-saturate-150">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {section.title} (Fixed Sidebar)
                      </span>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded transition-colors"
                      >
                        {section.enabled ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                  {renderSectionContent(section.id)}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeSectionForOverlay ? (
            <DraggableSection
              section={activeSectionForOverlay}
              isDragging={true}
            >
              {renderSectionContent(activeId)}
            </DraggableSection>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}