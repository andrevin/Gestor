import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProcessSchema, insertSubprocessSchema, insertDocumentSchema, insertCommentSchema, insertOtherDocTypeSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Custom error handler for zod validation errors
  function validateRequest(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ 
            message: "Error de validación", 
            errors: validationError.details 
          });
        } else {
          next(error);
        }
      }
    };
  }

  // Authentication middleware
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "No autenticado" });
  }

  // Admin authorization middleware
  function isAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "No autorizado" });
  }

  // Process routes
  app.get("/api/processes", async (req, res) => {
    const processes = await storage.getAllProcesses();
    res.json(processes);
  });

  app.get("/api/processes/:id", async (req, res) => {
    const process = await storage.getProcess(parseInt(req.params.id));
    if (!process) {
      return res.status(404).json({ message: "Proceso no encontrado" });
    }
    res.json(process);
  });

  app.post("/api/processes", isAdmin, validateRequest(insertProcessSchema), async (req, res) => {
    const process = await storage.createProcess(req.body);
    res.status(201).json(process);
  });

  app.put("/api/processes/:id", isAdmin, validateRequest(insertProcessSchema), async (req, res) => {
    const updated = await storage.updateProcess(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ message: "Proceso no encontrado" });
    }
    res.json(updated);
  });

  app.delete("/api/processes/:id", isAdmin, async (req, res) => {
    const deleted = await storage.deleteProcess(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Proceso no encontrado" });
    }
    res.json({ message: "Proceso eliminado correctamente" });
  });

  // Subprocess routes
  app.get("/api/subprocesses", async (req, res) => {
    const processId = req.query.processId ? parseInt(req.query.processId as string) : undefined;
    const subprocesses = processId 
      ? await storage.getSubprocessesByProcess(processId)
      : await storage.getAllSubprocesses();
    res.json(subprocesses);
  });

  app.get("/api/subprocesses/:id", async (req, res) => {
    const subprocess = await storage.getSubprocess(parseInt(req.params.id));
    if (!subprocess) {
      return res.status(404).json({ message: "Subproceso no encontrado" });
    }
    res.json(subprocess);
  });

  app.post("/api/subprocesses", isAdmin, validateRequest(insertSubprocessSchema), async (req, res) => {
    const subprocess = await storage.createSubprocess(req.body);
    res.status(201).json(subprocess);
  });

  app.put("/api/subprocesses/:id", isAdmin, validateRequest(insertSubprocessSchema), async (req, res) => {
    const updated = await storage.updateSubprocess(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ message: "Subproceso no encontrado" });
    }
    res.json(updated);
  });

  app.delete("/api/subprocesses/:id", isAdmin, async (req, res) => {
    const deleted = await storage.deleteSubprocess(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Subproceso no encontrado" });
    }
    res.json({ message: "Subproceso eliminado correctamente" });
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    const subprocessId = req.query.subprocessId ? parseInt(req.query.subprocessId as string) : undefined;
    const otherDocTypeId = req.query.otherDocTypeId ? parseInt(req.query.otherDocTypeId as string) : undefined;
    const type = req.query.type as string | undefined;

    let documents = [];
    if (subprocessId) {
      documents = await storage.getDocumentsBySubprocess(subprocessId, type);
    } else if (otherDocTypeId) {
      documents = await storage.getDocumentsByOtherDocType(otherDocTypeId);
    } else {
      documents = await storage.getAllDocuments();
    }
    res.json(documents);
  });

  app.get("/api/documents/:id", async (req, res) => {
    const document = await storage.getDocument(parseInt(req.params.id));
    if (!document) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }
    res.json(document);
  });

  app.post("/api/documents", isAdmin, validateRequest(insertDocumentSchema), async (req, res) => {
    const document = await storage.createDocument(req.body);
    res.status(201).json(document);
  });

  app.put("/api/documents/:id", isAdmin, validateRequest(insertDocumentSchema), async (req, res) => {
    const updated = await storage.updateDocument(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }
    res.json(updated);
  });

  app.delete("/api/documents/:id", isAdmin, async (req, res) => {
    const deleted = await storage.deleteDocument(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }
    res.json({ message: "Documento eliminado correctamente" });
  });

  // Comment routes
  app.get("/api/documents/:documentId/comments", async (req, res) => {
    const documentId = parseInt(req.params.documentId);
    const comments = await storage.getCommentsByDocument(documentId);
    res.json(comments);
  });

  app.post("/api/comments", isAuthenticated, validateRequest(insertCommentSchema), async (req, res) => {
    const comment = await storage.createComment({
      ...req.body,
      userId: req.user!.id
    });
    res.status(201).json(comment);
  });

  // Other document types routes
  app.get("/api/other-doc-types", async (req, res) => {
    const otherDocTypes = await storage.getAllOtherDocTypes();
    res.json(otherDocTypes);
  });

  app.post("/api/other-doc-types", isAdmin, validateRequest(insertOtherDocTypeSchema), async (req, res) => {
    const otherDocType = await storage.createOtherDocType(req.body);
    res.status(201).json(otherDocType);
  });

  app.put("/api/other-doc-types/:id", isAdmin, validateRequest(insertOtherDocTypeSchema), async (req, res) => {
    const updated = await storage.updateOtherDocType(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ message: "Tipo de documento no encontrado" });
    }
    res.json(updated);
  });

  app.delete("/api/other-doc-types/:id", isAdmin, async (req, res) => {
    const deleted = await storage.deleteOtherDocType(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Tipo de documento no encontrado" });
    }
    res.json({ message: "Tipo de documento eliminado correctamente" });
  });

  // User routes
  app.get("/api/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.put("/api/users/:id/kpi-config", isAdmin, async (req, res) => {
    const updated = await storage.updateUserKpiConfig(parseInt(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}
