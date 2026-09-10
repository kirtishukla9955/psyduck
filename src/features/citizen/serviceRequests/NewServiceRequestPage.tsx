import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenService, serviceRequestService } from '@/api/serviceFactory';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const serviceRequestSchema = z.object({
  parcelUlpin: z.string().min(3, 'Please select or enter a valid ULPIN'),
  category: z.string().min(1, 'Please select a service category'),
  description: z
    .string()
    .min(10, 'Please provide a detailed description (minimum 10 characters)'),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export const NewServiceRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledUlpin = searchParams.get('ulpin') || '';
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fileAttached, setFileAttached] = useState<string | null>(null);

  const { data: myParcels } = useQuery({
    queryKey: ['citizen', 'myParcels'],
    queryFn: () => citizenService.getMyParcels(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      parcelUlpin: prefilledUlpin || 'CH-SEC17-0402',
      category: 'ownership_clarification',
      description: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceRequestFormData) =>
      serviceRequestService.createServiceRequest({
        citizenId: user?.id || 'user_cit_01',
        parcelUlpin: data.parcelUlpin,
        category: data.category,
        description: data.description,
      }),
    onSuccess: (newReq) => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
      navigate(`/citizen/service-requests/${newReq.id}`);
    },
  });

  const onSubmit = (data: ServiceRequestFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Citizen Portal', href: '/citizen/dashboard' },
          { label: 'Service Requests', href: '/citizen/service-requests' },
          { label: 'New Request' },
        ]}
      />

      <div className="bg-white rounded-card border border-neutral-200 p-6 md:p-8 shadow-subtle">
        <div className="pb-4 border-b border-neutral-100 mb-6">
          <h1 className="text-xl font-bold text-neutral-900">Create Citizen Service Request</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Submit an application to Revenue or Survey & Settlement for land record services
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Parcel Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Select Land Parcel (ULPIN) *
            </label>
            <select
              {...register('parcelUlpin')}
              className="w-full text-xs p-2.5 rounded border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {myParcels && myParcels.length > 0 ? (
                myParcels.map((p) => (
                  <option key={p.ulpin} value={p.ulpin}>
                    {p.ulpin} — {p.locality}
                  </option>
                ))
              ) : (
                <>
                  <option value="CH-SEC17-0402">CH-SEC17-0402 (Sector 17, Chandigarh)</option>
                  <option value="CH-SEC09-1108">CH-SEC09-1108 (Sector 9, Chandigarh)</option>
                  <option value="TN-CH-09124">TN-CH-09124 (Maraimalai Nagar, TN)</option>
                </>
              )}
            </select>
            {errors.parcelUlpin && (
              <p className="text-xs text-rose-600 mt-1">{errors.parcelUlpin.message}</p>
            )}
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Service Category *
            </label>
            <select
              {...register('category')}
              className="w-full text-xs p-2.5 rounded border border-neutral-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ownership_clarification">
                Ownership / Title Mismatch Clarification
              </option>
              <option value="fard_issuance">Certified Digital Copy of RoR / Fard / Patta</option>
              <option value="demarcation_request">Field Survey & Cadastral Demarcation</option>
              <option value="encumbrance_certificate">Encumbrance Certificate Request</option>
              <option value="grievance_redressal">Departmental Grievance Redressal</option>
            </select>
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Request Details & Statement *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe the clarification or service needed, citing any registered deed or survey reference numbers..."
              className="w-full text-xs p-3 rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Document Attachment Placeholder UI */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Supporting Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-neutral-300 rounded p-4 text-center bg-neutral-50 hover:bg-neutral-100/60 transition-colors cursor-pointer">
              <input
                type="file"
                id="docUpload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileAttached(e.target.files[0].name);
                  }
                }}
              />
              <label htmlFor="docUpload" className="cursor-pointer block">
                <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
                <span className="text-xs font-medium text-neutral-700 block">
                  {fileAttached ? (
                    <span className="text-emerald-700 font-semibold">Attached: {fileAttached}</span>
                  ) : (
                    'Click to attach registered deed, Aadhaar/PAN, or tax receipt'
                  )}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  PDF, PNG, JPEG up to 10MB
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/citizen/service-requests')}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-semibold shadow-subtle transition-colors disabled:opacity-50"
            >
              {isSubmitting || mutation.isPending ? 'Submitting Application...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
