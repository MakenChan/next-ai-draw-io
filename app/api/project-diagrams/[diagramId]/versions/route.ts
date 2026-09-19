import { getDiagram, listVersions, restoreVersion } from "@/lib/project-db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ diagramId: string }> }) {
    const { diagramId } = await params
    if (!getDiagram(diagramId)) return Response.json({ error: "Diagram not found" }, { status: 404 })
    return Response.json({ versions: listVersions(diagramId) })
}

export async function POST(req: Request, { params }: { params: Promise<{ diagramId: string }> }) {
    const { diagramId } = await params
    const body = await req.json()
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) {
        return Response.json({ error: "Invalid version" }, { status: 400 })
    }
    const diagram = restoreVersion(diagramId, version)
    return diagram
        ? Response.json({ diagram })
        : Response.json({ error: "Version not found" }, { status: 404 })
}
