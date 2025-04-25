import { Link } from "wouter";
import { Subprocess, DocumentType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface SubprocessCardProps {
  subprocess: Subprocess;
}

export default function SubprocessCard({ subprocess }: SubprocessCardProps) {
  // Get document counts by type
  const { data: manuals } = useQuery<any[]>({
    queryKey: [`/api/documents?subprocessId=${subprocess.id}&type=${DocumentType.MANUAL}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: sops } = useQuery<any[]>({
    queryKey: [`/api/documents?subprocessId=${subprocess.id}&type=${DocumentType.SOP}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: templates } = useQuery<any[]>({
    queryKey: [`/api/documents?subprocessId=${subprocess.id}&type=${DocumentType.TEMPLATE}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const manualCount = manuals?.length || 0;
  const sopCount = sops?.length || 0;
  const templateCount = templates?.length || 0;
  
  return (
    <Link href={`/subprocess/${subprocess.id}`}>
      <div className="subprocess-card bg-white rounded-md shadow-sm p-4 cursor-pointer">
        <h3 className="font-medium text-secondary mb-3">{subprocess.name}</h3>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <span className="i-book-2-line mr-1 text-primary"></span>
            <span>{manualCount}</span> manuales
          </div>
          <div className="flex items-center">
            <span className="i-file-list-line mr-1 text-blue-500"></span>
            <span>{sopCount}</span> SOPs
          </div>
          <div className="flex items-center">
            <span className="i-file-paper-line mr-1 text-gray-500"></span>
            <span>{templateCount}</span> plantillas
          </div>
        </div>
      </div>
    </Link>
  );
}
