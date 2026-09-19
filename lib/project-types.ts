export const DIAGRAM_TYPES = ["sequence","flowchart","erd","dfd","class"] as const
export type DiagramType = (typeof DIAGRAM_TYPES)[number]
export type DiagramTaskStatus = "pending" | "generating" | "completed" | "failed"
export type DiagramPlanStatus = "draft" | "confirmed" | "generating" | "completed" | "partial" | "failed"

export interface Project {
    id: string; name: string; code?: string; description?: string; summaryText: string
    createdAt: number; updatedAt: number; lastOpenedAt: number
}
export interface ProjectDocument {
    id: string; projectId: string; name: string; mimeType?: string; originalName: string
    extractedText: string; createdAt: number
}
export interface ProjectChatSession { id: string; projectId: string; title: string; createdAt: number; updatedAt: number }
export interface ProjectChatMessage { id: string; sessionId: string; role: "user"|"assistant"|"system"; content: string; createdAt: number }
export interface DiagramPlanItem {
    id: string; type: DiagramType; title: string; description?: string; evidence?: string[]
    order: number; status: DiagramTaskStatus; error?: string
}
export interface DiagramPlan {
    id: string; projectId: string; sessionId?: string; title: string; requestText: string
    status: DiagramPlanStatus; items: DiagramPlanItem[]; createdAt: number; updatedAt: number
}
export interface ProjectDiagram {
    id: string; projectId: string; taskId?: string; name: string; type: DiagramType; xml: string
    thumbnailSvg?: string; currentVersion: number; createdAt: number; updatedAt: number
}
export interface DiagramVersion {
    id: string; diagramId: string; version: number; xml: string; source: "ai"|"manual"|"restore"; createdAt: number
}
