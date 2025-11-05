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
    <div>
        {/* Header */}
        <div>
            <div>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <div>
                    <p>{compress_dir_content.root_dir}</p>
                    <p>Formato: {compress_dir_content.file_type}</p>
                </div>
            </div>
        </div>

        {/* File List or Single File Display */}
        {compress_dir_content.base_item_is_dir ? (
            <div>
                <form ref={item_container_ref}>
                    <div>
                        {default_data_memo
                            .filter(data => !data.is_dir)
                            .map((item, index) => (
                                <label key={index}>
                                    <input
                                        disabled={compressing}
                                        type="checkbox"
                                        name="compress-archv"
                                        defaultChecked
                                        value={JSON.stringify(item)}
                                    />
                                    <div>
                                        <p>{item.full_path}</p>
                                    </div>
                                </label>
                            ))}
                    </div>
                </form>
            </div>
        ) : (
            <div>
                <div>
                    <div>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>{compress_dir_content.root_dir}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Loading Indicator */}
        {compressing && (
            <div>
                <span>Comprimiendo a {compress_dir_content.file_type}...</span>
            </div>
        )}

        {/* Action Buttons */}
        <div>
            <button disabled={compressing} onClick={() => handle_compress()}>
                Comprimir Todo
            </button>
            <button
                disabled={!compress_dir_content.base_item_is_dir || compressing}
                onClick={() => handle_compress(false)}
            >
                Comprimir Seleccionados
            </button>
            <button disabled={compressing} onClick={handle_cancel}>
                Cancelar
            </button>
        </div>
    </div>
);

})