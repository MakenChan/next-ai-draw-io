import { PROJECT_SUMMARY_PROMPT } from "@/lib/project-summary-template"
export async function GET(){return Response.json({prompt:PROJECT_SUMMARY_PROMPT})}