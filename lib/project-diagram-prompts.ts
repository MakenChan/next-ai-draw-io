import type { DiagramType } from "@/lib/project-types"

const rules: Record<DiagramType,string> = {
 sequence: "Create a UML sequence diagram. Use clear participants, top-to-bottom messages, dashed return messages where useful, and alt/opt fragments only when supported by the source summary.",
 flowchart: "Create a business flowchart. Use one start and explicit end states, diamonds for decisions, label branches, and keep the primary path visually obvious.",
 erd: "Create a Crow's Foot ERD. Show entities/tables, important fields, PK/FK markers, and only relationships supported by the source summary. Do not invent columns.",
 dfd: "Create a data-flow diagram. Distinguish external entities, processes, data stores, and labeled data flows. Do not turn control flow into data flow.",
 class: "Create a UML class diagram. Show important classes, selected fields/methods, and supported association/inheritance/dependency relationships. Do not invent implementation details.",
}

export function diagramPrompt(type: DiagramType, title: string, description: string, summary: string) {
 return `You generate draw.io mxGraph XML from a project summary.

SOURCE OF TRUTH:
${summary}

TASK:
Title: ${title}
Type: ${type}
Description: ${description || "(none)"}

RULES:
${rules[type]}
- Use only facts supported by SOURCE OF TRUTH. If details are missing, keep the diagram higher-level.
- Output ONLY sibling <mxCell> elements. No markdown, no explanation, no <mxfile>, <mxGraphModel>, <root>, or root cells id 0/1.
- Every mxCell must have a unique id and valid parent. Top-level parent is "1".
- Every vertex must include mxGeometry. Every edge must include mxGeometry relative="1".
- Prefer orthogonal connectors and readable spacing.
- Escape XML attribute values correctly.
`
}

export function wrapProjectMxCells(cells: string) {
 return `<mxfile host="app.diagrams.net"><diagram name="Page-1" id="project-diagram"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel></diagram></mxfile>`
}
