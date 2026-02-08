import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useState, useEffect, useRef } from 'react';

const ProjectManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  // Add firms state
  const [firms, setFirms] = useState([]);
  const [firmsLoading, setFirmsLoading] = useState(false);

  //add location
  const [locations, setLocations] = useState([]);
const [locationsLoading, setLocationsLoading] = useState(false);


  // New states for document management (matching EmployeeManagement)
  const [vendorDocuments, setVendorDocuments] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [replaceDocId, setReplaceDocId] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const dateRefs = useRef({});

  // State for form data - CORRECTED FIELD NAMES
  const [formData, setFormData] = useState({
    project_code: "",
    project_name: "",
    location: "",
    work_order_no: "",
    work_order_date: "",
    work_order_value: "",
    gst: "",
    total_value: "",
    invoice_name: "",
    gst_no: "",
    invoice_address: "",
    Site_incharge_name: "",
    Store_incharge_no: "",
    pro_start_date: "",
    pro_end_date: "",
    project_work: "",
    Bgurantee_no: "",
    Bgurante_amt: "",
    BguranteStart_date: "",
    BguranteEnd_date: "",
    firm: "" // Changed from firm_id to firm (String)
  });

  const [documentFiles, setDocumentFiles] = useState({
    workOrder: null,
    invoice: null,
    agreement: null,
    completionCertificate: null,
    bankGuarantee: null,
    sitePhotos: null,
    drawings: null,
    other: null
  });

  // Style definitions (keeping your original styles)
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
    btnDanger: {
      backgroundColor: '#ef4444',
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
      backgroundColor: '#e6f7ff',
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
      backgroundColor: '#ffffff'
    },
    trOdd: {
      backgroundColor: '#f5f5f5'
    },
    trHover: {
      backgroundColor: '#f8fafc'
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
      color: '#10b981'
    },
    viewBtn: {
      color: '#f59e0b'
    },
    deleteBtn: {
      color: '#ef4444'
    },
    documentBtn: {
      color: '#3b82f6'
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
    docModalContent: {
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
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '15px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    formGroupFullWidth: {
      gridColumn: 'span 3'
    },
    formLabel: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '500',
      color: '#1e293b',
      fontSize: '14px'
    },
    formControl: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontFamily: 'inherit',
      fontSize: '14px',
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
    // New styles for tabs
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '20px',
      overflowX: 'auto'
    },
    tab: {
      padding: '12px 24px',
      cursor: 'pointer',
      fontWeight: '500',
      color: '#64748b',
      whiteSpace: 'nowrap',
      borderBottom: '3px solid transparent',
      '&:hover': {
        color: '#3b82f6'
      }
    },
    activeTab: {
      color: '#3b82f6',
      borderBottom: '3px solid #3b82f6'
    },
    // Document grid styles
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    imageContainer: {
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '15px',
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    },
    image: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff'
    },
    imageLabel: {
      marginTop: '10px',
      fontWeight: '600',
      fontSize: '14px',
      color: '#374151',
      textTransform: 'capitalize'
    },
    noImage: {
      color: '#94a3b8',
      fontStyle: 'italic',
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    },
    fileInputLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
    },
    fileInput: {
      display: 'none'
    },
    fileInfo: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#64748b',
      wordBreak: 'break-all'
    },
    formColumn: {
      display: 'flex',
      flexDirection: 'column'
    },
    // New style for view mode
    viewModeValue: {
      padding: '8px 12px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#1e293b'
    },
    // New styles for document management (matching EmployeeManagement)
    docTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#1e293b'
    },
    docGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    docCard: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '15px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    docHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    docName: {
      fontWeight: '500',
      color: '#1e293b'
    },
    docDate: {
      fontSize: '12px',
      color: '#64748b'
    },
    docPreview: {
      height: '100px',
      backgroundColor: '#f1f5f9',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '10px',
      overflow: 'hidden'
    },
    docActions: {
      display: 'flex',
      gap: '8px'
    },
    docActionBtn: {
      flex: 1,
      height: '32px', // Fixed height for document action buttons
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px'
    },
    uploadSection: {
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '2px dashed #d1d5db',
      marginTop: '20px'
    },
    documentsSection: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
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
    dateWrapper: {
      position: 'relative',
      width: '100%'
    },
    dateIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      cursor: 'pointer'
    },
    replaceButton: {
      height: '32px', // Fixed height to match other action buttons
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      backgroundColor: '#f59e0b',
      color: '#fff',
      border: 'none',
      marginTop: '8px',
      width: '100%'
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
  

  // Generate project code
  const generateProjectCode = () => {
    const prefix = 'PROJ';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
  };

  // Function to get image URL from frontend public folder
//   const getImageUrl = (filePath) => {
//     if (!filePath) return getPlaceholderImage();

//     if (filePath.startsWith("http")) return filePath;

//     return `${import.meta.env.VITE_BACKEND_URL}${
//       filePath.startsWith("/") ? "" : "/"
//     }${filePath}`;
//   };
const getImageUrl = (filePath) => {
  if (!filePath || filePath.trim() === "") {
    return getPlaceholderImage();
  }

  // If backend already sends full URL
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // ✅ Backend already returns `/images/erp-images/...`
  // Public folder serves it directly
  return filePath;
};


  // Create a proper SVG placeholder - FIXED
  const getPlaceholderImage = () => {
    return "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22200%22%20height%3D%22150%22%20viewBox%3D%220%200%20200%20150%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23f0f0f0%22/%3E%3Ctext%20x%3D%22100%22%20y%3D%2275%22%20font-family%3D%22Arial%22%20font-size%3D%2214%22%20fill%3D%22%23666%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%3ENo%20Image%3C/text%3E%3C/svg%3E";
  };


  //fetch location
  const fetchLocations = async () => {
  try {
    setLocationsLoading(true);

    const response = await api.get("/location/getAllLoc");

    // API returns array OR "Location Not Found..."
    if (Array.isArray(response.data)) {
      setLocations(response.data);
    } else {
      setLocations([]);
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    toast.error("Failed to fetch locations");
    setLocations([]);
  } finally {
    setLocationsLoading(false);
  }
};


  // Fetch firms on component mount
  const fetchFirms = async () => {
    try {
      setFirmsLoading(true);
      const response = await api.get("/firm/all");

      const rawFirms =
        response.data?.data ||
        response.data ||
        [];

      const normalized = rawFirms.map(f => ({
        id: f.id || f.firm_id,
        name: f.firm_name || f.firmName || f.name || f.companyName
      }));

      console.log("Normalized firms:", normalized);

      setFirms(normalized);
    } catch (error) {
      console.error("Error fetching firms:", error);
      toast.error("Failed to fetch firms");
      setFirms([]);
    } finally {
      setFirmsLoading(false);
    }
  };

  // Fetch projects and firms on component mount
 useEffect(() => {
  fetchFirms();
  fetchLocations();
  fetchProjects();
}, []);



  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/project/getProjects");
      
      console.log("Projects API Response:", response.data);
      
      if (response.status === 200) {
        let projectsData = [];

        if (response.data && Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          projectsData = [response.data];
        }
        
        console.log("Processed Projects Data:", projectsData);
        
        // CORRECTED FIELD MAPPING
        const sanitizedProjects = projectsData.map(project => ({
          project_code: project.project_code || "",
          project_name: project.project_name || "",
          location: project.location || "",
          work_order_no: project.work_order_no || "",
          work_order_date: project.work_order_date || "",
          work_order_value: project.work_order_value || "",
          gst: project.gst || "",
          total_value: project.total_value || "",
          invoice_name: project.invoice_name || "",
          gst_no: project.gst_no || "",
          invoice_address: project.invoice_address || "",
          Site_incharge_name: project.Site_incharge_name || "",
          Store_incharge_no: project.Store_incharge_no || "",
          pro_start_date: project.pro_start_date || "",
          pro_end_date: project.pro_end_date || "",
          project_work: project.project_work || "",
          Bgurantee_no: project.Bgurantee_no || "",
          Bgurante_amt: project.Bgurante_amt || "",
          BguranteStart_date: project.BguranteStart_date || "",
          BguranteEnd_date: project.BguranteEnd_date || "",

          // ✅ NORMALIZE firm object FOR UI
          firm: project.firm || ""
        }));
        
        setProjects(sanitizedProjects);
        toast.success(`Loaded ${sanitizedProjects.length} project(s)`);
      } else {
        toast.error("Failed to fetch projects");
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to fetch projects"
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  //added calculator - FIXED to handle empty GST
  const calculateTotalValue = (workOrderValue, gst) => {
    const value = parseFloat(workOrderValue) || 0;
    const gstPercent = parseFloat(gst) || 0;

    if (isNaN(value) || value <= 0) return "";

    const gstAmount = (value * gstPercent) / 100;
    return (value + gstAmount).toFixed(2);
  };

  // Fetch project documents
const fetchProjectDocuments = async (projectCode) => {
  console.log("🔍 Fetching documents for project:", projectCode);
  try {
    // FIXED: Changed endpoint to match backend
    const response = await api.get(`/project/get/${projectCode}`);
    
    console.log("📥 API Response:", response);
    console.log("📦 Response data:", response.data);
    
    if (response.status === 200 && response.data) {
      // FIXED: Extract documents from DTO response
      const docs = response.data.documents || [];
      console.log("📄 Documents found:", docs.length);
      
      const normalizedDocs = docs.map(doc => ({
        id: doc.id,
        filePath: doc.docPath,
        fileName: doc.docName || doc.docName,
        uploadDate: doc.createdAt || null
      }));

      console.log("✅ Normalized docs:", normalizedDocs);
      setVendorDocuments(normalizedDocs);
      loadDocumentImages(normalizedDocs);
    } else {
      console.warn("⚠️ No documents found or empty response");
      setVendorDocuments([]);
    }
  } catch (error) {
    console.error("❌ Error fetching project documents:", error);
    console.error("🔍 Error response:", error.response?.data);
    console.error("🔍 Error status:", error.response?.status);
    setVendorDocuments([]);
    toast.error("Failed to load documents: " + (error.response?.data?.message || error.message));
  }
};
  // Function to load all document images
  const loadDocumentImages = async (docList) => {
    const urls = {};
    for (const doc of docList) {
      if (doc.filePath && doc.filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
        try {
          const url = getImageUrl(doc.filePath);
          urls[doc.id] = url;
        } catch (error) {
          console.error(`Error loading document ${doc.filePath}:`, error);
          urls[doc.id] = getPlaceholderImage();
        }
      }
    }
    setImageUrls(prev => ({ ...prev, ...urls }));
  };

  // Open modal for adding new project
  const openAddModal = () => {
    setEditingProject(null);
    setIsViewMode(false);
    setActiveTab("basic");
    setDocuments([]);
    const generatedCode = generateProjectCode();
    setFormData({
      project_code: generatedCode,
      project_name: "",
      location: "",
      work_order_no: "",
      work_order_date: "",
      work_order_value: "",
      gst: "",
      total_value: "",
      invoice_name: "",
      gst_no: "",
      invoice_address: "",
      Site_incharge_name: "",
      Store_incharge_no: "",
      pro_start_date: "",
      pro_end_date: "",
      project_work: "",
      Bgurantee_no: "",
      Bgurante_amt: "",
      BguranteStart_date: "",
      BguranteEnd_date: "",
      firm: "" // Changed from firm_id to firm (String)
    });
    setShowModal(true);
  };

  // Open modal for editing project - FIXED
  const openEditModal = async (project) => {
    try {
      // Use the project data directly instead of making an API call
      setFormData({
        project_code: project.project_code || "",
        project_name: project.project_name || "",
        location: project.location || "",
        work_order_no: project.work_order_no || "",
        work_order_date: project.work_order_date || "",
        work_order_value: project.work_order_value?.toString() || "",
        gst: project.gst?.toString() || "",
        total_value: project.total_value?.toString() || "",
        invoice_name: project.invoice_name || "",
        gst_no: project.gst_no || "",
        invoice_address: project.invoice_address || "",
        Site_incharge_name: project.Site_incharge_name || "",
        Store_incharge_no: project.Store_incharge_no || "",
        pro_start_date: project.pro_start_date || "",
        pro_end_date: project.pro_end_date || "",
        project_work: project.project_work || "",
        Bgurantee_no: project.Bgurantee_no || "",
        Bgurante_amt: project.Bgurante_amt?.toString() || "",
        BguranteStart_date: project.BguranteStart_date || "",
        BguranteEnd_date: project.BguranteEnd_date || "",
        firm: project.firm || ""
      });
      
      setEditingProject(project);
      setIsViewMode(false);
      setActiveTab("basic");
      setShowModal(true);
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project");
    }
  };

  // Open modal for viewing project - FIXED
  const openViewModal = async (project) => {
    try {
      // Use the project data directly instead of making an API call
      setFormData({
        project_code: project.project_code || "",
        project_name: project.project_name || "",
        location: project.location || "",
        work_order_no: project.work_order_no || "",
        work_order_date: project.work_order_date || "",
        work_order_value: project.work_order_value?.toString() || "",
        gst: project.gst?.toString() || "",
        total_value: project.total_value?.toString() || "",
        invoice_name: project.invoice_name || "",
        gst_no: project.gst_no || "",
        invoice_address: project.invoice_address || "",
        Site_incharge_name: project.Site_incharge_name || "",
        Store_incharge_no: project.Store_incharge_no || "",
        pro_start_date: project.pro_start_date || "",
        pro_end_date: project.pro_end_date || "",
        project_work: project.project_work || "",
        Bgurantee_no: project.Bgurantee_no || "",
        Bgurante_amt: project.Bgurante_amt?.toString() || "",
        BguranteStart_date: project.BguranteStart_date || "",
        BguranteEnd_date: project.BguranteEnd_date || "",
        firm: project.firm || ""
      });
      
      setEditingProject(project);
      setIsViewMode(true);
      setActiveTab("basic");
      setShowModal(true);
    } catch (error) {
      console.error("Error loading project details:", error);
      toast.error("Failed to load project details");
    }
  };

  // Open document modal
  const openDocumentModal = (project) => {
    setCurrentProjectId(project.project_code);
    setEditingProject(project);
    setSelectedVendorId(project.project_code);
    setShowDocumentModal(true);
    setDocumentFiles({
      workOrder: null,
      invoice: null,
      agreement: null,
      completionCertificate: null,
      bankGuarantee: null,
      sitePhotos: null,
      drawings: null,
      other: null
    });
    setUploadFiles([]);
    setUploadDocName("");
    fetchProjectDocuments(project.project_code);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setIsViewMode(false);
    setActiveTab("basic");
    // setDocuments([]);
  };

  // Close document modal
  const closeDocModal = () => {
    // Clean up blob URLs
    Object.values(imageUrls).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImageUrls({});
    setShowDocumentModal(false);
    setSelectedVendorId(null);
    setVendorDocuments([]);
    setUploadFiles([]);
    setUploadDocName("");
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    if (typeof dateString === 'string') {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return '';
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN');
    }
    
    return dateString;
  };

  // Handle form input changes - FIXED to always calculate total value
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // 🔹 Auto-calculate total_value - FIXED to handle empty GST
      if (name === "work_order_value" || name === "gst") {
        // Always calculate total value even if GST is empty
        const workOrderValue = updated.work_order_value || "0";
        const gstValue = updated.gst || "0";
        updated.total_value = calculateTotalValue(workOrderValue, gstValue);
      }

      return updated;
    });
  };

  // Handle document file change
  const handleDocumentFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDocumentFiles({ ...documentFiles, [name]: files[0] });
    }
  };

  // Handle file selection for upload (matching EmployeeManagement)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    
    // Auto-generate document name from first file if not set
    if (!uploadDocName && files.length > 0) {
      const fileName = files[0].name;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      setUploadDocName(nameWithoutExt);
    }
  };

  // Prepare data for API submission - CORRECTED
  const prepareSubmissionData = () => {
    const data = { ...formData };
    
    // Convert empty strings to null for backend
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      }
    });
    
    // Convert numeric fields - CORRECTED FIELD NAMES
    const numericFields = ['work_order_value', 'gst', 'total_value', 'Bgurante_amt'];
    numericFields.forEach(field => {
      if (data[field] !== null && data[field] !== '') {
        // gst is Integer, others are BigDecimal
        if (field === 'gst') {
          data[field] = parseInt(data[field]) || 0; // Default to 0 if empty
        } else {
          data[field] = parseFloat(data[field]) || 0; // Default to 0 if empty
        }
      } else {
        // Set to 0 instead of null for numeric fields
        data[field] = 0;
      }
    });
    
    // Format dates - send as strings in YYYY-MM-DD format
    const dateFields = [
      'work_order_date', 
      'pro_start_date', 
      'pro_end_date', 
      'BguranteStart_date', 
      'BguranteEnd_date'
    ];
    
    dateFields.forEach(field => {
      if (data[field]) {
        const date = new Date(data[field]);
        if (!isNaN(date.getTime())) {
          data[field] = date.toISOString().split('T')[0];
        }
      }
    });
    
    // Remove firm_id field if it exists and ensure firm is a string
    delete data.firm_id;
    if (data.firm === null) {
      data.firm = "";
    }
    
    console.log("Prepared submission data:", data);
    return data;
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.project_name) {
    toast.error("Project Name is required");
    return;
  }

  if (!formData.project_code) {
    toast.error("Project Code is required");
    return;
  }

  // 🔴 DUPLICATE PROJECT NAME CHECK (UI LEVEL)
  const currentName = formData.project_name.trim().toLowerCase();

  const isDuplicate = projects.some(project => {
    // while editing → ignore same project
    if (editingProject && project.project_code === editingProject.project_code) {
      return false;
    }
    return project.project_name?.trim().toLowerCase() === currentName;
  });

  if (isDuplicate) {
    toast.error("Project name already exists");
    return; // ⛔ stop submit
  }

  try {
    const submissionData = prepareSubmissionData();
    console.log("Submitting project data:", submissionData);

    if (editingProject) {
      // Update project
      const response = await api.put(
        `/project/updateProject/${editingProject.project_code}`,
        submissionData
      );

      if (response.status === 200) {
        toast.success("Project updated successfully");
        fetchProjects();
        closeModal();
      } else {
        toast.error(response.data?.message || "Update failed");
      }
    } else {
      // Create new project
      const response = await api.post("/project/addProject", submissionData);

      if (response.status === 200) {
        toast.success("Project created successfully");
        fetchProjects();
        closeModal();
      } else {
        toast.error(response.data?.message || "Creation failed");
      }
    }
  } catch (error) {
    console.error("Save error:", error);
    toast.error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to save project"
    );
  }
};


  // Handle document upload - FIXED to use 'docName' instead of 'docNames'
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setUploadingDocuments(true);
    
    const docNames = [];
    const files = [];
    
    Object.entries(documentFiles).forEach(([key, file]) => {
      if (file) {
        docNames.push(key);
        files.push(file);
      }
    });
    
    if (files.length === 0) {
      toast.error("Select at least one file");
      setUploadingDocuments(false);
      return;
    }

    const uploadData = new FormData();
    uploadData.append('project_code', currentProjectId);
    
    // FIXED: Use 'docName' instead of 'docNames' as expected by the backend
    docNames.forEach(name => {
      uploadData.append('docName', name);
    });
    
    // Append files
    files.forEach(file => {
      uploadData.append('files', file);
    });

    try {
      const response = await api.post(`/project/addProDoc`, uploadData, { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      });
      
      toast.success('Documents uploaded successfully');
      setShowDocumentModal(false);
      await fetchProjectDocuments(currentProjectId);
      
      // Refresh documents
      await fetchProjectDocuments(currentProjectId);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setUploadingDocuments(false);
    }
  };

  // Upload documents (matching EmployeeManagement)
