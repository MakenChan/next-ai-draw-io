import { listVersions, restoreVersion } from "@/lib/project-db"
export const runtime="nodejs"
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return Response.json({versions:listVersions(id)})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await req.json();const diagram=restoreVersion(id,Number(b.version));return diagram?Response.json({diagram}):Response.json({error:"Version not found"},{status:404})}