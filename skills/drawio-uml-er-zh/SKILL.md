---
name: drawio-uml-er-zh
description: 从代码、数据库结构或业务说明生成和修订中文 draw.io 图，覆盖流程/顺序/类图、DFD、Crow's Foot ERD 等。
---

# drawio-uml-er-zh

项目工作区只启用 V1 图种：流程图、顺序图、类图、DFD、Crow's Foot ERD。

## 路由
生成前读取 references/shared.md，再按图种读取：
- flowchart -> references/module-flow-usecase.md
- sequence -> references/behavior.md
- class / erd -> references/class-er.md
- dfd -> references/dfd.md

## 原则
1. 项目总结是事实来源，信息不足不得臆造。
2. 先整理节点、关系、方向、基数，再生成 XML。
3. 每条语义关系只用一个 edge；折线路径写入该 edge 的 mxGeometry。
4. XML 必须可编辑、可解析。
