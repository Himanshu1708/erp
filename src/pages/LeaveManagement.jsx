
import React, { useState, useEffect, useRef } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const LeaveManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employees, setEmployees] = useState([]);
  const [dateError, setDateError] = useState("");

  // Refs for date inputs
  const fdateInputRef = useRef(null);
  const todateInputRef = useRef(null);

  // State for form data
  const [formData, setFormData] = useState({
    id: "",
    emp: "",
    fdate: "",
    todate: "",
    leaves: 0
  });

  // Style definitions (same as reference code)
  const styles = {
    dateWrapper: {
      position: 'relative'
    },
    dateIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      cursor: 'pointer',
      pointerEvents: 'auto'
    },

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
      backgroundColor: '#e6f7ff', // Light blue color for table header
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#1e293b',
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
      backgroundColor: '#f5f5f5' // Light gray for odd rows
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
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    editBtn: {
      color: '#10b981' // Green color for edit icon
    },
    viewBtn: {
      color: '#f59e0b' // Yellow color for view icon
    },
    deleteBtn: {
      color: '#ef4444' // Red color for delete icon
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
    },
    summaryCard: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px',
      marginBottom: '20px'
    },
    summaryTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px'
    },
    summaryItem: {
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: '#f8fafc'
    },
    summaryLabel: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '5px'
    },
    summaryValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e40af'
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '5px',
      display: 'flex',
      alignItems: 'center'
    }
  };

  // API base URL
  // const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://pharma2.shop";

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
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

  // Function to convert dd/MM/yyyy to yyyy-MM-dd (for input type="date")
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      if (typeof dateString === 'string') {
        // If it's already in yyyy-MM-dd format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        
        // If it's in dd/MM/yyyy format
        if (dateString.includes('/')) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
        }
        
        // Try parsing as Date object
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      return '';
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return '';
    }
  };

  // Function to convert yyyy-MM-dd to dd/MM/yyyy (for API)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    try {
      // If it's already in dd/MM/yyyy format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        return dateString;
      }
      
      // Parse the date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return '';
    } catch (error) {
      console.error("Error formatting date for API:", error);
      return '';
    }
  };

  // Function to format date for display (dd/MM/yyyy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      if (typeof dateString === 'string') {
        // If it's in dd/MM/yyyy format
        if (dateString.includes('/')) {
          return dateString;
        }
        
        // If it's in yyyy-MM-dd format
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parts = dateString.split('-');
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        
        // Try parsing as Date object
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }
      }
      
      return String(dateString);
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return String(dateString);
    }
  };

  // Calculate leave days between two dates
  const calculateLeaveDays = (fdate, todate) => {
    if (!fdate) return 0;
    
    const fromDate = new Date(fdate);
    const toDate = todate ? new Date(todate) : fromDate;
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 0;
    
    // Calculate difference in days + 1 (inclusive)
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  // Validate dates
  const validateDates = (fdate, todate) => {
    setDateError("");
    
    if (fdate && todate) {
      const fromDate = new Date(fdate);
      const toDate = new Date(todate);
      
      if (fromDate > toDate) {
        setDateError("To Date must be on or after From Date");
        return false;
      }
    }
    
    return true;
  };

  // Fetch leaves on component mount
  useEffect(() => {
    fetchLeaves();
  }, []);

  // Fetch all leaves with proper API integration
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leave/getemp");

      // Extract actual list
      const apiData = response.data?.data || response.data;

      if (response.status === 200 && Array.isArray(apiData)) {
        const processedLeaves = [];

        apiData.forEach(employeeLeave => {
          if (employeeLeave?.leaveRecords?.length > 0) {
            employeeLeave.leaveRecords.forEach(record => {
              // Ensure each record has a proper ID
              if (!record.id && employeeLeave.id) {
                record.id = employeeLeave.id;
              }
              
              processedLeaves.push({
                id: record.id,
                emp: employeeLeave.emp,
                fdate: record.fdate,
                todate: record.todate,
                leaves: record.current_leaves || 0,
                total_leaves: employeeLeave.total_leaves || 0
              });
            });
          }
        });

        setLeaves(processedLeaves);

        const uniqueEmps = [
          ...new Set(processedLeaves.map(l => l.emp).filter(Boolean))
        ];
        setEmployees(uniqueEmps);

        toast.success(`Loaded ${processedLeaves.length} leave record(s)`);
      } else {
        setLeaves([]);
        setEmployees([]);
        toast.info("No leave records found");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error(error.response?.data?.message || "Failed to fetch leaves");
      setLeaves([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new leave
  const openAddModal = () => {
    setEditingLeave(null);
    setIsViewMode(false);
    setDateError("");
    setFormData({
      id: "",
      emp: "",
      fdate: "",
      todate: "",
      leaves: 0
    });
    setShowModal(true);
  };

  // Open modal for editing leave
  const openEditModal = (leave) => {
    if (!leave?.id) {
      toast.error("Invalid leave record (ID missing)");
      return;
    }

    setEditingLeave(leave);
    setIsViewMode(false);
    setDateError("");

    setFormData({
      id: leave.id,
      emp: leave.emp || "",
      fdate: formatDateForInput(leave.fdate),
      todate: formatDateForInput(leave.todate),
      leaves: leave.leaves || 0
    });

    setShowModal(true);
  };

  // Open modal for viewing leave
  const openViewModal = (leave) => {
    if (!leave?.id) {
      toast.error("Invalid leave record (ID missing)");
      return;
    }

    setEditingLeave(leave);
    setIsViewMode(true);
    setDateError("");

    setFormData({
      id: leave.id,
      emp: leave.emp || "",
      fdate: formatDateForInput(leave.fdate),
      todate: formatDateForInput(leave.todate),
      leaves: leave.leaves || 0
    });

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingLeave(null);
    setIsViewMode(false);
    setDateError("");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      
      // If fdate or todate changes, validate dates
      if (name === 'fdate' || name === 'todate') {
        validateDates(newData.fdate, newData.todate);
      }
      
      return newData;
    });
  };

  // Handle form submission (create/update leave)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emp?.trim()) {
      toast.error("Employee Name is required");
      return;
    }

    if (!formData.fdate) {
      toast.error("From Date is required");
      return;
    }

    if (!validateDates(formData.fdate, formData.todate)) {
      toast.error(dateError);
      return;
    }

    try {
      const formattedFdate = formatDateForAPI(formData.fdate);
      const formattedTodate = formData.todate
        ? formatDateForAPI(formData.todate)
        : null;

      let response;

      // UPDATE
      if (editingLeave && editingLeave.id) {
        response = await api.put(
          `/leave/updateLeave/${editingLeave.id}`,
          null,
          {
            params: {
              emp: formData.emp.trim(),
              fdate: formattedFdate,
              todate: formattedTodate
            }
          }
        );

        if (response.status === 200) {
          toast.success("Leave updated successfully");
        } else {
          toast.error("Failed to update leave");
          return;
        }
      }

      // ADD
      else {
        response = await api.post(
          "/leave/addLeave",
          null,
          {
            params: {
              emp: formData.emp.trim(),
              fdate: formattedFdate,
              todate: formattedTodate
            }
          }
        );

        if (response.status === 200) {
          toast.success("Leave added successfully");
        } else {
          toast.error("Failed to add leave");
          return;
        }
      }

      // COMMON SUCCESS FLOW
      fetchLeaves();
      closeModal();

    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to save leave"
      );
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!leaves || leaves.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = leaves.map((leave, index) => ({
      "Sr No": index + 1,
      "Employee": leave.emp || "",
      "From Date": formatDateForDisplay(leave.fdate),
      "To Date": formatDateForDisplay(leave.todate),
      "Leave Days": leave.leaves || 0,
      "Total Leaves": leave.total_leaves || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Leave_Management_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle leave deletion - FIXED ENDPOINT
  const handleDelete = async (id) => {
  if (id === undefined || id === null) {
    toast.error("Leave ID missing. Cannot delete.");
    return;
  }

  try {
    const response = await api.delete(`/leave/deleteleave/${id}`);

    if (response.status === 200) {
      toast.success(response.data || "Leave deleted successfully");

      // Instant UI update
      setLeaves(prev => prev.filter(l => l.id !== id));
    } else {
      toast.error("Failed to delete leave");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error(error.response?.data?.message || "Failed to delete leave");
  }
};


  // Filter leaves based on search term
  const filteredLeaves = leaves.filter((leave) => {
    const search = searchTerm.toLowerCase();
    const emp = employeeFilter.toLowerCase();
    
    const matchesSearch = searchTerm ? 
      (leave.emp && leave.emp.toLowerCase().includes(search)) : true;
    
    const matchesEmployeeFilter = employeeFilter ?
      (leave.emp && leave.emp.toLowerCase().includes(emp)) : true;
    
    return matchesSearch && matchesEmployeeFilter;
  });

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!leaves || leaves.length === 0) {
      return {
        totalEmployees: 0,
        totalLeaves: 0,
        currentMonthLeaves: 0
      };
    }
    
    const uniqueEmployees = new Set(leaves.map(leave => leave.emp));
    const totalLeaveDays = leaves.reduce((sum, leave) => sum + (leave.leaves || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthLeaves = leaves.reduce((sum, leave) => {
      if (leave.fdate) {
        const leaveDate = new Date(formatDateForInput(leave.fdate));
        if (leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear) {
          return sum + (leave.leaves || 0);
        }
      }
      return sum;
    }, 0);
    
    return {
      totalEmployees: uniqueEmployees.size,
      totalLeaves: totalLeaveDays,
      currentMonthLeaves
    };
  };

  const summary = calculateSummary();

  // Function to handle calendar icon click
  const handleCalendarIconClick = (inputRef) => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker ? inputRef.current.showPicker() : inputRef.current.click();
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Leave Management</h1>
          <div style={styles.headerActions}>
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
              Add Leave
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>Leave Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Total Employees</div>
              <div style={styles.summaryValue}>{summary.totalEmployees}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Total Leave Days</div>
              <div style={styles.summaryValue}>{summary.totalLeaves}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Current Month Leaves</div>
              <div style={styles.summaryValue}>{summary.currentMonthLeaves}</div>
            </div>
          </div>
        </div>

        {/* Leave Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>
              All Leaves ({filteredLeaves.length} records)
            </div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={styles.searchBox}>
                <i className="fas fa-filter" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Filter by employee..." 
                  style={styles.searchInput}
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={fetchLeaves}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <span style={{ marginLeft: '10px' }}>Loading leaves...</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr No</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>From Date</th>
                  <th style={styles.th}>To Date</th>
                  <th style={styles.th}>Leave Days</th>
                  <th style={styles.th}>Total Leaves</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.length > 0 ? filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.id || `${leave.emp}-${index}`}
                    style={
                      index % 2 === 0
                        ? hoveredRow === leave.id
                          ? { ...styles.tr, ...styles.trHover, ...styles.trEven }
                          : { ...styles.tr, ...styles.trEven }
                        : hoveredRow === leave.id
                          ? { ...styles.tr, ...styles.trHover, ...styles.trOdd }
                          : { ...styles.tr, ...styles.trOdd }
                    }
                    onMouseEnter={() => setHoveredRow(leave.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <strong style={{ color: '#1e40af' }}>{leave.emp || "N/A"}</strong>
                    </td>
                    <td style={styles.td}>
                      {formatDateForDisplay(leave.fdate)}
                    </td>
                    <td style={styles.td}>
                      {formatDateForDisplay(leave.todate) || '-'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {leave.leaves || 0} day(s)
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {leave.total_leaves || 0}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          title="Edit"
                          onClick={() => openEditModal(leave)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}}
                          title="View"
                          onClick={() => openViewModal(leave)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                          title="Delete"
                          onClick={() => {
                            if (!leave?.id) {
                              toast.error("Invalid Leave ID");
                              return;
                            }
                            handleDelete(leave.id);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      <i className="fas fa-inbox fa-2x" style={{ color: '#94a3b8', marginBottom: '10px' }}></i>
                      <div>No leaves found matching your search.</div>
                      {leaves.length === 0 && (
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#64748b' }}>
                          Click "Add Leave" to create your first leave record.
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Leave Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Leave' : (editingLeave ? 'Edit Leave' : 'Add New Leave')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Leave ID - Read-only for edit/view */}
                {editingLeave && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Leave ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      style={styles.formControl}
                      disabled={true}
                      readOnly
                    />
                  </div>
                )}

                {/* Employee Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="emp">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    id="emp"
                    name="emp"
                    value={formData.emp}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                    placeholder="Enter employee name"
                    list="employeeSuggestions"
                  />
                  <datalist id="employeeSuggestions">
                    {employees.map((emp, index) => (
                      <option key={index} value={emp} />
                    ))}
                  </datalist>
                </div>

                {/* From Date */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="fdate">
                    From Date *
                  </label>
                  <div style={styles.dateWrapper}>
                    <input
                      type="date"
                      id="fdate"
                      name="fdate"
                      value={formData.fdate || ""}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      required
                      disabled={isViewMode}
                      ref={fdateInputRef}
                    />
                    <i 
                      className="fas fa-calendar-alt" 
                      style={styles.dateIcon}
                      onClick={() => !isViewMode && handleCalendarIconClick(fdateInputRef)}
                    ></i>
                  </div>
                </div>

                {/* To Date */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="todate">
                    To Date (Optional)
                  </label>
                  <div style={styles.dateWrapper}>
                    <input
                      type="date"
                      id="todate"
                      name="todate"
                      value={formData.todate || ""}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      min={formData.fdate || undefined}
                      disabled={isViewMode}
                      ref={todateInputRef}
                    />
                    <i 
                      className="fas fa-calendar-alt" 
                      style={styles.dateIcon}
                      onClick={() => !isViewMode && handleCalendarIconClick(todateInputRef)}
                    ></i>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
                    Leave blank for single day leave
                  </small>
                  {dateError && (
                    <div style={styles.errorMessage}>
                      <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                      {dateError}
                    </div>
                  )}
                </div>

                {/* Leave Days - Calculated automatically */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="leaves">
                    Leave Days (Calculated)
                  </label>
                  <input
                    type="number"
                    id="leaves"
                    name="leaves"
                    value={calculateLeaveDays(formData.fdate, formData.todate)}
                    style={styles.formControl}
                    disabled={true}
                    readOnly
                  />
                  <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
                    {formData.todate ? 
                      `From ${formatDateForDisplay(formData.fdate)} to ${formatDateForDisplay(formData.todate)}` : 
                      `Single day leave on ${formatDateForDisplay(formData.fdate)}`
                    }
                  </small>
                </div>
              </form>
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              {!isViewMode && (
                <button 
                  style={{...styles.btn, ...styles.btnPrimary}} 
                  onClick={handleSubmit}
                  type="button"
                  disabled={!!dateError}
                >
                  <i className="fas fa-save"></i>
                  {editingLeave ? 'Update Leave' : 'Save Leave'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;