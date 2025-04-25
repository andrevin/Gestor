import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Process, Subprocess, InsertSubprocess } from "@shared/schema";
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
import { Skeleton } from "@/components/ui/skeleton";
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

// Schema for subprocess form
const subprocessSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  processId: z.number({
    required_error: "Seleccione un proceso",
    invalid_type_error: "Seleccione un proceso válido"
  }),
});

type SubprocessFormValues = z.infer<typeof subprocessSchema>;

export default function SubprocessTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedSubprocess, setSelectedSubprocess] = useState<Subprocess | null>(null);

  // Fetch all processes for the dropdown
  const { data: processes } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch subprocesses with optional process filter
  const { data: subprocesses, isLoading, error } = useQuery<Subprocess[]>({
    queryKey: selectedProcess 
      ? [`/api/subprocesses?processId=${selectedProcess}`] 
      : ["/api/subprocesses"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create form
  const createForm = useForm<SubprocessFormValues>({
    resolver: zodResolver(subprocessSchema),
    defaultValues: {
      name: "",
      processId: undefined as unknown as number,
    },
  });

  // Edit form
  const editForm = useForm<SubprocessFormValues>({
    resolver: zodResolver(subprocessSchema),
    defaultValues: {
      name: "",
      processId: undefined as unknown as number,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertSubprocess) => {
      const res = await apiRequest("POST", "/api/subprocesses", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: selectedProcess 
          ? [`/api/subprocesses?processId=${selectedProcess}`] 
          : ["/api/subprocesses"]
      });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast({
        title: "Subproceso creado",
        description: "El subproceso ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el subproceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertSubprocess }) => {
      const res = await apiRequest("PUT", `/api/subprocesses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: selectedProcess 
          ? [`/api/subprocesses?processId=${selectedProcess}`] 
          : ["/api/subprocesses"]
      });
      setIsEditModalOpen(false);
      setSelectedSubprocess(null);
      toast({
        title: "Subproceso actualizado",
        description: "El subproceso ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el subproceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subprocesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: selectedProcess 
          ? [`/api/subprocesses?processId=${selectedProcess}`] 
          : ["/api/subprocesses"]
      });
      setIsDeleteAlertOpen(false);
      setSelectedSubprocess(null);
      toast({
        title: "Subproceso eliminado",
        description: "El subproceso ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el subproceso: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: SubprocessFormValues) => {
    createMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: SubprocessFormValues) => {
    if (selectedSubprocess) {
      updateMutation.mutate({ id: selectedSubprocess.id, data });
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = () => {
    if (selectedSubprocess) {
      deleteMutation.mutate(selectedSubprocess.id);
    }
  };

  // Open edit modal with subprocess data
  const handleEdit = (subprocess: Subprocess) => {
    setSelectedSubprocess(subprocess);
    editForm.reset({
      name: subprocess.name,
      processId: subprocess.processId,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const handleDelete = (subprocess: Subprocess) => {
    setSelectedSubprocess(subprocess);
    setIsDeleteAlertOpen(true);
  };

  // Filter subprocesses by search term
  const filteredSubprocesses = subprocesses?.filter(
    (subprocess) => subprocess.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get process name by ID
  const getProcessName = (processId: number) => {
    const process = processes?.find(p => p.id === processId);
    return process ? process.name : "Desconocido";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary">Gestión de Subprocesos</h3>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo Subproceso
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex mb-4 gap-2">
            <Select 
              value={selectedProcess ? String(selectedProcess) : ""} 
              onValueChange={(value) => setSelectedProcess(value ? Number(value) : null)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por proceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los procesos</SelectItem>
                {processes?.map((process) => (
                  <SelectItem key={process.id} value={String(process.id)}>
                    {process.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar subprocesos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center p-4 text-destructive gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error al cargar los subprocesos</span>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredSubprocesses && filteredSubprocesses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Proceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubprocesses.map((subprocess) => (
                  <TableRow key={subprocess.id}>
                    <TableCell className="font-medium">{subprocess.name}</TableCell>
                    <TableCell>{getProcessName(subprocess.processId)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subprocess)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subprocess)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm 
                ? "No se encontraron subprocesos que coincidan con la búsqueda." 
                : selectedProcess 
                  ? "No hay subprocesos registrados para este proceso." 
                  : "No hay subprocesos registrados."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subprocess Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Subproceso</DialogTitle>
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
                      <Input placeholder="Nombre del subproceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="processId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proceso</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proceso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {processes?.map((process) => (
                          <SelectItem key={process.id} value={String(process.id)}>
                            {process.name}
                          </SelectItem>
                        ))}
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
                    "Crear Subproceso"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Subprocess Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subproceso</DialogTitle>
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
                      <Input placeholder="Nombre del subproceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="processId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proceso</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proceso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {processes?.map((process) => (
                          <SelectItem key={process.id} value={String(process.id)}>
                            {process.name}
                          </SelectItem>
                        ))}
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
              Esta acción eliminará permanentemente el subproceso "{selectedSubprocess?.name}".
              Todos los documentos asociados también podrían verse afectados.
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
