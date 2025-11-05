import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { IMainState } from './types';


export const useMainStore = create<IMainState>()(
    devtools(
        persist(
            (set) => ({
                extract_dir_content: undefined,
                compress_dir_content: undefined,
                set_state: (state, data) => {
                    switch (state) {
                        case 'extract_dir_content':
                            set((state) => ({ ...state, extract_dir_content: data }))
                            break;
                        case 'compress_dir_content':
                            set((state) => ({ ...state, compress_dir_content: data }))
                            break;
                    
                        default:
                            break;
                    }
                }
            }),
            {
                name: 'ficherapp-storage', // nombre único para localStorage
                partialize: (state) => ({
                    // Solo persistir los datos importantes, no las funciones
                    extract_dir_content: state.extract_dir_content,
                    compress_dir_content: state.compress_dir_content,
                }),
            }
        ),
        {
            name: 'FicherApp Store', // nombre para devtools
        }
    )
)