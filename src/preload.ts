// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";
import { broadcast_event } from "./shared/functions";
import { TCompressDirContent } from "./shared/types";

ipcRenderer.on("archive-data-ev", (ev, data) => {
  console.log("got data from main process", data);
  broadcast_event("archive-data", data);
});

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const renderer = {
  open_select_archive_dialog: async () => {
    return await ipcRenderer.invoke("open-select-archive-dlg");
  },
  handle_extract: async (file_path: string, content: string[]) => {
    return await ipcRenderer.invoke("extract-archv", file_path, content);
  },
  open_compress_file_dialog: async () => {
    return await ipcRenderer.invoke("open-compress-file-dlg");
  },
  handle_compress: async (data: TCompressDirContent) => {
    return await ipcRenderer.invoke("compress-dir", data);
  },
  windowMinimize: () => {
    ipcRenderer.invoke("window-minimize");
  },
  windowMaximize: () => {
    ipcRenderer.invoke("window-maximize");
  },
  windowClose: () => {
    ipcRenderer.invoke("window-close");
  },
  windowIsMaximized: async () => {
    return await ipcRenderer.invoke("window-is-maximized");
  },
};

contextBridge.exposeInMainWorld("electron", renderer);

export type TRenderer = typeof renderer;
