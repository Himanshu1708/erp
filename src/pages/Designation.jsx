
import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Designation = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for form data - Updated to match your Designation entity
  const [formData, setFormData] = useState({
    id: "",
    designation_name: "",
    description: ""
  });

  // Style definitions (same as Holiday Management)
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
      backgroundColor: '#DBEAFE',
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      color: 'darkblue',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '15px',
      borderBottom: '1px solid #e2e8f0'
    },
    tr: {
      transition: 'background-color 0.2s ease'
    },
    trHover: {
      backgroundColor: '#f8fafc'
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
      editBtn: {
      color: '#16a34a' // Green for Edit
    },
    viewBtn: {
      color: '#eab308' // Yellow for View
    },
    deleteBtn: {
      color: '#dc2626' // Red for Delete
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
    formControlFocus: {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
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
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

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

  // Fetch designations on component mount
  useEffect(() => {
    fetchDesignations();
  }, []);

  // Fetch all designations
  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/designation/getAllDesig");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setDesignations(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setDesignations(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setDesignations([]);
        }
      } else {
        setDesignations([]);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new designation
  const openAddModal = () => {
    setEditingDesignation(null);
    setIsViewMode(false);
    setFormData({
      id: "",
      designation_name: "",
      description: ""
    });
    setShowModal(true);
  };

  // Open modal for editing designation
  const openEditModal = (designation) => {
    setEditingDesignation(designation);
    setIsViewMode(false);
    
    setFormData({
      id: designation.id || "",
      designation_name: designation.designation_name || "",
      description: designation.description || ""
    });
    setShowModal(true);
  };

  // Open modal for viewing designation
  const openViewModal = (designation) => {
    setEditingDesignation(designation);
    setIsViewMode(true);
    
    setFormData({
      id: designation.id || "",
      designation_name: designation.designation_name || "",
      description: designation.description || ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
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

  // Handle form submission (create/update designation)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.designation_name) {
      toast.error("Designation Name is required", { position: 'top-right' });
      return;
    }

    // 🔴 DUPLICATE DESIGNATION CHECK (UI LEVEL)
const currentDesignation = formData.designation_name.trim().toLowerCase();

const isDuplicate = designations.some(des => {
  // edit mode → same record ignore
  if (editingDesignation && des.id === editingDesignation.id) {
    return false;
  }
  return des.designation_name?.trim().toLowerCase() === currentDesignation;
});

if (isDuplicate) {
  toast.error("Designation already exists", { position: "top-right" });
  return; // ⛔ stop API call
}


    try {
      if (editingDesignation) {
        // Update existing designation
        // Create FormData for the request
        const updateData = new FormData();
        updateData.append('designation_name', editingDesignation.designation_name);
        if (formData.designation_name !== editingDesignation.designation_name) {
          updateData.append('update_designation_name', formData.designation_name);
        }
        if (formData.description !== editingDesignation.description) {
          updateData.append('update_description', formData.description);
        }
        
        const response = await api.put('/designation/updateDesignation', updateData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          toast.success('Designation updated successfully', { position: 'top-right' });
          fetchDesignations(); // Refresh the designation list
          closeModal();
        } else {
          toast.error(response.data?.message || 'Failed to update designation', { position: 'top-right' });
        }
      } else {
        // Create new designation
        // Create FormData for the request
        const createData = new FormData();
        createData.append('designation_name', formData.designation_name);
        if (formData.description) {
          createData.append('description', formData.description);
        }
        
        const response = await api.post('/designation/addDesignation', createData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          toast.success('Designation created successfully', { position: 'top-right' });
          fetchDesignations(); // Refresh the designation list
          closeModal();
        } else {
          toast.error(response.data?.message || 'Failed to create designation', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving designation:', error);
      toast.error(error.response?.data?.message || 'Failed to save designation', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!designations || designations.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = designations.map((designation, index) => ({
      "Sr No": index + 1,
      "Designation Name": designation.designation_name || "",
      "Description": designation.description || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Designations");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Designation_Management_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle designation deletion - Direct deletion without confirmation
  const handleDelete = async (designation_name) => {
    try {
      const response = await api.delete(`/designation/deleteDesignation?designation_name=${designation_name}`);

      if (response.status === 200) {
        toast.success('Designation deleted successfully', {
          position: 'top-right',
        });
        fetchDesignations(); // refresh table
      } else {
        toast.error(response.data?.message || 'Failed to delete designation', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
      // Don't show error toast for delete operations
    }
  };

  const filteredDesignations = designations.filter((designation) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (designation.designation_name && designation.designation_name.toLowerCase().includes(search)) ||
      (designation.description && designation.description.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Designation Management</h1>
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
              Add Designation
            </button>
          </div>
        </div>

        {/* Designation Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Designations</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search designations..." 
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
                  <th style={styles.th}>Designation Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesignations.length > 0 ? filteredDesignations.map(designation => (
                  <tr 
                    key={designation.id}
                    style={hoveredRow === designation.id ? {...styles.tr, ...styles.trHover} : styles.tr}
                    onMouseEnter={() => setHoveredRow(designation.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{designation.designation_name || ""}</td>
                    <td style={styles.td}>{designation.description || ""}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(designation)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(designation)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                          title="Delete"
                          onClick={() => handleDelete(designation.designation_name)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      No designations found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Designation Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Designation' : (editingDesignation ? 'Edit Designation' : 'Add New Designation')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Designation ID - Read-only for edit/view */}
                {editingDesignation && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Designation ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}

                {/* Designation Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="designation_name">Designation Name</label>
                  <input
                    type="text"
                    id="designation_name"
                    name="designation_name"
                    value={formData.designation_name}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                  />
                </div>

                {/* Description */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    disabled={isViewMode}
                  ></textarea>
                </div>
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
                  {editingDesignation ? 'Update Designation' : 'Save Designation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designation;