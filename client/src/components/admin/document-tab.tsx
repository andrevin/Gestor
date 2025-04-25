import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Subprocess, 
  Process, 
  Document, 
  InsertDocument, 
  DocumentType, 
  OtherDocType 
} from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Loader2,
  Search,
  AlertCircle,
  CalendarIcon
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

// Schema for document form
const documentSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  type: z.enum(["manual", "sop", "template", "other"], {
    message: "Seleccione un tipo válido"
  }),
  subprocessId: z.number().nullable().optional(),
  otherDocTypeId: z.number().nullable().optional(),
  version: z.string().default("1.0"),
  description: z.string().optional(),
  content: z.string().min(1, { message: "El contenido es obligatorio" }),
  approvalDate: z.date({
    required_error: "La fecha de aprobación es obligatoria",
  }),
  approvers: z.string().min(1, { message: "Los aprobadores son obligatorios" }),
  keywords: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function DocumentTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [selectedSubprocess, setSelectedSubprocess] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | "">("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  // Fetch all processes
  const { data: processes } = useQuery<Process[]>({
    queryKey: ["/api/processes"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch subprocesses based on selected process
  const { data: subprocesses } = useQuery<Subprocess[]>({
    queryKey: selectedProcess 
      ? [`/api/subprocesses?processId=${selectedProcess}`] 
      : ["/api/subprocesses"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedProcess,
  });

  // Fetch other document types
  const { data: otherDocTypes } = useQuery<OtherDocType[]>({
    queryKey: ["/api/other-doc-types"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch documents with filters
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: [
      "/api/documents",
      selectedSubprocess ? `subprocessId=${selectedSubprocess}` : "",
      selectedType ? `type=${selectedType}` : "",
    ],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create form
  const createForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      type: undefined as unknown as DocumentType,
      subprocessId: null,
      otherDocTypeId: null,
      version: "1.0",
      description: "",
      content: "",
      approvalDate: new Date(),
      approvers: "",
      keywords: [],
      active: true,
    },
  });

  // Edit form
  const editForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      type: undefined as unknown as DocumentType,
      subprocessId: null,
      otherDocTypeId: null,
      version: "1.0",
      description: "",
      content: "",
      approvalDate: new Date(),
      approvers: "",
      keywords: [],
      active: true,
    },
  });

  // Watch form values to conditionally render fields
  const watchCreateType = createForm.watch("type");
  const watchEditType = editForm.watch("type");

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/documents"]
      });
      setIsCreateModalOpen(false);
      createForm.reset();
      toast({
        title: "Documento creado",
        description: "El documento ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertDocument }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/documents"]
      });
      setIsEditModalOpen(false);
      setSelectedDocument(null);
      toast({
        title: "Documento actualizado",
        description: "El documento ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/documents"]
      });
      setIsDeleteAlertOpen(false);
      setSelectedDocument(null);
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: DocumentFormValues) => {
    // Ensure the right ID is set based on document type
    if (data.type === DocumentType.OTHER) {
      if (!data.otherDocTypeId) {
        toast({
          title: "Error",
          description: "Debe seleccionar un tipo de documento",
          variant: "destructive",
        });
        return;
      }
      data.subprocessId = null;
    } else {
      if (!data.subprocessId) {
        toast({
          title: "Error", 
          description: "Debe seleccionar un subproceso",
          variant: "destructive",
        });
        return;
      }
      data.otherDocTypeId = null;
    }
    createMutation.mutate(data as InsertDocument);
  };

  // Handle edit form submission
  const onEditSubmit = (data: DocumentFormValues) => {
    if (selectedDocument) {
      // Ensure the right ID is set based on document type
      if (data.type === DocumentType.OTHER) {
        data.subprocessId = null;
      } else {
        data.otherDocTypeId = null;
      }
      updateMutation.mutate({ id: selectedDocument.id, data: data as InsertDocument });
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument.id);
    }
  };

  // Open edit modal with document data
  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    editForm.reset({
      name: document.name,
      type: document.type as DocumentType,
      subprocessId: document.subprocessId,
      otherDocTypeId: document.otherDocTypeId,
      version: document.version,
      description: document.description || "",
      content: document.content,
      approvalDate: new Date(document.approvalDate),
      approvers: document.approvers,
      keywords: document.keywords as string[] || [],
      active: document.active,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteAlertOpen(true);
  };

  // Filter documents by search term
  const filteredDocuments = documents?.filter(
    (document) => document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get process name
  const getProcessName = (processId: number) => {
    const process = processes?.find(p => p.id === processId);
    return process ? process.name : "Desconocido";
  };

  // Helper to get subprocess name
  const getSubprocessName = (subprocessId: number | null) => {
    if (!subprocessId) return "N/A";
    const subprocess = subprocesses?.find(s => s.id === subprocessId) || 
                       (selectedSubprocess ? undefined : null);

    if (subprocess) return subprocess.name;

    // If we don't have the subprocess in the current list, try to find its process
    const allSubprocesses = documents
      ?.filter(d => d.subprocessId === subprocessId)
      .map(d => ({ id: d.subprocessId, name: "Desconocido" }));

    return allSubprocesses && allSubprocesses.length > 0 
      ? allSubprocesses[0].name 
      : "Desconocido";
  };

  // Helper to get document type label
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case DocumentType.MANUAL: return 'Manual';
      case DocumentType.SOP: return 'SOP';
      case DocumentType.TEMPLATE: return 'Plantilla';
      case DocumentType.OTHER: return 'Otro';
      default: return type;
    }
  };

  // Handle adding keywords
  const addKeyword = (formType: 'create' | 'edit') => {
    if (!keywordInput.trim()) return;

    const form = formType === 'create' ? createForm : editForm;
    const currentKeywords = form.getValues("keywords") || [];

    if (!currentKeywords.includes(keywordInput)) {
      form.setValue("keywords", [...currentKeywords, keywordInput]);
    }

    setKeywordInput("");
  };

  // Handle removing keywords
  const removeKeyword = (keyword: string, formType: 'create' | 'edit') => {
    const form = formType === 'create' ? createForm : editForm;
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue("keywords", currentKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-secondary">Gestión de Documentos</h3>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo Documento
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex mb-4 gap-2 flex-wrap">
            <Select 
              value={selectedProcess ? String(selectedProcess) : "all"} 
              onValueChange={(value) => {
                setSelectedProcess(value === "all" ? null : Number(value));
                setSelectedSubprocess(null);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por proceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los procesos</SelectItem>
                {processes?.map((process) => (
                  <SelectItem key={process.id} value={String(process.id)}>
                    {process.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedSubprocess ? String(selectedSubprocess) : "all"} 
              onValueChange={(value) => setSelectedSubprocess(value === "all" ? null : Number(value))}
              disabled={!selectedProcess}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por subproceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los subprocesos</SelectItem>
                {subprocesses?.map((subprocess) => (
                  <SelectItem key={subprocess.id} value={String(subprocess.id)}>
                    {subprocess.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedType || "all"} 
              onValueChange={(value) => setSelectedType(value === "all" ? "" : value as DocumentType)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value={DocumentType.MANUAL}>Manuales</SelectItem>
                <SelectItem value={DocumentType.SOP}>SOPs</SelectItem>
                <SelectItem value={DocumentType.TEMPLATE}>Plantillas</SelectItem>
                <SelectItem value={DocumentType.OTHER}>Otros</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center justify-center p-4 text-destructive gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Error al cargar los documentos</span>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead>Subproceso</TableHead>
                    <TableHead>F. Aprobación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">{document.name}</TableCell>
                      <TableCell>{getDocumentTypeLabel(document.type)}</TableCell>
                      <TableCell>v{document.version}</TableCell>
                      <TableCell>{document.subprocessId ? getSubprocessName(document.subprocessId) : "N/A"}</TableCell>
                      <TableCell>
                        {format(new Date(document.approvalDate), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {document.active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(document)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(document)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {searchTerm 
                ? "No se encontraron documentos que coincidan con la búsqueda." 
                : "No hay documentos registrados con los filtros seleccionados."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Document Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Documento</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DocumentType.MANUAL}>Manual</SelectItem>
                          <SelectItem value={DocumentType.SOP}>SOP</SelectItem>
                          <SelectItem value={DocumentType.TEMPLATE}>Plantilla</SelectItem>
                          <SelectItem value={DocumentType.OTHER}>Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watchCreateType !== DocumentType.OTHER ? (
                  <>
                    <FormField
                      control={createForm.control}
                      name="subprocessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proceso</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              setSelectedProcess(Number(value));
                              field.onChange(null); // Reset subprocess when process changes
                            }} 
                            defaultValue={selectedProcess ? String(selectedProcess) : undefined}
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
                    <FormField
                      control={createForm.control}
                      name="subprocessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subproceso</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            defaultValue={field.value ? String(field.value) : undefined}
                            disabled={!selectedProcess}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar subproceso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subprocesses?.map((subprocess) => (
                                <SelectItem key={subprocess.id} value={String(subprocess.id)}>
                                  {subprocess.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <FormField
                    control={createForm.control}
                    name="otherDocTypeId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {otherDocTypes?.map((type) => (
                              <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versión</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="approvalDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Aprobación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy', { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="approvers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprobadores</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de los aprobadores" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción del documento" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Contenido del documento" 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="keywords"
                render={() => (
                  <FormItem>
                    <FormLabel>Palabras Clave</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Agregar palabra clave"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => addKeyword('create')}
                      >
                        Agregar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {createForm.getValues("keywords")?.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {keyword}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeKeyword(keyword, 'create')}
                          >
                            <span>×</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription>
                      Agregue palabras clave para facilitar la búsqueda del documento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="active"
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
                        Documento Activo
                      </FormLabel>
                      <FormDescription>
                        Los documentos activos son visibles para todos los usuarios.
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
                    "Crear Documento"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Document Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DocumentType.MANUAL}>Manual</SelectItem>
                          <SelectItem value={DocumentType.SOP}>SOP</SelectItem>
                          <SelectItem value={DocumentType.TEMPLATE}>Plantilla</SelectItem>
                          <SelectItem value={DocumentType.OTHER}>Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watchEditType !== DocumentType.OTHER ? (
                  <>
                    <FormField
                      control={editForm.control}
                      name="subprocessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proceso</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              setSelectedProcess(Number(value));
                              field.onChange(null); // Reset subprocess when process changes
                            }} 
                            defaultValue={
                              selectedDocument?.subprocessId 
                                ? String(processes?.find(p => 
                                    subprocesses?.some(s => 
                                      s.id === selectedDocument.subprocessId && s.processId === p.id
                                    )
                                  )?.id || '')
                                : ''
                            }
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
                    <FormField
                      control={editForm.control}
                      name="subprocessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subproceso</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value))} 
                            defaultValue={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar subproceso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subprocesses?.map((subprocess) => (
                                <SelectItem key={subprocess.id} value={String(subprocess.id)}>
                                  {subprocess.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <FormField
                    control={editForm.control}
                    name="otherDocTypeId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {otherDocTypes?.map((type) => (
                              <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versión</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="approvalDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Aprobación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy', { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="approvers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprobadores</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de los aprobadores" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción del documento" 
                        {...field} 
                        value={field.value || ""}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Contenido del documento" 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="keywords"
                render={() => (
                  <FormItem>
                    <FormLabel>Palabras Clave</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Agregar palabra clave"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => addKeyword('edit')}
                      >
                        Agregar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {editForm.getValues("keywords")?.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {keyword}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeKeyword(keyword, 'edit')}
                          >
                            <span>×</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <FormDescription>
                      Agregue palabras clave para facilitar la búsqueda del documento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="active"
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
                        Documento Activo
                      </FormLabel>
                      <FormDescription>
                        Los documentos activos son visibles para todos los usuarios.
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
              Esta acción eliminará permanentemente el documento "{selectedDocument?.name}".
              Esta acción no se puede deshacer.
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