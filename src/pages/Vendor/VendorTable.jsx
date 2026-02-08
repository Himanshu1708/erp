import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const VendorManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for form data - updated to match your Java entity
  const [formData, setFormData] = useState({
    vendorName: '',
    address1: '',
    address2: '',
    selectState: '',
    city: '',
    pincode: '',
    phone: '',
    mobile: '',
    email: '',
    panNo: '',
    gstNo: '',
    aadharNo: '',
    bankName: '',
    accountNo: '',
    branchName: '',
    ifscCode: '',
    panCard: '',
    gstCertificate: ''
  });

  // Style definitions
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      lineHeight: '1.6'
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
      maxWidth: '1000px',
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
    formSection: {
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#1e40af',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '8px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formGroupFullWidth: {
      gridColumn: 'span 2'
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
    fileInput: {
      display: 'none'
    },
    fileLabel: {
      display: 'inline-block',
      padding: '8px 15px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    fileLabelHover: {
      backgroundColor: '#e2e8f0'
    }
  };

  // API base URL
  // const API_BASE_URL = 'http://localhost:8080/api/vendor';
  const API_BASE_URL = '"https://pharma2.shop/api/vendor';

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

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Fetch all vendors using the /getAll endpoint
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/all');
      
      // Check if response is successful
      if (response.data && response.data.status === 200) {
        setVendors(response.data.data || []);
      } else {
        toast.error(response.data?.message || 'Failed to fetch vendors');
        setVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new vendor
  const openAddModal = () => {
    setEditingVendor(null);
    setIsViewMode(false);
    setFormData({
      vendorName: '',
      address1: '',
      address2: '',
      selectState: '',
      city: '',
      pincode: '',
      phone: '',
      mobile: '',
      email: '',
      panNo: '',
      gstNo: '',
      aadharNo: '',
      bankName: '',
      accountNo: '',
      branchName: '',
      ifscCode: '',
      panCard: '',
      gstCertificate: ''
    });
    setShowModal(true);
  };

  // Open modal for editing vendor
  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setIsViewMode(false);
    setFormData({
      vendorName: vendor.vendorName || '',
      address1: vendor.address1 || '',
      address2: vendor.address2 || '',
      selectState: vendor.selectState || '',
      city: vendor.city || '',
      pincode: vendor.pincode || '',
      phone: vendor.phone || '',
      mobile: vendor.mobile || '',
      email: vendor.email || '',
      panNo: vendor.panNo || '',
      gstNo: vendor.gstNo || '',
      aadharNo: vendor.aadharNo || '',
      bankName: vendor.bankName || '',
      accountNo: vendor.accountNo || '',
      branchName: vendor.branchName || '',
      ifscCode: vendor.ifscCode || '',
      panCard: vendor.panCard || '',
      gstCertificate: vendor.gstCertificate || ''
    });
    setShowModal(true);
  };

  // Open modal for viewing vendor
  const openViewModal = (vendor) => {
    setEditingVendor(vendor);
    setIsViewMode(true);
    setFormData({
      vendorName: vendor.vendorName || '',
      address1: vendor.address1 || '',
      address2: vendor.address2 || '',
      selectState: vendor.selectState || '',
      city: vendor.city || '',
      pincode: vendor.pincode || '',
      phone: vendor.phone || '',
      mobile: vendor.mobile || '',
      email: vendor.email || '',
      panNo: vendor.panNo || '',
      gstNo: vendor.gstNo || '',
      aadharNo: vendor.aadharNo || '',
      bankName: vendor.bankName || '',
      accountNo: vendor.accountNo || '',
      branchName: vendor.branchName || '',
      ifscCode: vendor.ifscCode || '',
      panCard: vendor.panCard || '',
      gstCertificate: vendor.gstCertificate || ''
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
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

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // In a real application, you would handle file upload here
      // For now, we'll just store the filename
      setFormData({
        ...formData,
        [name]: files[0].name
      });
    }
  };

  // Handle form submission (create/update vendor)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVendor) {
        // Update existing vendor
        const response = await api.put(`/update/${editingVendor.id}`, formData);
        if (response.data.status === 200) {
          toast.success('Vendor updated successfully', { position: 'top-right' });
          fetchVendors(); // Refresh the vendor list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to update vendor', { position: 'top-right' });
        }
      } else {
        // Create new vendor
        const response = await api.post('/create', formData);
        if (response.data.status === 200) {
          toast.success('Vendor created successfully', { position: 'top-right' });
          fetchVendors(); // Refresh the vendor list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to create vendor', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(error.response?.data?.message || 'Failed to save vendor', { position: 'top-right' });
    }
  };

  // Handle vendor deletion - Removed confirmation dialog
