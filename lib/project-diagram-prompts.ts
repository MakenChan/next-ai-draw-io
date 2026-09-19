import type { DiagramType } from "@/lib/project-types"

export function diagramPrompt(type: DiagramType, title: string, description: string, summary: string, skillRules: string) {
 return `你负责根据项目总结生成可编辑的 draw.io mxGraph XML。

项目总结（唯一事实来源）：
${summary}

制图任务：
标题：${title}
类型：${type}
说明：${description || "无"}

当前图种 Skill 规则：
${skillRules}

额外输出约束：
- 只能使用项目总结能支持的事实；信息不足时降低细节层级，不得编造。
- 只输出同级 <mxCell> 元素，不输出 Markdown、解释、<mxfile>、<mxGraphModel>、<root> 或 id=0/1 的根 cell。
- 每个 mxCell id 唯一，顶层 parent="1"。
- 每个 vertex 必须包含 mxGeometry；每个 edge 必须包含 mxGeometry relative="1" as="geometry"。
- XML 属性正确转义。
`
}

export function wrapProjectMxCells(cells: string) {
 return `<mxfile host="app.diagrams.net"><diagram name="Page-1" id="project-diagram"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel></diagram></mxfile>`
}
