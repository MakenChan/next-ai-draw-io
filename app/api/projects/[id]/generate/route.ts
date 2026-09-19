import { generateText } from "ai"
import { getAIModel } from "@/lib/ai-providers"
import { createDiagram, getProject, getTask, setTaskStatus } from "@/lib/project-db"
import { diagramPrompt, wrapProjectMxCells } from "@/lib/project-diagram-prompts"\nimport { loadDiagramSkill } from "@/lib/project-skill-loader"

export const runtime="nodejs"
export const maxDuration=300

function clean(text:string){
 const fenced=text.match(/\`\`\`(?:xml)?\s*([\s\S]*?)\`\`\`/i)?.[1]||text
 return fenced.trim().replace(/^<\?xml[^>]*>\s*/,"").replace(/^<mxfile[\s\S]*?<root>/,"").replace(/<\/root>[\s\S]*<\/mxfile>\s*$/,"")
}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const project=getProject(id); if(!project)return Response.json({error:"Project not found"},{status:404})
 if(!project.summaryText.trim())return Response.json({error:"请先填写项目总结"},{status:400})
 const b=await req.json(); const task=getTask(String(b.taskId||"")); if(!task)return Response.json({error:"Task not found"},{status:404})
 setTaskStatus(task.id,"generating")
 try{
  const {model,providerOptions,headers}=getAIModel({
   provider:req.headers.get("x-ai-provider"),baseUrl:req.headers.get("x-ai-base-url"),
   apiKey:req.headers.get("x-ai-api-key"),modelId:req.headers.get("x-ai-model"),
   awsAccessKeyId:req.headers.get("x-aws-access-key-id"),awsSecretAccessKey:req.headers.get("x-aws-secret-access-key"),
   awsRegion:req.headers.get("x-aws-region"),awsSessionToken:req.headers.get("x-aws-session-token"),
   vertexApiKey:req.headers.get("x-vertex-api-key"),
  })
  const skillRules=await loadDiagramSkill(task.type)\n  const result=await generateText({model,prompt:diagramPrompt(task.type,task.title,task.description||"",project.summaryText,skillRules),maxOutputTokens:16000,...(providerOptions&&{providerOptions}),...(headers&&{headers})})
  const cells=clean(result.text)
  if(!cells.includes("<mxCell"))throw new Error("模型没有返回有效的 mxCell XML")
  const diagram=createDiagram({projectId:id,taskId:task.id,name:task.title,type:task.type,xml:wrapProjectMxCells(cells),source:"ai"})
  setTaskStatus(task.id,"completed")
  return Response.json({diagram})
 }catch(e){const message=e instanceof Error?e.message:"Generation failed";setTaskStatus(task.id,"failed",message);return Response.json({error:message},{status:500})}
}