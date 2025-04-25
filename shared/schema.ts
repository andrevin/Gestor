import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  kpiConfig: jsonb("kpi_config").default({}).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  isAdmin: true,
  kpiConfig: true,
});

// Process categories
export enum ProcessCategory {
  STRATEGIC = "strategic",
  OPERATIONAL = "operational",
  SUPPORT = "support",
}

// Process model
export const processes = pgTable("processes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["strategic", "operational", "support"] }).notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProcessSchema = createInsertSchema(processes).pick({
  name: true,
  category: true,
  icon: true,
});

// Subprocess model
export const subprocesses = pgTable("subprocesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  processId: integer("process_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubprocessSchema = createInsertSchema(subprocesses).pick({
  name: true,
  processId: true,
});

// Document types
export enum DocumentType {
  MANUAL = "manual",
  SOP = "sop",
  TEMPLATE = "template",
  OTHER = "other",
}

// Document model
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

// Other document types model
export const otherDocTypes = pgTable("other_doc_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOtherDocTypeSchema = createInsertSchema(otherDocTypes).pick({
  name: true,
  icon: true,
});

// Comments model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
