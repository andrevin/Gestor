import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Process categories
export enum ProcessCategory {
  STRATEGIC = "strategic",
  OPERATIONAL = "operational",
  SUPPORT = "support",
}

// Document types
export enum DocumentType {
  MANUAL = "manual",
  SOP = "sop",
  TEMPLATE = "template",
  OTHER = "other",
}

// Schema definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  kpiIframeUrl: text("kpi_iframe_url").default(""),
});

export const processes = pgTable("processes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["strategic", "operational", "support"] }).notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subprocesses = pgTable("subprocesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  processId: integer("process_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const otherDocTypes = pgTable("other_doc_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["manual", "sop", "template", "other"] }).notNull(),
  subprocessId: integer("subprocess_id"),
  otherDocTypeId: integer("other_doc_type_id"),
  version: text("version").notNull().default("1.0"),
  description: text("description"),
  content: text("content").notNull(),
  approvalDate: timestamp("approval_date").notNull(),
  approvers: text("approvers").notNull(),
  keywords: jsonb("keywords").default([]).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
}));

export const processesRelations = relations(processes, ({ many }) => ({
  subprocesses: many(subprocesses),
}));

export const subprocessesRelations = relations(subprocesses, ({ one, many }) => ({
  process: one(processes, {
    fields: [subprocesses.processId],
    references: [processes.id],
  }),
  documents: many(documents),
}));

export const otherDocTypesRelations = relations(otherDocTypes, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  subprocess: one(subprocesses, {
    fields: [documents.subprocessId],
    references: [subprocesses.id],
  }),
  otherDocType: one(otherDocTypes, {
    fields: [documents.otherDocTypeId],
    references: [otherDocTypes.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  document: one(documents, {
    fields: [comments.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  isAdmin: true,
  kpiIframeUrl: true,
});

export const insertProcessSchema = createInsertSchema(processes).pick({
  name: true,
  category: true,
  icon: true,
});

export const insertSubprocessSchema = createInsertSchema(subprocesses).pick({
  name: true,
  processId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  type: true,
  subprocessId: true,
  otherDocTypeId: true,
  version: true,
  description: true,
  content: true,
  approvalDate: true,
  approvers: true,
  keywords: true,
  active: true,
});

export const insertOtherDocTypeSchema = createInsertSchema(otherDocTypes).pick({
  name: true,
  icon: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  documentId: true,
  userId: true,
  text: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof insertProcessSchema>;

export type Subprocess = typeof subprocesses.$inferSelect;
export type InsertSubprocess = z.infer<typeof insertSubprocessSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type OtherDocType = typeof otherDocTypes.$inferSelect;
export type InsertOtherDocType = z.infer<typeof insertOtherDocTypeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;