/**
 * Cloudflare Web Analytics.
 *
 * Cookieless and aggregate: page views, referrers, country and Core Web Vitals,
 * with no identifier stored on the device and nothing that identifies a person.
 * That is why the site needs no consent banner — and why privacy.html can stay
 * short and true.
 *
 * The beacon token is public by design; it ships in the page source of every
 * site that uses it, so it lives in the repo rather than in a secret.
 * Set VITE_CF_BEACON at build time to turn this on. Unset, it does nothing at
 * all: no request, no script tag, no third party contacted.
 */
const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js'

export function startAnalytics(token = import.meta.env.VITE_CF_BEACON) {
  if (!token || typeof document === 'undefined') return null
  // Never load it twice, however often this is called.
  if (document.querySelector(`script[src="${BEACON_SRC}"]`)) return null

  const script = document.createElement('script')
  script.src = BEACON_SRC
  script.defer = true
  script.dataset.cfBeacon = JSON.stringify({ token })
  document.head.appendChild(script)
  return script
}