const handleDelete = async (id) => {
  if (!id) {
    toast.error("Invalid leave ID");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this leave?"
  );

  if (!confirmDelete) return;

  try {
    const response = await api.delete(`/leave/deleteLeave/${id}`);

    if (response.status === 200) {
      toast.success(response.data || "Leave deleted successfully", {
        position: 'top-right',
      });
      fetchLeaves(); // refresh table
    } else {
      toast.error("Failed to delete leave", {
        position: 'top-right',
      });
    }
  } catch (error) {
    console.error("Error deleting leave:", error);
    toast.error(
      error.response?.data || "Failed to delete leave",
      { position: 'top-right' }
    );
  }
};


  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.toLowerCase();

    return (
      vendor.vendorName?.toLowerCase().includes(search) ||
      vendor.email?.toLowerCase().includes(search) ||
      vendor.mobile?.toString().includes(search) ||
      vendor.panNo?.toLowerCase().includes(search) ||
      vendor.gstNo?.toLowerCase().includes(search)
    );
  });

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleExportExcel = () => {
  if (!vendors || vendors.length === 0) {
    toast.error("No vendor data available to export");
    return;
  }

  const excelData = vendors.map((vendor, index) => ({
    "Sr No": index + 1,
    "Vendor Name": vendor.vendorName || "",
    "Email": vendor.email || "",
    "Phone": vendor.phone || "",
    "Mobile": vendor.mobile || "",
    "Address Line 1": vendor.address1 || "",
    "Address Line 2": vendor.address2 || "",
    "City": vendor.city || "",
    "State": vendor.selectState || "",
    "Pincode": vendor.pincode || "",
    "PAN No": vendor.panNo || "",
    "GST No": vendor.gstNo || "",
    "Aadhar No": vendor.aadharNo || "",
    "Bank Name": vendor.bankName || "",
    "Account No": vendor.accountNo || "",
    "Branch Name": vendor.branchName || "",
    "IFSC Code": vendor.ifscCode || "",
    "PAN Card": vendor.panCard || "",
    "GST Certificate": vendor.gstCertificate || ""
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

  // Convert to buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Vendor_Management_${Date.now()}.xlsx`);
};


  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Vendor Management</h1>
          <div style={styles.headerActions}>
            <button style={{...styles.btn, ...styles.btnSecondary}}>
              <i className="fas fa-download"></i>
              Export
            </button>
            <button 
              style={{...styles.btn, ...styles.btnPrimary}} 
              onClick={openAddModal}
            >
              <i className="fas fa-plus"></i>
              Add Vendor
            </button>
          </div>
        </div>

        {/* Vendor Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Vendors</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search vendors..." 
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
                  <th style={styles.th}>Vendor Name</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>PAN</th>
                  <th style={styles.th}>GST</th>
                  <th style={styles.th}>Bank Details</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length > 0 ? filteredVendors.map((vendor, index) => {
                  // Zebra striping logic: White for even, Light Grey for odd
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === vendor.id;

                  return (
                  <tr 
                    key={vendor.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e4e6e9ff' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(vendor.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td> {/* Added Sr No Data */}
                    <td style={styles.td}>{vendor.vendorName}</td>
                    <td style={styles.td}>
                      {vendor.email}<br/>
                      {vendor.mobile}
                    </td>
                    <td style={styles.td}>
                      {vendor.address1}, {vendor.address2}<br/>
                      {vendor.city}, {vendor.selectState} - {vendor.pincode}
                    </td>
                    <td style={styles.td}>{vendor.panNo}</td>
                    <td style={styles.td}>{vendor.gstNo}</td>
                    <td style={styles.td}>
                      {vendor.bankName}<br/>
                      A/C: {vendor.accountNo}<br/>
                      IFSC: {vendor.ifscCode}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(vendor.status === 'Active' ? styles.statusActive : styles.statusInactive)
                      }}>
                        {vendor.status || 'Active'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, color: '#16a34a'}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(vendor)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, color: '#eab308'}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(vendor)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                       <button 
  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
  title="Delete"
  onClick={() => handleDelete(leave.id)}
