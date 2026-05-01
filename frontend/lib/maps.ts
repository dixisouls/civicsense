import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

let initialized = false
let mapsPromise: Promise<void> | null = null

function init() {
  if (!initialized) {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "beta",
    })
    initialized = true
  }
}

export async function loadMaps(): Promise<void> {
  if (!mapsPromise) {
    init()
    mapsPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("places"),
      importLibrary("visualization"),
      importLibrary("marker"),
    ]).then(() => undefined)
  }
  return mapsPromise
}
