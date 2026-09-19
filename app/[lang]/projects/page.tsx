"use client"

import { FolderOpen, Plus, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/project-types"

export default function ProjectsPage() {
    const router = useRouter()
    const params = useParams<{ lang: string }>()
    const [projects, setProjects] = useState<Project[]>([])
    const [query, setQuery] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(true)

    async function load(q = "") {
        setLoading(true)
        const res = await fetch(`/api/projects?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setProjects(data.projects || [])
        setLoading(false)
    }

    useEffect(() => {
        const timer = setTimeout(() => load(query), 200)
        return () => clearTimeout(timer)
    }, [query])

    async function create(e: FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name }),
        })
        const data = await res.json()
        if (data.project) router.push(`/${params.lang}/projects/${data.project.id}`)
    }

    return (
        <main className="min-h-screen bg-background p-6 md:p-10">
            <div className="mx-auto max-w-5xl space-y-8">
                <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">项目工作区</h1>
                        <p className="mt-1 text-muted-foreground">保存项目总结、聊天记录和生成的 Draw.io 图表。</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push(`/${params.lang}`)}>返回自由绘图</Button>
                </header>

                <form onSubmit={create} className="flex gap-2 rounded-xl border bg-card p-4">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新项目名称，例如：资产管理系统" className="h-10 flex-1 rounded-md border bg-background px-3" />
                    <Button type="submit"><Plus />新建项目</Button>
                </form>

                <div className="relative">
                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索项目、编号、描述或总结..." className="h-10 w-full rounded-md border bg-background pl-9 pr-3" />
                </div>

                {loading ? <p className="text-muted-foreground">加载中...</p> : projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">还没有项目，先创建一个。</div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {projects.map((project) => (
                            <button key={project.id} onClick={() => router.push(`/${params.lang}/projects/${project.id}`)} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-accent">
                                <FolderOpen className="mt-1 size-5" />
                                <span>
                                    <span className="block font-medium">{project.name}</span>
                                    <span className="mt-1 block text-sm text-muted-foreground">{project.code || "未设置项目编号"} · {project.summaryText ? "已有项目总结" : "待添加项目总结"}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
