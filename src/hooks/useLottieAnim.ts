import { useState, useEffect } from 'react'

type AnimState =
  | { status: 'loading' }
  | { status: 'ready'; data: unknown }
  | { status: 'unavailable' }

const cache = new Map<string, unknown>()

/**
 * Fetches a Lottie JSON from public/lottie/<name>.json at runtime.
 * Returns { status: 'unavailable' } silently on 404 so the SVG
 * fallback is used without errors in the console.
 */
export function useLottieAnim(name: string): AnimState {
  const url = `/lottie/${name}.json`
  const [state, setState] = useState<AnimState>(() =>
    cache.has(url) ? { status: 'ready', data: cache.get(url) } : { status: 'loading' }
  )

  useEffect(() => {
    if (cache.has(url)) {
      setState({ status: 'ready', data: cache.get(url) })
      return
    }

    let cancelled = false

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data) => {
        cache.set(url, data)
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable' })
      })

    return () => { cancelled = true }
  }, [url])

  return state
}
