import React from 'react';
import { motion } from 'framer-motion';

interface TabsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  onValueChange,
  children,
}) => {
  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            defaultValue,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`bg-slate-100 dark:bg-slate-800 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  return (
    <button
      onClick={() => {}}
      className="relative w-full px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 [&[data-state=active]]:text-primary-700 dark:[&[data-state=active]]:text-primary-300"
    >
      {children}
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-white dark:bg-slate-700 rounded"
        transition={{ type: "spring", duration: 0.5 }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};