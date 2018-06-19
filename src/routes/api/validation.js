// @flow

import * as yup from 'yup'

// eslint-disable-next-line import/prefer-default-export
export const createPostSchema = yup.object({
  content: yup.string().required(),
  user: yup.number().nullable(true),
})
