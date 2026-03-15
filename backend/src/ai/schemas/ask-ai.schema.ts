import * as yup from 'yup';

export const askAiSchema = yup.object({
  question: yup
    .string()
    .required('Question is required')
    .min(3, 'Question is too short')
    .max(500, 'Question is too long'),
});
