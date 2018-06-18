// @flow

export function asyncRoute(callback: (req: $FlowFixMe, res: $FlowFixMe, next: $FlowFixMe) => void) {
  return function(req, res, next) {
    const promise = new Promise(function(resolve) {
      resolve(callback(req, res, next))
    })
    promise.catch(error => {
      console.error('Error handling route', error)
      res.statusCode = 500
      res.json({ status: 0, error: 'Request failed. Please try again later' })
    })
  }
}

export function validationErrorToResponse(error: Object): Array<Object> {
  const errors = []

  function walkOverValidationError(current: Object) {
    if (current.path) {
      current.errors.forEach(message => {
        errors.push({ field: current.path, message })
      })
    }
    current.inner.forEach(walkOverValidationError)
  }
  walkOverValidationError(error)

  return errors
}
