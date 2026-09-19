import { deleteProject, getProject, updateProject } from "@/lib/project-db"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = getProject(id, true)
    return project
        ? Response.json({ project })
        : Response.json({ error: "Project not found" }, { status: 404 })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()
    const project = updateProject(id, body)
    return project
        ? Response.json({ project })
        : Response.json({ error: "Project not found" }, { status: 404 })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return deleteProject(id)
        ? new Response(null, { status: 204 })
        : Response.json({ error: "Project not found" }, { status: 404 })
}
