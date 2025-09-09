'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout, DEFAULT_DASHBOARD_LAYOUT, DASHBOARD_PRESETS } from '@/types/dashboard';

const STORAGE_KEY = 'crypto-dashboard-layout';

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLayout = JSON.parse(stored) as DashboardLayout;
        setLayout(parsedLayout);
      }
    } catch (error) {
      console.warn('Failed to load dashboard layout from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save layout to localStorage whenever it changes
  const saveLayout = (newLayout: DashboardLayout) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
      setLayout(newLayout);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  };

  // Update section order (for drag & drop)
  const reorderSections = (activeId: string, overId: string) => {
    const sections = [...layout.sections];
    const activeIndex = sections.findIndex(s => s.id === activeId);
    const overIndex = sections.findIndex(s => s.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      // Swap the order values
      const temp = sections[activeIndex].order;
      sections[activeIndex].order = sections[overIndex].order;
      sections[overIndex].order = temp;

      // Re-sort sections by order
      sections.sort((a, b) => a.order - b.order);

      const newLayout: DashboardLayout = {
        sections,
        lastModified: new Date().toISOString()
      };

      saveLayout(newLayout);
    }
  };

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    const sections = layout.sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );

    const newLayout: DashboardLayout = {
      sections,
      lastModified: new Date().toISOString()
    };

    saveLayout(newLayout);
  };

  // Update section size
  const updateSectionSize = (sectionId: string, size: 'full' | 'half' | 'quarter' | 'three-quarters') => {
    const sections = layout.sections.map(section =>
      section.id === sectionId
        ? { ...section, size }
        : section
    );

    const newLayout: DashboardLayout = {
      sections,
      lastModified: new Date().toISOString()
    };

    saveLayout(newLayout);
  };

  // Reset to default layout
  const resetToDefault = () => {
    saveLayout(DEFAULT_DASHBOARD_LAYOUT);
  };

  // Apply preset layout
  const applyPreset = (presetName: string) => {
    const preset = DASHBOARD_PRESETS[presetName];
    if (preset) {
      saveLayout(preset);
    }
  };

  // Get enabled sections sorted by order
  const enabledSections = layout.sections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  return {
    layout,
    enabledSections,
    isLoading,
    reorderSections,
    toggleSection,
    updateSectionSize,
    resetToDefault,
    applyPreset
  };
}