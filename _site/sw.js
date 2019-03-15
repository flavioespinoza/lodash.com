'use strict'































const BUILD_REV = '109293ad4c2396b86c2e18b45a05503830dce854'

const prefetch = ["/404.html","/assets/css/main.css","/assets/img/lodash.svg","/assets/js/boot.js","/assets/js/docs.js","/assets/js/home.js","/custom-builds.html","/docs/2.4.2.html","/docs/3.10.1.html","/docs/4.17.11.html","/icons/favicon-16x16.png","/icons/icon.svg","/icons/safari-pinned-tab-16x16.svg","/index.html","/manifest.webmanifest","/package-lock.json","/vendor/cdn.jsdelivr.net/fontawesome/4.7.0/css/font-awesome.min.css","/vendor/cdn.jsdelivr.net/fontawesome/4.7.0/fonts/fontawesome-webfont.woff","/vendor/cdn.jsdelivr.net/fontawesome/4.7.0/fonts/fontawesome-webfont.woff2","/vendor/cdn.jsdelivr.net/g/fuse@2.6.1,react@15.4.0(react.min.js+react-dom.min.js","/vendor/cdn.jsdelivr.net/lodash/3.10.1/lodash.min.js","/vendor/cdn.jsdelivr.net/npm/lodash@2.4.2/dist/lodash.min.js","/vendor/cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js","/vendor/fonts.gstatic.com/s/sourcecodepro/v6/leqv3v-yTsJNC7nFznSMqSP2LEk6lMzYsRqr3dHFImA.woff2","/vendor/fonts.gstatic.com/s/sourcecodepro/v6/leqv3v-yTsJNC7nFznSMqczFoXZ-Kj537nB_-9jJhlA.woff2","https://cdn.jsdelivr.net/fontawesome/4.7.0/css/font-awesome.min.css","https://cdn.jsdelivr.net/fontawesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0","https://cdn.jsdelivr.net/fontawesome/4.7.0/fonts/fontawesome-webfont.woff?v=4.7.0","https://cdn.jsdelivr.net/g/fuse@2.6.1,react@15.4.0(react.min.js+react-dom.min.js","https://cdn.jsdelivr.net/lodash/3.10.1/lodash.min.js","https://cdn.jsdelivr.net/npm/lodash@2.4.2/dist/lodash.min.js","https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js","https://embed.runkit.com/","https://fonts.gstatic.com/s/sourcecodepro/v6/leqv3v-yTsJNC7nFznSMqSP2LEk6lMzYsRqr3dHFImA.woff2","https://fonts.gstatic.com/s/sourcecodepro/v6/leqv3v-yTsJNC7nFznSMqczFoXZ-Kj537nB_-9jJhlA.woff2","icons/apple-touch-180x180.png","icons/favicon-32x32.png","manifest.webmanifest","sw.js"]
  .map(href => new URL(href, location))

const redirect = [[/^\/docs\/4\.(.*)/,'/docs/4.17.11',302], [/^\/docs\/4/,'/docs/4.17.11',302], [/^\/docs\/3\.(.*)/,'/docs/3.10.1',302], [/^\/docs\/3/,'/docs/3.10.1',302], [/^\/docs\/2\.(.*)/,'/docs/2.4.2',302], [/^\/docs\/2/,'/docs/2.4.2',302], [/^\/docs\/1\.(.*)/,'https://github.com/lodash/lodash/blob/1.3.1/doc/README.md',301], [/^\/docs\/1/,'https://github.com/lodash/lodash/blob/1.3.1/doc/README.md',301], [/^\/docs(?:\/.|\/?$)/,'/docs/4.17.11',200], [/^\/license/,'https://raw.githubusercontent.com/lodash/lodash/4.17.11-npm/LICENSE',301]]
  .map(entry => (entry[1] = new URL(entry[1], location), entry))

const reHtml = /(?:(\/)index)?\.html$/
const reSplat = /:splat\b/

/**
 * Checks if `status` is a [redirect code](https://fetch.spec.whatwg.org/#redirect-status).
 *
 * @param {number} status The status code to check.
 * @returns {boolean} Returns `true` if `status` is a redirect code, else `false`.
 */
function isRedirect(status) {
  return (
    // Moved permanently.
    status === 301 ||
    // Moved temporarily.
    status === 302 ||
    // See other.
    status === 303 ||
    // Temporary redirect.
    status === 307 ||
    // Permanent redirect.
    status === 308
  )
}

/**
 * A specialized version of `Cache#put` which caches an additional extensionless
 * resource for HTML requests.
 *
 * @private
 * @param {Object} cache The cache object
 * @param {*} resource The resource key.
 * @param {Object} response The response value.
 * @returns {Promise} Returns a promise that resolves to `undefined`.
 */
function put(cache, resource, response) {
  const isReq = resource instanceof Request
  const url = new URL(isReq ? resource.url : resource)

  // Add cache entry for the extensionless variant.
  if (reHtml.test(url.pathname)) {
    const extless = new URL(url)
    extless.pathname = extless.pathname.replace(reHtml, '$1')
    cache.put(new Request(extless, isReq ? resource : undefined), response.clone())
  }
  return cache.put(resource, response)
}

/*----------------------------------------------------------------------------*/

addEventListener('install', event =>
  event.waitUntil(Promise.all([
    skipWaiting(),
    caches.open(BUILD_REV).then(cache =>
      Promise.all(prefetch.map(uri =>
        fetch(uri)
          .then(response => response.ok && put(cache, uri, response))
          .catch(error => console.log(`prefetch failed: ${ uri }`, error))
      ))
    )
  ]))
)

addEventListener('activate', event =>
  event.waitUntil(Promise.all([
    clients.claim(),
    // Delete old caches.
    caches.keys().then(keys =>
      Promise.all(keys.map(key =>
        key == BUILD_REV || caches.delete(key)
      ))
    )
  ]))
)

addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  event.respondWith(
    caches.open(BUILD_REV).then(cache =>
      cache.match(request).then(response => {
        if (response) {
          return response
        }
        // Detect URL redirects.
        if (url.origin == location.origin) {
          for (let { 0:pattern, 1:to, 2:status } of redirect) {
            const match = pattern.exec(url.pathname)
            const search = to.search || url.search
            const splat = match ? match[1] : undefined
            status = isRedirect(status) ? status : 302
            if (splat !== undefined) {
              to = new URL(to.pathname.replace(reSplat, splat) + search, location)
            } else if (!to.search && search) {
              to = new URL(to.pathname + search, location)
            }
            if (match) {
              if (url.href != to.href) {
                const response = Response.redirect(to, status)
                // Repro for http://bugzil.la/1319846.
                if (/fx_bug_1319846/.test(url.href)) {
                  put(cache, url, response.clone())
                }
                return response
              }
              break
            }
          }
        }
        // Fetch requests that weren't prefetched.
        else if (!prefetch.find(({ href }) => href == url.href)) {
          return fetch(request)
        }
        // Retry requests that failed during prefetch.
        return fetch(request).then(response => {
          if (response.ok) {
            put(cache, request, response.clone())
          }
          return response
        })
      })
      .catch(error => {
        // Respond with a 400 "Bad Request" status.
        console.log(`fetch failed: ${ url }`, error)
        return new Response(new Blob, { 'status': 400, 'statusText': 'Bad Request' })
      })
    )
  )
})
