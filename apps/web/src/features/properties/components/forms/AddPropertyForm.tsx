import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPropertySchema, type CreatePropertyFormValues } from '../../schemas/property.schema';

export const AddPropertyForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyFormValues>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      purpose: 'SALE',
      currency: 'EGP',
      unit: 'SQM',
    },
  });

  const onSubmit = async (data: CreatePropertyFormValues) => {
    try {
      // API call to POST /properties goes here
      console.log('Submitting property data:', data);
      alert('Property details submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-primary mb-6 font-en">Add New Property</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Property Title</label>
          <input
            {...register('title')}
            className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g. Modern Apartment in New Cairo"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Core Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Purpose</label>
            <select {...register('purpose')} className="w-full p-2 border border-gray-300 rounded">
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Property Type ID</label>
            <input
              {...register('propertyTypeId')}
              className={`w-full p-2 border rounded ${errors.propertyTypeId ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="UUID of PropertyType"
            />
            {errors.propertyTypeId && <p className="text-red-500 text-xs mt-1">{errors.propertyTypeId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Price</label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Area (SQM)</label>
            <input
              type="number"
              {...register('area', { valueAsNumber: true })}
              className={`w-full p-2 border rounded ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Country</label>
            <input
              {...register('country')}
              className={`w-full p-2 border rounded ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">City</label>
            <input
              {...register('city')}
              className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Area / Neighborhood</label>
            <input
              {...register('areaLocation')}
              className={`w-full p-2 border rounded ${errors.areaLocation ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.areaLocation && <p className="text-red-500 text-xs mt-1">{errors.areaLocation.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-background font-bold py-3 rounded hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
};
