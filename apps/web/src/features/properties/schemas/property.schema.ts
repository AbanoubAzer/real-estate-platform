import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  propertyTypeId: z.string().min(1, 'Property type is required'),
  purpose: z.enum(['SALE', 'RENT'], { required_error: 'Purpose is required' }),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().default('EGP'),
  area: z.number().positive('Area must be greater than 0'),
  unit: z.string().default('SQM'),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  areaLocation: z.string().min(1, 'Area location is required'),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CreatePropertyFormValues = z.infer<typeof createPropertySchema>;
