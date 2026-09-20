"use client"

import {
    Activity,
    Boxes,
    Database,
    GitBranch,
    Network,
    Share2,
    Users,
    Workflow,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useDiagram } from "@/contexts/diagram-context"
import { getApiEndpoint } from "@/lib/base-path"

interface ExampleCardProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick: () => void
    loading?: boolean
}

function ExampleCard({
    icon,
    title,
    description,
    onClick,
    loading = false,
}: ExampleCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="group w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm disabled:cursor-wait disabled:opacity-60"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {loading ? `正在加载 ${title}...` : title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    )
}

const SKILL_TEMPLATES = [
    {
        name: "功能模块图",
        description: "按系统功能层级展示模块、子模块和功能分解。",
        file: "功能模块图.drawio",
        icon: Boxes,
    },
    {
        name: "流程图",
        description: "开始、处理、判断、分支、回环的标准业务流程图。",
        file: "流程图.drawio",
        icon: GitBranch,
    },
    {
        name: "活动图",
        description: "适合角色泳道、并发、分支与合并的 UML 活动图。",
        file: "活动图.drawio",
        icon: Activity,
    },
    {
        name: "状态图",
        description: "展示对象生命周期、状态以及事件驱动的状态迁移。",
        file: "状态图.drawio",
        icon: Workflow,
    },
    {
        name: "顺序图",
        description: "参与者、生命线、激活条、同步调用与返回消息。",
        file: "顺序图.drawio",
        icon: Share2,
    },
    {
        name: "用例图",
        description: "展示参与者、系统边界、用例和参与关系。",
        file: "用例图.drawio",
        icon: Users,
    },
    {
        name: "类图",
        description: "类名、属性、方法以及继承、关联、依赖等关系。",
        file: "类图.drawio",
        icon: Boxes,
    },
    {
        name: "ERD 鸡爪图",
        description: "表、字段、PK/FK 和 Crow's Foot 基数关系。",
        file: "ERD_鸡爪图.drawio",
        icon: Database,
    },
    {
        name: "ER 图",
        description: "实体、联系和基数表达的概念级 Chen ER 图。",
        file: "ER图.drawio",
        icon: Database,
    },
    {
        name: "数据流图",
        description: "外部实体、处理过程、数据存储以及数据流。",
        file: "数据流图.drawio",
        icon: Network,
    },
    {
        name: "架构图",
        description: "系统分层、组件、服务、数据库和外部依赖关系。",
        file: "架构图.drawio",
        icon: Boxes,
    },
] as const

export default function ExamplePanel({
    setInput,
    setFiles,
    minimal = false,
}: {
    setInput: (input: string) => void
    setFiles: (files: File[]) => void
    minimal?: boolean
}) {
    const { loadDiagram, setDiagramHistory } = useDiagram()
    const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null)

    const loadSkillTemplate = async (
        template: (typeof SKILL_TEMPLATES)[number],
    ) => {
        if (loadingTemplate) return

        setLoadingTemplate(template.file)
        try {
            const response = await fetch(
                getApiEndpoint(
                    `/api/skill-templates/${encodeURIComponent(template.file)}`,
                ),
                { cache: "no-store" },
            )

            if (!response.ok) {
                const data = await response.json().catch(() => null)
                throw new Error(data?.error || "模板文件加载失败")
            }

            const xml = await response.text()
            if (!xml.includes("<mxfile") && !xml.includes("<mxGraphModel")) {
                throw new Error("模板不是有效的 Draw.io XML")
            }

            const error = loadDiagram(xml)
            if (error) throw new Error(error)

            setDiagramHistory([])
            setInput("")
            setFiles([])
            toast.success(`已加载模板：${template.name}`)
        } catch (error) {
            console.error("[skill-template] Failed to load template", error)
            toast.error(
                error instanceof Error ? error.message : "模板加载失败",
            )
        } finally {
            setLoadingTemplate(null)
        }
    }

    return (
        <div className={minimal ? "" : "px-2 py-6 animate-fade-in"}>
            {!minimal && (
                <div className="mb-5 text-center">
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                        Skill 模板图
                    </h2>
                    <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                        点击模板后直接加载到左侧 Draw.io 画布
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {!minimal && (
                    <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        快速示例
                    </p>
                )}

                <div className="grid gap-2">
                    {SKILL_TEMPLATES.map((template) => {
                        const Icon = template.icon
                        return (
                            <ExampleCard
                                key={template.name}
                                icon={<Icon className="h-4 w-4 text-primary" />}
                                title={template.name}
                                description={template.description}
                                loading={loadingTemplate === template.file}
                                onClick={() => loadSkillTemplate(template)}
                            />
                        )
                    })}
                </div>

                <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
                    模板来自 drawio-uml-er-zh Skill，可直接编辑
                </p>
            </div>
        </div>
    )
}
