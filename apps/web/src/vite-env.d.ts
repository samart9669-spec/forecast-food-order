/// <reference types="vite/client" />
interface Window { showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>; }
interface FileSystemHandle { kind: "file" | "directory"; name: string; }
interface FileSystemFileHandle extends FileSystemHandle { kind: "file"; getFile(): Promise<File>; }
interface FileSystemDirectoryHandle extends FileSystemHandle { kind: "directory"; entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>; }
