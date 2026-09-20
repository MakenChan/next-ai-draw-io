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

interface ExampleCardProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick: () => void
}

function ExampleCard({ icon, title, description, onClick }: ExampleCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group w-full rounded-xl border border-border/60 bg-card p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {title}
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
        prompt: "请使用 drawio-uml-er-zh Skill 中的「功能模块图.drawio」模板风格，生成一张中文功能模块图。先保持模板的版式、层级、间距和黑白风格，再根据我的后续描述替换模板内容。",
        icon: Boxes,
    },
    {
        name: "流程图",
        description: "开始、处理、判断、分支、回环的标准业务流程图。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「流程图.drawio」模板风格，生成一张中文业务流程图。保持模板的节点样式、正交连线、判断分支标签和整体布局，再根据我的后续描述替换内容。",
        icon: GitBranch,
    },
    {
        name: "活动图",
        description: "适合角色泳道、并发、分支与合并的 UML 活动图。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「活动图.drawio」模板风格，生成一张中文 UML 活动图。保持模板泳道、活动节点、分支合并和结束节点样式，再根据我的后续描述替换内容。",
        icon: Activity,
    },
    {
        name: "状态图",
        description: "展示对象生命周期、状态以及事件驱动的状态迁移。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「状态图.drawio」模板风格，生成一张中文 UML 状态图。保持模板的初始状态、状态节点、迁移线和终止状态样式，再根据我的后续描述替换内容。",
        icon: Workflow,
    },
    {
        name: "顺序图",
        description: "参与者、生命线、激活条、同步调用与返回消息。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「顺序图.drawio」模板风格，生成一张中文 UML 顺序图。保持模板的参与者、生命线、激活条、消息间距和返回虚线，再根据我的后续描述替换内容。",
        icon: Share2,
    },
    {
        name: "用例图",
        description: "展示参与者、系统边界、用例和参与关系。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「用例图.drawio」模板风格，生成一张中文 UML 用例图。保持模板的 Actor、系统边界、用例椭圆和关系线布局，再根据我的后续描述替换内容。",
        icon: Users,
    },
    {
        name: "类图",
        description: "类名、属性、方法以及继承、关联、依赖等关系。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「类图.drawio」模板风格，生成一张中文 UML 类图。每个类保持类名、属性、方法三区结构，只使用有依据的 UML 关系，再根据我的后续描述替换内容。",
        icon: Boxes,
    },
    {
        name: "ERD 鸡爪图",
        description: "表、字段、PK/FK 和 Crow's Foot 基数关系。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「ERD_鸡爪图.drawio」模板风格，生成一张中文 Crow's Foot ERD。保持实体表、字段、PK/FK 和鸡爪基数标记的样式，再根据我的后续数据库结构替换内容。",
        icon: Database,
    },
    {
        name: "ER 图",
        description: "实体、联系和基数表达的概念级 Chen ER 图。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「ER图.drawio」模板风格，生成一张中文 Chen ER 图。保持实体矩形、联系菱形和基数标注的模板样式，再根据我的后续描述替换内容。",
        icon: Database,
    },
    {
        name: "数据流图",
        description: "外部实体、处理过程、数据存储以及数据流。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「数据流图.drawio」模板风格，生成一张中文 DFD 数据流图。保持模板的外部实体、处理过程、数据存储和带标签数据流样式，再根据我的后续描述替换内容。",
        icon: Network,
    },
    {
        name: "架构图",
        description: "系统分层、组件、服务、数据库和外部依赖关系。",
        prompt: "请使用 drawio-uml-er-zh Skill 中的「架构图.drawio」模板风格，生成一张中文系统架构图。保持模板的分层、组件间距、连接关系和整体黑白风格，再根据我的后续描述替换内容。",
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
    const chooseTemplate = (prompt: string) => {
        setInput(prompt)
        setFiles([])
    }

    return (
        <div className={minimal ? "" : "px-2 py-6 animate-fade-in"}>
            {!minimal && (
                <div className="mb-5 text-center">
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                        Skill 模板图
                    </h2>
                    <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                        选择你上传的 drawio-uml-er-zh 模板作为制图起点
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
                                onClick={() => chooseTemplate(template.prompt)}
                            />
                        )
                    })}
                </div>

                <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
                    点击模板后，可继续补充业务、数据库或系统说明再发送
                </p>
            </div>
        </div>
    )
}
