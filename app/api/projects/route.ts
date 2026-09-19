import { createProject, listProjects } from "@/lib/project-db"

export const runtime = "nodejs"

export async function GET(req: Request) {
    const query = new URL(req.url).searchParams.get("q") || ""
    return Response.json({ projects: listProjects(query) })
}

export async function POST(req: Request) {
    const body = await req.json()
    if (typeof body.name !== "string" || !body.name.trim()) {
        return Response.json({ error: "Project name is required" }, { status: 400 })
    }
    const project = createProject({
        name: body.name,
        code: typeof body.code === "string" ? body.code : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        summaryText: typeof body.summaryText === "string" ? body.summaryText : undefined,
    })
    return Response.json({ project }, { status: 201 })
}
