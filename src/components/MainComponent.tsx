import React from "react";
import ExtractComponent from "./ExtractComponent";
import { useMainStore } from "../shared/zustand-state";
import CompressComponent from "./CompressComponent";
import TitleBar from "./TitleBar";

export default React.memo((props: any) => {
    const set_state = useMainStore(state => state.set_state)
    const [loading_extract, set_loading_extract] = React.useState<boolean>(false)
    const [loading_compress, set_loading_compress] = React.useState<boolean>(false)
    const [active_tab, set_active_tab] = React.useState<'extract' | 'compress'>('extract')
    const extract_dir_content = useMainStore(state => state.extract_dir_content)
    const compress_dir_content = useMainStore(state => state.compress_dir_content)

    const handle_open_achv_file = React.useCallback(async () => {
        set_loading_extract(true)
        const achv = await window.electron.open_select_archive_dialog()
        set_loading_extract(false)
        if (achv) {
            set_state('extract_dir_content', achv)            
        }
    }, [])

    const handle_open_compress_dlg = React.useCallback(async (file_type: 'tar' | 'gzip' | 'tgz' | 'zip') => {
        set_loading_compress(true)
        const dir_to_compress = await window.electron.open_compress_file_dialog()
        set_loading_compress(false)
        console.log("dir_to_compress", dir_to_compress)
        if (dir_to_compress) {
            set_state('compress_dir_content', {
                file_type,
                ...dir_to_compress
            })            
        }
    }, [])

    React.useLayoutEffect(() => {
        window.addEventListener("archive-data", (ev: CustomEvent) => {
            set_state('extract_dir_content', ev.detail)
        })
    }, [])

    return (
        <div className="w-full h-[100vh] flex flex-col overflow-hidden">
            <TitleBar />
            <div className="flex justify-center gap-2 p-4 pb-2">
                <button
                    onClick={() => set_active_tab('extract')}
                    className={`px-8 py-3 rounded-2xl cursor-pointer font-medium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                        active_tab === 'extract' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xl scale-105' 
                            : 'glass-blue'
                    }`}
                >
                    Extraer Archivo
                </button>
                
                <button
                    onClick={() => set_active_tab('compress')}
                    className={`px-8 py-3 rounded-2xl cursor-pointer font-medium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                        active_tab === 'compress' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xl scale-105' 
                            : 'glass-blue'
                    }`}
                >
                    Comprimir Archivos
                </button>
            </div>

            {active_tab === 'extract' && (
            <div className="w-full h-full p-4">
                {
                    !extract_dir_content ?
                    <div className="w-full h-full flex items-center justify-center">
                        <button 
                            onClick={handle_open_achv_file} 
                            className="glass-strong px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 border border-white/30 hover:border-white/50"
                        >
                            {
                                loading_extract ?
                                <div className="flex items-center gap-3">
                                    <span className="loading loading-spinner loading-md text-blue-300"></span>
                                    <span>Abriendo archivo...</span>
                                </div>:
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span>Abrir Archivo</span>
                                </div>
                            }
                        </button>
                    </div>:
                    <div className="w-full h-full glass-strong rounded-3xl p-6 overflow-hidden">
                        <ExtractComponent />
                    </div>
                }
            </div>
            )}

            {active_tab === 'compress' && (
            <div className="w-full h-full p-4">
                {
                    !compress_dir_content ?
                    <div className="w-full h-full flex items-center justify-center">
                        <details className="dropdown dropdown-bottom">
                            <summary className="glass-strong px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 border border-white/30 hover:border-white/50 cursor-pointer list-none">
                                {
                                    loading_compress ?
                                    <div className="flex items-center gap-3">
                                        <span className="loading loading-spinner loading-md text-blue-300"></span>
                                        <span>Cargando directorio...</span>
                                    </div>:
                                    <div className="flex items-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Comprimir Carpeta/Archivo</span>
                                    </div>
                                }
                            </summary>
                            <ul className="glass-strong menu dropdown-content rounded-2xl z-[1] w-64 p-3 shadow-2xl border border-white/20 mt-2">
                                <li>
                                    <a 
                                        onClick={() => handle_open_compress_dlg('tar')} 
                                        className="text-white hover:bg-blue-500/30 rounded-xl transition-all duration-200"
                                    >
                                        <span className="font-medium">🗂️ Archivo Tar</span>
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        onClick={() => handle_open_compress_dlg('gzip')} 
                                        className="text-white hover:bg-blue-500/30 rounded-xl transition-all duration-200"
                                    >
                                        <span className="font-medium">🗂️ Archivo Gzip</span>
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        onClick={() => handle_open_compress_dlg('tgz')} 
                                        className="text-white hover:bg-blue-500/30 rounded-xl transition-all duration-200"
                                    >
                                        <span className="font-medium">🗂️ Archivo Tgz</span>
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        onClick={() => handle_open_compress_dlg('zip')} 
                                        className="text-white hover:bg-blue-500/30 rounded-xl transition-all duration-200"
                                    >
                                        <span className="font-medium">🗂️ Archivo Zip</span>
                                    </a>
                                </li>
                            </ul>
                        </details>
                    </div>:
                    <div className="w-full h-full glass-strong rounded-3xl p-6 overflow-hidden">
                        <CompressComponent />
                    </div>
                }
            </div>
            )}
        </div>
    )
})