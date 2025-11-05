export const broadcast_event = (ev: string, data: any) => {
    const ce = new CustomEvent(ev, {detail: data})
    window.dispatchEvent(ce)
}