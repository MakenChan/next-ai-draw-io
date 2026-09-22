"use client"

import { openDB } from "idb"

const DB_NAME = "next-ai-drawio-local-folder"
const STORE_NAME = "state"
const DB_VERSION = 1
const DIRECTORY_KEY = "directory-handle"
const ACTIVE_PATH_KEY = "active-relative-path"

async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        },
    })
}

export async function saveLocalDrawioDirectoryHandle(
    handle: FileSystemDirectoryHandle,
): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAME, handle, DIRECTORY_KEY)
}

export async function getLocalDrawioDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    const db = await getDB()
    return (await db.get(STORE_NAME, DIRECTORY_KEY)) || null
}

export async function saveActiveDrawioRelativePath(
    relativePath: string | null,
): Promise<void> {
    const db = await getDB()
    if (relativePath) {
        await db.put(STORE_NAME, relativePath, ACTIVE_PATH_KEY)
    } else {
        await db.delete(STORE_NAME, ACTIVE_PATH_KEY)
    }
}

export async function getActiveDrawioRelativePath(): Promise<string | null> {
    const db = await getDB()
    return (await db.get(STORE_NAME, ACTIVE_PATH_KEY)) || null
}
