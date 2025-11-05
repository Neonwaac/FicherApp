import { TRenderer } from "./preload";

declare global {
    interface Window {
        electron: TRenderer
    }
}