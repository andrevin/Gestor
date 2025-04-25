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
  
  // In a real implementation, these would come from user.kpiConfig
  const kpis = [
    { id: 1, title: "Índice de Calidad", lastUpdate: "15/05/2023", url: "" },
    { id: 2, title: "Producción Mensual", lastUpdate: "18/05/2023", url: "" },
    { id: 3, title: "Eficiencia Operativa", lastUpdate: "12/05/2023", url: "" },
  ];
  
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
            {kpis.map((kpi) => (
              <div key={kpi.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-secondary mb-2">{kpi.title}</h3>
                <div className="h-52 bg-white p-2 rounded border border-gray-200 flex items-center justify-center">
                  {/* Power BI Embed would go here */}
                  <div className="text-center text-gray-400">
                    <span className="i-pie-chart-line text-3xl mb-2 block"></span>
                    <p className="text-xs">Informe de Power BI</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Última actualización: <span>{kpi.lastUpdate}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
