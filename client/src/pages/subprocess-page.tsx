import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Subprocess, Document, DocumentType } from "@shared/schema";
import Layout from "@/components/layout";
import DocumentList from "@/components/document-list";
import CommentsModal from "@/components/comments-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";

export default function SubprocessPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("manuals");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Fetch subprocess details
  const { data: subprocess, isLoading: subprocessLoading } = useQuery<Subprocess>({
    queryKey: [`/api/subprocesses/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch process details for subprocess's parent process
  const { data: process, isLoading: processLoading } = useQuery<any>({
    queryKey: [`/api/processes/${subprocess?.processId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!subprocess?.processId,
  });
  
  // Fetch documents for each type
  const { data: manuals, isLoading: manualsLoading } = useQuery<Document[]>({
    queryKey: [`/api/documents?subprocessId=${id}&type=${DocumentType.MANUAL}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });
  
  const { data: sops, isLoading: sopsLoading } = useQuery<Document[]>({
    queryKey: [`/api/documents?subprocessId=${id}&type=${DocumentType.SOP}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });
  
  const { data: templates, isLoading: templatesLoading } = useQuery<Document[]>({
    queryKey: [`/api/documents?subprocessId=${id}&type=${DocumentType.TEMPLATE}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });
  
  const openCommentModal = (document: Document) => {
    setSelectedDocument(document);
    setCommentModalOpen(true);
  };
  
  return (
    <Layout>
      <div className="fade-in">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Mapa de Procesos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {processLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <BreadcrumbLink 
                href={`/process/${process?.id}`}
              >
                {process?.name}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          <BreadcrumbItem>
            <span>{subprocess?.name || <Skeleton className="h-4 w-20" />}</span>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex items-center mb-6 mt-4">
          <h1 className="text-2xl font-montserrat font-bold text-secondary">
            {subprocessLoading ? <Skeleton className="h-8 w-64" /> : subprocess?.name}
          </h1>
        </div>
        
        <Tabs defaultValue="manuals" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="manuals" className="flex items-center gap-1">
              <span className="i-book-2-line"></span>
              Manuales
            </TabsTrigger>
            <TabsTrigger value="sops" className="flex items-center gap-1">
              <span className="i-file-list-line"></span>
              SOPs
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1">
              <span className="i-file-paper-line"></span>
              Plantillas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manuals">
            <DocumentList
              documents={manuals || []}
              isLoading={manualsLoading}
              type={DocumentType.MANUAL}
              onOpenComments={openCommentModal}
              iconClass="i-file-text-line text-primary"
            />
          </TabsContent>
          
          <TabsContent value="sops">
            <DocumentList
              documents={sops || []}
              isLoading={sopsLoading}
              type={DocumentType.SOP}
              onOpenComments={openCommentModal}
              iconClass="i-file-list-line text-blue-600"
            />
          </TabsContent>
          
          <TabsContent value="templates">
            <DocumentList
              documents={templates || []}
              isLoading={templatesLoading}
              type={DocumentType.TEMPLATE}
              onOpenComments={openCommentModal}
              iconClass="i-file-paper-line text-secondary"
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Comments Modal */}
      <CommentsModal
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
        document={selectedDocument}
      />
    </Layout>
  );
}
