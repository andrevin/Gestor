import { 
  User, InsertUser, Process, InsertProcess, Subprocess, InsertSubprocess,
  Document, InsertDocument, OtherDocType, InsertOtherDocType, Comment, InsertComment,
  users, processes, subprocesses, documents, otherDocTypes, comments
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserKpiConfig(id: number, kpiConfig: any): Promise<User | undefined>;

  // Process methods
  getProcess(id: number): Promise<Process | undefined>;
  getAllProcesses(): Promise<Process[]>;
  createProcess(process: InsertProcess): Promise<Process>;
  updateProcess(id: number, process: InsertProcess): Promise<Process | undefined>;
  deleteProcess(id: number): Promise<boolean>;

  // Subprocess methods
  getSubprocess(id: number): Promise<Subprocess | undefined>;
  getAllSubprocesses(): Promise<Subprocess[]>;
  getSubprocessesByProcess(processId: number): Promise<Subprocess[]>;
  createSubprocess(subprocess: InsertSubprocess): Promise<Subprocess>;
  updateSubprocess(id: number, subprocess: InsertSubprocess): Promise<Subprocess | undefined>;
  deleteSubprocess(id: number): Promise<boolean>;

  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentsBySubprocess(subprocessId: number, type?: string): Promise<Document[]>;
  getDocumentsByOtherDocType(otherDocTypeId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: InsertDocument): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Other document types methods
  getOtherDocType(id: number): Promise<OtherDocType | undefined>;
  getAllOtherDocTypes(): Promise<OtherDocType[]>;
  createOtherDocType(otherDocType: InsertOtherDocType): Promise<OtherDocType>;
  updateOtherDocType(id: number, otherDocType: InsertOtherDocType): Promise<OtherDocType | undefined>;
  deleteOtherDocType(id: number): Promise<boolean>;

  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByDocument(documentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private processes: Map<number, Process>;
  private subprocesses: Map<number, Subprocess>;
  private documents: Map<number, Document>;
  private otherDocTypes: Map<number, OtherDocType>;
  private comments: Map<number, Comment>;

  sessionStore: session.SessionStore;

  private userIdCounter: number;
  private processIdCounter: number;
  private subprocessIdCounter: number;
  private documentIdCounter: number;
  private otherDocTypeIdCounter: number;
  private commentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.processes = new Map();
    this.subprocesses = new Map();
    this.documents = new Map();
    this.otherDocTypes = new Map();
    this.comments = new Map();

    this.userIdCounter = 1;
    this.processIdCounter = 1;
    this.subprocessIdCounter = 1;
    this.documentIdCounter = 1;
    this.otherDocTypeIdCounter = 1;
    this.commentIdCounter = 1;

    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000  // prune expired entries every 24h
    });

    // Initialize with admin user
    this.createUser({
      username: 'andrevin',
      password: 'andy0101',
      fullName: 'Admin User',
      isAdmin: true,
      kpiConfig: {}
    });

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample processes
    const strategic = this.createProcess({
      name: 'Planificación Estratégica',
      category: 'strategic',
      icon: 'presentation-line'
    });

    const operational = this.createProcess({
      name: 'Producción',
      category: 'operational',
      icon: 'hammer-line'
    });

    const support = this.createProcess({
      name: 'Recursos Humanos',
      category: 'support',
      icon: 'user-settings-line'
    });

    // Create sample subprocesses
    const subprocess1 = this.createSubprocess({
      name: 'Control de Calidad',
      processId: operational.id
    });

    const subprocess2 = this.createSubprocess({
      name: 'Procesamiento',
      processId: operational.id
    });

    // Create sample documents
    this.createDocument({
      name: 'Manual de Control de Calidad en Línea',
      type: 'manual',
      subprocessId: subprocess1.id,
      version: '2.3',
      description: 'Manual completo de control de calidad en línea de producción',
      content: 'Contenido del manual',
      approvalDate: new Date(),
      approvers: 'Departamento de Calidad',
      keywords: ['calidad', 'línea', 'producción'],
      active: true
    });

    this.createDocument({
      name: 'SOP-001: Inspección de Materias Primas',
      type: 'sop',
      subprocessId: subprocess1.id,
      version: '3.1',
      description: 'Procedimiento estándar para inspección de materias primas',
      content: 'Contenido del SOP',
      approvalDate: new Date(),
      approvers: 'Dirección Técnica',
      keywords: ['inspección', 'materia prima', 'control'],
      active: true
    });

    // Create sample other doc type
    this.createOtherDocType({
      name: 'Normativas Internas',
      icon: 'file-text-line'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      id, 
      ...userData,
      kpiConfig: userData.kpiConfig || {}
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserKpiConfig(id: number, kpiConfig: any): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, kpiConfig };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Process methods
  async getProcess(id: number): Promise<Process | undefined> {
    return this.processes.get(id);
  }

  async getAllProcesses(): Promise<Process[]> {
    return Array.from(this.processes.values());
  }

  async createProcess(processData: InsertProcess): Promise<Process> {
    const id = this.processIdCounter++;
    const now = new Date();
    const process: Process = {
      id,
      ...processData,
      createdAt: now,
      updatedAt: now
    };
    this.processes.set(id, process);
    return process;
  }

  async updateProcess(id: number, processData: InsertProcess): Promise<Process | undefined> {
    const process = await this.getProcess(id);
    if (!process) return undefined;

    const updatedProcess = { 
      ...process, 
      ...processData, 
      updatedAt: new Date() 
    };
    this.processes.set(id, updatedProcess);
    return updatedProcess;
  }

  async deleteProcess(id: number): Promise<boolean> {
    return this.processes.delete(id);
  }

  // Subprocess methods
  async getSubprocess(id: number): Promise<Subprocess | undefined> {
    return this.subprocesses.get(id);
  }

  async getAllSubprocesses(): Promise<Subprocess[]> {
    return Array.from(this.subprocesses.values());
  }

  async getSubprocessesByProcess(processId: number): Promise<Subprocess[]> {
    return Array.from(this.subprocesses.values()).filter(
      subprocess => subprocess.processId === processId
    );
  }

  async createSubprocess(subprocessData: InsertSubprocess): Promise<Subprocess> {
    const id = this.subprocessIdCounter++;
    const now = new Date();
    const subprocess: Subprocess = {
      id,
      ...subprocessData,
      createdAt: now,
      updatedAt: now
    };
    this.subprocesses.set(id, subprocess);
    return subprocess;
  }

  async updateSubprocess(id: number, subprocessData: InsertSubprocess): Promise<Subprocess | undefined> {
    const subprocess = await this.getSubprocess(id);
    if (!subprocess) return undefined;

    const updatedSubprocess = { 
      ...subprocess, 
      ...subprocessData, 
      updatedAt: new Date() 
    };
    this.subprocesses.set(id, updatedSubprocess);
    return updatedSubprocess;
  }

  async deleteSubprocess(id: number): Promise<boolean> {
    return this.subprocesses.delete(id);
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsBySubprocess(subprocessId: number, type?: string): Promise<Document[]> {
    let documents = Array.from(this.documents.values()).filter(
      document => document.subprocessId === subprocessId && document.active
    );

    if (type) {
      documents = documents.filter(document => document.type === type);
    }

    return documents;
  }

  async getDocumentsByOtherDocType(otherDocTypeId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      document => document.otherDocTypeId === otherDocTypeId && document.active
    );
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = {
      id,
      ...documentData,
      createdAt: now,
      updatedAt: now
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentData: InsertDocument): Promise<Document | undefined> {
    const document = await this.getDocument(id);
    if (!document) return undefined;

    const updatedDocument = { 
      ...document, 
      ...documentData, 
      updatedAt: new Date() 
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Other document types methods
  async getOtherDocType(id: number): Promise<OtherDocType | undefined> {
    return this.otherDocTypes.get(id);
  }

  async getAllOtherDocTypes(): Promise<OtherDocType[]> {
    return Array.from(this.otherDocTypes.values());
  }

  async createOtherDocType(otherDocTypeData: InsertOtherDocType): Promise<OtherDocType> {
    const id = this.otherDocTypeIdCounter++;
    const now = new Date();
    const otherDocType: OtherDocType = {
      id,
      ...otherDocTypeData,
      createdAt: now,
      updatedAt: now
    };
    this.otherDocTypes.set(id, otherDocType);
    return otherDocType;
  }

  async updateOtherDocType(id: number, otherDocTypeData: InsertOtherDocType): Promise<OtherDocType | undefined> {
    const otherDocType = await this.getOtherDocType(id);
    if (!otherDocType) return undefined;

    const updatedOtherDocType = { 
      ...otherDocType, 
      ...otherDocTypeData, 
      updatedAt: new Date() 
    };
    this.otherDocTypes.set(id, updatedOtherDocType);
    return updatedOtherDocType;
  }

  async deleteOtherDocType(id: number): Promise<boolean> {
    return this.otherDocTypes.delete(id);
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByDocument(documentId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      comment => comment.documentId === documentId
    );
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = {
      id,
      ...commentData,
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Convertir kpiIframeUrl de undefined a string vacía si es necesario
    const dataToInsert = {
      ...userData,
      kpiIframeUrl: userData.kpiIframeUrl || ""
    };
    
    const [user] = await db.insert(users).values(dataToInsert).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUserKpiConfig(id: number, kpiIframeUrl: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ kpiIframeUrl })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Process methods
  async getProcess(id: number): Promise<Process | undefined> {
    const [process] = await db.select().from(processes).where(eq(processes.id, id));
    return process;
  }

  async getAllProcesses(): Promise<Process[]> {
    return db.select().from(processes);
  }

  async createProcess(processData: InsertProcess): Promise<Process> {
    const [process] = await db.insert(processes).values(processData).returning();
    return process;
  }

  async updateProcess(id: number, processData: InsertProcess): Promise<Process | undefined> {
    const [updatedProcess] = await db
      .update(processes)
      .set(processData)
      .where(eq(processes.id, id))
      .returning();
    return updatedProcess;
  }

  async deleteProcess(id: number): Promise<boolean> {
    const result = await db.delete(processes).where(eq(processes.id, id));
    return result.rowCount > 0;
  }

  // Subprocess methods
  async getSubprocess(id: number): Promise<Subprocess | undefined> {
    const [subprocess] = await db.select().from(subprocesses).where(eq(subprocesses.id, id));
    return subprocess;
  }

  async getAllSubprocesses(): Promise<Subprocess[]> {
    return db.select().from(subprocesses);
  }

  async getSubprocessesByProcess(processId: number): Promise<Subprocess[]> {
    return db.select().from(subprocesses).where(eq(subprocesses.processId, processId));
  }

  async createSubprocess(subprocessData: InsertSubprocess): Promise<Subprocess> {
    const [subprocess] = await db.insert(subprocesses).values(subprocessData).returning();
    return subprocess;
  }

  async updateSubprocess(id: number, subprocessData: InsertSubprocess): Promise<Subprocess | undefined> {
    const [updatedSubprocess] = await db
      .update(subprocesses)
      .set(subprocessData)
      .where(eq(subprocesses.id, id))
      .returning();
    return updatedSubprocess;
  }

  async deleteSubprocess(id: number): Promise<boolean> {
    const result = await db.delete(subprocesses).where(eq(subprocesses.id, id));
    return result.rowCount > 0;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents);
  }

  async getDocumentsBySubprocess(subprocessId: number, type?: string): Promise<Document[]> {
    let query = db.select().from(documents)
      .where(and(
        eq(documents.subprocessId, subprocessId),
        eq(documents.active, true)
      ));

    if (type) {
      query = query.where(eq(documents.type, type));
    }

    return query;
  }

  async getDocumentsByOtherDocType(otherDocTypeId: number): Promise<Document[]> {
    return db.select().from(documents)
      .where(and(
        eq(documents.otherDocTypeId, otherDocTypeId),
        eq(documents.active, true)
      ));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(id: number, documentData: InsertDocument): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(documentData)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }

  // Other document types methods
  async getOtherDocType(id: number): Promise<OtherDocType | undefined> {
    const [otherDocType] = await db.select().from(otherDocTypes).where(eq(otherDocTypes.id, id));
    return otherDocType;
  }

  async getAllOtherDocTypes(): Promise<OtherDocType[]> {
    return db.select().from(otherDocTypes);
  }

  async createOtherDocType(otherDocTypeData: InsertOtherDocType): Promise<OtherDocType> {
    const [otherDocType] = await db.insert(otherDocTypes).values(otherDocTypeData).returning();
    return otherDocType;
  }

  async updateOtherDocType(id: number, otherDocTypeData: InsertOtherDocType): Promise<OtherDocType | undefined> {
    const [updatedOtherDocType] = await db
      .update(otherDocTypes)
      .set(otherDocTypeData)
      .where(eq(otherDocTypes.id, id))
      .returning();
    return updatedOtherDocType;
  }

  async deleteOtherDocType(id: number): Promise<boolean> {
    const result = await db.delete(otherDocTypes).where(eq(otherDocTypes.id, id));
    return result.rowCount > 0;
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async getCommentsByDocument(documentId: number): Promise<Comment[]> {
    return db.select().from(comments)
      .where(eq(comments.documentId, documentId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  // Método para inicializar datos de muestra
  async initializeSampleData() {
    // Primero comprobar si ya existen datos
    const existingUsers = await this.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("La base de datos ya tiene datos. Omitiendo inicialización.");
      return;
    }

    // Crear usuario administrador
    const adminUser = await this.createUser({
      username: 'andrevin',
      password: 'andy0101',
      fullName: 'Admin User',
      isAdmin: true,
      kpiIframeUrl: ''
    });
    
    // Crear procesos
    const strategic = await this.createProcess({
      name: 'Planificación Estratégica',
      category: 'strategic',
      icon: 'presentation-line'
    });

    const operational = await this.createProcess({
      name: 'Producción',
      category: 'operational',
      icon: 'hammer-line'
    });

    const support = await this.createProcess({
      name: 'Recursos Humanos',
      category: 'support',
      icon: 'user-settings-line'
    });

    // Crear subprocesos
    const subprocess1 = await this.createSubprocess({
      name: 'Control de Calidad',
      processId: operational.id
    });

    const subprocess2 = await this.createSubprocess({
      name: 'Procesamiento',
      processId: operational.id
    });

    // Crear tipo de documento "otro"
    const otherDocType = await this.createOtherDocType({
      name: 'Normativas Internas',
      icon: 'file-text-line'
    });

    // Crear documentos
    await this.createDocument({
      name: 'Manual de Control de Calidad en Línea',
      type: 'manual',
      subprocessId: subprocess1.id,
      otherDocTypeId: null,
      version: '2.3',
      description: 'Manual completo de control de calidad en línea de producción',
      content: 'Contenido del manual',
      approvalDate: new Date(),
      approvers: 'Departamento de Calidad',
      keywords: ['calidad', 'línea', 'producción'],
      active: true
    });

    await this.createDocument({
      name: 'SOP-001: Inspección de Materias Primas',
      type: 'sop',
      subprocessId: subprocess1.id,
      otherDocTypeId: null,
      version: '3.1',
      description: 'Procedimiento estándar para inspección de materias primas',
      content: 'Contenido del SOP',
      approvalDate: new Date(),
      approvers: 'Dirección Técnica',
      keywords: ['inspección', 'materia prima', 'control'],
      active: true
    });

    // Documento en la categoría "otros"
    await this.createDocument({
      name: 'Reglamento Interno',
      type: 'other',
      subprocessId: null,
      otherDocTypeId: otherDocType.id,
      version: '1.0',
      description: 'Reglamento interno de la empresa',
      content: 'Contenido del reglamento',
      approvalDate: new Date(),
      approvers: 'Dirección General',
      keywords: ['reglamento', 'normativa', 'interno'],
      active: true
    });

    console.log("Datos de muestra inicializados correctamente");
  }
}

// Cambiar a la implementación de base de datos
export const storage = new DatabaseStorage();

// Inicializar datos de prueba
storage.initializeSampleData().catch(err => {
  console.error("Error al inicializar datos de muestra:", err);
});