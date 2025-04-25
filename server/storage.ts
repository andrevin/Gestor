import { 
  User, InsertUser, Process, InsertProcess, Subprocess, InsertSubprocess,
  Document, InsertDocument, OtherDocType, InsertOtherDocType, Comment, InsertComment
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

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
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
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

export const storage = new MemStorage();
