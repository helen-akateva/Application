import * as yup from 'yup';

export const createTagSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be at most 30 characters'),
  color: yup.string().optional(),
});
