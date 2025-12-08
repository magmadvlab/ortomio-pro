
import React from 'react';
import { Tab } from '../types';
import { Home, Sprout, ClipboardList, Stethoscope, ShoppingBasket, Wifi } from 'lucide-react';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { tab: Tab.DASHBOARD, label: 'Home', icon: Home },
    { tab: Tab.PLANNER, label: 'Semina', icon: Sprout },
    { tab: Tab.JOURNAL, label: 'Diario', icon: ClipboardList },
    { tab: Tab.ADVICE, label: 'Cura', icon: Stethoscope },
    { tab: Tab.HARVEST, label: 'Raccolto', icon: ShoppingBasket },
    { tab: Tab.SMART, label: 'Smart', icon: Wifi },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 shadow-lg pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-green-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
