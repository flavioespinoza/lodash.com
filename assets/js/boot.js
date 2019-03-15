(function(root) {
  'use strict'

  var head = document.head,
      rootEl = document.documentElement

  function addStyleSheet(res) {
    var link = document.createElement('link')

    if (res.integrity &&
        res.href.slice(0, 6) === 'https:') {
      link.crossOrigin = 'anonymous'
      link.integrity = res.integrity
    }

    link.rel = 'stylesheet'
    link.href = res.href
    head.appendChild(link)
  }

  function toggleOffline() {
    rootEl.classList.toggle('offline')
  }

  /*--------------------------------------------------------------------------*/

  
  

  // Add asynchronous style sheets.
  [{"href":"https://cdn.jsdelivr.net/fontawesome/4.7.0/css/font-awesome.min.css","integrity":"sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"}].forEach(addStyleSheet)

  

  // Toggle offline status.
  addEventListener('offline', toggleOffline)
  addEventListener('online', toggleOffline)
}(this))
