import { useQuery } from "@tanstack/react-query";
import { Process, ProcessCategory } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import Layout from "@/components/layout";
import ProcessCard from "@/components/process-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const { data: processes, isLoading, error } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Separate processes by category
  const strategicProcesses = processes?.filter(p => p.category === ProcessCategory.STRATEGIC) || [];
  const operationalProcesses = processes?.filter(p => p.category === ProcessCategory.OPERATIONAL) || [];
  const supportProcesses = processes?.filter(p => p.category === ProcessCategory.SUPPORT) || [];

  return (
    <Layout>
      <div id="process-map-view" className="fade-in">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-secondary">Mapa de Procesos</h1>
        
        {/* Strategic Processes */}
        <div className="mb-8">
          <h2 className="text-lg font-montserrat font-semibold text-primary mb-3 flex items-center">
            <span className="i-bar-chart-grouped-line mr-2"></span>
            Procesos Estratégicos
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-md shadow-sm p-4">
                  <div className="flex items-start">
                    <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategicProcesses.map((process) => (
                <ProcessCard 
                  key={process.id} 
                  process={process} 
                  colorClass="border-primary" 
                  bgClass="bg-strategic" 
                  iconColorClass="text-primary"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Operational Processes */}
        <div className="mb-8">
          <h2 className="text-lg font-montserrat font-semibold text-blue-600 mb-3 flex items-center">
            <span className="i-recycle-line mr-2"></span>
            Procesos Operativos
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-md shadow-sm p-4">
                  <div className="flex items-start">
                    <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operationalProcesses.map((process) => (
                <ProcessCard 
                  key={process.id} 
                  process={process} 
                  colorClass="border-blue-500" 
                  bgClass="bg-operational" 
                  iconColorClass="text-blue-600"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Support Processes */}
        <div className="mb-8">
          <h2 className="text-lg font-montserrat font-semibold text-secondary mb-3 flex items-center">
            <span className="i-service-line mr-2"></span>
            Procesos de Soporte
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-md shadow-sm p-4">
                  <div className="flex items-start">
                    <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportProcesses.map((process) => (
                <ProcessCard 
                  key={process.id} 
                  process={process} 
                  colorClass="border-secondary" 
                  bgClass="bg-support" 
                  iconColorClass="text-secondary"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Other Documentation (Admin Only) */}
        {user?.isAdmin && (
          <div id="other-documentation-section">
            <h2 className="text-lg font-montserrat font-semibold text-secondary mb-3 flex items-center">
              <span className="i-file-list-3-line mr-2"></span>
              Otra Documentación
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-md shadow-sm p-4">
                    <div className="flex items-start">
                      <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* This would be filled with other document types from API */}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
