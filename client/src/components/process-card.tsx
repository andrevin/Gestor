import { Link } from "wouter";
import { Process } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { getIconComponent } from "@/lib/icons";

interface ProcessCardProps {
  process: Process;
  colorClass: string;
  bgClass: string;
  iconColorClass: string;
}

export default function ProcessCard({ 
  process, 
  colorClass, 
  bgClass, 
  iconColorClass 
}: ProcessCardProps) {
  // Get subprocess count
  const { data: subprocesses } = useQuery<any[]>({
    queryKey: [`/api/subprocesses?processId=${process.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const subprocessCount = subprocesses?.length || 0;
  const IconComponent = getIconComponent(process.icon);
  
  return (
    <Link href={`/process/${process.id}`}>
      <div 
        className={`process-card bg-white border-l-4 ${colorClass} rounded-md shadow-sm p-4 cursor-pointer`}
      >
        <div className="flex items-start">
          <div className={`${bgClass} p-2 rounded-lg mr-3`}>
            {IconComponent && (
              <IconComponent className={`text-xl ${iconColorClass}`} />
            )}
          </div>
          <div>
            <h3 className="font-medium text-secondary">{process.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span>{subprocessCount}</span> subprocesos
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
