# Project Workspace V1 开发计划

## 目标
在保留现有自由聊天 + Draw.io 生成/编辑能力的基础上，增加“项目工作区”模式。用户通过粘贴或上传项目总结，让 AI 规划并批量生成多张图，并长期保存项目、聊天、图表和版本。

## V1 范围
- 项目创建、列表、搜索、最近访问
- 项目总结：粘贴/编辑；上传 md/txt/pdf
- 项目总结 Prompt 模板
- 项目内聊天与历史记录
- Diagram Plan：先规划、用户确认后生成
- 图类型：时序图、流程图、Crow's Foot ERD、DFD、类图
- 批量生成任务与状态
- 图表库、缩略图、点击加载到 Draw.io
- Draw.io 手工编辑后保存
- 图表版本历史与恢复
- 保留原自由绘图模式

## 明确不做
- 本地源码扫描
- Tree-sitter/代码索引
- Embedding/向量数据库
- 跨仓库代码搜索

## 数据模型
Project -> ProjectDocument
Project -> ChatSession -> ChatMessage
Project -> DiagramPlan -> Diagram -> DiagramVersion

### projects
id, name, code, description, summary_text, created_at, updated_at, last_opened_at

### project_documents
id, project_id, name, mime_type, original_name, extracted_text, created_at

### chat_sessions
id, project_id, title, created_at, updated_at

### chat_messages
id, session_id, role, content_json, created_at

### diagram_plans
id, project_id, session_id, title, status, request_text, created_at, updated_at

### diagram_tasks
id, plan_id, diagram_type, title, description, sort_order, status, error, created_at, updated_at

### diagrams
id, project_id, task_id, name, diagram_type, xml, thumbnail_svg, current_version, created_at, updated_at

### diagram_versions
id, diagram_id, version, xml, source, created_at

## 阶段

### Phase 1 — 项目与持久化基础
1. 引入本地 SQLite 数据层。
2. 建表与初始化。
3. Projects CRUD API。
4. Project Summary CRUD API。
5. 项目列表/创建/详情基础 UI。
6. 不修改现有自由聊天链路。

验收：重启应用后项目和总结仍存在；可创建、搜索、打开、修改项目。

### Phase 2 — 项目内聊天
1. Session/Message 从浏览器 IndexedDB 扩展为项目级服务端持久化。
2. 保留现有旧 Session，避免破坏自由聊天。
3. 项目详情增加聊天列表。
4. 支持历史搜索。

验收：同一项目可有多次聊天，重启后可恢复。

### Phase 3 — Skill Engine
1. 将 drawio-uml-er-zh skill 纳入项目。
2. Skill Router 按 diagram_type 只加载需要的规则/模板。
3. 支持 sequence/flowchart/erd/dfd/class。
4. 项目总结作为生成事实来源；信息不足时不得臆造。

验收：五种图均可由同一项目总结独立生成。

### Phase 4 — Diagram Planner + 批量生成
1. 新增 plan_diagrams API/tool。
2. AI 根据“时序图3、流程图3...”输出结构化任务。
3. UI 可改名、删除、新增、调整类型。
4. 确认后进入任务队列。
5. 本地单用户先使用 SQLite task 状态 + 2 个并发 worker，不引入 Redis。

验收：单次 10+ 张图允许部分成功、失败重试，不因一张失败丢失其他结果。

### Phase 5 — Diagram Library
1. 图表成为独立实体，不再只依附聊天消息。
2. 项目图表按类型分组。
3. 保存 SVG 缩略图。
4. 点击图表 -> loadDiagram(xml) -> Draw.io。
5. Draw.io 编辑后保存回 diagram。

验收：离开聊天后仍可独立打开、编辑、保存每张图。

### Phase 6 — 版本与搜索
1. 每次 AI/人工保存创建 DiagramVersion。
2. 支持查看/恢复历史版本。
3. 全局搜索项目、聊天标题、图表名、项目总结。
4. 最近项目/收藏（收藏可作为后续小版本）。

## 关键原则
- 现有 display_diagram/edit_diagram/append_diagram 保留。
- 项目模式复用现有 XML validator、react-drawio、Tool Calling。
- AI 不直接决定批量生成顺序：先 Plan，再确认，再执行。
- Diagram 是一等实体。
- V1 的事实来源只有用户提供的项目总结/总结文件。
- 生成内容超出总结事实时应标记“信息不足”，而不是编造。
