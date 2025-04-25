import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Process, Subprocess } from "@shared/schema";
import Layout from "@/components/layout";
import SubprocessCard from "@/components/subprocess-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";

export default function ProcessPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  
  const { data: process, isLoading: processLoading } = useQuery<Process>({
    queryKey: [`/api/processes/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: subprocesses, isLoading: subprocessLoading } = useQuery<Subprocess[]>({
    queryKey: [`/api/subprocesses?processId=${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });
  
  const isLoading = processLoading || subprocessLoading;
  
  // Determine the process category for styling
  const getCategoryDetails = (category?: string) => {
    switch (category) {
      case 'strategic':
        return { text: 'Proceso Estratégico', bgClass: 'bg-strategic text-primary' };
      case 'operational':
        return { text: 'Proceso Operativo', bgClass: 'bg-operational text-blue-600' };
      case 'support':
        return { text: 'Proceso de Soporte', bgClass: 'bg-support text-secondary' };
      default:
        return { text: 'Proceso', bgClass: 'bg-gray-100 text-secondary' };
    }
  };
  
  const categoryDetails = getCategoryDetails(process?.category);
  
  return (
    <Layout>
      <div className="fade-in">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Mapa de Procesos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <span>{process?.name || 'Cargando...'}</span>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex items-center justify-between mb-6 mt-4">
          <h1 className="text-2xl font-montserrat font-bold text-secondary">
            {processLoading ? <Skeleton className="h-8 w-64" /> : process?.name}
          </h1>
          <div className="text-sm">
            {processLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <span className={`px-2 py-1 rounded ${categoryDetails.bgClass}`}>
                {categoryDetails.text}
              </span>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-md shadow-sm p-4">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : subprocesses && subprocesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subprocesses.map((subprocess) => (
              <SubprocessCard key={subprocess.id} subprocess={subprocess} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-md shadow-sm">
            <p className="text-secondary">No hay subprocesos registrados para este proceso.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
