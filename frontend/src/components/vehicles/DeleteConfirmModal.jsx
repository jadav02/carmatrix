// ==========================================
// Delete Vehicle Confirmation Modal
// ==========================================
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, vehicle }) {
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setErrorMessage('');
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMessage('');
    try {
      await onConfirm(vehicle.id);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete vehicle. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="modal-title" style={{ color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
            <h2>Confirm Deletion</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" style={{ margin: '1rem 1.5rem 0' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ padding: '1.5rem', lineHeight: '1.6' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{vehicle.make} {vehicle.model}</strong> (ID: #{vehicle.id}) from the inventory database?
          </p>
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <div className="spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={18} />
                <span>Delete Vehicle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
