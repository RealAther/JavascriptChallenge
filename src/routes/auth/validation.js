// @flow

import * as yup from 'yup'
import { validationErrorToResponse } from '../common'

const fieldEmail = yup
  .string()
  .email()
  .required()
const fieldPassword = yup
  .string()
  .required()
  .min(7)

const loginSchema = yup.object({
  email: fieldEmail,
  password: fieldPassword,
})
const registerSchema = yup.object({
  email: fieldEmail,
  password: fieldPassword,
  firstName: yup.string().required(),
  lastName: yup.string().required(),
})

function createValidator(schema) {
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

const validateForLogin = createValidator(loginSchema)
const validateForRegister = createValidator(registerSchema)

export { validateForLogin, validateForRegister }
