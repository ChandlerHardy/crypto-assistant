'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { DashboardSection } from '@/types/dashboard';

interface DraggableSectionProps {
  section: DashboardSection;
  isDragging?: boolean;
  isCustomizing?: boolean;
  onToggleVisibility?: (sectionId: string) => void;
  children: React.ReactNode;
}

export function DraggableSection({ 
  section, 
  isDragging = false,
  isCustomizing = false,
  onToggleVisibility,
  children 
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: section.id,
    disabled: !isCustomizing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };


  if (!section.enabled && !isCustomizing) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 w-full ${
        isCustomizing ? 'ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg' : ''
      }`}
      {...attributes}
    >
      {isCustomizing && (
        <div className="absolute -top-3 left-2 z-10 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-md backdrop-saturate-150">
          <button
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded transition-colors"
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {section.title}
          </span>
          <button
            onClick={() => onToggleVisibility?.(section.id)}
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
      
      <div className={`transition-opacity duration-200 ${
        isCustomizing && !section.enabled ? 'opacity-30' : 'opacity-100'
      }`}>
        {children}
      </div>
    </div>
  );
}