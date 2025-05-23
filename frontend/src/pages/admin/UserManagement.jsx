import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchUsers, updateUserRole, deleteUser } from '../../api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      
      if (response.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? response.data : user
          )
        );
        toast.success('User role updated successfully');
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await deleteUser(userId);
        
        if (response.success) {
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
          toast.success(response.message || 'User deleted successfully');
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'System Admin':
        return 'role-system-admin';
      case 'Organizer':
        return 'role-organizer';
      case 'Standard User':
        return 'role-standard-user';
      default:
        return '';
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    return matchesSearch && matchesRole;
  });

  // Paginate results
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="user-management">
      <div className="user-management-container">
        {/* Header */}
        <div className="user-management-header">
          <h1 className="user-management-title">User Management</h1>
          <button
            onClick={loadUsers}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Filters */}
        <div className="filters-section">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="">All Roles</option>
            <option value="System Admin">System Admin</option>
            <option value="Organizer">Organizer</option>
            <option value="Standard User">Standard User</option>
          </select>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="table-container">
              <table className="users-table">
                <thead className="table-header">
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user._id} className="table-row" style={{animationDelay: `${index * 0.1}s`}}>
                        <td className="table-cell">
                          <div className="user-info">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="user-avatar"
                              />
                            ) : (
                              <div className="user-avatar-placeholder">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`role-select ${getRoleClass(user.role)}`}
                          >
                            <option value="System Admin">System Admin</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Standard User">Standard User</option>
                          </select>
                        </td>
                        <td className="table-cell">
                          <span style={{color: '#6b7280', fontSize: '0.875rem'}}>
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="table-cell">
                        <div className="empty-state">
                          <div className="empty-state-icon">👥</div>
                          <p>No users found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
                  <div className="pagination-info">
                    Showing <strong>{indexOfFirstUser + 1}</strong> to{' '}
                    <strong>{Math.min(indexOfLastUser, filteredUsers.length)}</strong> of{' '}
                    <strong>{filteredUsers.length}</strong> users
                  </div>
                  <div className="pagination-nav">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;