import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StoreManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // NEW: State for projects dropdown
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // State for form data - Updated to match your Store entity
  const [formData, setFormData] = useState({
    id: "",
    project: "", // This will store the selected project_code
    store: ""
  });

  // Style definitions (same as reference code)
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
      backgroundColor: '#dbeafe', // Light blue color for table header
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
    trEven: {
      backgroundColor: '#ffffff' // White for even rows
    },
    trOdd: {
      backgroundColor: '#f8fafc' // Light gray for odd rows
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
      color: '#64748b', // Default grey, overridden inline
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
      color: '#16a34a' // Green for Edit
    },
    viewBtn: {
      color: '#eab308' // Yellow for View
    },
    deleteBtn: {
      color: '#dc2626' // Red for Delete
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
      transition: 'all 0.2s ease',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundColor: '#ffffff',
      color: '#1e293b'
    },
    formControlDisabled: {
      backgroundColor: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed'
    },
    selectWrapper: {
      position: 'relative'
    },
    selectArrow: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: '#64748b',
      zIndex: 1
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

  // NEW: Fetch projects when modal opens
  useEffect(() => {
    if (showModal) {
      fetchProjects();
    }
  }, [showModal]);

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  // NEW: Fetch all projects for dropdown
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      // The endpoint is /project/getProjects based on your controller mapping
      const response = await api.get("/project/getProjects");
      
      console.log("Projects response:", response.data);

      let projectsData = [];
      // Assuming your API returns an array of project objects
      if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else {
        console.error("Unexpected projects response format:", response.data);
        projectsData = [];
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch all stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/store/getStore");
      
      if (response.status === 200) {
        // Debug log to check the response structure
        console.log("Stores response:", response.data);
        
        // Handle different response structures
        let storesData = [];
        if (Array.isArray(response.data)) {
          storesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          storesData = response.data.data;
        } else if (response.data && response.data.stores && Array.isArray(response.data.stores)) {
          storesData = response.data.stores;
        } else {
          console.error("Unexpected response format:", response.data);
          storesData = [];
        }
        
        // Log to verify data structure
        console.log("Processed stores data:", storesData);
        setStores(storesData);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new store
  const openAddModal = () => {
    setEditingStore(null);
    setIsViewMode(false);
    setFormData({
      id: "",
      project: "",
      store: ""
    });
    setShowModal(true);
  };

  // Open modal for editing store
  const openEditModal = (store) => {
    setEditingStore(store);
    setIsViewMode(false);
    
    setFormData({
      id: store.id || "",
      project: store.project || "", // Assuming 'project' field holds the project_code
      store: store.store || ""
    });
    setShowModal(true);
  };

  // Open modal for viewing store
  const openViewModal = (store) => {
    setEditingStore(store);
    setIsViewMode(true);
    
    setFormData({
      id: store.id || "",
      project: store.project || "",
      store: store.store || ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingStore(null);
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

  // Handle form submission (create/update store)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.project) {
      toast.error("Project is required", { position: "top-right" });
      return;
    }

    if (!formData.store) {
      toast.error("Store is required", { position: "top-right" });
      return;
    }

    // DUPLICATE STORE NAME CHECK (UI LEVEL)
    const currentProject = formData.project.trim().toLowerCase();
    const currentStore = formData.store.trim().toLowerCase();

    const isDuplicate = stores.some(store => {
      // while editing, ignore same record
      if (editingStore && store.id === editingStore.id) return false;
      
      // Check for duplicate project with same store
      const projectMatch = store.project?.trim().toLowerCase() === currentProject;
      const storeMatch = store.store?.trim().toLowerCase() === currentStore;
      
      return projectMatch && storeMatch;
    });

    if (isDuplicate) {
      toast.error("Store with this Project already exists", { position: "top-right" });
      return; // stop API call
    }

    try {
      if (editingStore) {
        // Update existing store
        const updateData = new FormData();
        updateData.append("id", editingStore.id);

        if (formData.project !== editingStore.project) {
          updateData.append("upproject", formData.project);
        }
        if (formData.store !== editingStore.store) {
          updateData.append("upstore", formData.store);
        }

        const response = await api.put("/store/updateStore", updateData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          toast.success("Store updated successfully", { position: "top-right" });
          fetchStores();
          closeModal();
        } else {
          toast.error(response.data?.message || "Failed to update store", {
            position: "top-right",
          });
        }
      } else {
        // Create new store
        const createData = new FormData();
        createData.append("project", formData.project);
        createData.append("store", formData.store);

        const response = await api.post("/store/addStore", createData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200) {
          toast.success("Store created successfully", { position: "top-right" });
          fetchStores();
          closeModal();
        } else {
          toast.error(response.data?.message || "Failed to create store", {
            position: "top-right",
          });
        }
      }
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error(error.response?.data?.message || "Failed to save store", {
        position: "top-right",
      });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!stores || stores.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = stores.map((store, index) => ({
      "Sr No": index + 1,
      "Project": store.project || "",
      "Store": store.store || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Store_Management_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle store deletion
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/store/deleteStore/${id}`);

      if (response.status === 200) {
        toast.success('Store deleted successfully', {
          position: 'top-right',
        });
        fetchStores(); // refresh table
      } else {
        toast.error(response.data?.message || 'Failed to delete store', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      // Don't show error toast for delete operations
    }
  };

  const filteredStores = stores.filter((store) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (store.project && store.project.toLowerCase().includes(search)) ||
      (store.store && store.store.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Store Management</h1>
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
              Add Store
            </button>
          </div>
        </div>

        {/* Store Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Stores</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search stores..." 
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
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Store</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.length > 0 ? filteredStores.map((store, index) => {
                  // Zebra striping logic: White for even, Light Grey for odd
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === store.id;

                  return (
                  <tr 
                    key={store.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(store.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{store.project || ""}</td>
                    <td style={styles.td}>{store.store || ""}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(store)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(store)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                          title="Delete"
                          onClick={() => handleDelete(store.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      No stores found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Store Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Store' : (editingStore ? 'Edit Store' : 'Add New Store')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Store ID - Read-only for edit/view */}
                {editingStore && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Store ID</label>
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

                {/* Project Dropdown */}
               <div style={styles.formGroup}>
  <label style={styles.formLabel} htmlFor="project">Project</label>

  <div style={styles.selectWrapper}>
    <select
      id="project"
      name="project"
      value={formData.project}
      onChange={handleInputChange}
      style={{
        ...styles.formControl,
        ...(isViewMode || projectsLoading ? styles.formControlDisabled : {})
      }}
      disabled={isViewMode || projectsLoading}
      required
    >
      <option value="">
        {projectsLoading ? "Loading Projects..." : "-- Select Project --"}
      </option>

      {projects.map((proj) => (
        <option
          key={proj.project_code || proj.project_name}
          value={proj.project_name}
        >
          {proj.project_name}
        </option>
      ))}
    </select>

    {!isViewMode && (
      <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
    )}
  </div>
</div>


                {/* Store */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="store">Store</label>
                  <input
                    type="text"
                    id="store"
                    name="store"
                    value={formData.store}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                  />
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
                  {editingStore ? 'Update Store' : 'Save Store'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;


