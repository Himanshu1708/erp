import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const GroupMasterManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for form data
  const [formData, setFormData] = useState({
    groupName: "",
    natureOfGroup: "",
    underTheGroup: "",
    status: "ACTIVE"
  });

  // Style definitions (Same as reference code)
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      lineHeight: '1.6'
    },
    sidebar: {
      width: '260px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px 0',
      transition: 'all 0.3s ease'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px 20px',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    logoIcon: {
      fontSize: '24px',
      color: '#1e40af',
      marginRight: '10px'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e40af'
    },
    menu: {
      listStyle: 'none'
    },
    menuItem: {
      marginBottom: '5px'
    },
    menuLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      color: '#64748b',
      textDecoration: 'none',
      transition: 'all 0.2s ease'
    },
    menuLinkActive: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6'
    },
    menuIcon: {
      marginRight: '10px',
      width: '20px',
      textAlign: 'center'
    },
    mainContent: {
      flex: '1',
      padding: '30px',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b'
    },
    headerActions: {
      display: 'flex',
      gap: '15px'
    },
    btn: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    btnPrimary: {
      backgroundColor: '#1e40af',
      color: '#ffffff'
    },
    btnSecondary: {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      border: '1px solid #e2e8f0'
    },
    tableContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    tableTitle: {
      fontSize: '20px',
      fontWeight: '600'
    },
    tableActions: {
      display: 'flex',
      gap: '10px'
    },
    searchBox: {
      position: 'relative'
    },
    searchInput: {
      padding: '8px 15px 8px 40px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      width: '250px',
      fontFamily: 'inherit'
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      backgroundColor: '#dbeafe',
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e3a8a',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '15px',
      borderBottom: '1px solid #e2e8f0'
    },
    tr: {
      transition: 'background-color 0.2s ease'
    },
    trEven: {
      backgroundColor: '#ffffff'
    },
    trOdd: {
      backgroundColor: '#f8fafc'
    },
    trHover: {
      backgroundColor: '#e2e8f0'
    },
    statusBadge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'inline-block'
    },
    statusActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'
    },
    statusInactive: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    actionBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#f8fafc',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    actionBtnHover: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    editBtn: {
      color: '#16a34a'
    },
    viewBtn: {
      color: '#eab308'
    },
    deleteBtn: {
      color: '#dc2626'
    },
    modal: {
      display: 'flex',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '1000',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    modalHeader: {
      padding: '20px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      color: '#64748b',
      cursor: 'pointer'
    },
    modalBody: {
      padding: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#1e293b'
    },
    formControl: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease'
    },
    formSelect: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease'
    },
    modalFooter: {
      padding: '15px 20px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    }
  };

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/group`;

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor for auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/all");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setGroups(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setGroups(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new group
  const openAddModal = () => {
    setEditingGroup(null);
    setIsViewMode(false);
    setFormData({
      groupName: "",
      natureOfGroup: "",
      underTheGroup: "",
      status: "ACTIVE"
    });
    setShowModal(true);
  };

  // Open modal for editing group
  const openEditModal = async (group) => {
    try {
      // Fetch full group details
      const response = await api.get(`/${group.id}`);
      
      if (response.status === 200) {
        const groupDetails = response.data.data || response.data;
        
        setEditingGroup(groupDetails);
        setIsViewMode(false);
        
        setFormData({
          groupName: groupDetails.groupName || "",
          natureOfGroup: groupDetails.natureOfGroup || "",
          underTheGroup: groupDetails.underTheGroup || "",
          status: groupDetails.status || "ACTIVE"
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to fetch group details");
    }
  };

  // Open modal for viewing group
  const openViewModal = async (group) => {
    try {
      // Fetch full group details
      const response = await api.get(`/${group.id}`);
      
      if (response.status === 200) {
        const groupDetails = response.data.data || response.data;
        
        setEditingGroup(groupDetails);
        setIsViewMode(true);
        
        setFormData({
          groupName: groupDetails.groupName || "",
          natureOfGroup: groupDetails.natureOfGroup || "",
          underTheGroup: groupDetails.underTheGroup || "",
          status: groupDetails.status || "ACTIVE"
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to fetch group details");
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setIsViewMode(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission (create/update group)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.groupName) {
      toast.error("Group Name is required", { position: 'top-right' });
      return;
    }

    try {
      if (editingGroup) {
        // Update existing group
        const response = await api.put(`/update/${editingGroup.id}`, formData);
        
        if (response.status === 200) {
          toast.success('Group updated successfully', { position: 'top-right' });
          fetchGroups(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to update group', { position: 'top-right' });
        }
      } else {
        // Create new group
        const response = await api.post('/create', formData);
        
        if (response.status === 200) {
          toast.success('Group added successfully', { position: 'top-right' });
          fetchGroups(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to add group', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error(error.response?.data?.message || 'Failed to save group', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!groups || groups.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = groups.map((group, index) => ({
      "Sr No": index + 1,
      "Group Name": group.groupName || "",
      "Nature of Group": group.natureOfGroup || "",
      "Under the Group": group.underTheGroup || "",
      "Status": group.status || "",
      "Created By": group.createdBy || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Groups");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Group_Master_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle group deletion
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/delete/${id}`);

      if (response.status === 200) {
        toast.success('Group deleted successfully', {
          position: 'top-right',
        });
        fetchGroups(); // refresh table
      } else {
        toast.error(response.data.message || 'Failed to delete group', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error(error.response?.data?.message || 'Failed to delete group', { position: 'top-right' });
    }
  };

  const filteredGroups = groups.filter((group) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (group.groupName && group.groupName.toLowerCase().includes(search)) ||
      (group.natureOfGroup && group.natureOfGroup.toLowerCase().includes(search)) ||
      (group.underTheGroup && group.underTheGroup.toLowerCase().includes(search)) ||
      (group.status && group.status.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Group Master Management</h1>
          <div style={styles.headerActions}>
            {/* EXPORT BUTTON */}
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={handleExportExcel}
            >
              <i className="fas fa-download"></i>
              Export
            </button>
            <button 
              style={{...styles.btn, ...styles.btnPrimary}} 
              onClick={openAddModal}
            >
              <i className="fas fa-plus"></i>
              Add Group
            </button>
          </div>
        </div>

        {/* Group Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Groups</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search groups..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button style={{...styles.btn, ...styles.btnSecondary}}>
                <i className="fas fa-filter"></i>
                Filter
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr No</th>
                  <th style={styles.th}>Group Name</th>
                  <th style={styles.th}>Nature of Group</th>
                  <th style={styles.th}>Under the Group</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created By</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length > 0 ? filteredGroups.map((group, index) => {
                  // Zebra striping logic: White for even, Light Grey for odd
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === group.id;

                  return (
                  <tr 
                    key={group.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(group.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{group.groupName || ""}</td>
                    <td style={styles.td}>{group.natureOfGroup || ""}</td>
                    <td style={styles.td}>{group.underTheGroup || ""}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(group.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive)
                      }}>
                        {group.status || ""}
                      </span>
                    </td>
                    <td style={styles.td}>{group.createdBy || ""}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(group)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(group)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                          title="Delete"
                          onClick={() => handleDelete(group.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      No groups found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Group Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Group Details' : (editingGroup ? 'Edit Group' : 'Add New Group')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Group ID - Read-only for edit/view */}
                {editingGroup && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Group ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={editingGroup.id}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}

                {/* Group Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="groupName">Group Name *</label>
                  <input
                    type="text"
                    id="groupName"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                  />
                </div>

                {/* Nature of Group */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="natureOfGroup">Nature of Group</label>
                  <input
                    type="text"
                    id="natureOfGroup"
                    name="natureOfGroup"
                    value={formData.natureOfGroup}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    disabled={isViewMode}
                  />
                </div>

                {/* Under the Group */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="underTheGroup">Under the Group</label>
                  <input
                    type="text"
                    id="underTheGroup"
                    name="underTheGroup"
                    value={formData.underTheGroup}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    disabled={isViewMode}
                  />
                </div>

                {/* Status */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    disabled={isViewMode}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                {/* Created By - Read-only for edit/view */}
                {editingGroup && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="createdBy">Created By</label>
                    <input
                      type="text"
                      id="createdBy"
                      name="createdBy"
                      value={editingGroup.createdBy || ""}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}
              </form>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closeModal}
              >
                Cancel
              </button>
              {!isViewMode && (
                <button 
                  style={{...styles.btn, ...styles.btnPrimary}} 
                  onClick={handleSubmit}
                >
                  {editingGroup ? 'Update Group' : 'Save Group'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMasterManagement;