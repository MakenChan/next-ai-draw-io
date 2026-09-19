"use client"
import { ArrowLeft, History, Save } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DrawIoEmbed, type DrawIoEmbedRef } from "react-drawio"
import { Button } from "@/components/ui/button"
import type { DiagramVersion, ProjectDiagram } from "@/lib/project-types"

export default function ProjectDiagramEditor(){
 const p=useParams<{lang:string;id:string;diagramId:string}>(),router=useRouter(),ref=useRef<DrawIoEmbedRef|null>(null)
 const [d,setD]=useState<ProjectDiagram|null>(null),[versions,setVersions]=useState<DiagramVersion[]>([]),[status,setStatus]=useState("")
 const pendingXml=useRef<string|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),saving=useRef(false)
 async function load(){const x=await fetch(`/api/project-diagrams/${p.diagramId}`).then(r=>r.json());setD(x.diagram||null)}
 async function loadVersions(){const x=await fetch(`/api/project-diagrams/${p.diagramId}/versions`).then(r=>r.json());setVersions(x.versions||[])}
 useEffect(()=>{load();loadVersions();return()=>{if(timer.current)clearTimeout(timer.current)}},[p.diagramId])
 async function persist(xml:string){if(saving.current){pendingXml.current=xml;return} saving.current=true;setStatus("保存中...");try{const x=await fetch(`/api/project-diagrams/${p.diagramId}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({xml,source:"manual"})}).then(r=>r.json());if(x.diagram)setD(x.diagram);setStatus("已保存");await loadVersions()}finally{saving.current=false;if(pendingXml.current&&pendingXml.current!==xml){const next=pendingXml.current;pendingXml.current=null;void persist(next)}}}
 function scheduleSave(xml:string){pendingXml.current=xml;setStatus("有未保存修改");if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{const next=pendingXml.current;pendingXml.current=null;if(next)void persist(next)},1200)}
 async function restore(v:number){if(timer.current)clearTimeout(timer.current);pendingXml.current=null;const x=await fetch(`/api/project-diagrams/${p.diagramId}/versions`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({version:v})}).then(r=>r.json());if(x.diagram){setD(x.diagram);ref.current?.load({xml:x.diagram.xml});setStatus(`已恢复 v${v}`);loadVersions()}}
 if(!d)return <div className="p-8">加载图表...</div>
 return <main className="h-screen bg-background flex flex-col">
  <header className="h-14 border-b flex items-center gap-3 px-4"><Button variant="ghost" size="icon" onClick={()=>router.push(`/${p.lang}/projects/${p.id}`)}><ArrowLeft/></Button><strong className="flex-1">{d.name}</strong><span className="text-sm text-muted-foreground">{status}</span><Button variant="outline" onClick={()=>ref.current?.exportDiagram({format:"xmlsvg"})}><Save/>导出</Button></header>
  <div className="flex min-h-0 flex-1">
   <div className="min-w-0 flex-1 p-2"><div className="h-full overflow-hidden rounded-xl border"><DrawIoEmbed ref={ref} autosave onLoad={()=>ref.current?.load({xml:d.xml})} onAutoSave={(data:any)=>{if(data?.xml&&data.xml!==d.xml)scheduleSave(data.xml)}} urlParameters={{ui:"kennedy",spin:false,libraries:false,saveAndExit:false,noSaveBtn:true,noExitBtn:true}}/></div></div>
   <aside className="w-64 border-l p-3 overflow-auto"><div className="mb-3 flex items-center gap-2 font-medium"><History className="size-4"/>版本历史</div>{versions.map(v=><button key={v.id} onClick={()=>restore(v.version)} className="mb-2 w-full rounded border p-2 text-left text-sm hover:bg-accent"><b>v{v.version}</b> · {v.source}<div className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</div></button>)}</aside>
  </div>
 </main>
}