//   const handleUploadDocuments = async () => {
//     if (!selectedVendorId) {
//       toast.error("No project selected");
//       return;
//     }

//     if (uploadFiles.length === 0) {
//       toast.error("Please select files to upload");
//       return;
//     }

//     if (!uploadDocName.trim()) {
//       toast.error("Please enter a document name");
//       return;
//     }

//     setIsUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append('project_code', selectedVendorId);

//       // MUST BE docName (singular)
//       uploadFiles.forEach((file, index) => {
//         const name =
//           uploadDocName + (uploadFiles.length > 1 ? `_${index + 1}` : '');
//         formData.append('docName', name);
//       });

//       uploadFiles.forEach(file => {
//         formData.append('files', file);
//       });

//       await api.post('/project/addProDoc', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       toast.success('Documents uploaded successfully');
//       fetchProjectDocuments(selectedVendorId);

//       setUploadFiles([]);
//       setUploadDocName('');
//     } catch (error) {
//       console.error("Error uploading documents:", error);
//       toast.error(error.response?.data?.message || 'Upload failed');
//     } finally {
//       setIsUploading(false);
//     }
//   };
// const handleUploadDocuments = async () => {
//   console.log("⬆️ Starting document upload...");
  
//   if (!selectedVendorId) {
//     toast.error("No project selected");
//     return;
//   }

