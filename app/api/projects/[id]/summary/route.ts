import { getProject, updateProject } from "@/lib/project-db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = getProject(id)
    return project
        ? Response.json({ summaryText: project.summaryText })
        : Response.json({ error: "Project not found" }, { status: 404 })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()
    if (typeof body.summaryText !== "string") {
        return Response.json({ error: "summaryText must be a string" }, { status: 400 })
    }
    const project = updateProject(id, { summaryText: body.summaryText })
    return project
        ? Response.json({ project })
        : Response.json({ error: "Project not found" }, { status: 404 })
}
