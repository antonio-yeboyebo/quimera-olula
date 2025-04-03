import React from "react";
import estilos from "./tabs.module.css";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  className?: string;
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return <div>{children}</div>;
};

const Tabs: React.FC<TabsProps> = ({ children, className }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { detalleTabs } = estilos;

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className={`${detalleTabs} ${className || ""}`.trim()}>
      {" "}
      {/* Aplicar className */}
      <div className="tab-header">
        {children.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={activeTab === index ? "active" : "inactive"}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{children[activeTab]}</div>
    </div>
  );
};

export { Tab, Tabs };
