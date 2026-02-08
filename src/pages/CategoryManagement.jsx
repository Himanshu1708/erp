import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CategoryManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for form data - Matching Controller @RequestParam names
  // Add uses 'category', Update uses 'update_cate'
  const [formData, setFormData] = useState({
    category: "",
    description: ""
  });

  // Style definitions (Same as requested reference code)
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

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/category/getAllCate");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new category
  const openAddModal = () => {
    setEditingCategory(null);
    setIsViewMode(false);
    setFormData({
      category: "",
      description: ""
    });
    setShowModal(true);
  };

  // Open modal for editing category
  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsViewMode(false);
    
    // Entity uses 'cate_name', Controller Add uses 'category'
    setFormData({
      category: category.cate_name || "",
      description: category.description || ""
    });
    setShowModal(true);
  };

  // Open modal for viewing category
  const openViewModal = (category) => {
    setEditingCategory(category);
    setIsViewMode(true);
    
    setFormData({
      category: category.cate_name || "",
      description: category.description || ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
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

  // Handle form submission (create/update category)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.category) {
      toast.error("Category Name is required", { position: 'top-right' });
      return;
    }

    // 🔴 DUPLICATE CATEGORY CHECK (UI LEVEL)
const currentCategory = formData.category.trim().toLowerCase();

const isDuplicate = categories.some(cat => {
  // while editing → ignore same record
  if (editingCategory && cat.id === editingCategory.id) {
    return false;
  }
  return cat.cate_name?.trim().toLowerCase() === currentCategory;
});

if (isDuplicate) {
  toast.error("Category already exists", { position: "top-right" });
  return; // ⛔ stop API call
}


    try {
      if (editingCategory) {
        // Update existing category
        // Controller expects params: update_cate, update_description
        const params = {
          update_cate: formData.category,
          update_description: formData.description
        };
        
        const response = await api.put(`/category/updateCate/${editingCategory.id}`, null, { params });
        
        if (response.status === 200) {
          toast.success('Category updated successfully', { position: 'top-right' });
          fetchCategories(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data || 'Failed to update category', { position: 'top-right' });
        }
      } else {
        // Create new category
        // Controller expects params: category, description
        const params = {
          category: formData.category,
          description: formData.description
        };
        
        const response = await api.post('/category/addCategory', null, { params });
        
        if (response.status === 200) {
          toast.success('Category added successfully', { position: 'top-right' });
          fetchCategories(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data || 'Failed to add category', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data || 'Failed to save category', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!categories || categories.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = categories.map((category, index) => ({
      "Sr No": index + 1,
      "Category Name": category.cate_name || "",
      "Description": category.description || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Category_Management_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle category deletion - Direct delete without confirmation
  const handleDelete = async (id) => {
    // Removed window.confirm for direct deletion
    
    try {
      const response = await api.delete(`/category/deleteCategory/${id}`);

      if (response.status === 200) {
        toast.success('Category deleted successfully', {
          position: 'top-right',
        });
        fetchCategories(); // refresh table
      } else {
        toast.error(response.data || 'Failed to delete category', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category', { position: 'top-right' });
    }
  };

  const filteredCategories = categories.filter((category) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (category.cate_name && category.cate_name.toLowerCase().includes(search)) ||
      (category.description && category.description.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Category Management</h1>
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
              Add Category
            </button>
          </div>
        </div>

        {/* Category Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Categories</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search categories..." 
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
                  <th style={styles.th}>Category Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? filteredCategories.map((category, index) => {
                  // Zebra striping logic: White for even, Light Grey for odd
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === category.id;

                  return (
                  <tr 
                    key={category.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(category.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{category.cate_name || ""}</td>
                    <td style={styles.td}>{category.description || ""}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                          title="Edit"
                          onClick={() => openEditModal(category)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                          title="View"
                          onClick={() => openViewModal(category)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                          title="Delete"
                          onClick={() => handleDelete(category.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      No categories found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Category Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Category' : (editingCategory ? 'Edit Category' : 'Add New Category')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Category ID - Read-only for edit/view */}
                {editingCategory && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Category ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={editingCategory.id}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}

                {/* Category Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="category">Category Name</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
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
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;