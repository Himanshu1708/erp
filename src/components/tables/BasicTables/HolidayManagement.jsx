
import React, { useState, useEffect, useRef } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const HolidayManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Set current year dynamically
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalDate, setOriginalDate] = useState(null);
  const dateInputRef = useRef(null);

  // State for form data
  const [formData, setFormData] = useState({
    id: "",
    date: "",
    description: ""
  });

  // State for calendar form
  const [calendarForm, setCalendarForm] = useState({
    date: '',
    name: '',
    description: '', // Added description field
    type: 'custom' // public, private, custom
  });

  // Function to generate predefined holidays dynamically for any year
  const generatePredefinedHolidays = (year) => {
    // Base dates for holidays that change each year
    const getEasterDate = (year) => {
      // Algorithm to calculate Easter Sunday
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31);
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      
      return new Date(year, month - 1, day);
    };

    // Calculate Diwali (approximate calculation)
    const getDiwaliDate = (year) => {
      // This is a simplified calculation for Diwali
      // In reality, Diwali is calculated based on the Hindu lunar calendar
      const diwaliMonth = 10; // October or November
      const diwaliDay = year === 2026 ? 4 : 
                       year === 2027 ? 24 : 
                       year === 2028 ? 12 : 
                       year === 2029 ? 31 : 
                       year === 2030 ? 21 : 4; // Default for other years
      
      return new Date(year, diwaliMonth - 1, diwaliDay);
    };

    // Calculate Holi (approximate calculation)
    const getHoliDate = (year) => {
      // This is a simplified calculation for Holi
      const holiMonth = 3; // March
      const holiDay = year === 2026 ? 14 : 
                     year === 2027 ? 4 : 
                     year === 2028 ? 22 : 
                     year === 2029 ? 11 : 
                     year === 2030 ? 1 : 14; // Default for other years
      
      return new Date(year, holiMonth - 1, holiDay);
    };

    // Calculate Janmashtami (approximate calculation)
    const getJanmashtamiDate = (year) => {
      // This is a simplified calculation for Janmashtami
      const janmashtamiMonth = 8; // August
      const janmashtamiDay = year === 2026 ? 31 : 
                           year === 2027 ? 21 : 
                           year === 2028 ? 9 : 
                           year === 2029 ? 28 : 
                           year === 2030 ? 17 : 15; // Default for other years
      
      return new Date(year, janmashtamiMonth - 1, janmashtamiDay);
    };

    // Calculate Dussehra (approximately 20 days before Diwali)
    const diwaliDate = getDiwaliDate(year);
    const dussehraDate = new Date(diwaliDate);
    dussehraDate.setDate(dussehraDate.getDate() - 20);

    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Good Friday is 2 days before Easter Sunday
    const easterDate = getEasterDate(year);
    const goodFridayDate = new Date(easterDate);
    goodFridayDate.setDate(goodFridayDate.getDate() - 2);

    return [
      { date: `${year}-01-01`, name: 'New Year\'s Day', type: 'public', description: 'Celebration of the New Year' },
      { date: `${year}-01-26`, name: 'Republic Day', type: 'public', description: 'Commemorates the enactment of the Constitution of India' },
      { date: formatDate(getHoliDate(year)), name: 'Holi', type: 'public', description: 'Festival of colors' },
      { date: formatDate(goodFridayDate), name: 'Good Friday', type: 'public', description: 'Christian holiday commemorating the crucifixion of Jesus' },
      { date: `${year}-08-15`, name: 'Independence Day', type: 'public', description: 'India\'s independence from British rule' },
      { date: formatDate(getJanmashtamiDate(year)), name: 'Janmashtami', type: 'public', description: 'Birth of Lord Krishna' },
      { date: `${year}-10-02`, name: 'Gandhi Jayanti', type: 'public', description: 'Birth anniversary of Mahatma Gandhi' },
      { date: formatDate(dussehraDate), name: 'Dussehra', type: 'public', description: 'Celebration of the victory of good over evil' },
      { date: formatDate(getDiwaliDate(year)), name: 'Diwali', type: 'public', description: 'Festival of lights' },
      // Diwali Second Day
      { 
        date: formatDate(new Date(getDiwaliDate(year).getTime() + 24 * 60 * 60 * 1000)), 
        name: 'Diwali (Second Day)', 
        type: 'public', 
        description: 'Continued celebration of Diwali' 
      },
      { date: `${year}-12-25`, name: 'Christmas', type: 'public', description: 'Birth of Jesus Christ' }
    ];
  };

  // Generate predefined holidays for the current year
  const predefinedHolidays = generatePredefinedHolidays(currentYear);

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
    calendarContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px',
      marginBottom: '20px'
    },
    yearSelector: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '30px'
    },
    yearButton: {
      padding: '10px 20px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    yearButtonActive: {
      backgroundColor: '#1e40af',
      color: '#ffffff',
      borderColor: '#1e40af'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    },
    monthContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    monthHeader: {
      backgroundColor: '#e6f7ff',
      padding: '15px',
      textAlign: 'center',
      fontWeight: '600',
      color: '#1e40af',
      borderBottom: '1px solid #e2e8f0'
    },
    monthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#e2e8f0'
    },
    dayHeader: {
      padding: '10px 5px',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '12px',
      color: '#64748b',
      backgroundColor: '#f8fafc'
    },
    dayCell: {
      padding: '8px 5px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      fontSize: '14px'
    },
    dayCellHover: {
      backgroundColor: '#f8fafc'
    },
    weekend: {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    },
    holiday: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      fontWeight: '600'
    },
    customHoliday: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#1e40af',
      fontWeight: '600'
    },
    today: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#1e40af',
      fontWeight: '700'
    },
    otherMonth: {
      backgroundColor: '#f8fafc',
      color: '#cbd5e1'
    },
    holidayBadge: {
      position: 'absolute',
      bottom: '2px',
      fontSize: '8px',
      fontWeight: '500'
    },
    holidaysList: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px',
      marginTop: '20px'
    },
    holidaysListTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    holidaySection: {
      marginBottom: '25px'
    },
    holidaySectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#1e40af',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    holidayItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #e2e8f0',
      transition: 'background-color 0.2s ease'
    },
    holidayItemHover: {
      backgroundColor: '#f8fafc'
    },
    holidayInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    },
    holidayDate: {
      fontWeight: '600',
      color: '#1e40af',
      minWidth: '120px'
    },
    holidayName: {
      fontWeight: '500',
      flex: '1'
    },
    holidayDescription: {
      fontSize: '14px',
      color: '#64748b',
      fontStyle: 'italic',
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    holidayType: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    typePublic: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    },
    typePrivate: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b'
    },
    typeCustom: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      color: '#1e40af'
    },
    deleteBtn: {
      color: '#ef4444',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      background: 'none',
      border: 'none',
      fontSize: '16px'
    },
    deleteBtnHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    },
    editBtn: {
      color: '#1e40af',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      marginRight: '5px'
    },
    editBtnHover: {
      backgroundColor: 'rgba(30, 64, 175, 0.1)'
    },
    actionButtons: {
      display: 'flex',
      alignItems: 'center'
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
    dateWrapper: {
      position: 'relative',
      width: '100%'
    },
    dateIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#3b82f6',
      fontSize: '16px'
    },
    formSelect: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      fontSize: '14px'
    },
    // Textarea styles
    textarea: {
      width: '100%',
      padding: '10px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      resize: 'vertical',
      minHeight: '80px'
    },
    // Navigation buttons style
    navButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    navButtonHover: {
      backgroundColor: '#f8fafc',
      borderColor: '#1e40af',
      color: '#1e40af'
    }
  };

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Initialize holidays on component mount
  useEffect(() => {
    fetchHolidays();
  }, []);

  // Fetch all holidays
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await api.get("/holiday/getAllHoliday");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setHolidays(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setHolidays(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setHolidays([]);
        }
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  // Update predefined holidays when current year changes
  // useEffect(() => {
  //   // Regenerate predefined holidays for the new year
  //   const newPredefinedHolidays = generatePredefinedHolidays(currentYear);
  //   // Force a re-render by updating the state
  //   setHolidays(prev => [...prev]);
  // }, [currentYear]);

  //calnderautochnage years 
  useEffect(() => {
    const checkYearChange = () => {
      const now = new Date();
      const systemYear = now.getFullYear();

      setCurrentYear(prevYear => {
        if (prevYear !== systemYear) {
          return systemYear; // 🔥 auto shift year
        }
        return prevYear;
      });
    };

    // Check once every 1 hour (efficient & safe)
    const interval = setInterval(checkYearChange, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is a holiday
  const isHoliday = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Check in backend holidays first (custom holidays)
    const backendHoliday = holidays.find(h => {
      if (!h.date) return false;
      const holidayDate = new Date(h.date);
      return holidayDate.toISOString().split('T')[0] === dateStr;
    });
    
    if (backendHoliday) {
      // Fix: Use holiday_name from backend instead of description
      return { 
        name: backendHoliday.holiday_name || backendHoliday.description || 'Holiday', 
        type: 'custom', 
        description: backendHoliday.description,
        id: backendHoliday.id
      };
    }
    
    // Check in predefined holidays for current year
    return predefinedHolidays.find(h => h.date === dateStr);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Check if this is a custom holiday
    const backendHoliday = holidays.find(h => {
      if (!h.date) return false;
      const holidayDate = new Date(h.date);
      return holidayDate.toISOString().split('T')[0] === dateStr;
    });
    
    if (backendHoliday) {
      // This is a custom holiday, open in edit mode
      setIsEditMode(true);
      setOriginalDate(dateStr);
      setCalendarForm({
        date: dateStr,
        name: backendHoliday.holiday_name || backendHoliday.description || 'Holiday',
        description: backendHoliday.description || '',
        type: 'custom'
      });
    } else {
      // This is either a predefined holiday or not a holiday
      const predefinedHoliday = predefinedHolidays.find(h => h.date === dateStr);
      
      if (predefinedHoliday) {
        // This is a predefined holiday, show in view mode
        setIsEditMode(false);
        setCalendarForm({
          date: dateStr,
          name: predefinedHoliday.name,
          description: predefinedHoliday.description || '',
          type: predefinedHoliday.type
        });
      } else {
        // Not a holiday, open in add mode
        setIsEditMode(false);
        setCalendarForm({
          date: dateStr,
          name: '',
          description: '',
          type: 'custom'
        });
      }
    }
    
    setShowCalendarModal(true);
  };

  // Handle adding calendar holiday
  const handleAddCalendarHoliday = () => {
    if (!calendarForm.date || !calendarForm.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Format date for backend (dd/MM/yyyy)
    const formatDateForBackend = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    if (isEditMode) {
      // Update existing holiday - use FormData for consistency with backend
      const updateData = new FormData();
      updateData.append('date', formatDateForBackend(originalDate));
      updateData.append('update_date', formatDateForBackend(calendarForm.date));
      updateData.append('holidayName', calendarForm.name);
      updateData.append('update_description', calendarForm.description);

      api.put('/holiday/updateHoliday', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        if (response.status === 200) {
          toast.success('Holiday updated successfully');
          fetchHolidays();
          setCalendarForm({ date: '', name: '', description: '', type: 'custom' });
          setShowCalendarModal(false);
          setIsEditMode(false);
          setOriginalDate(null);
        } else {
          toast.error(response.data?.message || 'Failed to update holiday');
        }
      })
      .catch(error => {
        console.error('Error updating holiday:', error);
        toast.error(error.response?.data?.message || 'Failed to update holiday');
      });
    } else {
      // Add new holiday
      const createData = new FormData();
      createData.append('date', formatDateForBackend(calendarForm.date));
      createData.append('holidayName', calendarForm.name);
      createData.append('description', calendarForm.description || '');

      api.post('/holiday/addHoliday', createData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        if (response.status === 200) {
          toast.success('Holiday added successfully');
          fetchHolidays();
          setCalendarForm({ date: '', name: '', description: '', type: 'custom' });
          setShowCalendarModal(false);
        } else {
          toast.error(response.data?.message || 'Failed to add holiday');
        }
      })
      .catch(error => {
        console.error('Error adding holiday:', error);
        toast.error(error.response?.data?.message || 'Failed to add holiday');
      });
    }
  };

  // Handle edit holiday
  const handleEditHoliday = (holiday) => {
    setIsEditMode(true);
    setOriginalDate(holiday.date);
    setCalendarForm({
      date: holiday.date,
      name: holiday.name,
      description: holiday.description || '',
      type: holiday.type
    });
    setShowCalendarModal(true);
  };

  //calender delete
  const handleDeleteCalendarHoliday = (date) => {
    // Don't allow deletion of predefined holidays
    if (predefinedHolidays.find(h => h.date === date)) {
      toast.error('Cannot delete predefined holidays');
      return;
    }

    const formatDateForBackend = (dateString) => {
      if (!dateString) return "";
      const d = new Date(dateString);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    api
      .delete(`/holiday/deleteHoliday?date=${formatDateForBackend(date)}`)
      .then(response => {
        if (response.status === 200) {
          toast.success('Holiday deleted successfully');
          fetchHolidays();
        } else {
          toast.error(response.data?.message || 'Failed to delete holiday');
        }
      })
      .catch(error => {
        console.error('Error deleting holiday:', error);
        toast.error('Failed to delete holiday');
      });
  };

  // Render month calendar
const renderMonth = (monthIndex, year) => {
  const daysInMonth = getDaysInMonth(monthIndex, year);
  const firstDay = getFirstDayOfMonth(monthIndex, year);
  const cells = [];

  // empty cells
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} style={styles.dayCell}></div>);
  }

  // actual dates
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    const holiday = isHoliday(date);
    const today = isToday(date);
    const weekend = isWeekend(date);

    let style = { ...styles.dayCell };
    if (holiday) {
      // Apply different styles based on holiday type
      if (holiday.type === 'custom') {
        style = { ...style, ...styles.customHoliday };
      } else {
        style = { ...style, ...styles.holiday };
      }
    }
    if (today) style = { ...style, ...styles.today };
    if (weekend && !holiday) style = { ...style, ...styles.weekend };

    cells.push(
      <div key={d} style={style} onClick={() => handleDateClick(date)}>
        {d}
        {holiday && <span style={styles.holidayBadge}>🎉</span>}
      </div>
    );
  }

  return (
    <div style={styles.monthContainer}>
      <div style={styles.monthHeader}>
        {months[monthIndex]} {year}
      </div>

      <div style={styles.monthGrid}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={styles.dayHeader}>{d}</div>
        ))}
        {cells}
      </div>
    </div>
  );
};


  // Get all holidays for the current year
  const getAllHolidays = () => {
    const allHolidays = [...predefinedHolidays];
    
    // Add backend holidays for current year
    holidays.forEach(holiday => {
      if (holiday.date) {
        const date = new Date(holiday.date);
        if (date.getFullYear() === currentYear) {
          const dateStr = date.toISOString().split('T')[0];
          // Fix: Use holiday_name from backend instead of description
          allHolidays.push({
            date: dateStr,
            name: holiday.holiday_name || holiday.description || 'Holiday',
            type: 'custom',
            description: holiday.description,
            id: holiday.id
          });
        }
      }
    });
    
    // Sort by date
    return allHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get holidays by type
  const getHolidaysByType = () => {
    const allHolidays = getAllHolidays();
    return {
      public: allHolidays.filter(h => h.type === 'public'),
      private: allHolidays.filter(h => h.type === 'private'),
      custom: allHolidays.filter(h => h.type === 'custom')
    };
  };

  // Export to Excel
  const handleExportExcel = () => {
    const allHolidays = getAllHolidays();
    
    if (!allHolidays || allHolidays.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = allHolidays.map((holiday, index) => ({
      "Sr No": index + 1,
      "Holiday Date": new Date(holiday.date).toLocaleDateString(),
      "Holiday Name": holiday.name,
      "Description": holiday.description || '',
      "Type": holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Holidays");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Holiday_Management_${currentYear}_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Close calendar modal
  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setCalendarForm({ date: '', name: '', description: '', type: 'custom' });
    setIsEditMode(false);
    setOriginalDate(null);
  };

  // Handle calendar form input changes
  const handleCalendarFormChange = (e) => {
    const { name, value } = e.target;
    setCalendarForm({
      ...calendarForm,
      [name]: value
    });
  };

  // Handle year navigation
  const goToPreviousYear = () => {
    setCurrentYear(prevYear => prevYear - 1);
  };

  const goToNextYear = () => {
    setCurrentYear(prevYear => prevYear + 1);
  };

  const holidaysByType = getHolidaysByType();

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Holiday Management Calendar</h1>
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
              onClick={() => {
                setIsEditMode(false);
                setCalendarForm({ date: '', name: '', description: '', type: 'custom' });
                setShowCalendarModal(true);
              }}
            >
              <i className="fas fa-plus"></i>
              Add Holiday
            </button>
          </div>
        </div>

        {/* Year Display with Navigation */}
        <div style={styles.calendarContainer}>
          <div style={styles.yearSelector}>
            <button 
              style={styles.navButton}
              onClick={goToPreviousYear}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1e40af';
                e.currentTarget.style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#1e293b';
              }}
            >
              <i className="fas fa-chevron-left"></i>
              Previous Year
            </button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e40af' }}>
              {currentYear}
            </h2>
            
            <button 
              style={styles.navButton}
              onClick={goToNextYear}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1e40af';
                e.currentTarget.style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#1e293b';
              }}
            >
              Next Year
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={styles.calendarGrid}>
            {months.map((_, index) => renderMonth(index, currentYear))}
          </div>
        </div>

        {/* Holidays List - Grouped by Type */}
        <div style={styles.holidaysList}>
          <h3 style={styles.holidaysListTitle}>
            <i className="fas fa-calendar-alt" style={{ color: '#1e40af' }}></i>
            Holidays List {currentYear} ({getAllHolidays().length})
          </h3>
          
          {/* Public Holidays Section */}
          {holidaysByType.public.length > 0 && (
            <div style={styles.holidaySection}>
              <h4 style={styles.holidaySectionTitle}>
                <i className="fas fa-flag" style={{ color: '#ef4444' }}></i>
                Public Holidays ({holidaysByType.public.length})
              </h4>
              {holidaysByType.public.map((holiday, index) => (
                <div
                  key={index}
                  style={styles.holidayItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div style={styles.holidayInfo}>
                    <span style={styles.holidayDate}>
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span style={styles.holidayName}>{holiday.name}</span>
                    {holiday.description && (
                      <span style={styles.holidayDescription} title={holiday.description}>
                        {holiday.description}
                      </span>
                    )}
                    <span style={{ ...styles.holidayType, ...styles.typePublic }}>
                      Public
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Private Holidays Section */}
          {holidaysByType.private.length > 0 && (
            <div style={styles.holidaySection}>
              <h4 style={styles.holidaySectionTitle}>
                <i className="fas fa-building" style={{ color: '#f59e0b' }}></i>
                Private Holidays ({holidaysByType.private.length})
              </h4>
              {holidaysByType.private.map((holiday, index) => (
                <div
                  key={index}
                  style={styles.holidayItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div style={styles.holidayInfo}>
                    <span style={styles.holidayDate}>
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span style={styles.holidayName}>{holiday.name}</span>
                    {holiday.description && (
                      <span style={styles.holidayDescription} title={holiday.description}>
                        {holiday.description}
                      </span>
                    )}
                    <span style={{ ...styles.holidayType, ...styles.typePrivate }}>
                      Private
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Holidays Section */}
          {holidaysByType.custom.length > 0 && (
            <div style={styles.holidaySection}>
              <h4 style={styles.holidaySectionTitle}>
                <i className="fas fa-star" style={{ color: '#1e40af' }}></i>
                Custom Holidays ({holidaysByType.custom.length})
              </h4>
              {holidaysByType.custom.map((holiday, index) => (
                <div
                  key={index}
                  style={styles.holidayItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div style={styles.holidayInfo}>
                    <span style={styles.holidayDate}>
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span style={styles.holidayName}>{holiday.name}</span>
                    {holiday.description && (
                      <span style={styles.holidayDescription} title={holiday.description}>
                        {holiday.description}
                      </span>
                    )}
                    <span style={{ ...styles.holidayType, ...styles.typeCustom }}>
                      Custom
                    </span>
                  </div>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEditHoliday(holiday)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 64, 175, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Edit Holiday"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteCalendarHoliday(holiday.date)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Delete Holiday"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No holidays message */}
          {getAllHolidays().length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <i className="fas fa-calendar-times fa-3x" style={{ marginBottom: '15px', color: '#cbd5e1' }}></i>
              <p>No holidays found for {currentYear}</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Holiday Modal */}
      {showCalendarModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <i className="fas fa-calendar-plus" style={{ marginRight: '10px', color: '#1e40af' }}></i>
                {isEditMode ? 'Edit Holiday' : 'Add Holiday'}
              </h3>
              <button style={styles.modalClose} onClick={closeCalendarModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
             <div style={styles.formGroup}>
  <label style={styles.formLabel}>Date *</label>

  <div style={styles.dateWrapper}>
    <input
      type="date"
      name="date"
      value={calendarForm.date}
      onChange={handleCalendarFormChange}
      style={styles.formControl}
      min={`${currentYear}-01-01`}
      max={`${currentYear}-12-31`}
      required
      disabled={isEditMode && calendarForm.type === 'public'}
    />
    <i
      className="fas fa-calendar-alt"
      style={styles.dateIcon}
      onClick={() => {
        const input = document.querySelector('input[name="date"]');
        input && input.showPicker && input.showPicker();
      }}
    ></i>
  </div>
</div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="holidayName">Holiday Name *</label>
                <input
                  type="text"
                  id="holidayName"
                  name="name"
                  value={calendarForm.name}
                  onChange={handleCalendarFormChange}
                  style={styles.formControl}
                  placeholder="Enter holiday name"
                  required
                  disabled={isEditMode && calendarForm.type === 'public'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel} htmlFor="holidayDescription">Description</label>
                <textarea
                  id="holidayDescription"
                  name="description"
                  value={calendarForm.description}
                  onChange={handleCalendarFormChange}
                  style={styles.textarea}
                  placeholder="Enter holiday description (optional)"
                  rows="3"
                  disabled={isEditMode && calendarForm.type === 'public'}
                ></textarea>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={closeCalendarModal}
              >
                Cancel
              </button>
              {calendarForm.type !== 'public' && (
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={handleAddCalendarHoliday}
                >
                  <i className="fas fa-save"></i>
                  {isEditMode ? 'Update Holiday' : 'Add Holiday'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;