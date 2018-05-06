/* eslint-disable no-undef */

;(function() {
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
          content.textContent = response.join('\n')
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
