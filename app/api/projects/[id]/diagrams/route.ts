import { createDiagram, listDiagrams } from "@/lib/project-db"
import { DIAGRAM_TYPES } from "@/lib/project-types"
export const runtime="nodejs"
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const q=new URL(req.url).searchParams.get("q")||"";return Response.json({diagrams:listDiagrams(id,q)})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await req.json();if(!DIAGRAM_TYPES.includes(b.type)||typeof b.xml!=="string")return Response.json({error:"Invalid diagram"},{status:400});return Response.json({diagram:createDiagram({projectId:id,taskId:b.taskId,name:b.name||"未命名图表",type:b.type,xml:b.xml,thumbnailSvg:b.thumbnailSvg,source:b.source||"manual"})},{status:201})}