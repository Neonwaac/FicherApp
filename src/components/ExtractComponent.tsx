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
    <div>
        {/* Header */}
        <div>
            <div>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                <p>{extract_dir_content.file_path}</p>
            </div>
        </div>

        {/* File List */}
        <div>
            <form ref={item_container_ref}>
                <div>
                    {default_data_memo.map((dir, index) => (
                        <label key={index}>
                            <input
                                type="checkbox"
                                name="extract-archv"
                                defaultChecked
                                value={dir}
                                disabled={extracting}
                            />
                            <div>
                                <p>{dir}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </form>
        </div>

        {/* Loading Indicator */}
        {extracting && (
            <div>
                <span>Extrayendo archivos...</span>
            </div>
        )}

        {/* Action Buttons */}
        <div>
            <button disabled={extracting} onClick={() => handle_extract()}>
                Extraer Todo
            </button>
            <button disabled={extracting} onClick={() => handle_extract(false)}>
                Extraer Seleccionados
            </button>
            <button disabled={extracting} onClick={handle_cancel}>
                Cancelar
            </button>
        </div>
    </div>
);

})