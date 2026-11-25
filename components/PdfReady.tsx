import { useEffect, useState } from 'react'

// Mount only after the printable content and its data have loaded.
export default function PdfReady({ prepare }: { prepare?: () => void }) {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let cancelled = false
        let frame = 0
        document.fonts.ready.then(() => {
            frame = requestAnimationFrame(() => {
                if (cancelled) return
                prepare?.()
                frame = requestAnimationFrame(() => {
                    if (!cancelled) setReady(true)
                })
            })
        })
        return () => { cancelled = true; cancelAnimationFrame(frame) }
    }, [prepare])
    return ready ? <span hidden data-pdf-ready="true" /> : null
}
