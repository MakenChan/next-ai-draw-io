import { createChatSession, listChatSessions } from "@/lib/project-db"
export const runtime="nodejs"
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return Response.json({sessions:listChatSessions(id)})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await req.json().catch(()=>({}));return Response.json({session:createChatSession(id,b.title||"新对话")},{status:201})}