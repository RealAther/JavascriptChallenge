;(function() {
  function postToServer(path, contents) {
    return new Promise(function(resolve, reject) {
      // NOTE: NEVER EVER USE XMLHttpRequest
      // Use fetch() instead, it has promises built-in
      const xhr = new XMLHttpRequest()
      xhr.open('POST', path, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.setRequestHeader('Accept', 'application/x-maohra')
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(xhr.responseText)
        } else {
          const httpError = new Error(`HTTP Error: Code ${xhr.status}`)
          httpError.xhr = xhr
          httpError.response = xhr.responseText
          reject(httpError)
        }
      }
      xhr.send(contents)
    })
  }

  function urlEncodeObject(obj) {
    return Object.keys(obj)
      .map(function(key) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
      })
      .join('&')
  }

  function getValuesFromForm(form) {
    const values = {}
    Array.from(form.elements).forEach(function(element) {
      if (element.tagName === 'BUTTON' || (element.tagName === 'INPUT' && element.type === 'button')) {
        // Ignore buttons they have no value :(
        return
      }
      if (values[element.name]) {
        console.error(`Element name '${element.name}' was encountered twice while processing form`, form)
      }
      if (!element.name) {
        console.error('Element has no name', element, 'of form', form)
        return
      }
      values[element.name] = element.value
    })
    return values
  }

  function main() {
    const writePost = document.getElementById('writePost')
    if (!writePost) {
      console.error('<form id="writePost" /> not found.')
      return
    }
    const content = document.getElementById('content')
    if (!content) {
      console.error('<pre id="content" /> not found')
      return
    }

    writePost.addEventListener('submit', function(event) {
      event.preventDefault()
      const values = urlEncodeObject(getValuesFromForm(writePost))
      postToServer('/', values)
        .then(function(response) {
          content.textContent = response
        })
        .catch(error => {
          console.error('error', error)
        })
    })
  }

  if (document.readyState === 'complete') {
    main()
  } else {
    document.addEventListener('DOMContentLoaded', function listener() {
      document.removeEventListener('DOMContentLoaded', listener)
      main()
    })
  }
})()
