"use client"
import { Copy, Upload } from "lucide-react"
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { extractPdfText, extractTextFileContent, isPdfFile, isTextFile, MAX_EXTRACTED_CHARS } from "@/lib/pdf-utils"
export function ProjectSummaryTools({projectId,onImported}:{projectId:string;onImported:(text:string)=>void}){
 const [busy,setBusy]=useState(false)
 async function copyPrompt(){const x=await fetch("/api/projects/summary-template").then(r=>r.json());await navigator.clipboard.writeText(x.prompt)}
 async function upload(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;setBusy(true);try{let text="";if(isPdfFile(f))text=await extractPdfText(f);else if(isTextFile(f))text=await extractTextFileContent(f);else throw new Error("仅支持 PDF、Markdown 和文本文件");text=text.slice(0,MAX_EXTRACTED_CHARS);await fetch(`/api/projects/${projectId}/documents`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:f.name,originalName:f.name,mimeType:f.type,extractedText:text,useAsSummary:true})});onImported(text)}finally{setBusy(false);e.target.value=""}}
 return <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={copyPrompt}><Copy/>复制项目总结 Prompt</Button><label className="inline-flex"><input type="file" accept=".md,.txt,.pdf,text/plain,text/markdown,application/pdf" className="hidden" onChange={upload}/><span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm"><Upload className="size-4"/>{busy?"解析中...":"上传总结文件"}</span></label></div>
}