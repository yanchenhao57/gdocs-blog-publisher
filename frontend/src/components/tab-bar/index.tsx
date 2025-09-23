import React from 'react';
import { Settings, BarChart3, CheckCircle, FileText, LucideIcon } from 'lucide-react';
import styles from './index.module.css';

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabBarProps {
  currentStep: string;
  completedSteps: Set<string>;
  onTabClick: (stepId: string) => void;
}

const defaultSteps: TabItem[] = [
  { id: "input", label: "Configure", icon: Settings },
  { id: "analysis", label: "Analyze", icon: BarChart3 },
  { id: "suggestions", label: "Review", icon: CheckCircle },
  { id: "output", label: "Export", icon: FileText },
];

export default function TabBar({ currentStep, completedSteps, onTabClick }: TabBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <div className={styles.tabList}>
          {defaultSteps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isClickable = completedSteps.has(step.id);
            
            return (
              <div key={step.id} className={styles.tabItem}>
                <button
                  onClick={() => isClickable ? onTabClick(step.id) : undefined}
                  disabled={!isClickable}
                  className={`${styles.tabButton} ${
                    isActive
                      ? styles.tabButtonActive
                      : isClickable
                      ? styles.tabButtonClickable
                      : styles.tabButtonDisabled
                  }`}
                >
                  <Icon className={styles.tabIcon} />
                </button>

                <div className={styles.tooltip}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}