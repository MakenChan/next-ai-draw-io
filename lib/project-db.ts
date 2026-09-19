import "server-only"

import fs from "fs"
import path from "path"
import { DatabaseSync } from "node:sqlite"
import { nanoid } from "nanoid"
import type { Project } from "@/lib/project-types"

const dataDir = process.env.PROJECT_DATA_DIR || path.join(process.cwd(), "data")
const dbPath = process.env.PROJECT_DB_PATH || path.join(dataDir, "projects.sqlite")

let database: DatabaseSync | null = null

function getDb() {
    if (database) return database

    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    database = new DatabaseSync(dbPath)
    database.exec("PRAGMA journal_mode = WAL;")
    database.exec("PRAGMA foreign_keys = ON;")
    database.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT,
            description TEXT,
            summary_text TEXT NOT NULL DEFAULT '',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            last_opened_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
    `)
    return database
}

function mapProject(row: Record<string, unknown>): Project {
    return {
        id: String(row.id),
        name: String(row.name),
        code: row.code ? String(row.code) : undefined,
        description: row.description ? String(row.description) : undefined,
        summaryText: String(row.summary_text || ""),
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
        lastOpenedAt: Number(row.last_opened_at),
    }
}

export function listProjects(query = ""): Project[] {
    const db = getDb()
    const q = query.trim()
    const rows = q
        ? db.prepare(`
            SELECT * FROM projects
            WHERE name LIKE ? OR code LIKE ? OR description LIKE ? OR summary_text LIKE ?
            ORDER BY last_opened_at DESC, updated_at DESC
          `).all(...Array(4).fill(`%${q}%`))
        : db.prepare("SELECT * FROM projects ORDER BY last_opened_at DESC, updated_at DESC").all()
    return rows.map((row) => mapProject(row as Record<string, unknown>))
}

export function createProject(input: { name: string; code?: string; description?: string; summaryText?: string }): Project {
    const db = getDb()
    const now = Date.now()
    const project: Project = {
        id: nanoid(),
        name: input.name.trim(),
        code: input.code?.trim() || undefined,
        description: input.description?.trim() || undefined,
        summaryText: input.summaryText?.trim() || "",
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
    }
    db.prepare(`
        INSERT INTO projects (id, name, code, description, summary_text, created_at, updated_at, last_opened_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(project.id, project.name, project.code ?? null, project.description ?? null, project.summaryText, now, now, now)
    return project
}

export function getProject(id: string, touch = false): Project | null {
    const db = getDb()
    if (touch) {
        db.prepare("UPDATE projects SET last_opened_at = ? WHERE id = ?").run(Date.now(), id)
    }
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id)
    return row ? mapProject(row as Record<string, unknown>) : null
}

export function updateProject(id: string, input: Partial<Pick<Project, "name" | "code" | "description" | "summaryText">>): Project | null {
    const current = getProject(id)
    if (!current) return null
    const next = {
        name: input.name?.trim() || current.name,
        code: input.code !== undefined ? input.code.trim() || undefined : current.code,
        description: input.description !== undefined ? input.description.trim() || undefined : current.description,
        summaryText: input.summaryText !== undefined ? input.summaryText : current.summaryText,
    }
    const now = Date.now()
    getDb().prepare(`
        UPDATE projects SET name = ?, code = ?, description = ?, summary_text = ?, updated_at = ? WHERE id = ?
    `).run(next.name, next.code ?? null, next.description ?? null, next.summaryText, now, id)
    return getProject(id)
}

export function deleteProject(id: string): boolean {
    return getDb().prepare("DELETE FROM projects WHERE id = ?").run(id).changes > 0
}
