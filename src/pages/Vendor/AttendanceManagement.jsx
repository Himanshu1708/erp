import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AttendanceManagement = () => {
  // State for modal visibility
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [showViewAttendanceModal, setShowViewAttendanceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("mark");
  
  // State for location
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  
  // State for employees
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // State for attendance data
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for viewing attendance
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  
  // State for attendance marking
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [timeIn, setTimeIn] = useState({});
  const [timeOut, setTimeOut] = useState({});
  const [saving, setSaving] = useState(false);
  
  // State for leave balance
  const [leaveBalances, setLeaveBalances] = useState({});
  const [todayMarkedLeaves, setTodayMarkedLeaves] = useState({}); // Track leaves marked today

  // API Configuration
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

  // Fetch all employees and locations on component mount
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Fetch all employees to get locations
  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/emp/all");
      
      if (response.data && response.data.status === 200) {
        const employeesData = response.data.data || [];
        
        // Process employees data (your API returns nested structure)
        const processedEmployees = employeesData.map(item => ({
          ...item.employee,           // Spread employee properties
          bankDetails: item.bankDetails || [],
          payheads: item.payheads || [],
          documents: item.documents || [],
          leaveBalance: item.employee?.leaveBalance || 0
        }));
        
        setAllEmployees(processedEmployees);
        
        // Extract unique locations
        const uniqueLocations = [...new Set(processedEmployees
          .map(emp => emp.loc)
          .filter(loc => loc && loc.trim() !== ''))];
        
        setLocations(uniqueLocations);
        
        // Initialize leave balances from database
        const initialLeaveBalances = {};
        processedEmployees.forEach(emp => {
          initialLeaveBalances[emp.id] = emp.leaveBalance || 0;
        });
        setLeaveBalances(initialLeaveBalances);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees by location
  const fetchEmployeesByLocation = async (location) => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/employees/${location}`);
      
      if (response.data && response.data.status === 200) {
        const employeesList = response.data.data || [];
        setFilteredEmployees(employeesList);
        
        // Initialize attendance status for each employee
        const initialStatus = {};
        const initialTimeIn = {};
        const initialTimeOut = {};
        const initialTodayMarkedLeaves = {};
        
        // Check if attendance already marked for today
        const today = new Date().toISOString().split('T')[0];
        
        for (const emp of employeesList) {
          try {
            // Check if attendance already marked for today
            const attendanceResponse = await api.get(
              `/attendance/daily?empId=${emp.id}&date=${selectedDate}`
            );
            
            if (attendanceResponse.data?.status === 200 && attendanceResponse.data.data) {
              // Attendance already marked
              const existingAttendance = attendanceResponse.data.data;
              initialStatus[emp.id] = existingAttendance.status || "PRESENT";
              initialTimeIn[emp.id] = existingAttendance.timeIn ? 
                existingAttendance.timeIn.substring(0, 5) : "09:00";
              initialTimeOut[emp.id] = existingAttendance.timeOut ? 
                existingAttendance.timeOut.substring(0, 5) : "18:00";
              
              // If leave was marked today, track it
              if (existingAttendance.status === "LEAVE" && existingAttendance.date === today) {
                initialTodayMarkedLeaves[emp.id] = true;
              }
            } else {
              // No attendance marked for today
              initialStatus[emp.id] = "PRESENT";
              initialTimeIn[emp.id] = "09:00";
              initialTimeOut[emp.id] = "18:00";
            }
          } catch (error) {
            // If error, set defaults
            initialStatus[emp.id] = "PRESENT";
            initialTimeIn[emp.id] = "09:00";
            initialTimeOut[emp.id] = "18:00";
          }
        }
        
        setAttendanceStatus(initialStatus);
        setTimeIn(initialTimeIn);
        setTimeOut(initialTimeOut);
        setTodayMarkedLeaves(initialTodayMarkedLeaves);
      }
    } catch (error) {
      console.error("Error fetching employees by location:", error);
      
      // Fallback: filter from all employees if API fails
      const filtered = allEmployees.filter(emp => 
        emp.loc && emp.loc.toLowerCase() === location.toLowerCase()
      );
      setFilteredEmployees(filtered);
      
      // Initialize attendance status
      const initialStatus = {};
      const initialTimeIn = {};
      const initialTimeOut = {};
      
      filtered.forEach(emp => {
        initialStatus[emp.id] = "PRESENT";
        initialTimeIn[emp.id] = "09:00";
        initialTimeOut[emp.id] = "18:00";
      });
      
      setAttendanceStatus(initialStatus);
      setTimeIn(initialTimeIn);
      setTimeOut(initialTimeOut);
    } finally {
      setLoading(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    if (location) {
      fetchEmployeesByLocation(location);
    } else {
      setFilteredEmployees([]);
    }
  };

  // Handle attendance status change with leave balance update
  const handleStatusChange = async (empId, newStatus, currentStatus) => {
    const employee = allEmployees.find(emp => emp.id === empId);
    if (!employee) return;

    // Get current leave balance from state or employee data
    const currentBalance = leaveBalances[empId] || employee.leaveBalance || 0;
    const wasLeaveToday = todayMarkedLeaves[empId] || false;

    // Check if changing from LEAVE to another status
    if (currentStatus === "LEAVE" && newStatus !== "LEAVE") {
      // If leave was marked today, add back the leave balance
      if (wasLeaveToday) {
        setLeaveBalances(prev => ({
          ...prev,
          [empId]: currentBalance + 1
        }));
        setTodayMarkedLeaves(prev => ({
          ...prev,
          [empId]: false
        }));
      }
    } 
    // Check if changing to LEAVE from another status
    else if (newStatus === "LEAVE" && currentStatus !== "LEAVE") {
      // Check if employee has sufficient leave balance
      if (currentBalance > 0) {
        // Deduct leave balance only if not already deducted today
        if (!wasLeaveToday) {
          setLeaveBalances(prev => ({
            ...prev,
            [empId]: currentBalance - 1
          }));
          setTodayMarkedLeaves(prev => ({
            ...prev,
            [empId]: true
          }));
        }
      } else {
        toast.error(`Employee ${employee.empName} has no leave balance remaining`);
        return; // Don't change status
      }
    }

    // Update attendance status
    setAttendanceStatus(prev => ({
      ...prev,
      [empId]: newStatus
    }));
    
    // Clear time in/out for LEAVE or ABSENT status
    if (newStatus === "LEAVE" || newStatus === "ABSENT") {
      setTimeIn(prev => ({ ...prev, [empId]: "" }));
      setTimeOut(prev => ({ ...prev, [empId]: "" }));
    } else if (newStatus === "PRESENT") {
      // Set default times for PRESENT
      setTimeIn(prev => ({ ...prev, [empId]: prev[empId] || "09:00" }));
      setTimeOut(prev => ({ ...prev, [empId]: prev[empId] || "18:00" }));
    }
  };

  // Handle time change
  const handleTimeInChange = (empId, time) => {
    setTimeIn(prev => ({
      ...prev,
      [empId]: time
    }));
  };

  const handleTimeOutChange = (empId, time) => {
    setTimeOut(prev => ({
      ...prev,
      [empId]: time
    }));
  };

  // Check if attendance already marked for today
  const checkExistingAttendance = async () => {
    try {
      const response = await api.get(`/attendance/check?date=${selectedDate}&loc=${selectedLocation}`);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error checking existing attendance:", error);
      return [];
    }
  };

  // Mark attendance function
  const handleMarkAttendance = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (filteredEmployees.length === 0) {
      toast.error("No employees found for the selected location");
      return;
    }

    // Check leave balances for employees marked as LEAVE
    const employeesWithInsufficientLeave = [];
    
    for (const emp of filteredEmployees) {
      const status = attendanceStatus[emp.id] || "PRESENT";
      if (status === "LEAVE") {
        const currentBalance = leaveBalances[emp.id] || emp.leaveBalance || 0;
        const wasLeaveToday = todayMarkedLeaves[emp.id] || false;
        
        // If not already deducted today and balance is insufficient
        if (!wasLeaveToday && currentBalance <= 0) {
          employeesWithInsufficientLeave.push(emp.empName);
        }
      }
    }

    if (employeesWithInsufficientLeave.length > 0) {
      const names = employeesWithInsufficientLeave.join(', ');
      toast.error(`No leave balance remaining for: ${names}`);
      return;
    }

    try {
      setSaving(true);
      
      // First, update leave balances in backend
      await updateEmployeeLeaveBalances();
      
      // Then, mark attendance
      const attendanceRequests = filteredEmployees.map(emp => {
        const status = attendanceStatus[emp.id] || "PRESENT";
        const timeInValue = timeIn[emp.id] || "";
        const timeOutValue = timeOut[emp.id] || "";
        
        return {
          empId: emp.id,
          date: selectedDate,
          status: status,
          timeIn: status === "PRESENT" && timeInValue ? `${timeInValue}:00` : null,
          timeOut: status === "PRESENT" && timeOutValue ? `${timeOutValue}:00` : null,
          loc: selectedLocation
        };
      });

      console.log("Sending attendance data:", attendanceRequests);
      
      const response = await api.post("/attendance/mark", attendanceRequests);
      
      if (response.data && response.data.status === 200) {
        toast.success("Attendance marked successfully!");
        
        // Refresh employee data to get updated leave balances
        await fetchAllEmployees();
        
        // Clear form
        setAttendanceStatus({});
        setTimeIn({});
        setTimeOut({});
        setTodayMarkedLeaves({});
        setSelectedLocation("");
        setFilteredEmployees([]);
        setShowMarkAttendanceModal(false);
      } else {
        toast.error(response.data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      console.error("Error details:", error.response?.data);
      
      let errorMessage = "Failed to mark attendance";
      if (error.response) {
        if (error.response.data) {
          errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        }
        errorMessage += ` (Status: ${error.response.status})`;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Update employee leave balances in backend
  const updateEmployeeLeaveBalances = async () => {
    try {
      const updatePromises = [];
      
      for (const emp of filteredEmployees) {
        const status = attendanceStatus[emp.id];
        if (status === "LEAVE") {
          const currentBalance = leaveBalances[emp.id] || emp.leaveBalance || 0;
          const wasLeaveToday = todayMarkedLeaves[emp.id] || false;
          
          // Only update if not already deducted today
          if (!wasLeaveToday && currentBalance > 0) {
            const updatedBalance = currentBalance - 1;
            
            // Update in backend
            updatePromises.push(
              api.put(`/emp/update-leave-balance/${emp.id}`, {
                leaveBalance: updatedBalance
              }).catch(err => {
                console.error(`Error updating leave balance for ${emp.id}:`, err);
                return null;
              })
            );
          }
        }
      }
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log("Leave balances updated in backend");
      }
    } catch (error) {
      console.error("Error updating leave balances:", error);
      // Don't show error to user, as attendance marking might still work
    }
  };

  // View monthly attendance
  const handleViewMonthlyAttendance = async () => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setViewLoading(true);
      const response = await api.get(`/attendance/monthly?empId=${selectedEmployeeId}&month=${selectedMonth}&year=${selectedYear}`);
      
      if (response.data && response.data.status === 200) {
        const attendanceData = response.data.data || [];
        
        // Get current employee data for leave balance
        const employee = allEmployees.find(emp => emp.id === selectedEmployeeId);
        const currentLeaveBalance = employee?.leaveBalance || 0;
        
        // Calculate leave balance for each day
        let runningLeaveBalance = currentLeaveBalance;
        const processedAttendance = attendanceData.map(record => {
          const recordDate = new Date(record.date);
          const today = new Date();
          
          // Only adjust balance for past dates
          if (recordDate < today && record.status === "LEAVE") {
            runningLeaveBalance++;
          }
          
          return {
            ...record,
            leaveBalance: runningLeaveBalance
          };
        }).reverse(); // Show most recent first
        
        setMonthlyAttendance(processedAttendance);
        setShowViewAttendanceModal(true);
      } else {
        toast.error(response.data.message || "Failed to fetch attendance");
      }
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      toast.error(error.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setViewLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    const total = monthlyAttendance.length;
    const present = monthlyAttendance.filter(a => a.status === "PRESENT").length;
    const absent = monthlyAttendance.filter(a => a.status === "ABSENT").length;
    const leave = monthlyAttendance.filter(a => a.status === "LEAVE").length;
    const halfDay = monthlyAttendance.filter(a => a.status === "HALF_DAY").length;
    
    return { total, present, absent, leave, halfDay };
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!monthlyAttendance || monthlyAttendance.length === 0) {
      toast.error("No attendance data available to export");
      return;
    }

    const excelData = monthlyAttendance.map((attendance, index) => ({
      "Sr No": index + 1,
      "Date": attendance.date || "",
      "Day": attendance.day || "",
      "Employee Name": attendance.empName || "",
      "Status": attendance.status || "",
      "Time In": attendance.timeIn || "",
      "Time Out": attendance.timeOut || "",
      "Working Hours": attendance.workingHours || "",
      "Leave Balance": attendance.leaveBalance || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `Attendance_${selectedMonth}_${selectedYear}_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return '#10b981';
      case 'ABSENT': return '#ef4444';
      case 'LEAVE': return '#f59e0b';
      case 'HALF_DAY': return '#8b5cf6';
      case 'NOT_MARKED': return '#94a3b8';
      default: return '#64748b';
    }
  };

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
    btnSuccess: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    btnWarning: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    btnDanger: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    btnInfo: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
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
    statusBadge: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'inline-block'
    },
    statusPresent: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'
    },
    statusAbsent: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    },
    statusLeave: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b'
    },
    statusHalfDay: {
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      color: '#8b5cf6'
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
      width: '95%',
      maxWidth: '1400px',
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
    },
    formRow: {
      display: 'flex',
      gap: '15px'
    },
    formCol: {
      flex: 1
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    tab: {
      padding: '12px 24px',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      fontWeight: '500',
      color: '#64748b',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      color: '#3b82f6',
      borderBottom: '3px solid #3b82f6'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500'
    },
    selectBox: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      minWidth: '120px'
    },
    timeInput: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      width: '100px'
    },
    leaveBalanceBadge: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: '600',
      display: 'inline-block'
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
     
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <i className="fas fa-calendar-alt" style={{marginRight: '10px'}}></i>
            Attendance Management
          </h1>
          <div style={styles.headerActions}>
            <button
              style={{...styles.btn, ...styles.btnPrimary}}
              onClick={() => setShowMarkAttendanceModal(true)}
            >
              <i className="fas fa-calendar-check"></i>
              Mark Attendance
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>Attendance Dashboard</div>
          </div>
          
          <div style={styles.tabs}>
            <div 
              style={activeTab === "mark" ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab("mark")}
            >
              <i className="fas fa-pen" style={{marginRight: '8px'}}></i>
              Mark Attendance
            </div>
            <div 
              style={activeTab === "view" ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab("view")}
            >
              <i className="fas fa-eye" style={{marginRight: '8px'}}></i>
              View Attendance
            </div>
            <div 
              style={activeTab === "leaves" ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab("leaves")}
            >
              <i className="fas fa-umbrella-beach" style={{marginRight: '8px'}}></i>
              Leave Balances
            </div>
          </div>
          
          <div style={styles.modalBody}>
            {activeTab === "mark" ? (
              <div>
                <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                  <i className="fas fa-calendar-alt" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                  <h3 style={{marginBottom: '10px'}}>Mark Attendance</h3>
                  <p>Click the "Mark Attendance" button above to mark attendance for employees</p>
                  <button
                    style={{...styles.btn, ...styles.btnSuccess, marginTop: '20px'}}
                    onClick={() => setShowMarkAttendanceModal(true)}
                  >
                    <i className="fas fa-calendar-plus"></i> Open Attendance Form
                  </button>
                </div>
              </div>
            ) : activeTab === "view" ? (
              <div>
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Select Employee</label>
                      <select
                        style={styles.formControl}
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      >
                        <option value="">Select Employee</option>
                        {allEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.empName} - {employee.designation} ({employee.loc})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Select Month</label>
                      <select
                        style={styles.formControl}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      >
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Select Year</label>
                      <select
                        style={styles.formControl}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      >
                        {[2023, 2024, 2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div style={{textAlign: 'right', marginBottom: '20px'}}>
                  <button
                    style={{...styles.btn, ...styles.btnInfo}}
                    onClick={handleViewMonthlyAttendance}
                    disabled={viewLoading || !selectedEmployeeId}
                  >
                    {viewLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chart-bar"></i> View Monthly Attendance
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{marginBottom: '20px', color: '#1e293b'}}>
                  <i className="fas fa-umbrella-beach" style={{marginRight: '10px'}}></i>
                  Employee Leave Balances
                </h3>
                {allEmployees.length > 0 ? (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sr No</th>
                        <th style={styles.th}>Employee Name</th>
                        <th style={styles.th}>Department</th>
                        <th style={styles.th}>Designation</th>
                        <th style={styles.th}>Location</th>
                        <th style={styles.th}>Leave Balance</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEmployees.map((employee, index) => (
                        <tr key={employee.id} style={styles.tr}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>{employee.empName || ""}</td>
                          <td style={styles.td}>{employee.dept || "N/A"}</td>
                          <td style={styles.td}>{employee.designation || "N/A"}</td>
                          <td style={styles.td}>{employee.loc || "N/A"}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.leaveBalanceBadge,
                              backgroundColor: employee.leaveBalance > 10 ? '#d1fae5' : 
                                            employee.leaveBalance > 5 ? '#fef3c7' : 
                                            employee.leaveBalance > 0 ? '#fee2e2' : '#f3f4f6',
                              color: employee.leaveBalance > 10 ? '#065f46' : 
                                    employee.leaveBalance > 5 ? '#92400e' : 
                                    employee.leaveBalance > 0 ? '#991b1b' : '#6b7280'
                            }}>
                              {employee.leaveBalance || 0} days
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: employee.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: employee.status === 'Active' ? '#10b981' : '#ef4444'
                            }}>
                              {employee.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                    <i className="fas fa-users" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                    <p>No employees found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mark Attendance Modal */}
      {showMarkAttendanceModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <i className="fas fa-calendar-check" style={{marginRight: '10px'}}></i>
                Mark Manual Attendance
                <span style={{fontSize: '14px', color: '#64748b', marginLeft: '10px'}}>
                  Date: {selectedDate}
                </span>
              </h3>
              <button style={styles.modalClose} onClick={() => {
                setShowMarkAttendanceModal(false);
                setSelectedLocation("");
                setFilteredEmployees([]);
                setTodayMarkedLeaves({});
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <i className="fas fa-map-marker-alt" style={{marginRight: '8px'}}></i>
                      Select Location *
                    </label>
                    <select
                      style={styles.formControl}
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      required
                    >
                      <option value="">Select Location</option>
                      {locations.map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formCol}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <i className="fas fa-calendar-day" style={{marginRight: '8px'}}></i>
                      Select Date *
                    </label>
                    <input
                      type="date"
                      style={styles.formControl}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {selectedLocation && (
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h3 style={{color: '#1e293b'}}>
                      <i className="fas fa-users" style={{marginRight: '10px'}}></i>
                      Employees at {selectedLocation} 
                      <span style={{fontSize: '14px', color: '#64748b', marginLeft: '10px'}}>
                        ({filteredEmployees.length} employees)
                      </span>
                    </h3>
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
                  </div>
                  
                  {loading ? (
                    <div style={styles.loadingSpinner}>
                      <i className="fas fa-spinner fa-spin fa-2x"></i>
                      <span style={{marginLeft: '10px'}}>Loading employees...</span>
                    </div>
                  ) : filteredEmployees.length > 0 ? (
                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Sr No</th>
                            <th style={styles.th}>Employee Name</th>
                            <th style={styles.th}>Department</th>
                            <th style={styles.th}>Designation</th>
                            <th style={styles.th}>Leave Balance</th>
                            <th style={styles.th}>Status *</th>
                            <th style={styles.th}>Time In</th>
                            <th style={styles.th}>Time Out</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployees.map((employee, index) => {
                            const currentBalance = leaveBalances[employee.id] || employee.leaveBalance || 0;
                            const isLeaveToday = todayMarkedLeaves[employee.id] || false;
                            const status = attendanceStatus[employee.id] || "PRESENT";
                            
                            // Calculate displayed balance (showing effect of today's leave if marked)
                            let displayedBalance = currentBalance;
                            if (status === "LEAVE" && !isLeaveToday) {
                              displayedBalance = Math.max(0, currentBalance - 1);
                            }
                            
                            return (
                              <tr key={employee.id} style={styles.tr}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={styles.td}>
                                  <div style={{fontWeight: '600'}}>{employee.empName || ""}</div>
                                  <div style={{fontSize: '12px', color: '#64748b'}}>ID: {employee.id}</div>
                                </td>
                                <td style={styles.td}>{employee.dept || "N/A"}</td>
                                <td style={styles.td}>{employee.designation || "N/A"}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.leaveBalanceBadge,
                                    backgroundColor: displayedBalance > 5 ? '#d1fae5' : 
                                                  displayedBalance > 0 ? '#fef3c7' : '#fee2e2',
                                    color: displayedBalance > 5 ? '#065f46' : 
                                          displayedBalance > 0 ? '#92400e' : '#991b1b'
                                  }}>
                                    {displayedBalance} days
                                    {status === "LEAVE" && !isLeaveToday && displayedBalance === 0 && (
                                      <i className="fas fa-exclamation-triangle" style={{marginLeft: '5px', color: '#dc2626'}}></i>
                                    )}
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <select
                                    style={{
                                      ...styles.selectBox,
                                      backgroundColor: status === "PRESENT" ? 'rgba(16, 185, 129, 0.1)' :
                                                      status === "ABSENT" ? 'rgba(239, 68, 68, 0.1)' :
                                                      status === "LEAVE" ? 'rgba(245, 158, 11, 0.1)' :
                                                      status === "HALF_DAY" ? 'rgba(139, 92, 246, 0.1)' : '#ffffff'
                                    }}
                                    value={status}
                                    onChange={(e) => handleStatusChange(employee.id, e.target.value, status)}
                                    required
                                  >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LEAVE">Leave</option>
                                    <option value="HALF_DAY">Half Day</option>
                                  </select>
                                </td>
                                <td style={styles.td}>
                                  <input
                                    type="time"
                                    style={styles.timeInput}
                                    value={timeIn[employee.id] || ""}
                                    onChange={(e) => handleTimeInChange(employee.id, e.target.value)}
                                    disabled={status === "LEAVE" || status === "ABSENT"}
                                  />
                                </td>
                                <td style={styles.td}>
                                  <input
                                    type="time"
                                    style={styles.timeInput}
                                    value={timeOut[employee.id] || ""}
                                    onChange={(e) => handleTimeOutChange(employee.id, e.target.value)}
                                    disabled={status === "LEAVE" || status === "ABSENT"}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                      <i className="fas fa-user-slash" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                      <p>No employees found at {selectedLocation}</p>
                      <p style={{fontSize: '14px', marginTop: '10px'}}>
                        Make sure employees have this location set in their profile
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={() => {
                  setShowMarkAttendanceModal(false);
                  setSelectedLocation("");
                  setFilteredEmployees([]);
                  setTodayMarkedLeaves({});
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                style={{...styles.btn, ...styles.btnPrimary}}
                onClick={handleMarkAttendance}
                disabled={saving || !selectedLocation || filteredEmployees.length === 0}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Marking Attendance...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Mark Attendance for {selectedDate}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Attendance Modal */}
      {showViewAttendanceModal && monthlyAttendance.length > 0 && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <i className="fas fa-chart-bar" style={{marginRight: '10px'}}></i>
                Monthly Attendance Report
                <span style={{fontSize: '16px', color: '#64748b', marginLeft: '10px'}}>
                  {monthlyAttendance[0]?.empName || ''} - {selectedMonth}/{selectedYear}
                </span>
              </h3>
              <button style={styles.modalClose} onClick={() => setShowViewAttendanceModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Statistics */}
              {monthlyAttendance.length > 0 && (
                <div style={styles.statsContainer}>
                  <div style={styles.statCard}>
                    <div style={{...styles.statValue, color: '#10b981'}}>
                      {calculateStats().present}
                    </div>
                    <div style={styles.statLabel}>Present Days</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statValue, color: '#ef4444'}}>
                      {calculateStats().absent}
                    </div>
                    <div style={styles.statLabel}>Absent Days</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statValue, color: '#f59e0b'}}>
                      {calculateStats().leave}
                    </div>
                    <div style={styles.statLabel}>Leave Days</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statValue, color: '#8b5cf6'}}>
                      {calculateStats().halfDay}
                    </div>
                    <div style={styles.statLabel}>Half Days</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{...styles.statValue, color: '#3b82f6'}}>
                      {calculateStats().total}
                    </div>
                    <div style={styles.statLabel}>Total Days</div>
                  </div>
                </div>
              )}
              
              {/* Attendance Table */}
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Day</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Time In</th>
                      <th style={styles.th}>Time Out</th>
                      <th style={styles.th}>Working Hours</th>
                      <th style={styles.th}>Leave Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyAttendance.map((attendance, index) => {
                      let statusStyle = {};
                      switch(attendance.status) {
                        case 'PRESENT':
                          statusStyle = styles.statusPresent;
                          break;
                        case 'ABSENT':
                          statusStyle = styles.statusAbsent;
                          break;
                        case 'LEAVE':
                          statusStyle = styles.statusLeave;
                          break;
                        case 'HALF_DAY':
                          statusStyle = styles.statusHalfDay;
                          break;
                        default:
                          statusStyle = styles.statusPresent;
                      }
                      
                      // Calculate working hours
                      let workingHours = "N/A";
                      if (attendance.timeIn && attendance.timeOut) {
                        const timeIn = new Date(`2000-01-01T${attendance.timeIn}`);
                        const timeOut = new Date(`2000-01-01T${attendance.timeOut}`);
                        const diff = (timeOut - timeIn) / (1000 * 60 * 60); // hours
                        workingHours = diff.toFixed(2) + " hrs";
                      }
                      
                      return (
                        <tr key={index} style={styles.tr}>
                          <td style={styles.td}>{attendance.date}</td>
                          <td style={styles.td}>{attendance.day}</td>
                          <td style={styles.td}>
                            <span style={{...styles.statusBadge, ...statusStyle}}>
                              {attendance.status}
                            </span>
                          </td>
                          <td style={styles.td}>{attendance.timeIn || "N/A"}</td>
                          <td style={styles.td}>{attendance.timeOut || "N/A"}</td>
                          <td style={styles.td}>{workingHours}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.leaveBalanceBadge,
                              backgroundColor: attendance.leaveBalance > 10 ? '#d1fae5' : 
                                            attendance.leaveBalance > 5 ? '#fef3c7' : 
                                            attendance.leaveBalance > 0 ? '#fee2e2' : '#f3f4f6',
                              color: attendance.leaveBalance > 10 ? '#065f46' : 
                                    attendance.leaveBalance > 5 ? '#92400e' : 
                                    attendance.leaveBalance > 0 ? '#991b1b' : '#6b7280'
                            }}>
                              {attendance.leaveBalance || 0} days
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={() => setShowViewAttendanceModal(false)}
              >
                Close
              </button>
              <button
                style={{...styles.btn, ...styles.btnSuccess}}
                onClick={handleExportExcel}
              >
                <i className="fas fa-download"></i> Export to Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;