import * as yup from 'yup';

export const createEventSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  date: yup
    .string()
    .required('Date is required')
    .test('is-iso', 'Date must be a valid ISO format', (value) => {
      if (!value) return false;
      return !isNaN(new Date(value).getTime());
    })
    .test('future-date', 'Cannot create events in the past', (value) => {
      if (!value) return false;
      return new Date(value) > new Date();
    }),
  location: yup.string().required('Location is required'),
  capacity: yup.number().min(1, 'Capacity must be at least 1').optional(),
  visibility: yup
    .string()
    .oneOf(['public', 'private'], 'Visibility must be public or private')
    .required('Visibility is required'),
});
