import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User, InsertUser } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Plus, 
  Loader2,
  Search,
  AlertCircle,
  User as UserIcon,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Schema for user form
const userSchema = z.object({
  username: z.string().min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  fullName: z.string().min(1, { message: "El nombre completo es obligatorio" }),
  isAdmin: z.boolean().default(false),
});

// Schema for KPI iframe URL form
const kpiConfigSchema = z.object({
  kpiIframeUrl: z.string().default("")
});

type UserFormValues = z.infer<typeof userSchema>;
type KpiConfigFormValues = z.infer<typeof kpiConfigSchema>;

export default function UserTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isKpiConfigModalOpen, setIsKpiConfigModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [kpiUrlInput, setKpiUrlInput] = useState("");

  // Fetch all users
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create form
  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      isAdmin: false,
    },
  });

  // KPI Config form
  const kpiConfigForm = useForm<KpiConfigFormValues>({
    resolver: zodResolver(kpiConfigSchema),
    defaultValues: {
      kpiIframeUrl: ""
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update KPI config mutation
  const updateKpiConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/users/${id}/kpi-config`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsKpiConfigModalOpen(false);
      setSelectedUser(null);
      toast({
        title: "Configuración actualizada",
        description: "La configuración de KPIs ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: UserFormValues) => {
    createMutation.mutate({
      ...data,
      kpiIframeUrl: ""
    });
  };

  // Handle KPI config form submission
  const onKpiConfigSubmit = (data: KpiConfigFormValues) => {
    if (selectedUser) {
      updateKpiConfigMutation.mutate({ 
        id: selectedUser.id, 
        data: data.kpiIframeUrl 
      });
    }
  };

  // Open KPI config modal with user data
  const handleConfigureKpi = (user: User) => {
    setSelectedUser(user);
    
    // Set iframe URL from user data
    kpiConfigForm.reset({
      kpiIframeUrl: user.kpiIframeUrl || ""
    });
    
    setIsKpiConfigModalOpen(true);
  };

  // Filter users by search term
  const filteredUsers = users?.filter(
    (user) => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary">Gestión de Usuarios</h3>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center p-4 text-destructive gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error al cargar los usuarios</span>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>KPIs Configurados</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-1 rounded-full">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge className="bg-primary/10 text-primary">Admin</Badge>
                      ) : (
                        <Badge variant="outline">Usuario</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.kpiIframeUrl ? (
                        <Badge variant="outline">
                          Configurado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted/50">
                          Sin configurar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConfigureKpi(user)}
                        title="Configurar KPIs"
                      >
                        <Settings className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda." : "No hay usuarios registrados."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Usuario Administrador
                      </FormLabel>
                      <FormDescription>
                        Los administradores pueden gestionar procesos, documentos y usuarios.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Usuario"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* KPI Config Modal */}
      <Dialog open={isKpiConfigModalOpen} onOpenChange={setIsKpiConfigModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar KPIs para {selectedUser?.fullName}</DialogTitle>
          </DialogHeader>
          <Form {...kpiConfigForm}>
            <form onSubmit={kpiConfigForm.handleSubmit(onKpiConfigSubmit)} className="space-y-4">
              <FormField
                control={kpiConfigForm.control}
                name="kpiIframeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Panel de KPI</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://app.powerbi.com/..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ingrese la URL del panel de control de PowerBI o cualquier otra herramienta que proporcione un iframe para visualización.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={updateKpiConfigMutation.isPending}
                >
                  {updateKpiConfigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Configuración"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
