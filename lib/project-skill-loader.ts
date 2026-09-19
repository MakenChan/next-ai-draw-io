import "server-only"
import fs from "fs/promises"
import path from "path"
import type { DiagramType } from "@/lib/project-types"

const route: Record<DiagramType, string> = {
    sequence: "behavior.md",
    flowchart: "module-flow-usecase.md",
    erd: "class-er.md",
    dfd: "dfd.md",
    class: "class-er.md",
}

export async function loadDiagramSkill(type: DiagramType) {
    const base = path.join(process.cwd(), "skills", "drawio-uml-er-zh")
    const [skill, shared, specific] = await Promise.all([
        fs.readFile(path.join(base, "SKILL.md"), "utf8"),
        fs.readFile(path.join(base, "references", "shared.md"), "utf8"),
        fs.readFile(path.join(base, "references", route[type]), "utf8"),
    ])
    return [skill, shared, specific].join("\n\n---\n\n")
}
