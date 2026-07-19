// ==========================================
// User Management Page (Administrator Only)
// ==========================================
import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, updateUserRole, deleteUser } from '../api/users';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Clock
} from 'lucide-react';
import './Users.css';

export default function UserManagement() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsersData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getUsers();
      setUserList(data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch user accounts.');
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const updated = await updateUserStatus(userId, newStatus);
      showSuccess(`Account for ${updated.name} updated to ${updated.status}.`);
      fetchUsersData();
    } catch (err) {
      setErrorMessage(err.message || 'Status update failed.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await updateUserRole(userId, newRole);
      showSuccess(`Role for ${updated.name} updated to ${getRoleDisplay(updated.role)}.`);
      fetchUsersData();
    } catch (err) {
      setErrorMessage(err.message || 'Role update failed.');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete account ${userName}?`)) return;
    try {
      await deleteUser(userId);
      showSuccess(`User account ${userName} deleted.`);
      fetchUsersData();
    } catch (err) {
      setErrorMessage(err.message || 'Delete failed.');
    }
  };

  const getRoleDisplay = (r) => {
    if (r === 'admin') return 'Administrator';
    if (r === 'manager') return 'Inventory Manager';
    return 'Sales Representative';
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">User Management</h1>
          <p className="page-subtitle">Approve pending registrations, manage roles, and review account permissions</p>
        </div>
        <button className="btn btn-secondary icon-only-btn" onClick={fetchUsersData} title="Refresh Users">
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="table-card glass-panel">
        <div className="table-card-header">
          <Users size={20} className="text-indigo-400" />
          <h2>Registered Dealership Accounts</h2>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
            <p>Loading user accounts...</p>
          </div>
        ) : userList.length === 0 ? (
          <div className="table-empty">
            <Users size={48} className="empty-icon" />
            <h3>No User Accounts Found</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(u => (
                  <tr key={u.id}>
                    <td className="col-id">#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="form-input select-input role-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Inventory Manager</option>
                        <option value="sales">Sales Representative</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-pill ${u.status.toLowerCase()}`}>
                        {u.status === 'Approved' && <ShieldCheck size={14} />}
                        {u.status === 'Pending' && <Clock size={14} />}
                        {u.status === 'Rejected' && <XCircle size={14} />}
                        <span>{u.status === 'Pending' ? 'Pending Approval' : u.status}</span>
                      </span>
                    </td>
                    <td className="col-actions">
                      {u.status !== 'Approved' && (
                        <button
                          className="btn btn-secondary quick-btn approve-btn"
                          onClick={() => handleStatusChange(u.id, 'Approved')}
                          title="Approve User"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                      )}
                      {u.status !== 'Rejected' && (
                        <button
                          className="btn btn-secondary quick-btn reject-btn"
                          onClick={() => handleStatusChange(u.id, 'Rejected')}
                          title="Reject User"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(u.id, u.name)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
