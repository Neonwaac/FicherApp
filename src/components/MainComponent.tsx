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
        <div>
            <TitleBar />

            <div>
                <button onClick={() => set_active_tab('extract')}>
                    Extraer Archivo
                </button>
                <button onClick={() => set_active_tab('compress')}>
                    Comprimir Archivos
                </button>
            </div>

            {active_tab === 'extract' && (
                <div>
                    {!extract_dir_content ? (
                        <div>
                            <button onClick={handle_open_achv_file}>
                                {loading_extract ? (
                                    <div>
                                        <span>Cargando...</span>
                                    </div>
                                ) : (
                                    <div>
                                        <span>Abrir Archivo</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <ExtractComponent />
                        </div>
                    )}
                </div>
            )}

            {active_tab === 'compress' && (
                <div>
                    {!compress_dir_content ? (
                        <div>
                            {loading_compress ? (
                                <div>
                                    <span>Cargando directorio...</span>
                                </div>
                            ) : (
                                <div>
                                    <span>Selecciona tipo de compresión:</span>
                                    <ul>
                                        <li>
                                            <button onClick={() => handle_open_compress_dlg('tar')}>
                                                Archivo TAR
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => handle_open_compress_dlg('gzip')}>
                                                Archivo GZIP
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => handle_open_compress_dlg('tgz')}>
                                                Archivo TGZ
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => handle_open_compress_dlg('zip')}>
                                                Archivo ZIP
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <CompressComponent />
                        </div>
                    )}
                </div>
            )}
        </div>
    );

})