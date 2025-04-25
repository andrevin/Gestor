import { useState } from "react";
import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProcessTab from "@/components/admin/process-tab";
import SubprocessTab from "@/components/admin/subprocess-tab";
import DocumentTab from "@/components/admin/document-tab";
import UserTab from "@/components/admin/user-tab";
import OtherDocsTab from "@/components/admin/other-docs-tab";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("processes");
  const { user } = useAuth();
  
  // Redirect if not an admin
  if (user && !user.isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-montserrat font-bold text-primary">Panel de Administración</h1>
        </div>
        
        <Tabs defaultValue="processes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="processes">Procesos</TabsTrigger>
            <TabsTrigger value="subprocesses">Subprocesos</TabsTrigger>
            <TabsTrigger value="documents">Documentación</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="otherDocs">Otra Documentación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="processes" className="space-y-4">
            <ProcessTab />
          </TabsContent>
          
          <TabsContent value="subprocesses" className="space-y-4">
            <SubprocessTab />
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <DocumentTab />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <UserTab />
          </TabsContent>
          
          <TabsContent value="otherDocs" className="space-y-4">
            <OtherDocsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