//   if (uploadFiles.length === 0) {
//     toast.error("Please select files to upload");
//     return;
//   }

//   if (!uploadDocName.trim()) {
//     toast.error("Please enter a document name");
//     return;
//   }

//   setIsUploading(true);

//   try {
//     const formData = new FormData();
//     formData.append('project_code', selectedVendorId);
//     console.log("📝 Project code:", selectedVendorId);
//     console.log("📁 Files to upload:", uploadFiles.length);

//     // Append each file with its own docName
//     uploadFiles.forEach((file, index) => {
//       const name = uploadDocName + (uploadFiles.length > 1 ? `_${index + 1}` : '');
//       console.log(`📄 Appending file ${index + 1}:`, name, file.name);
//       formData.append('docName', name);
//       formData.append('files', file);
//     });

//     // Log FormData contents (for debugging)
//     for (let [key, value] of formData.entries()) {
//       console.log(`📋 FormData: ${key} =`, value instanceof File ? value.name : value);
//     }

//     // FIXED: Use correct endpoint 'addProDoc'
//     const response = await api.post('/project/addProDoc', formData, {
//       headers: { 
//         'Content-Type': 'multipart/form-data' 
//       },
//     });

//     console.log("✅ Upload response:", response);
//     toast.success(response.data || 'Documents uploaded successfully');
    
