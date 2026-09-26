import "server-only"

import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"

const TEMPLATE_FILES = new Set([
    "功能模块图.drawio",
    "流程图.drawio",
    "活动图.drawio",
    "状态图.drawio",
    "顺序图.drawio",
    "用例图.drawio",
    "类图.drawio",
    "ERD_鸡爪图.drawio",
    "ER图.drawio",
    "数据流图.drawio",
    "架构图.drawio",
])

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ name: string }> },
) {
    const { name } = await params
    const decodedName = decodeURIComponent(name)

    if (!TEMPLATE_FILES.has(decodedName)) {
        return Response.json({ error: "Template not found" }, { status: 404 })
    }

    const filePath = path.join(
        process.cwd(),
        "skills",
        "drawio-uml-er-zh",
        "template",
        decodedName,
    )

    try {
        const xml = await fs.readFile(filePath, "utf8")
        return new Response(xml, {
            headers: {
                "content-type": "application/xml; charset=utf-8",
                "cache-control": "no-store",
            },
        })
    } catch {
        return Response.json({ error: "Template file is missing" }, { status: 404 })
    }
}
