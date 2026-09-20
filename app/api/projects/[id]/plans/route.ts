import { generateText } from "ai"
import { createPlan, getProject, listPlans } from "@/lib/project-db"
import { DIAGRAM_TYPES, type DiagramType } from "@/lib/project-types"
import { getAIModelFromRequest } from "@/lib/request-ai-model"
export const runtime="nodejs";export const maxDuration=120
const labels:Record<DiagramType,string[]>={sequence:["核心业务时序图","关键交互时序图","异常处理时序图"],flowchart:["核心业务流程图","主要操作流程图","异常处理流程图"],erd:["数据库 ERD"],dfd:["系统数据流图","核心业务数据流图","外部交互数据流图"],class:["核心领域类图"]}
function count(text:string,keys:string[]){for(const k of keys){const m=text.match(new RegExp(k+"\\s*(?:图)?\\s*[xX×*]?\\s*(\\d+)","i"));if(m)return Math.min(20,Math.max(0,Number(m[1])))}return 0}
function requested(text:string){return [{type:"sequence" as const,n:count(text,["时序","顺序","sequence"])},{type:"flowchart" as const,n:count(text,["流程","flowchart"])},{type:"erd" as const,n:count(text,["ERD","ER图","er"])},{type:"dfd" as const,n:count(text,["数据流","DFD"])},{type:"class" as const,n:count(text,["类图","class"])}]}
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return Response.json({plans:listPlans(id)})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params,p=getProject(id);if(!p)return Response.json({error:"Project not found"},{status:404})
 const b=await req.json(),text=String(b.requestText||"")
 if(Array.isArray(b.items)){const items=b.items.filter((x:any)=>DIAGRAM_TYPES.includes(x.type)).map((x:any)=>({type:x.type,title:String(x.title),description:String(x.description||"")}));return Response.json({plan:createPlan(id,text,items)},{status:201})}
 const counts=requested(text);if(!counts.some(x=>x.n))return Response.json({error:"没有识别到制图数量，例如：时序图3 流程图3 ER图1 数据流图3 类图1"},{status:400})
 if(p.summaryText.trim()){try{
  const {model,providerOptions,headers}=await getAIModelFromRequest(req)
  const wanted=counts.filter(x=>x.n).map(x=>`${x.type}=${x.n}`).join(", ")
  const out=await generateText({model,system:"你是软件架构制图规划器。只能使用项目总结中的事实，不得臆造。",prompt:`项目总结：\n${p.summaryText}\n\n用户要求：${text}\n数量约束：${wanted}\n\n请输出严格 JSON 数组，不要 markdown。每项格式：{"type":"sequence|flowchart|erd|dfd|class","title":"具体业务图名","description":"该图应覆盖的真实业务范围","evidence":["总结中的依据"]}。必须严格满足每种类型数量。`,maxOutputTokens:5000,...(providerOptions&&{providerOptions}),...(headers&&{headers})})
  const raw=out.text.replace(/^\`\`\`(?:json)?/i,"").replace(/\`\`\`$/,"").trim(),parsed=JSON.parse(raw)
  if(Array.isArray(parsed)){const items=parsed.filter((x:any)=>DIAGRAM_TYPES.includes(x.type)&&x.title).map((x:any)=>({type:x.type as DiagramType,title:String(x.title),description:String(x.description||""),evidence:Array.isArray(x.evidence)?x.evidence.map(String):[]}));const ok=counts.every(c=>items.filter((x:any)=>x.type===c.type).length===c.n);if(ok)return Response.json({plan:createPlan(id,text,items)},{status:201})}
 }catch(e){console.warn("[project-plan] AI planning failed; using deterministic fallback",e)}}
 const items=counts.flatMap(({type,n})=>Array.from({length:n},(_,i)=>({type,title:labels[type][i]||`${labels[type][0]} ${i+1}`,description:`根据项目总结规划的${type}图，第 ${i+1} 张。生成前可修改名称和描述。`})))
 return Response.json({plan:createPlan(id,text,items)},{status:201})
}