"use client"

import { FileCode2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useDiagram } from "@/contexts/diagram-context"
import {
    getActiveDrawioRelativePath,
    getLocalDrawioDirectoryHandle,
    saveActiveDrawioRelativePath,
} from "@/lib/local-drawio-folder-storage"

type DrawioFileEntry = {
    name: string
    relativePath: string
    handle: FileSystemFileHandle
}

async function collectDrawioFiles(
    directory: FileSystemDirectoryHandle,
    prefix = "",
): Promise<DrawioFileEntry[]> {
    const files: DrawioFileEntry[] = []
    const iterable = directory as FileSystemDirectoryHandle & {
        entries(): AsyncIterableIterator<[string, FileSystemHandle]>
    }

    for await (const [name, handle] of iterable.entries()) {
        const relativePath = prefix ? `${prefix}/${name}` : name

        if (handle.kind === "directory") {
            files.push(
                ...(await collectDrawioFiles(
                    handle as FileSystemDirectoryHandle,
                    relativePath,
                )),
            )
        } else if (
            name.toLowerCase().endsWith(".drawio") ||
            name.toLowerCase().endsWith(".drawio.xml")
        ) {
            files.push({
                name,
                relativePath,
                handle: handle as FileSystemFileHandle,
            })
        }
    }

    return files.sort((a, b) =>
        a.relativePath.localeCompare(b.relativePath, "zh-CN"),
    )
}

export function LocalDrawioFileSwitcher() {
    const { chartXML, loadDiagram, setDiagramHistory } = useDiagram()
    const [files, setFiles] = useState<DrawioFileEntry[]>([])
    const [activePath, setActivePath] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        void (async () => {
            try {
                const directory = await getLocalDrawioDirectoryHandle()
                if (!directory) return

                const permissionHandle = directory as FileSystemDirectoryHandle & {
                    queryPermission?: (options?: {
                        mode?: "read" | "readwrite"
                    }) => Promise<PermissionState>
                }
                const permission = permissionHandle.queryPermission
                    ? await permissionHandle.queryPermission({ mode: "readwrite" })
                    : "granted"

                if (permission !== "granted") return

                const nextFiles = await collectDrawioFiles(directory)
                const storedPath = await getActiveDrawioRelativePath()
                if (cancelled) return

                setFiles(nextFiles)
                setActivePath(
                    storedPath &&
                        nextFiles.some((item) => item.relativePath === storedPath)
                        ? storedPath
                        : "",
                )
            } catch (error) {
                console.warn("[drawio-switcher] Failed to restore files", error)
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [])

    const switchFile = async (relativePath: string) => {
        if (!relativePath || relativePath === activePath) return

        const nextEntry = files.find(
            (entry) => entry.relativePath === relativePath,
        )
        if (!nextEntry) return

        if (activePath) {
            const currentEntry = files.find(
                (entry) => entry.relativePath === activePath,
            )
            if (currentEntry) {
                try {
                    const currentFile = await currentEntry.handle.getFile()
                    const savedXml = await currentFile.text()
                    if (
                        chartXML.trim() !== savedXml.trim() &&
                        !window.confirm(
                            `“${currentEntry.name}”有未保存修改。确定切换文件吗？`,
                        )
                    ) {
                        return
                    }
                } catch {
                    // If the previous file can no longer be read, allow switching.
                }
            }
        }

        setLoading(true)
        try {
            const file = await nextEntry.handle.getFile()
            const xml = await file.text()
            if (!xml.includes("<mxfile") && !xml.includes("<mxGraphModel")) {
                throw new Error("不是有效的 Draw.io XML")
            }

            const error = loadDiagram(xml, true)
            if (error) throw new Error(error)

            await saveActiveDrawioRelativePath(nextEntry.relativePath)
            setActivePath(nextEntry.relativePath)
            setDiagramHistory([])
            toast.success(`已切换：${nextEntry.name}`)
        } catch (error) {
            console.error("[drawio-switcher] Failed to switch file", error)
            toast.error(
                error instanceof Error ? error.message : "切换文件失败",
            )
        } finally {
            setLoading(false)
        }
    }

    if (files.length === 0) return null

    return (
        <div className="flex items-center gap-2 border-b border-border/50 bg-card/70 px-4 py-2">
            <FileCode2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="shrink-0 text-xs text-muted-foreground">
                当前文件
            </span>
            <select
                value={activePath}
                disabled={loading}
                onChange={(event) => void switchFile(event.target.value)}
                className="h-8 min-w-0 flex-1 truncate rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                title={activePath || "选择 Draw.io 文件"}
            >
                <option value="">选择 Draw.io 文件</option>
                {files.map((entry) => (
                    <option key={entry.relativePath} value={entry.relativePath}>
                        {entry.relativePath}
                    </option>
                ))}
            </select>
        </div>
    )
}