//     // Refresh documents
//     await fetchProjectDocuments(selectedVendorId);

//     // Clear form
//     setUploadFiles([]);
//     setUploadDocName('');
    
//   } catch (error) {
//     console.error("❌ Error uploading documents:", error);
//     console.error("🔍 Error response:", error.response?.data);
//     console.error("🔍 Error status:", error.response?.status);
//     toast.error(error.response?.data?.message || 'Upload failed: ' + error.message);
//   } finally {
//     setIsUploading(false);
//   }
// };
const handleUploadDocuments = async () => {
  console.log("⬆️ Starting document upload...");
  
  if (!selectedVendorId) {
    toast.error("No project selected");
    return;
  }

  if (uploadFiles.length === 0) {
    toast.error("Please select files to upload");
    return;
  }

  if (!uploadDocName.trim()) {
    toast.error("Please enter a document name");
    return;
  }

  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append('project_code', selectedVendorId);
    console.log("📝 Project code:", selectedVendorId);
    console.log("📁 Files to upload:", uploadFiles.length);

    // Append each file with its own docName
    uploadFiles.forEach((file, index) => {
      const name = uploadDocName + (uploadFiles.length > 1 ? `_${index + 1}` : '');
      console.log(`📄 Appending file ${index + 1}:`, name, file.name);
      formData.append('docName', name);
      formData.append('files', file);
    });

    // Use correct endpoint
    const response = await api.post('/project/addProDoc', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });

    console.log("✅ Upload response:", response);
    toast.success(response.data || 'Documents uploaded successfully');
    
    // Refresh documents
    await fetchProjectDocuments(selectedVendorId);

    // Clear form
    setUploadFiles([]);
    setUploadDocName('');
    
  } catch (error) {
    console.error("❌ Error uploading documents:", error);
    toast.error(error.response?.data?.message || 'Upload failed: ' + error.message);
  } finally {
    setIsUploading(false);
  }
};
  // Delete document
  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const response = await api.delete(`/project/deleteProjectDoc/${docId}`);
      
      if (response.status === 200) {
        toast.success("Document deleted successfully");
        // Refresh documents
        await fetchProjectDocuments(currentProjectId);
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Handle delete document (matching EmployeeManagement)
  const handleDeleteDocument = async (docId) => {
    try {
      const response = await api.delete(`/project/deleteProjectDoc/${docId}`);
      
      if (response.status === 200) {
        toast.success(response.data.message || 'Document deleted successfully');
        // Remove from local state
        setVendorDocuments(prev => prev.filter(doc => doc.id !== docId));
        
        // Clean up image URL if exists
        if (imageUrls[docId]) {
          setImageUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[docId];
            return newUrls;
          });
        }
      } else {
        toast.error(response.data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  // View document (matching EmployeeManagement)
  const viewDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file path available");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Construct URL
      let documentUrl = getImageUrl(doc.filePath);

      // Check file type
      const isImage = doc.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                     doc.filePath?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
      
      const isPdf = doc.fileName?.match(/\.pdf$/i) ||
                   doc.filePath?.match(/\.pdf$/i);
      
      if (isImage) {
        // Open image in new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${doc.fileName || 'Document'}</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 90vh; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <img src="${documentUrl}" alt="${doc.fileName || 'Document'}">
            </body>
            </html>
          `);
        }
      } else if (isPdf) {
        // Open PDF in new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${doc.fileName || 'PDF Document'}</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${documentUrl}#toolbar=0" title="${doc.fileName || 'PDF'}"></iframe>
            </body>
            </html>
          `);
        }
      } else {
        // For other files (doc, docx, etc.), trigger download
        const a = document.createElement('a');
        a.href = documentUrl;
        a.download = doc.fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to open document");
    }
  };

  // Download document (matching EmployeeManagement)
  const downloadDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file path available");
      return;
    }
    
    try {
      const documentUrl = getImageUrl(doc.filePath);
      const a = document.createElement('a');
      a.href = documentUrl;
      a.download = doc.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  // Export to Excel - CORRECTED FIELD NAMES
  const handleExportExcel = () => {
    if (!projects || projects.length === 0) {
      toast.error("No data to export");
      return;
    }

    const excelData = projects.map((project, index) => ({
      "Sr No": index + 1,
      "Project Code": project.project_code,
      "Project Name": project.project_name,
      "Firm": project.firm || "-",
      "Location": project.location,
      "Work Order No": project.work_order_no,
      "Work Order Date": formatDateForDisplay(project.work_order_date),
      "Work Order Value": project.work_order_value,
      "GST (%)": project.gst,
      "Total Value": project.total_value,
      "Invoice Name": project.invoice_name,
      "GST No": project.gst_no,
      "Invoice Address": project.invoice_address,
      "Site Incharge": project.Site_incharge_name,
      "Store Incharge No": project.Store_incharge_no,
      "Start Date": formatDateForDisplay(project.pro_start_date),
      "End Date": formatDateForDisplay(project.pro_end_date),
      "Project Work": project.project_work,
      "Bank Guarantee No": project.Bgurantee_no,
      "Bank Guarantee Amount": project.Bgurante_amt,
      "BG Start Date": formatDateForDisplay(project.BguranteStart_date),
      "BG End Date": formatDateForDisplay(project.BguranteEnd_date)
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Projects_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Export completed");
  };

  // Delete project - FIXED to delete directly without confirmation
  const handleDelete = async (project_code) => {
    try {
      const response = await api.delete(`/project/deleteProject/${project_code}`);
      
      if (response.status === 200) {
        toast.success('Project deleted successfully');
        fetchProjects();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const search = searchTerm.toLowerCase();
    return (
      (project.project_name?.toLowerCase() || '').includes(search) ||
      (project.location?.toLowerCase() || '').includes(search) ||
      (project.project_code?.toLowerCase() || '').includes(search) ||
      (project.work_order_no?.toLowerCase() || '').includes(search) ||
      (project.Site_incharge_name?.toLowerCase() || '').includes(search) ||
      (project.firm || "").toLowerCase().includes(search)
    );
  });

  // Replace document function
//   const replaceDocument = async (docId, newFile) => {
//     try {
//       // 1️⃣ Delete old document
//       await api.delete(`/project/deleteProjectDoc/${docId}`);

//       // 2️⃣ Upload new document
//       const formData = new FormData();
//       formData.append('project_code', selectedVendorId);
//       formData.append('docName', 'Replaced_Image');
//       formData.append('files', newFile);

//       await api.post('/project/addProDoc', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       toast.success('Image replaced successfully');

//       // 3️⃣ Refresh UI
//       fetchProjectDocuments(selectedVendorId);

//     } catch (error) {
//       console.error("Error replacing document:", error);
//       toast.error('Failed to replace image');
//     } finally {
//       setReplaceDocId(null);
//       setReplaceFile(null);
//     }
//   };
  // Replace document function - Updated to handle both PDF and Images
  const replaceDocument = async (docId, newFile) => {
    try {
      // 1️⃣ Delete old document
      await api.delete(`/project/deleteProjectDoc/${docId}`);

      // 2️⃣ Upload new document
      const formData = new FormData();
      formData.append('project_code', selectedVendorId);
      // Use generic name "Updated_Document" for both PDF and Images
      formData.append('docName', 'Updated_Document'); 
      formData.append('files', newFile);

      await api.post('/project/addProDoc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document replaced successfully');

      // 3️⃣ Refresh UI
      fetchProjectDocuments(selectedVendorId);

    } catch (error) {
      console.error("Error replacing document:", error);
      toast.error('Failed to replace document: ' + (error.response?.data?.message || error.message));
    } finally {
      setReplaceDocId(null);
      setReplaceFile(null);
    }
  };

  useEffect(() => {
    if (replaceDocId && replaceFile) {
      replaceDocument(replaceDocId, replaceFile);
    }
  }, [replaceDocId, replaceFile]);

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Project Management</h1>
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
              Add Project
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>Projects ({filteredProjects.length})</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={fetchProjects}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loadingSpinner}>
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <span style={{ marginLeft: '10px' }}>Loading...</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr No</th>
                  <th style={styles.th}>Project Code</th>
                  <th style={styles.th}>Project Name</th>
                  <th style={styles.th}>Firm</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Work Order No</th>
                  <th style={styles.th}>Total Value</th>
                  <th style={styles.th}>Site Incharge</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
                  <tr 
                    key={project.project_code || index}
                    style={index % 2 === 0 ? 
                      (hoveredRow === project.project_code ? {...styles.tr, ...styles.trHover, ...styles.trEven} : {...styles.tr, ...styles.trEven}) : 
                      (hoveredRow === project.project_code ? {...styles.tr, ...styles.trHover, ...styles.trOdd} : {...styles.tr, ...styles.trOdd})}
                    onMouseEnter={() => setHoveredRow(project.project_code)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}><strong style={{color: '#1e40af'}}>{project.project_code}</strong></td>
                    <td style={styles.td}>{project.project_name}</td>
                    <td style={styles.td}>
                      {project.firm || "-"}
                    </td>
                    <td style={styles.td}>{project.location}</td>
                    <td style={styles.td}>{project.work_order_no}</td>
                    <td style={styles.td}>{project.total_value ? `₹${project.total_value}` : '-'}</td>
                    <td style={styles.td}>{project.Site_incharge_name || '-'}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          title="Edit"
                          onClick={() => openEditModal(project)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}}
                          title="View"
                          onClick={() => openViewModal(project)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.documentBtn}}
                          title="Upload Documents"
                          onClick={() => openDocumentModal(project)}
                        >
                          <i className="fas fa-file-upload"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          title="Delete"
                          onClick={() => handleDelete(project.project_code)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                      <i className="fas fa-inbox fa-2x" style={{ color: '#94a3b8', marginBottom: '10px' }}></i>
                      <div>No projects found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Project Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View' : editingProject ? 'Edit' : 'Add'} Project - {formData.project_name || 'New Project'}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.tabs}>
                <div 
                  style={activeTab === "basic" ? { ...styles.tab, ...styles.activeTab } : styles.tab} 
                  onClick={() => setActiveTab("basic")}
                >
                  Basic Information
                </div>
              </div>

              {activeTab === "basic" && (
                <form onSubmit={handleSubmit}>
                  <div style={styles.formGrid}>
                    {/* Project Code */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="project_code">
                        Project Code {!editingProject ? '*' : ''}
                      </label>
                      {!editingProject ? (
                        <input
                          type="text"
                          id="project_code"
                          name="project_code"
                          value={formData.project_code}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          required
                          disabled={isViewMode}
                          placeholder="Auto-generated project code"
                        />
                      ) : (
                        <div style={styles.viewModeValue}>
                          <i className="fas fa-lock" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                          {formData.project_code} (Cannot be changed)
                        </div>
                      )}
                    </div>

                    {/* Firm Dropdown */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="firm">Firm</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.firm || '-'}
                        </div>
                      ) : (
                        <select
                          id="firm"
                          name="firm"
                          value={formData.firm || ""}
                          onChange={handleInputChange}
                          style={styles.formControl}
                        >
                          <option value="">Select Firm</option>
                          {firms.map(firm => (
                            <option key={firm.id} value={firm.name}>
                              {firm.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {firmsLoading && (
                        <div style={{fontSize: '12px', color: '#64748b', marginTop: '5px'}}>
                          <i className="fas fa-spinner fa-spin" style={{marginRight: '5px'}}></i>
                          Loading firms...
                        </div>
                      )}
                    </div>

                    {/* Project Name */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="project_name">
                        Project Name *
                      </label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.project_name || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="project_name"
                          name="project_name"
                          value={formData.project_name}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          required
                          placeholder="Enter project name"
                        />
                      )}
                    </div>

                    {/* Location */}
                    <div style={styles.formGroup}>
  <label style={styles.formLabel} htmlFor="location">Location</label>

  {isViewMode ? (
    <div style={styles.viewModeValue}>
      {formData.location || '-'}
    </div>
  ) : (
    <select
      id="location"
      name="location"
      value={formData.location || ""}
      onChange={handleInputChange}
      style={styles.formControl}
    >
      <option value="">Select Location</option>

      {locations.map((loc) => (
        <option
          key={loc.locationCode}
          value={loc.locationName}
        >
          {loc.locationName}
        </option>
      ))}
    </select>
  )}

  {locationsLoading && (
    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
      <i className="fas fa-spinner fa-spin"></i> Loading locations...
    </div>
  )}
</div>


                    {/* Work Order No */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="work_order_no">Work Order No</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.work_order_no || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="work_order_no"
                          name="work_order_no"
                          value={formData.work_order_no}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Work order number"
                        />
                      )}
                    </div>
                    
                    {/* Work Order Date */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="work_order_date">Work Order Date</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formatDateForDisplay(formData.work_order_date) || '-'}
                        </div>
                      ) : (
                        <div style={styles.dateWrapper}>
                          <input
                            type="date"
                            id="work_order_date"
                            name="work_order_date"
                            value={formatDateForInput(formData.work_order_date)}
                            onChange={handleInputChange}
                            ref={(el) => (dateRefs.current.work_order_date = el)}
                            style={{ ...styles.formControl, paddingRight: '40px' }}
                          />

                          <i
                            className="fas fa-calendar-alt"
                            style={styles.dateIcon}
                            onClick={() => dateRefs.current.work_order_date?.showPicker()}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* Work Order Value */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="work_order_value">Work Order Value (₹)</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.work_order_value ? `₹${formData.work_order_value}` : '-'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          id="work_order_value"
                          name="work_order_value"
                          value={formData.work_order_value}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      )}
                    </div>

                    {/* GST */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="gst">GST (%)</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.gst || '0'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          id="gst"
                          name="gst"
                          value={formData.gst}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          min="0"
                          max="100"
                          placeholder="18"
                        />
                      )}
                    </div>

                    {/* Total Value */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="total_value">Total Value (₹)</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.total_value ? `₹${formData.total_value}` : '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="total_value"
                          name="total_value"
                          value={formData.total_value ? `₹${formData.total_value}` : ''}
                          style={{
                            ...styles.formControl,
                            backgroundColor: "#f1f5f9",
                            cursor: "not-allowed"
                          }}
                          disabled
                          placeholder="Calculated automatically"
                        />
                      )}
                    </div>

                    {/* Invoice Name */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="invoice_name">Invoice Name</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.invoice_name || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="invoice_name"
                          name="invoice_name"
                          value={formData.invoice_name}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Name on invoice"
                        />
                      )}
                    </div>

                    {/* GST No */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="gst_no">GST Number</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.gst_no || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="gst_no"
                          name="gst_no"
                          value={formData.gst_no}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="GSTIN number"
                        />
                      )}
                    </div>

                    {/* Invoice Address */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="invoice_address">Invoice Address</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.invoice_address || '-'}
                        </div>
                      ) : (
                        <textarea
                          id="invoice_address"
                          name="invoice_address"
                          rows="2"
                          value={formData.invoice_address}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Billing address"
                        ></textarea>
                      )}
                    </div>

                    {/* Site Incharge Name - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="Site_incharge_name">Site Incharge Name</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.Site_incharge_name || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="Site_incharge_name"
                          name="Site_incharge_name"
                          value={formData.Site_incharge_name}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Site incharge name"
                        />
                      )}
                    </div>

                    {/* Store Incharge No - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="Store_incharge_no">Store Incharge Contact</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.Store_incharge_no || '-'}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          id="Store_incharge_no"
                          name="Store_incharge_no"
                          value={formData.Store_incharge_no}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Contact number"
                        />
                      )}
                    </div>

                    {/* Project Start Date */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="pro_start_date">Project Start Date</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formatDateForDisplay(formData.pro_start_date) || '-'}
                        </div>
                      ) : (
                        <div style={styles.dateWrapper}>
                          <input
                            type="date"
                            id="pro_start_date"
                            name="pro_start_date"
                            value={formatDateForInput(formData.pro_start_date)}
                            onChange={handleInputChange}
                            ref={(el) => (dateRefs.current.pro_start_date = el)}
                            style={{
                              ...styles.formControl,
                              paddingRight: '40px'
                            }}
                          />
                          <i
                            className="fas fa-calendar-alt"
                            style={styles.dateIcon}
                            onClick={() => dateRefs.current.pro_start_date?.showPicker()}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* Project End Date */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="pro_end_date">Project End Date</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formatDateForDisplay(formData.pro_end_date) || '-'}
                        </div>
                      ) : (
                        <div style={styles.dateWrapper}>
                          <input
                            type="date"
                            id="pro_end_date"
                            name="pro_end_date"
                            value={formatDateForInput(formData.pro_end_date)}
                            onChange={handleInputChange}
                            ref={(el) => (dateRefs.current.pro_end_date = el)}
                            style={{
                              ...styles.formControl,
                              paddingRight: '40px'
                            }}
                          />
                          <i
                            className="fas fa-calendar-alt"
                            style={styles.dateIcon}
                            onClick={() => dateRefs.current.pro_end_date?.showPicker()}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* Project Work Details */}
                    <div style={{...styles.formGroup, ...styles.formGroupFullWidth}}>
                      <label style={styles.formLabel} htmlFor="project_work">Project Work Details</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.project_work || '-'}
                        </div>
                      ) : (
                        <textarea
                          id="project_work"
                          name="project_work"
                          rows="3"
                          value={formData.project_work}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="Describe the project work..."
                        ></textarea>
                      )}
                    </div>

                    {/* Bank Guarantee No - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="Bgurantee_no">Bank Guarantee No</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.Bgurantee_no || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          id="Bgurantee_no"
                          name="Bgurantee_no"
                          value={formData.Bgurantee_no}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder="BG number"
                        />
                      )}
                    </div>

                    {/* Bank Guarantee Amount - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="Bgurante_amt">Bank Guarantee Amount (₹)</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formData.Bgurante_amt ? `₹${formData.Bgurante_amt}` : '-'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          id="Bgurante_amt"
                          name="Bgurante_amt"
                          value={formData.Bgurante_amt}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                      )}
                    </div>

                    {/* BG Start Date - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="BguranteStart_date">BG Start Date</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formatDateForDisplay(formData.BguranteStart_date) || '-'}
                        </div>
                      ) : (
                        <div style={styles.dateWrapper}>
                          <input
                            type="date"
                            id="BguranteStart_date"
                            name="BguranteStart_date"
                            value={formatDateForInput(formData.BguranteStart_date)}
                            onChange={handleInputChange}
                            ref={(el) => (dateRefs.current.BguranteStart_date = el)}
                            style={{
                              ...styles.formControl,
                              paddingRight: '40px'
                            }}
                          />
                          <i
                            className="fas fa-calendar-alt"
                            style={styles.dateIcon}
                            onClick={() => dateRefs.current.BguranteStart_date?.showPicker()}
                          ></i>
                        </div>
                      )}
                    </div>

                    {/* BG End Date - CORRECTED FIELD NAME */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="BguranteEnd_date">BG End Date</label>
                      {isViewMode ? (
                        <div style={styles.viewModeValue}>
                          {formatDateForDisplay(formData.BguranteEnd_date) || '-'}
                        </div>
                      ) : (
                        <div style={styles.dateWrapper}>
                          <input
                            type="date"
                            id="BguranteEnd_date"
                            name="BguranteEnd_date"
                            value={formatDateForInput(formData.BguranteEnd_date)}
                            onChange={handleInputChange}
                            ref={(el) => (dateRefs.current.BguranteEnd_date = el)}
                            style={{
                              ...styles.formControl,
                              paddingRight: '40px'
                            }}
                          />
                          <i
                            className="fas fa-calendar-alt"
                            style={styles.dateIcon}
                            onClick={() => dateRefs.current.BguranteEnd_date?.showPicker()}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closeModal}
              >
                Cancel
              </button>
              {!isViewMode && activeTab === "basic" && (
                <button 
                  style={{...styles.btn, ...styles.btnPrimary}} 
                  onClick={handleSubmit}
                >
                  <i className="fas fa-save"></i>
                  {editingProject ? 'Update Project' : 'Save Project'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal - Updated to match EmployeeManagement */}
      {showDocumentModal && (
        <div style={styles.modal}>
          <div style={styles.docModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Project Documents - {editingProject?.project_name}
              </h3>
              <button style={styles.modalClose} onClick={closeDocModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Upload Section */}
              <div style={styles.uploadSection}>
                <h4 style={styles.docTitle}>Upload Documents</h4>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Document Name</label>
                  <input
                    type="text"
                    placeholder="Enter document name (e.g., Work Order, Invoice, Agreement, etc.)"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    style={styles.formControl}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Select Files</label>
                  <div style={styles.formRow}>
                    <div style={styles.formColumn}>
                      <label style={{...styles.fileLabel, display: 'block', textAlign: 'center'}}>
                        <i className="fas fa-cloud-upload-alt" style={{marginRight: '8px'}}></i>
                        Choose Files
                        <input
                          type="file"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>
                      {uploadFiles.length > 0 && (
                        <div style={{marginTop: '10px'}}>
                          <small style={{color: '#10b981'}}>
                            <i className="fas fa-check-circle"></i> {uploadFiles.length} file(s) selected
                          </small>
                          <ul style={{margin: '5px 0', paddingLeft: '20px', fontSize: '12px'}}>
                            {uploadFiles.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                  <button
                    style={{...styles.btn, ...styles.btnSecondary}}
                    onClick={() => {
                      setUploadFiles([]);
                      setUploadDocName("");
                    }}
                    disabled={isUploading}
                  >
                    Clear
                  </button>
                  <button
                    style={{...styles.btn, ...styles.btnPrimary}}
                    onClick={handleUploadDocuments}
                    disabled={isUploading || uploadFiles.length === 0}
                  >
                    {isUploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i>
                        Upload Documents
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Documents List */}
              <div style={styles.documentsSection}>
                <h4 style={styles.docTitle}>Uploaded Documents</h4>
                
                {vendorDocuments.length > 0 ? (
                                   <div style={styles.docGrid}>
                    {vendorDocuments.map((doc) => {
                      const isImage = doc.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ||
                                     doc.filePath?.match(/\.(jpg|jpeg|png|gif)$/i);

                      const isPdf = doc.fileName?.match(/\.pdf$/i) ||
                                   doc.filePath?.match(/\.pdf$/i);
                      
                      // CHANGED: Allow replace for both Image and PDF
                      const canReplace = isImage || isPdf;

                      return (
                        <div key={doc.id} style={styles.docCard}>
                          <div style={styles.docHeader}>
                            <div style={styles.docName}>
                              {doc.fileName || "Document"}
                            </div>
                            <div style={styles.docDate}>
                              {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : new Date().toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div style={styles.docPreview}>
                            {isImage ? (
                              <img 
                                src={imageUrls[doc.id] || getPlaceholderImage()} 
                                alt={doc.fileName}
                                style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getPlaceholderImage();
                                }}
                              />
                            ) : isPdf ? (
                              <i className="fas fa-file-pdf fa-3x" style={{color: '#ef4444'}}></i>
                            ) : (
                              <i className="fas fa-file-alt fa-3x" style={{color: '#94a1b4'}}></i>
                            )}
                          </div>
                          
                          <div style={styles.docActions}>
                            <button
                              style={{...styles.docActionBtn, backgroundColor: '#3b82f6', color: 'white'}}
                              onClick={() => viewDocument(doc)}
                            >
                              <i className="fas fa-eye"></i> 
                            </button>
                            <button
                              style={{...styles.docActionBtn, backgroundColor: '#10b981', color: 'white'}}
                              onClick={() => downloadDocument(doc)}
                            >
                              <i className="fas fa-download"></i> 
                            </button>
                            <button
                              style={{...styles.docActionBtn, backgroundColor: '#ef4444', color: 'white'}}
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <i className="fas fa-trash"></i> 
                            </button>
                            
                            {/* CHANGED: Replace button now shows for PDFs too */}
                           <label
  style={{
    ...styles.docActionBtn,
    backgroundColor: '#f59e0b',
    color: 'white'
  }}
>
  <i className="fas fa-sync"></i>
  <input
    type="file"
    accept={isPdf ? ".pdf" : "image/*"}
    style={{ display: 'none' }}
    onChange={(e) => {
      setReplaceDocId(doc.id);
      setReplaceFile(e.target.files[0]);
    }}
  />
</label>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                    <i className="fas fa-folder-open" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                    <p>No documents uploaded yet for this project.</p>
                    <p>Use the upload section above to add documents.</p>
                  </div>
                )}
                
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <button
                    style={{...styles.btn, ...styles.btnSecondary}}
                    onClick={closeDocModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
