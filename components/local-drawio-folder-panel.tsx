"use client"

import {
    ChevronRight,
    FileCode2,
    FolderOpen,
    RefreshCw,
    Save,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useDiagram } from "@/contexts/diagram-context"
import { cn } from "@/lib/utils"

type DrawioFileEntry = {
    name: string
    relativePath: string
    handle: FileSystemFileHandle
}

type DirectoryPickerWindow = Window & {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
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
            continue
        }

        if (
            handle.kind === "file" &&
            (name.toLowerCase().endsWith(".drawio") ||
                name.toLowerCase().endsWith(".drawio.xml"))
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

export function LocalDrawioFolderPanel() {
    const { chartXML, loadDiagram, setDiagramHistory } = useDiagram()
    const [directoryHandle, setDirectoryHandle] =
        useState<FileSystemDirectoryHandle | null>(null)
    const [files, setFiles] = useState<DrawioFileEntry[]>([])
    const [activeFile, setActiveFile] = useState<DrawioFileEntry | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const lastSavedXmlRef = useRef("")

    const supported =
        typeof window !== "undefined" &&
        typeof (window as DirectoryPickerWindow).showDirectoryPicker ===
            "function"

    const dirty = activeFile
        ? chartXML.trim() !== lastSavedXmlRef.current.trim()
        : false

    const refreshFiles = useCallback(
        async (handle = directoryHandle) => {
            if (!handle) return
            setLoading(true)
            try {
                const nextFiles = await collectDrawioFiles(handle)
                setFiles(nextFiles)
            } catch (error) {
                console.error("[drawio-folder] Failed to scan folder", error)
                toast.error("读取文件夹失败")
            } finally {
                setLoading(false)
            }
        },
        [directoryHandle],
    )

    const openFolder = useCallback(async () => {
        const picker = (window as DirectoryPickerWindow).showDirectoryPicker
        if (!picker) {
            toast.error("当前浏览器不支持打开本地文件夹，请使用 Chrome / Edge 或桌面版")
            return
        }

        try {
            const handle = await picker()
            setDirectoryHandle(handle)
            setActiveFile(null)
            lastSavedXmlRef.current = ""
            setDiagramHistory([])
            await refreshFiles(handle)
        } catch (error) {
            if ((error as DOMException)?.name !== "AbortError") {
                console.error("[drawio-folder] Failed to open folder", error)
                toast.error("打开文件夹失败")
            }
        }
    }, [refreshFiles, setDiagramHistory])

    const openFile = useCallback(
        async (entry: DrawioFileEntry) => {
            if (
                dirty &&
                activeFile &&
                !window.confirm(
                    `“${activeFile.name}”有未保存的修改。确定切换到其他文件吗？`,
                )
            ) {
                return
            }

            setLoading(true)
            try {
                const file = await entry.handle.getFile()
                const xml = await file.text()
                if (!xml.includes("<mxfile") && !xml.includes("<mxGraphModel")) {
                    throw new Error("不是有效的 Draw.io XML")
                }

                const error = loadDiagram(xml, true)
                if (error) throw new Error(error)

                lastSavedXmlRef.current = xml
                setActiveFile(entry)
                setDiagramHistory([])
                toast.success(`已打开：${entry.name}`)
            } catch (error) {
                console.error("[drawio-folder] Failed to open file", error)
                toast.error(
                    error instanceof Error ? error.message : "打开文件失败",
                )
            } finally {
                setLoading(false)
            }
        },
        [activeFile, dirty, loadDiagram, setDiagramHistory],
    )

    const saveCurrentFile = useCallback(async () => {
        if (!activeFile) {
            toast.error("请先从左侧选择一个 Draw.io 文件")
            return
        }
        if (!chartXML.trim()) {
            toast.error("当前画布没有可保存的内容")
            return
        }

        setSaving(true)
        try {
            const writable = await activeFile.handle.createWritable()
            await writable.write(chartXML)
            await writable.close()
            lastSavedXmlRef.current = chartXML
            toast.success(`已保存：${activeFile.name}`)
        } catch (error) {
            console.error("[drawio-folder] Failed to save file", error)
            toast.error(
                error instanceof Error ? error.message : "保存文件失败",
            )
        } finally {
            setSaving(false)
        }
    }, [activeFile, chartXML])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                activeFile &&
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault()
                void saveCurrentFile()
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [activeFile, saveCurrentFile])

    return (
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/30 bg-card shadow-soft-lg">
            <div className="border-b border-border/50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-sm font-semibold">Draw.io 文件</div>
                        <div className="truncate text-xs text-muted-foreground">
                            {directoryHandle?.name || "尚未打开文件夹"}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => void openFolder()}
                        title="打开文件夹"
                    >
                        <FolderOpen className="size-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1"
                        onClick={() => void openFolder()}
                    >
                        <FolderOpen className="size-3.5" />
                        打开文件夹
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={!directoryHandle || loading}
                        onClick={() => void refreshFiles()}
                        title="刷新文件列表"
                    >
                        <RefreshCw
                            className={cn("size-3.5", loading && "animate-spin")}
                        />
                    </Button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-2">
                {!supported ? (
                    <div className="rounded-lg border border-dashed p-3 text-xs leading-5 text-muted-foreground">
                        当前环境不支持文件夹访问。请使用 Chrome、Edge 或桌面版。
                    </div>
                ) : !directoryHandle ? (
                    <button
                        type="button"
                        onClick={() => void openFolder()}
                        className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center text-xs text-muted-foreground hover:bg-accent/50"
                    >
                        <FolderOpen className="size-6" />
                        打开包含 .drawio 文件的文件夹
                    </button>
                ) : files.length === 0 && !loading ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        没有找到 .drawio 文件
                    </div>
                ) : (
                    <div className="space-y-1">
                        {files.map((entry) => {
                            const selected =
                                activeFile?.relativePath === entry.relativePath
                            return (
                                <button
                                    type="button"
                                    key={entry.relativePath}
                                    onClick={() => void openFile(entry)}
                                    className={cn(
                                        "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors",
                                        selected
                                            ? "bg-accent font-medium text-accent-foreground"
                                            : "hover:bg-accent/60",
                                    )}
                                    title={entry.relativePath}
                                >
                                    <FileCode2 className="size-4 shrink-0 text-muted-foreground" />
                                    <span className="min-w-0 flex-1 truncate">
                                        {entry.relativePath}
                                    </span>
                                    <ChevronRight className="size-3.5 shrink-0 opacity-0 group-hover:opacity-60" />
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="border-t border-border/50 p-3">
                <div className="mb-2 min-w-0">
                    <div className="truncate text-xs font-medium">
                        {activeFile?.name || "未选择文件"}
                    </div>
                    {activeFile && (
                        <div
                            className={cn(
                                "mt-0.5 text-[11px]",
                                dirty
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground",
                            )}
                        >
                            {dirty ? "有未保存修改" : "已保存"}
                        </div>
                    )}
                </div>

                <Button
                    className="w-full"
                    size="sm"
                    disabled={!activeFile || saving}
                    onClick={() => void saveCurrentFile()}
                >
                    <Save className="size-3.5" />
                    {saving ? "保存中..." : "保存当前文件"}
                </Button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    支持 Ctrl/Cmd + S · AI 修改后可直接保存
                </p>
            </div>
        </div>
    )
}
