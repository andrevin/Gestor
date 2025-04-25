import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Process, InsertProcess, ProcessCategory } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getIconComponent } from "@/lib/icons";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Loader2,
  Search,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Icon options for processes
const iconOptions = [
  "presentation-line",
  "funds-line",
  "truck-line",
  "store-2-line",
  "hammer-line",
  "user-settings-line",
  "computer-line",
  "safe-line",
  "bar-chart-grouped-line",
  "recycle-line",
  "service-line"
];

// Schema for process form
const processSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  category: z.enum(["strategic", "operational", "support"], {
    message: "Seleccione una categoría válida"
  }),
  icon: z.string().min(1, { message: "El ícono es obligatorio" }),
});

type ProcessFormValues = z.infer<typeof processSchema>;

export default function ProcessTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  // Fetch all processes
  const { data: processes, isLoading, error } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create form
  const createForm = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      category: undefined,
      icon: "",
    },
  });

  // Edit form
  const editForm = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      category: undefined,
      icon: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertProcess) => {
      const res = await apiRequest("POST", "/api/processes", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast({
        title: "Proceso creado",
        description: "El proceso ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el proceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertProcess }) => {
      const res = await apiRequest("PUT", `/api/processes/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsEditModalOpen(false);
      setSelectedProcess(null);
      toast({
        title: "Proceso actualizado",
        description: "El proceso ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el proceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/processes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      setIsDeleteAlertOpen(false);
      setSelectedProcess(null);
      toast({
        title: "Proceso eliminado",
        description: "El proceso ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el proceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: ProcessFormValues) => {
    createMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: ProcessFormValues) => {
    if (selectedProcess) {
      updateMutation.mutate({ id: selectedProcess.id, data });
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = () => {
    if (selectedProcess) {
      deleteMutation.mutate(selectedProcess.id);
    }
  };

  // Open edit modal with process data
  const handleEdit = (process: Process) => {
    setSelectedProcess(process);
    editForm.reset({
      name: process.name,
      category: process.category as any,
      icon: process.icon,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const handleDelete = (process: Process) => {
    setSelectedProcess(process);
    setIsDeleteAlertOpen(true);
  };

  // Filter processes by search term
  const filteredProcesses = processes?.filter(
    (process) => process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case ProcessCategory.STRATEGIC:
        return <Badge className="bg-strategic text-primary">Estratégico</Badge>;
      case ProcessCategory.OPERATIONAL:
        return <Badge className="bg-operational text-blue-600">Operativo</Badge>;
      case ProcessCategory.SUPPORT:
        return <Badge className="bg-support text-secondary">Soporte</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary">Gestión de Macroprocesos</h3>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo Proceso
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procesos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center p-4 text-destructive gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error al cargar los procesos</span>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredProcesses && filteredProcesses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ícono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => {
                  const IconComponent = getIconComponent(process.icon);
                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.name}</TableCell>
                      <TableCell>{getCategoryBadge(process.category)}</TableCell>
                      <TableCell>
                        {IconComponent && (
                          <IconComponent className="h-5 w-5 text-primary" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(process)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(process)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm ? "No se encontraron procesos que coincidan con la búsqueda." : "No hay procesos registrados."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Process Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proceso</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del proceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strategic">Estratégico</SelectItem>
                        <SelectItem value="operational">Operativo</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícono</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ícono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((icon) => {
                          const IconComponent = getIconComponent(icon);
                          return (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center">
                                {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                                {icon}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Proceso"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Process Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proceso</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del proceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strategic">Estratégico</SelectItem>
                        <SelectItem value="operational">Operativo</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícono</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ícono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((icon) => {
                          const IconComponent = getIconComponent(icon);
                          return (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center">
                                {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                                {icon}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el proceso "{selectedProcess?.name}".
              Todos los subprocesos y documentos asociados también podrían verse afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
