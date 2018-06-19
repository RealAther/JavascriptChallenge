// @flow

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

export function createValidator(schema) {
  return async function(body: Object): Object {
    try {
      return { status: 1, fields: await schema.validate(body), errors: null }
    } catch (error) {
      if (error && error.name === 'ValidationError') {
        return { status: 0, fields: null, errors: validationErrorToResponse(error) }
      }
      throw error
    }
  }
}

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

export function validatedRoute(
  schema: Object,
  callback: (req: $FlowFixMe, res: $FlowFixMe, next: $FlowFixMe, body: Object) => void,
) {
  const validator = createValidator(schema)
  return asyncRoute(async function(req, res, next) {
    const validated = await validator(req.body)
    if (!validated.status) {
      res.statusCode = 400
      res.json({ status: 0, errors: validated.errors })
      return
    }
    await callback(req, res, next, validated.fields)
  })
}
