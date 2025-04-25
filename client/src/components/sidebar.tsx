import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  visible: boolean;
  onToggle: () => void;
}

export default function Sidebar({ visible, onToggle }: SidebarProps) {
  const { user } = useAuth();
  
  return (
    <aside 
      className={`bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
        visible ? 'w-1/4' : 'w-0'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-montserrat font-semibold text-secondary">Indicadores (KPIs)</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className={`transform transition-transform duration-300 ${visible ? '' : 'rotate-180'}`}
          >
            <ChevronRight className="h-5 w-5 text-secondary" />
          </Button>
        </div>
        
        {visible && (
          <div className="space-y-4">
            {user?.kpiIframeUrl ? (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-secondary mb-2">Panel de Control</h3>
                <div className="bg-white rounded border border-gray-200 overflow-hidden" style={{ height: '60vh' }}>
                  <iframe 
                    src={user.kpiIframeUrl} 
                    className="w-full h-full"
                    title="KPI Dashboard"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col items-center justify-center text-center h-52">
                <div className="text-gray-400 mb-2">
                  <span className="i-pie-chart-line text-3xl mb-2 block"></span>
                </div>
                <p className="text-sm text-gray-500">No hay panel de KPI configurado.</p>
                <p className="text-xs text-gray-400 mt-1">Contacte a un administrador para configurar su panel.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
