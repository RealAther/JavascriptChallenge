// @flow

import * as yup from 'yup'

const fieldEmail = yup
  .string()
  .email()
  .required()
const fieldPassword = yup
  .string()
  .required()
  .min(7)

export const loginSchema = yup.object({
  email: fieldEmail,
  password: fieldPassword,
})
export const registerSchema = yup.object({
  email: fieldEmail,
  password: fieldPassword,
  firstName: yup.string().required(),
  lastName: yup.string().required(),
})
