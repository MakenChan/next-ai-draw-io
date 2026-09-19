# 通用生成与校验规范
- 黑白、无阴影：strokeColor=#000000；普通节点白色或无填充；rounded=0。
- 中文字体优先宋体；密集表格/类框字号 14~20，同类文字一致。
- 图内默认不加大标题；页面名承担图名。
- 主要阅读方向唯一：自上而下或自左向右；节点先对齐再连线。
- 文本不得溢出，图元不得重叠，标签不得压线。
- 每个 vertex 都有 mxGeometry；每个 edge 都有 <mxGeometry relative="1" as="geometry"/>。
- source/target 必须指向真实 cell；id 全局唯一；禁止双重 HTML 转义。
- 任何一条语义关系只使用一个 edge；折线路径放在同一 geometry 的 Array as="points"。
