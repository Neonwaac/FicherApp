import React from "react";
import { useMainStore } from "../shared/zustand-state";
import { TArchiveExtract, TCompressDirItem } from "src/shared/types";

export default React.memo((props: any) => {
    const set_state = useMainStore(state => state.set_state)
    const compress_dir_content = useMainStore(state => state.compress_dir_content)
    const compress_dir_content_ref = React.useRef(compress_dir_content)
    const [default_data, set_default_data] = React.useState<TCompressDirItem[]>(compress_dir_content?.items.slice(0,50))
    const default_data_memo = React.useMemo(() => default_data, [default_data])
    const item_container_ref = React.useRef<HTMLFormElement|null>(null)
    const current_data_ref = React.useRef<number>(50)
    const [compressing, set_compressing] = React.useState<boolean>(false)

    const handle_compress = React.useCallback(async (all = true) => {
        let inputs = compress_dir_content.items
        if (!all) {
            inputs = [];
            const unchecked_inputs: string[] = [];
            (item_container_ref.current['compress-archv'] as RadioNodeList).forEach((node: HTMLInputElement) => {
                if (!node.checked) {
                    unchecked_inputs.push(JSON.parse(node.value).full_path)
                }
            });
            inputs = compress_dir_content.items.filter(item => !unchecked_inputs.includes(item.full_path))
            console.log("nodenodenode", inputs)
        }
        set_compressing(true)
        const compress = await window.electron.handle_compress({
            items: inputs,
            root_dir: compress_dir_content.root_dir,
            file_type: compress_dir_content.file_type,
            base_item_is_dir: compress_dir_content.base_item_is_dir
        })
        set_compressing(false)
    }, [compress_dir_content, item_container_ref.current])

    const handle_cancel = React.useCallback(() => {
        set_state('compress_dir_content', undefined)
    }, [])
    
    React.useLayoutEffect(() => {
        if (item_container_ref.current) {
            item_container_ref.current.addEventListener('scroll', (ev: MouseEvent) => {
                const targetEl = ev.currentTarget as HTMLDivElement
                if ((targetEl.clientHeight + targetEl.scrollTop) >= targetEl.scrollHeight) {
                    current_data_ref.current += 50
                    set_default_data(compress_dir_content_ref.current.items.slice(0, current_data_ref.current))
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-blue-100 font-medium truncate">{compress_dir_content.root_dir}</p>
                        <p className="text-xs text-blue-200/70 mt-1">Formato: <span className="font-semibold uppercase">{compress_dir_content.file_type}</span></p>
                    </div>
                </div>
            </div>

            {/* File List or Single File Display */}
            {
                compress_dir_content.base_item_is_dir ?
                <div className="flex-1 glass-strong rounded-2xl overflow-hidden border border-white/20 mb-4">
                    <form ref={item_container_ref} className="overflow-auto h-full p-2">
                        <div className="space-y-1">
                            {
                                default_data_memo.filter(data => !data.is_dir).map((item, index) => 
                                    <label 
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-xl glass-blue hover:bg-blue-500/20 cursor-pointer border border-transparent hover:border-blue-400/30 transition-all duration-200 group"
                                    >
                                        <input 
                                            disabled={compressing} 
                                            type="checkbox" 
                                            name="compress-archv" 
                                            defaultChecked 
                                            value={JSON.stringify(item)} 
                                            className="checkbox checkbox-primary checkbox-sm border-white/50 bg-white/10 checked:bg-blue-500" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm truncate group-hover:text-blue-100 transition-colors">{item.full_path}</p>
                                        </div>
                                    </label>
                                )
                            }
                        </div>
                    </form>
                </div>:
                <div className="flex-1 glass-strong rounded-2xl overflow-hidden border border-white/20 mb-4 flex items-center justify-center">
                    <div className="glass-blue rounded-xl p-6 border border-white/20">
                        <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-white font-medium">{compress_dir_content.root_dir}</p>
                        </div>
                    </div>
                </div>
            }

            {/* Loading Indicator */}
            {
                compressing &&
                <div className="glass-blue rounded-2xl p-4 mb-4 border border-white/20 flex items-center justify-center gap-3">
                    <span className="loading loading-infinity loading-md text-blue-300"></span>
                    <span className="text-white font-medium">Comprimiendo a {compress_dir_content.file_type}...</span>
                </div>
            }

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
                <button 
                    disabled={compressing} 
                    onClick={() => handle_compress()} 
                    className="flex-1 glass-strong px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 hover:border-white/50 transition-all duration-200"
                >
                    Comprimir Todo
                </button>
                <button 
                    disabled={!compress_dir_content.base_item_is_dir || compressing} 
                    onClick={() => handle_compress(false)} 
                    className="flex-1 glass-blue px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200"
                >
                    Comprimir Seleccionados
                </button>
                <button 
                    disabled={compressing} 
                    onClick={handle_cancel} 
                    className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/30 backdrop-blur-md border border-red-400/30 hover:border-red-400/50 hover:bg-red-500/40 transition-all duration-200"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
})