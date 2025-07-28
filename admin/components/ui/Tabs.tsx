import React, { useState, ReactNode, Children, isValidElement, ReactElement } from 'react';

interface TabProps {
  label: string;
  children: ReactNode;
}

interface TabsProps {
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>;

const Tabs: React.FC<TabsProps> & { Tab: React.FC<TabProps> } = ({ children }) => {
  const tabs = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  type TabElement = ReactElement<{ label: string; children: React.ReactNode }>;

  return (
    <div>
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab, idx) =>
          React.isValidElement(tab) ? (
            <button
              key={(tab as TabElement).props.label}
              className={`pb-2 px-2 font-medium border-b-2 transition-colors ${active === idx ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
              onClick={() => setActive(idx)}
            >
              {(tab as TabElement).props.label}
            </button>
          ) : null
        )}
      </div>
      <div>{React.isValidElement(tabs[active]) ? (tabs[active] as TabElement).props.children : null}</div>
    </div>
  );
};

Tabs.Tab = Tab;

export { Tabs }; 