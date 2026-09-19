import { generateText } from "ai"
import { getAIModel } from "@/lib/ai-providers"
import { addChatMessage, getProject, listChatMessages } from "@/lib/project-db"
export const runtime="nodejs"; export const maxDuration=300
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const p=getProject(id);if(!p)return Response.json({error:"Project not found"},{status:404})
 const b=await req.json();if(typeof b.sessionId!=="string"||typeof b.message!=="string")return Response.json({error:"Invalid request"},{status:400})
 addChatMessage(b.sessionId,"user",b.message)
 const history=listChatMessages(b.sessionId).slice(-20).map(m=>`${m.role}: ${m.content}`).join("\n")
 try{const {model,providerOptions,headers}=getAIModel({provider:req.headers.get("x-ai-provider"),baseUrl:req.headers.get("x-ai-base-url"),apiKey:req.headers.get("x-ai-api-key"),modelId:req.headers.get("x-ai-model")})
 const out=await generateText({model,system:`你是项目架构分析助手。只能根据下面的项目总结回答；信息不足时明确说明。\n\n项目总结：\n${p.summaryText}`,prompt:`对话记录：\n${history}\n\n请回答最后一个用户问题。`,maxOutputTokens:4000,...(providerOptions&&{providerOptions}),...(headers&&{headers})})
 const message=addChatMessage(b.sessionId,"assistant",out.text);return Response.json({message})
 }catch(e){return Response.json({error:e instanceof Error?e.message:"Chat failed"},{status:500})}
}