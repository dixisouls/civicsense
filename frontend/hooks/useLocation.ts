"use client"

import { useState, useCallback } from "react"
import { SF_CENTER } from "@/lib/constants"

interface LocationState {
  coords: { lat: number; lng: number }
  usingFallback: boolean
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: SF_CENTER,
    usingFallback: false,
  })
  const [isDetecting, setIsDetecting] = useState(false)

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ coords: SF_CENTER, usingFallback: true })
      return
    }

    setIsDetecting(true)

    const timeout = setTimeout(() => {
      setIsDetecting(false)
      setState({ coords: SF_CENTER, usingFallback: true })
    }, 3000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout)
        setIsDetecting(false)
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          usingFallback: false,
        })
      },
      () => {
        clearTimeout(timeout)
        setIsDetecting(false)
        setState({ coords: SF_CENTER, usingFallback: true })
      },
      { timeout: 3000, maximumAge: 60000 },
    )
  }, [])

  return {
    coords: state.coords,
    usingFallback: state.usingFallback,
    isDetecting,
    detect,
  }
}
