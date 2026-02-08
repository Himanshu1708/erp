import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const LocationManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for form data - Updated to match your Location entity
  const [formData, setFormData] = useState({
    locationCode: "",
    locationName: "",
    description: ""
  });

  // Style definitions (same as Designation Management)
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
    editBtn: {
      color: '#16a34a' // Green for Edit
    },
    viewBtn: {
      color: '#eab308' // Yellow for View
    },
    deleteBtn: {
      color: '#dc2626' // Red for Delete
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

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/location/getAllLoc");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setLocations(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setLocations(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setLocations([]);
        }
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new location
  const openAddModal = () => {
    setEditingLocation(null);
    setIsViewMode(false);
    setFormData({
      locationCode: "",
      locationName: "",
      description: ""
    });
    setShowModal(true);
  };

  // Open modal for editing location
  const openEditModal = (location) => {
    setEditingLocation(location);
    setIsViewMode(false);
    
    setFormData({
      locationCode: location.locationCode || "",
      locationName: location.locationName || "",
      description: location.description || ""
    });
    setShowModal(true);
  };

  // Open modal for viewing location
  const openViewModal = (location) => {
    setEditingLocation(location);
    setIsViewMode(true);
    
    setFormData({
      locationCode: location.locationCode || "",
      locationName: location.locationName || "",
      description: location.description || ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
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

  // Handle form submission (create/update location)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.locationName) {
      toast.error("Location Name is required", { position: 'top-right' });
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        // Create FormData for to request
        const updateData = new FormData();
        updateData.append('locationName', editingLocation.locationName);
        if (formData.locationName !== editingLocation.locationName) {
          updateData.append('update_LocName', formData.locationName);
        }
        if (formData.description !== editingLocation.description) {
          updateData.append('update_description', formData.description);
        }
        
        const response = await api.put('/location/updateLoc', updateData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          toast.success('Location updated successfully', { position: 'top-right' });
          fetchLocations(); // Refresh to location list
          closeModal();
        } else {
          toast.error(response.data?.message || 'Failed to update location', { position: 'top-right' });
        }
      } else {
        // Create new location
        // Create FormData for to request
        // 🔴 Duplicate location check (frontend)
const isDuplicate = locations.some(
  loc =>
    loc.locationName?.toLowerCase().trim() ===
    formData.locationName.toLowerCase().trim()
);

if (isDuplicate) {
  toast.error('Location already exists', { position: 'top-right' });
  return;
}

        const createData = new FormData();
        createData.append('locationName', formData.locationName);
        if (formData.description) {
          createData.append('description', formData.description);
        }
        
        const response = await api.post('/location/addLocation', createData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          toast.success('Location created successfully', { position: 'top-right' });
          fetchLocations(); // Refresh to location list
          closeModal();
        } else {
          toast.error(response.data?.message || 'Failed to create location', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.message || 'Failed to save location', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!locations || locations.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = locations.map((location, index) => ({
      "Sr No": index + 1,
      "Location Code": location.locationCode || "",
      "Location Name": location.locationName || "",
      "Description": location.description || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Location_Management_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle location deletion - Direct deletion without confirmation
  const handleDelete = async (locationName) => {
    try {
      const response = await api.delete(`/location/deleteLoc?locationName=${locationName}`);

      if (response.status === 200) {
        toast.success('Location deleted successfully', {
          position: 'top-right',
        });
        fetchLocations(); // refresh table
      } else {
        toast.error(response.data?.message || 'Failed to delete location', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      // Don't show error toast for delete operations
    }
  };

  const filteredLocations = locations.filter((location) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (location.locationCode && location.locationCode.toLowerCase().includes(search)) ||
      (location.locationName && location.locationName.toLowerCase().includes(search)) ||
      (location.description && location.description.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Location Management</h1>
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
              Add Location
            </button>
          </div>
        </div>

        {/* Location Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Locations</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search locations..." 
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
                  <th style={styles.th}>Sr No</th> {/* Added Sr No Column */}
                  <th style={styles.th}>Location Code</th>
                  <th style={styles.th}>Location Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.length > 0 ? filteredLocations.map((location, index) => {
                  // Zebra striping logic: White for even, Light Grey for odd
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === location.locationCode;

                  return (
                  <tr 
                    key={location.locationCode || index}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(location.locationCode)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td> {/* Added Sr No Data */}
                    <td style={styles.td}>{location.locationCode || ""}</td>
                    <td style={styles.td}>{location.locationName || ""}</td>
                    <td style={styles.td}>{location.description || ""}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(location)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(location)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                          title="Delete"
                          onClick={() => handleDelete(location.locationName)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="5" style={{...styles.td, textAlign: 'center', padding: '30px'}}> {/* Updated ColSpan to 5 */}
                      No locations found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Location Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Location' : (editingLocation ? 'Edit Location' : 'Add New Location')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Location Code - Read-only for edit/view */}
                {editingLocation && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="locationCode">Location Code</label>
                    <input
                      type="text"
                      id="locationCode"
                      name="locationCode"
                      value={formData.locationCode}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}

                {/* Location Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="locationName">Location Name</label>
                  <input
                    type="text"
                    id="locationName"
                    name="locationName"
                    value={formData.locationName}
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
                  {editingLocation ? 'Update Location' : 'Save Location'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;