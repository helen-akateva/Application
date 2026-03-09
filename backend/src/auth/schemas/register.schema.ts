import * as yup from 'yup';

export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Invalid password')
    .required('Password is required'),
  name: yup.string().required('Name is required'),
});
