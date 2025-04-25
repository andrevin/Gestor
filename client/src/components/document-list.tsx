import { Document, DocumentType } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  type: DocumentType;
  onOpenComments: (document: Document) => void;
  iconClass: string;
}

export default function DocumentList({ 
  documents, 
  isLoading, 
  type, 
  onOpenComments,
  iconClass
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-sm">
        <ul className="divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="p-4">
              <div className="flex justify-between">
                <div className="flex items-start">
                  <Skeleton className="h-6 w-6 mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex flex-wrap mt-2">
                      <Skeleton className="h-5 w-16 mr-1 mb-1 rounded-full" />
                      <Skeleton className="h-5 w-16 mr-1 mb-1 rounded-full" />
                      <Skeleton className="h-5 w-16 mr-1 mb-1 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <p className="text-secondary">No hay documentos disponibles en esta categoría.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-md shadow-sm">
      <ul className="divide-y divide-gray-200">
        {documents.map((document) => (
          <li key={document.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <Link href={`/document/${document.id}`} className="flex-1">
                <div className="flex items-start">
                  <span className={`${iconClass} text-lg mt-1 mr-3`}></span>
                  <div>
                    <h3 className="font-medium text-secondary">{document.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Versión: <span>{document.version}</span> | 
                      Actualizado: <span>
                        {document.approvalDate ? 
                          format(new Date(document.approvalDate), 'dd/MM/yyyy', { locale: es }) : 
                          'N/A'
                        }
                      </span> | 
                      Aprobado por: <span>{document.approvers}</span>
                    </p>
                    <div className="flex flex-wrap mt-2">
                      {document.keywords && document.keywords.length > 0 && 
                        document.keywords.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs mr-1 mb-1"
                          >
                            {keyword}
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </Link>
              <div className="flex items-start space-x-2">
                <Button variant="ghost" size="icon" className="text-secondary hover:text-primary">
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-secondary hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenComments(document);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
