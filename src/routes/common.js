// @flow

// eslint-disable-next-line import/prefer-default-export
export function asyncRoute(callback: (req: $FlowFixMe, res: $FlowFixMe) => void) {
  return function(req, res) {
    const promise = new Promise(function(resolve) {
      resolve(callback(req, res))
    })
    promise.catch(error => {
      console.error('Error handling route', error)
      res.statusCode = 500
      res.json({ status: 0, error: 'Request failed. Please try again later' })
    })
  }
}
