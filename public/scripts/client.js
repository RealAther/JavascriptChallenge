;(function() {
  function postToServer(path, contents) {
    return fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/x-maohra',
      },
      body: contents,
    }).then(response => response.text())
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
