import React from "react";
import { useMainStore } from "../shared/zustand-state";
import { TArchiveExtract } from "src/shared/types";

export default React.memo((props: any) => {
    const set_state = useMainStore(state => state.set_state)
    const extract_dir_content = useMainStore(state => state.extract_dir_content)
    const extract_dir_content_ref = React.useRef(extract_dir_content)
    const [default_data, set_default_data] = React.useState<string[]>(extract_dir_content?.content.slice(0,50))
    const default_data_memo = React.useMemo(() => default_data, [default_data])
    const item_container_ref = React.useRef<HTMLFormElement|null>(null)
    const current_data_ref = React.useRef<number>(50)
    const [extracting, set_extracting] = React.useState(false)

    const handle_extract = React.useCallback(async (all = true) => {
        let inputs = extract_dir_content.content
        if (!all) {
            inputs = [];
            (item_container_ref.current['extract-archv'] as RadioNodeList).forEach((node: HTMLInputElement) => {
                if (node.checked) {
                    inputs.push(node.value)
                }
            });
            console.log("nodenodenode", inputs)
        }
        set_extracting(true)
        const extract = await window.electron.handle_extract(extract_dir_content.file_path, inputs)
        set_extracting(false)
    }, [extract_dir_content, item_container_ref.current])

    const handle_cancel = React.useCallback(() => {
        set_state('extract_dir_content', undefined)
    }, [])
    
    React.useLayoutEffect(() => {
        if (item_container_ref.current) {
            item_container_ref.current.addEventListener('scroll', (ev: MouseEvent) => {
                const targetEl = ev.currentTarget as HTMLDivElement
                if ((targetEl.clientHeight + targetEl.scrollTop) >= targetEl.scrollHeight) {
                    current_data_ref.current += 50
                    set_default_data(extract_dir_content_ref.current.content.slice(0, current_data_ref.current))
                }
            })
            
        }
    }, [])
    
    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="glass-blue rounded-2xl p-4 mb-4 border border-white/20">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-blue-100 font-medium truncate">{extract_dir_content.file_path}</p>
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 glass-strong rounded-2xl overflow-hidden border border-white/20 mb-4">
                <form ref={item_container_ref} className="overflow-auto h-full p-2">
                    <div className="space-y-1">
                        {
                            default_data_memo.map((dir, index) => 
                                <label 
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl glass-blue hover:bg-blue-500/20 cursor-pointer border border-transparent hover:border-blue-400/30 transition-all duration-200 group"
                                >
                                    <input 
                                        type="checkbox" 
                                        name="extract-archv" 
                                        defaultChecked 
                                        value={dir} 
                                        className="checkbox checkbox-primary checkbox-sm border-white/50 bg-white/10 checked:bg-blue-500" 
                                        disabled={extracting}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate group-hover:text-blue-100 transition-colors">{dir}</p>
                                    </div>
                                </label>
                            )
                        }
                    </div>
                </form>
            </div>

            {/* Loading Indicator */}
            {
                extracting &&
                <div className="glass-blue rounded-2xl p-4 mb-4 border border-white/20 flex items-center justify-center gap-3">
                    <span className="loading loading-infinity loading-md text-blue-300"></span>
                    <span className="text-white font-medium">Extrayendo archivos...</span>
                </div>
            }

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
                <button 
                    disabled={extracting} 
                    onClick={() => handle_extract()} 
                    className="flex-1 glass-strong px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 hover:border-white/50 transition-all duration-200"
                >
                    Extraer Todo
                </button>
                <button 
                    disabled={extracting} 
                    onClick={() => handle_extract(false)} 
                    className="flex-1 glass-blue px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200"
                >
                    Extraer Seleccionados
                </button>
                <button 
                    disabled={extracting} 
                    onClick={handle_cancel} 
                    className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/30 backdrop-blur-md border border-red-400/30 hover:border-red-400/50 hover:bg-red-500/40 transition-all duration-200"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
})