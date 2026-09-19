"use client"

import { ArrowLeft, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/project-types"

export default function ProjectDetailPage() {
    const params = useParams<{ lang: string; id: string }>()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [summary, setSummary] = useState("")
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetch(`/api/projects/${params.id}`).then((r) => r.json()).then((data) => {
            setProject(data.project || null)
            setSummary(data.project?.summaryText || "")
        })
    }, [params.id])

    async function saveSummary() {
        setSaving(true)
        setSaved(false)
        const res = await fetch(`/api/projects/${params.id}/summary`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ summaryText: summary }),
        })
        const data = await res.json()
        if (data.project) {
            setProject(data.project)
            setSaved(true)
        }
        setSaving(false)
    }

    if (!project) return <main className="min-h-screen bg-background p-10 text-muted-foreground">加载项目...</main>

    return (
        <main className="min-h-screen bg-background p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/${params.lang}/projects`)}><ArrowLeft /></Button>
                        <div>
                            <h1 className="text-2xl font-semibold">{project.name}</h1>
                            <p className="text-sm text-muted-foreground">{project.code || "未设置项目编号"}</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/${params.lang}`)}>打开自由绘图</Button>
                </header>

                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <aside className="rounded-xl border bg-card p-3">
                        <div className="rounded-md bg-accent px-3 py-2 font-medium">项目总结</div>
                        <div className="px-3 py-2 text-sm text-muted-foreground">聊天记录（Phase 2）</div>
                        <div className="px-3 py-2 text-sm text-muted-foreground">制图计划（Phase 4）</div>
                        <div className="px-3 py-2 text-sm text-muted-foreground">图表库（Phase 5）</div>
                    </aside>

                    <section className="space-y-4 rounded-xl border bg-card p-5">
                        <div>
                            <h2 className="text-lg font-semibold">项目总结</h2>
                            <p className="text-sm text-muted-foreground">把其他 AI 对项目的完整分析粘贴到这里。后续所有制图都以这里的内容作为事实来源。</p>
                        </div>
                        <textarea value={summary} onChange={(e) => { setSummary(e.target.value); setSaved(false) }} placeholder="粘贴项目背景、模块、角色、业务流程、API、核心类、数据库表关系、外部系统、关键时序和数据流..." className="min-h-[520px] w-full resize-y rounded-lg border bg-background p-4 font-mono text-sm leading-6" />
                        <div className="flex items-center justify-end gap-3">
                            {saved && <span className="text-sm text-muted-foreground">已保存</span>}
                            <Button onClick={saveSummary} disabled={saving}><Save />{saving ? "保存中..." : "保存总结"}</Button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
