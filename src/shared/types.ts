export interface IMainState extends TMainStateType {
    set_state: (state: keyof TMainStateType, data: any) => void;
}

export interface TMainStateType {
    extract_dir_content?: TArchiveExtract;
    compress_dir_content?: TCompressDirContent;
}

export type TArchiveExtract = {
    file_path: string;
    content: string[];
}

export type TCompressDirItem = {
    full_path: string;
    is_dir: boolean;
}

export type TCompressFileTypes = 'tar' | 'gzip' | 'tgz' | 'zip'

export type TCompressDirContent = {
    items: TCompressDirItem[];
    file_type: TCompressFileTypes;
    root_dir: string;
    base_item_is_dir: boolean,
}