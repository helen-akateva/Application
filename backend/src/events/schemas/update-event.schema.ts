import * as yup from 'yup';

export const updateEventSchema = yup.object({
  title: yup.string().optional(),
  description: yup.string().optional(),
  date: yup
    .string()
    .optional()
    .test('is-iso', 'Date must be a valid ISO format', (value) => {
      if (!value) return true;
      return !isNaN(new Date(value).getTime());
    })
    .test('future-date', 'Cannot set event date in the past', (value) => {
      if (!value) return true;
      return new Date(value) > new Date();
    }),
  location: yup.string().optional(),
  capacity: yup.number().min(1, 'Capacity must be at least 1').optional(),
  visibility: yup
    .string()
    .oneOf(['public', 'private'], 'Visibility must be public or private')
    .optional(),
});
