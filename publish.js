const ghpages = require('gh-pages')
const { _log, log } = require('@flavioespinoza/log_log')
const _d = require('datedash')

const options = {
    date: _d.date(new Date(), 'full'),
    project: 'lodash.com',
    repository: 'github.com/flavioespinoza/lodash.com',
    gh_pages: 'flavioespinoza.github.io/lodash.com'
}

ghpages.publish('_site', options, (err) => {
    if (err) {
        _log.error('publish.js --> ghpages.publish()', err)
        return
    }
    log.cyan(options)
})