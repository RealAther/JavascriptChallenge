/* eslint-disable no-unused-vars */
function postToServer(path, contents) {
  return fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: contents,
  }).then(response => response.json())
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
