import { getDiagram, updateDiagram } from "@/lib/project-db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ diagramId: string }> }) {
    const { diagramId } = await params
    const diagram = getDiagram(diagramId)
    return diagram
        ? Response.json({ diagram })
        : Response.json({ error: "Diagram not found" }, { status: 404 })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ diagramId: string }> }) {
    const { diagramId } = await params
    const body = await req.json()
    const diagram = updateDiagram(diagramId, {
        name: typeof body.name === "string" ? body.name : undefined,
        xml: typeof body.xml === "string" ? body.xml : undefined,
        thumbnailSvg: typeof body.thumbnailSvg === "string" ? body.thumbnailSvg : undefined,
        source: ["ai", "manual", "restore"].includes(body.source) ? body.source : "manual",
    })
    return diagram
        ? Response.json({ diagram })
        : Response.json({ error: "Diagram not found" }, { status: 404 })
}
