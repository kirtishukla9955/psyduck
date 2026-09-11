import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, X, ArrowUpRight } from 'lucide-react';

export type DialogAction = 'resolve' | 'reject' | 'escalate';

interface ConfirmationDialogProps {
  isOpen: boolean;
  action: DialogAction;
  conflictId: string;
  ulpin: string;
  title: string;
  description: string;
  notePlaceholder?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  action,
  conflictId,
  ulpin,
  title,
  description,
  notePlaceholder = 'Enter official departmental order number, verification reference, or findings...',
  confirmLabel,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() && action !== 'escalate') {
      setValidationError('An official departmental finding or order reference is required.');
      return;
    }
    setValidationError('');
    onConfirm(note.trim());
  };

  const getActionConfig = () => {
    switch (action) {
      case 'resolve':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          badgeBg: 'bg-emerald-100 text-emerald-800',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          defaultConfirm: 'Authorize Resolution & Reconcile Record',
        };
      case 'reject':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          badgeBg: 'bg-rose-100 text-rose-800',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
          defaultConfirm: 'Dismiss Conflict / Record Finding',
        };
      case 'escalate':
        return {
          icon: <ArrowUpRight className="w-5 h-5 text-amber-600" />,
          badgeBg: 'bg-amber-100 text-amber-800',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
          defaultConfirm: 'Escalate to Department Supervisor',
        };
    }
  };

  const config = getActionConfig();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-card shadow-2xl border border-neutral-200 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.badgeBg}`}>{config.icon}</div>
            <div>
              <h2 id="dialog-title" className="text-base font-bold text-neutral-900">
                {title}
              </h2>
              <p className="text-xs text-neutral-500">
                Case: <span className="font-semibold text-neutral-800">{conflictId}</span> | ULPIN:{' '}
                <span className="font-semibold text-neutral-800">{ulpin}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            {description}
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Official Note & Audit Trail Entry{' '}
              {action !== 'escalate' && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder={notePlaceholder}
              className="w-full p-3 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-neutral-400"
              disabled={isSubmitting}
            />
            {validationError && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">{validationError}</p>
            )}
            <p className="text-[10px] text-neutral-400 mt-1">
              This note is permanently recorded in the immutable departmental audit trail and will
              be linked to the parcel's title history.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 ${config.btnBg}`}
            >
              {isSubmitting ? (
                <span>Recording Action...</span>
              ) : (
                <span>{confirmLabel || config.defaultConfirm}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
