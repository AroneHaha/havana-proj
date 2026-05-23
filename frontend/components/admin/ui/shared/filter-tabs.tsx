"use client";

interface FilterTabsProps {
  tabs: Array<{
    key: string;
    label: string;
    count?: number;
    dotColor?: string;
  }>;
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1.5 pb-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? "bg-white/20 dark:bg-dark-bg/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}