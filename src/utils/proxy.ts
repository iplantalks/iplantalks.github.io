/**
 * Proxy request to another host bypassing CORS
 * @param url to retrieve
 * @param ttl optional, cache time to live in seconds
 * @returns response as is from the proxied host
 */
export async function proxy(url: string | URL, ttl: number | null = null) {
  url = new URL(url)
  var host = url.hostname
  url.hostname = 'proxy.iplan-talks.workers.dev'
  return await fetch(url, {
    headers: ttl ? { 'X-Host': host, 'X-Cache-Control': 'public, max-age=' + ttl } : { 'X-Host': host },
  })
}