>
  <i className="fas fa-trash"></i>
</button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="9" style={{...styles.td, textAlign: 'center', padding: '30px'}}> {/* Updated ColSpan */}
                      No vendors found. Add a new vendor to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Vendor Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Vendor' : (editingVendor ? 'Edit Vendor' : 'Add New Vendor')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Basic Information</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="vendorName">Vendor Name</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="vendorName"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleInputChange}
                        placeholder="Enter vendor name"
                        required
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="email">Email</label>
                      <input
                        type="email"
                        style={styles.formControl}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        style={styles.formControl}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="mobile">Mobile</label>
                      <input
                        type="tel"
                        style={styles.formControl}
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Address Information</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="address1">Address Line 1</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="address1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleInputChange}
                        placeholder="Enter address line 1"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="address2">Address Line 2</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="address2"
                        name="address2"
                        value={formData.address2}
                        onChange={handleInputChange}
                        placeholder="Enter address line 2"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="city">City</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="selectState">State</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="selectState"
                        name="selectState"
                        value={formData.selectState}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="pincode">Pincode</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information Section */}
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Tax Information</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="panNo">PAN Number</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="panNo"
                        name="panNo"
                        value={formData.panNo}
                        onChange={handleInputChange}
                        placeholder="Enter PAN number"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="gstNo">GST Number</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="gstNo"
                        name="gstNo"
                        value={formData.gstNo}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="aadharNo">Aadhar Number</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="aadharNo"
                        name="aadharNo"
                        value={formData.aadharNo}
                        onChange={handleInputChange}
                        placeholder="Enter Aadhar number"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Information Section */}
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Bank Information</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="bankName">Bank Name</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="bankName"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        placeholder="Enter bank name"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="accountNo">Account Number</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="accountNo"
                        name="accountNo"
                        value={formData.accountNo}
                        onChange={handleInputChange}
                        placeholder="Enter account number"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="branchName">Branch Name</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="branchName"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        placeholder="Enter branch name"
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="ifscCode">IFSC Code</label>
                      <input
                        type="text"
                        style={styles.formControl}
                        id="ifscCode"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        placeholder="Enter IFSC code"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div style={styles.formSection}>
                  <h4 style={styles.sectionTitle}>Documents</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="panCard">PAN Card</label>
                      {!isViewMode ? (
                        <>
                          <input
                            type="file"
                            style={styles.fileInput}
                            id="panCard"
                            name="panCard"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                          />
                          <label htmlFor="panCard" style={styles.fileLabel}>
                            <i className="fas fa-upload"></i> Choose File
                          </label>
                          {formData.panCard && <p>Selected: {formData.panCard}</p>}
                        </>
                      ) : (
                        <div style={styles.formControl}>
                          {formData.panCard ? (
                            <a href={`#`} target="_blank" rel="noopener noreferrer">
                              View PAN Card
                            </a>
                          ) : (
                            'No file uploaded'
                          )}
                        </div>
                      )}
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="gstCertificate">GST Certificate</label>
                      {!isViewMode ? (
                        <>
                          <input
                            type="file"
                            style={styles.fileInput}
                            id="gstCertificate"
                            name="gstCertificate"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                          />
                          <label htmlFor="gstCertificate" style={styles.fileLabel}>
                            <i className="fas fa-upload"></i> Choose File
                          </label>
                          {formData.gstCertificate && <p>Selected: {formData.gstCertificate}</p>}
                        </>
                      ) : (
                        <div style={styles.formControl}>
                          {formData.gstCertificate ? (
                            <a href={`#`} target="_blank" rel="noopener noreferrer">
                              View GST Certificate
                            </a>
                          ) : (
                            'No file uploaded'
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
                  {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;