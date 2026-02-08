import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ConditionMaster = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCondition, setEditingCondition] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for form data - Updated to match your Condition entity
  const [formData, setFormData] = useState({
    id: "",
    term_name: "",
    conditionText: ""
  });

  // Style definitions (same as ContractorMaster)
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
      backgroundColor: '#dbeafe', // Changed to light blue color for table header
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e3a8a', // Darker blue text for contrast
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
      maxWidth: '800px',
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
    },
    textarea: {
      minHeight: '120px',
      resize: 'vertical'
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

  // Fetch conditions on component mount
  useEffect(() => {
    fetchConditions();
  }, []);

  // Fetch all conditions
  const fetchConditions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/condition/getAllCond");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setConditions(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setConditions(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setConditions([]);
        }
      } else {
        setConditions([]);
      }
    } catch (error) {
      console.error("Error fetching conditions:", error);
      toast.error(error.response?.data?.message || "Failed to fetch conditions");
      setConditions([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new condition
  const openAddModal = () => {
    setEditingCondition(null);
    setIsViewMode(false);
    setFormData({
      id: "",
      term_name: "",
      conditionText: ""
    });
    setShowModal(true);
  };

  // Open modal for editing condition
  const openEditModal = (condition) => {
    setEditingCondition(condition);
    setIsViewMode(false);
    
    setFormData({
      id: condition.id || "",
      term_name: condition.term_name || "",
      conditionText: condition.conditionText || ""
    });
    setShowModal(true);
  };

  // Open modal for viewing condition
  const openViewModal = (condition) => {
    setEditingCondition(condition);
    setIsViewMode(true);
    
    setFormData({
      id: condition.id || "",
      term_name: condition.term_name || "",
      conditionText: condition.conditionText || ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCondition(null);
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

  // Handle form submission (create/update condition)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.term_name) {
      toast.error("Term Name is required", { position: 'top-right' });
      return;
    }
    
  // 🔴 DUPLICATE TERM NAME CHECK (UI LEVEL)
  const currentTerm = formData.term_name.trim().toLowerCase();

  const isDuplicate = conditions.some(cond => {
    // while editing → ignore same record
    if (editingCondition && cond.term_name === editingCondition.term_name) {
      return false;
    }
    return cond.term_name?.trim().toLowerCase() === currentTerm;
  });

  if (isDuplicate) {
    toast.error("Term already exists", { position: "top-right" });
    return; // ⛔ stop API call
  }

    try {
      if (editingCondition) {
        // Update existing condition
        const response = await api.put('/condition/updateCond', null, {
          params: {
            term_name: editingCondition.term_name,
            update_term_name: formData.term_name,
            update_condition: formData.conditionText
          }
        });
        
        if (response.status === 200) {
          toast.success('Condition updated successfully', { position: 'top-right' });
          fetchConditions(); // Refresh the condition list
          closeModal();
        } else {
          toast.error(response.data || 'Failed to update condition', { position: 'top-right' });
        }
      } else {
        // Create new condition
        const response = await api.post('/condition/addCond', null, {
          params: {
            term_name: formData.term_name,
            condition: formData.conditionText
          }
        });
        
        if (response.status === 200) {
          toast.success('Condition added successfully', { position: 'top-right' });
          fetchConditions(); // Refresh the condition list
          closeModal();
        } else {
          toast.error(response.data || 'Failed to add condition', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving condition:', error);
      toast.error(error.response?.data || 'Failed to save condition', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!conditions || conditions.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = conditions.map((condition, index) => ({
      "Sr No": index + 1,
      "Term Name": condition.term_name || "",
      "Condition": condition.conditionText || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Conditions");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Condition_Master_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle condition deletion
  const handleDelete = async (term_name) => {
    if (!window.confirm(`Are you sure you want to delete the condition "${term_name}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/condition/deleteCond`, {
        params: {
          term_name: term_name
        }
      });

      if (response.status === 200) {
        toast.success(response.data || 'Condition deleted successfully', {
          position: 'top-right',
        });
        fetchConditions(); // refresh table
      } else {
        toast.error(response.data || 'Failed to delete condition', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting condition:', error);
      toast.error(error.response?.data || 'Failed to delete condition', {
        position: 'top-right',
      });
    }
  };

  const filteredConditions = conditions.filter((condition) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (condition.term_name && condition.term_name.toLowerCase().includes(search)) ||
      (condition.conditionText && condition.conditionText.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Condition Master</h1>
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
              Add Condition
            </button>
          </div>
        </div>

        {/* Condition Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Conditions</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search conditions..." 
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
                  <th style={styles.th}>Term Name</th>
                  <th style={styles.th}>Condition</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConditions.length > 0 ? filteredConditions.map((condition, index) => (
                  <tr 
                    key={condition.id}
                    style={hoveredRow === condition.id ? {...styles.tr, ...styles.trHover} : styles.tr}
                    onMouseEnter={() => setHoveredRow(condition.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <strong style={{ color: '#1e40af' }}>{condition.term_name || ""}</strong>
                    </td>
                    <td style={styles.td}>
                      {condition.conditionText && condition.conditionText.length > 100 
                        ? `${condition.conditionText.substring(0, 100)}...` 
                        : condition.conditionText || ""}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, color: '#10b981'}}
                          title="Edit"
                          onClick={() => openEditModal(condition)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, color: '#f59e0b'}}
                          title="View"
                          onClick={() => openViewModal(condition)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, color: '#ef4444'}}
                          title="Delete"
                          onClick={() => handleDelete(condition.term_name)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      No conditions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Condition Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Condition' : (editingCondition ? 'Edit Condition' : 'Add New Condition')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Condition ID - Read-only for edit/view */}
                {editingCondition && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Condition ID</label>
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

                {/* Term Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="term_name">Term Name</label>
                  <input
                    type="text"
                    id="term_name"
                    name="term_name"
                    value={formData.term_name}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                    placeholder="Enter term name"
                  />
                </div>

                {/* Condition Text */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="conditionText">Condition</label>
                  <textarea
                    id="conditionText"
                    name="conditionText"
                    value={formData.conditionText}
                    onChange={handleInputChange}
                    style={{...styles.formControl, ...styles.textarea}}
                    disabled={isViewMode}
                    placeholder="Enter condition details"
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
                  {editingCondition ? 'Update Condition' : 'Save Condition'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionMaster;