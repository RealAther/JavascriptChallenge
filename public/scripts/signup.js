/* eslint-disable no-undef */

;(function() {
  const emailForm = document.getElementById('emailForm')
  if (!emailForm) {
    console.error('<form id="emailForm" /> not found.')
    return
  }

  emailForm.addEventListener('submit', function(event) {
    event.preventDefault()
    const values = urlEncodeObject(getValuesFromForm(emailForm))
    postToServer('/signup', values)
      .then(function() {
        // window.location.href = '/'
      })
      .catch(error => {
        console.log('error', error)
      })
  })
})()
