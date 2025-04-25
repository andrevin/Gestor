import { useState, ReactNode } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main 
          className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
            sidebarVisible ? 'md:w-3/4' : 'md:w-full'
          }`}
        >
          {children}
        </main>
        
        {/* Sidebar */}
        <Sidebar 
          visible={sidebarVisible} 
          onToggle={toggleSidebar}
        />
      </div>
    </div>
  );
}
