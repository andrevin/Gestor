import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Document, Subprocess, DocumentType } from "@shared/schema";
import Layout from "@/components/layout";
import CommentsModal from "@/components/comments-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Download, MessageSquare, Calendar, UserCheck, Tag, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  
  // Fetch document details
  const { data: document, isLoading: documentLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch subprocess details
  const { data: subprocess, isLoading: subprocessLoading } = useQuery<Subprocess>({
    queryKey: [`/api/subprocesses/${document?.subprocessId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!document?.subprocessId,
  });
  
  // Fetch process details
  const { data: process, isLoading: processLoading } = useQuery<any>({
    queryKey: [`/api/processes/${subprocess?.processId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!subprocess?.processId,
  });
  
  const isLoading = documentLoading || subprocessLoading || processLoading;
  
  const getDocumentTypeLabel = (type?: string) => {
    switch (type) {
      case DocumentType.MANUAL: return 'Manual';
      case DocumentType.SOP: return 'SOP';
      case DocumentType.TEMPLATE: return 'Plantilla';
      default: return 'Documento';
    }
  };
  
  const getDocumentIcon = (type?: string) => {
    switch (type) {
      case DocumentType.MANUAL: return "i-book-2-line text-primary";
      case DocumentType.SOP: return "i-file-list-line text-blue-600";
      case DocumentType.TEMPLATE: return "i-file-paper-line text-secondary";
      default: return "i-file-text-line text-secondary";
    }
  };
  
  return (
    <Layout>
      <div className="fade-in">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Mapa de Procesos</BreadcrumbLink>
          </BreadcrumbItem>
          {process && (
            <BreadcrumbItem>
              <BreadcrumbLink href={`/process/${process.id}`}>{process.name}</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {subprocess && (
            <BreadcrumbItem>
              <BreadcrumbLink href={`/subprocess/${subprocess.id}`}>{subprocess.name}</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem>
            <span>{document?.name || 'Documento'}</span>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          ) : document ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getDocumentIcon(document.type)}></span>
                    <Badge variant="outline">{getDocumentTypeLabel(document.type)}</Badge>
                    <Badge variant="secondary">v{document.version}</Badge>
                  </div>
                  <h1 className="text-2xl font-montserrat font-bold text-secondary">{document.name}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setCommentModalOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Comentarios
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Fecha de aprobación
                      </div>
                      <div className="font-medium">
                        {document.approvalDate ? 
                          format(new Date(document.approvalDate), 'dd/MM/yyyy', { locale: es }) : 
                          'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Aprobado por
                      </div>
                      <div className="font-medium">{document.approvers}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        Tipo
                      </div>
                      <div className="font-medium">{getDocumentTypeLabel(document.type)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        Palabras clave
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {document.keywords && document.keywords.length > 0 ? 
                          document.keywords.map((keyword, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          )) : 
                          <span className="text-muted-foreground text-sm">Sin palabras clave</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  {document.description && (
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Descripción</div>
                      <p>{document.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Contenido</div>
                    <div className="prose max-w-none border rounded-md p-4 bg-white">
                      {document.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary">Documento no encontrado.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments Modal */}
      <CommentsModal
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
        document={document || null}
      />
    </Layout>
  );
}
