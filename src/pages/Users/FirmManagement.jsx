import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FirmManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFirm, setEditingFirm] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceDocId, setReplaceDocId] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);

const getImageUrl = (filePath) => {
  if (!filePath) return "";

  const cacheBuster = `t=${Date.now()}`;

  if (filePath.startsWith("http")) {
    return `${filePath}?${cacheBuster}`;
  }

  if (filePath.startsWith("/")) {
    return `${BACKEND_URL}${filePath}?${cacheBuster}`;
  }

  return `${BACKEND_URL}/${filePath}?${cacheBuster}`;
};

  // Document management states
  const [showDocModal, setShowDocModal] = useState(false);
  const [firmDocuments, setFirmDocuments] = useState([]);
  const [selectedFirmId, setSelectedFirmId] = useState(null);
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState({});

  // State for form data
  const [formData, setFormData] = useState({
    firmName: "",
    printName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobileNo: "",
    phoneNo: "",
    gstNo: "",
    panNo: "",
    cinNo: "",
    tanNo: "",
    emailID: "",
    website: "",
    bankName: "",
    accountNo: "",
    branchName: "",
    ifscCode: "",
    status: "Active"
  });

  // API Configuration
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/firm`;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pharma2.shop';
  
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

  // Fetch firms on component mount
  useEffect(() => {
    fetchFirms();
  }, []);

  // Function to fetch document with authentication
  const fetchDocument = async (filePath) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!filePath) {
        return getPlaceholderImage();
      }

      // If it's already a full URL, use it
      if (filePath.startsWith('http')) {
        const response = await fetch(filePath, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      }

      // Construct full URL
      let fullUrl;
      if (filePath.startsWith('/')) {
        fullUrl = `${BACKEND_URL}${filePath}`;
      } else {
        fullUrl = `${BACKEND_URL}/${filePath}`;
      }

      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } else {
        console.error('Failed to fetch document:', response.status);
        return getPlaceholderImage();
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      return getPlaceholderImage();
    }
  };

  // Function to load all document images
  const loadDocumentImages = async (docList) => {
    const urls = {};
    for (const doc of docList) {
      if (doc.filePath && doc.filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
        try {
          const url = await fetchDocument(doc.filePath);
          urls[doc.id] = url;
        } catch (error) {
          console.error(`Error loading document ${doc.filePath}:`, error);
          urls[doc.id] = getPlaceholderImage();
        }
      }
    }
    setImageUrls(prev => ({ ...prev, ...urls }));
  };

  // Get placeholder image
  const getPlaceholderImage = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
      <rect width="200" height="150" fill="#f0f0f0"/>
      <text x="100" y="75" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" alignment-baseline="middle">
        No Image
      </text>
    </svg>`;
  };

  // Fetch all firms
  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/all");
     
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data.data)) {
          setFirms(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setFirms(response.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setFirms([]);
        }
      } else {
        setFirms([]);
      }
    } catch (error) {
      console.error("Error fetching firms:", error);
      toast.error("Failed to fetch firms");
      setFirms([]);
    } finally {
      setLoading(false);
    }
  };

  // Open document modal
  const openDocumentModal = async (firm) => {
    try {
      setSelectedFirmId(firm.id);
      setShowDocModal(true);
      
      // Fetch firm documents
      const response = await api.get(`/get/${firm.id}`);
      
      if (response.status === 200) {
        const firmData = response.data.data || response.data;
        const docs = firmData.documents || [];
        setFirmDocuments(docs);
        
        // Load document images
        if (docs.length > 0) {
          loadDocumentImages(docs);
        }
        
        toast.success("Documents loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
      setFirmDocuments([]);
    }
  };

  //view and download
const handleReplaceDocument = async () => {
  if (!replaceDocId || !replaceFile) {
    toast.error("Please select a file to replace");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("id", replaceDocId);
    formData.append("itemimage", replaceFile);

   const response = await api.put(
  "/updateDoc",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);


    if (response.status === 200) {
      toast.success("Document replaced successfully");

      // 🔥 clear old image cache
      setImageUrls({});

      // reload documents
      const firmResponse = await api.get(`/get/${selectedFirmId}`);
      const firmData = firmResponse.data.data || firmResponse.data;
      const docs = firmData.documents || [];

      setFirmDocuments(docs);
      loadDocumentImages(docs);

      setReplaceDocId(null);
      setReplaceFile(null);
    }
  } catch (error) {
    console.error("Replace error:", error);
    toast.error("Failed to replace document");
  }
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
    setShowDocModal(false);
    setSelectedFirmId(null);
    setFirmDocuments([]);
    setUploadFiles([]);
    setUploadDocName("");
  };

  // Handle file selection for upload
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

  // Handle file selection for replace
  const handleReplaceFileSelect = (e) => {
    const file = e.target.files[0];
    setReplaceFile(file);
  };

  // Upload documents
  const handleUploadDocuments = async () => {
    if (!selectedFirmId) {
      toast.error("No firm selected");
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
      formData.append('id', selectedFirmId);
      
      // Create array of document names
      const docNames = uploadFiles.map((file, index) => 
        uploadDocName + (uploadFiles.length > 1 ? `_${index + 1}` : '')
      );
      
      docNames.forEach(name => {
        formData.append('docNames', name);
      });
      
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/addDoc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Documents uploaded successfully');
        
        // Refresh documents list
        const firmResponse = await api.get(`/get/${selectedFirmId}`);
        if (firmResponse.status === 200) {
          const firmData = firmResponse.data.data || firmResponse.data;
          const docs = firmData.documents || [];
          setFirmDocuments(docs);
          
          // Load new document images
          if (docs.length > 0) {
            loadDocumentImages(docs);
          }
        }
        
        // Reset upload form
        setUploadFiles([]);
        setUploadDocName("");
      } else {
        toast.error(response.data.message || 'Failed to upload documents');
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(error.response?.data?.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  // View document (Fixed version)
  const viewDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file path available");
      return;
    }
    
    try {
      // Check file type
      const isImage = doc.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                     doc.filePath?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
      
      const isPdf = doc.fileName?.match(/\.pdf$/i) ||
                   doc.filePath?.match(/\.pdf$/i);
      
      // Get the document URL with authentication
      const documentUrl = getImageUrl(doc.filePath);
      
      if (isImage) {
        // For images, fetch the document as blob and create object URL
        const token = localStorage.getItem('token');
        
        // Fetch the image with auth token
        const response = await fetch(documentUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          // Open in a new window
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${doc.fileName || 'Image Document'}</title>
                <style>
                  body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; max-height: 90vh; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                </style>
              </head>
              <body>
                <img src="${imageUrl}" alt="${doc.fileName || 'Image'}">
              </body>
              </html>
            `);
          }
        } else {
          throw new Error('Failed to fetch image');
        }
      } else if (isPdf) {
        // For PDFs, fetch the document as blob and create object URL
        const token = localStorage.getItem('token');
        
        // Fetch the PDF with auth token
        const response = await fetch(documentUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const pdfUrl = URL.createObjectURL(blob);
          
          // Open in a new window
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
                <iframe src="${pdfUrl}" title="${doc.fileName || 'PDF'}"></iframe>
              </body>
              </html>
            `);
          }
        } else {
          throw new Error('Failed to fetch PDF');
        }
      } else {
        // For other files, trigger download
        const token = localStorage.getItem('token');
        
        // Fetch the file with auth token
        const response = await fetch(documentUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          // Create download link
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.fileName || 'document';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Clean up
          URL.revokeObjectURL(url);
        } else {
          throw new Error('Failed to fetch file');
        }
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to open document");
    }
  };

  // Download document
  const downloadDocument = async (doc) => {
  if (!doc.filePath) {
    toast.error("No file path available");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const fileUrl = getImageUrl(doc.filePath);

    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName || "document";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Document downloaded successfully");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download document");
  }
};


  // Delete document
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await api.delete(`/deleteDoc?id=${docId}`);
      
      if (response.status === 200) {
        toast.success('Document deleted successfully');
        // Remove from local state
        setFirmDocuments(prev => prev.filter(doc => doc.id !== docId));
        
        // Clean up blob URL if exists
        if (imageUrls[docId]) {
          URL.revokeObjectURL(imageUrls[docId]);
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

  // Open modal for adding new firm
  const openAddModal = () => {
    setEditingFirm(null);
    setIsViewMode(false);
    setFormData({
      firmName: "",
      printName: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      mobileNo: "",
      phoneNo: "",
      gstNo: "",
      panNo: "",
      cinNo: "",
      tanNo: "",
      emailID: "",
      website: "",
      bankName: "",
      accountNo: "",
      branchName: "",
      ifscCode: "",
      status: "Active"
    });
    setShowModal(true);
  };

  // Open modal for editing firm
  const openEditModal = async (firm) => {
    try {
      // Fetch full firm details
      const response = await api.get(`/get/${firm.id}`);
     
      if (response.status === 200) {
        const firmDetails = response.data.data || response.data;
       
        setEditingFirm(firmDetails);
        setIsViewMode(false);
       
        setFormData({
          firmName: firmDetails.firmName || "",
          printName: firmDetails.printName || "",
          address: firmDetails.address || "",
          city: firmDetails.city || "",
          state: firmDetails.state || "",
          pinCode: firmDetails.pinCode || "",
          mobileNo: firmDetails.mobileNo || "",
          phoneNo: firmDetails.phoneNo || "",
          gstNo: firmDetails.gstNo || "",
          panNo: firmDetails.panNo || "",
          cinNo: firmDetails.cinNo || "",
          tanNo: firmDetails.tanNo || "",
          emailID: firmDetails.emailID || "",
          website: firmDetails.website || "",
          bankName: firmDetails.bankName || "",
          accountNo: firmDetails.accountNo || "",
          branchName: firmDetails.branchName || "",
          ifscCode: firmDetails.ifscCode || "",
          status: firmDetails.status || "Active"
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching firm details:", error);
      toast.error("Failed to fetch firm details");
    }
  };

  // Open modal for viewing firm
  const openViewModal = async (firm) => {
    try {
      // Fetch full firm details
      const response = await api.get(`/get/${firm.id}`);
     
      if (response.status === 200) {
        const firmDetails = response.data.data || response.data;
       
        setEditingFirm(firmDetails);
        setIsViewMode(true);
       
        setFormData({
          firmName: firmDetails.firmName || "",
          printName: firmDetails.printName || "",
          address: firmDetails.address || "",
          city: firmDetails.city || "",
          state: firmDetails.state || "",
          pinCode: firmDetails.pinCode || "",
          mobileNo: firmDetails.mobileNo || "",
          phoneNo: firmDetails.phoneNo || "",
          gstNo: firmDetails.gstNo || "",
          panNo: firmDetails.panNo || "",
          cinNo: firmDetails.cinNo || "",
          tanNo: firmDetails.tanNo || "",
          emailID: firmDetails.emailID || "",
          website: firmDetails.website || "",
          bankName: firmDetails.bankName || "",
          accountNo: firmDetails.accountNo || "",
          branchName: firmDetails.branchName || "",
          ifscCode: firmDetails.ifscCode || "",
          status: firmDetails.status || "Active"
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching firm details:", error);
      toast.error("Failed to fetch firm details");
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingFirm(null);
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

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission (create/update firm)
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    // Basic validation
    if (!formData.firmName) {
      toast.error("Firm Name is required", { position: 'top-right' });
      return;
    }

    try {
      if (editingFirm) {
        // Update existing firm
        const response = await api.put(`/update/${editingFirm.id}`, formData);
       
        if (response.status === 200) {
          toast.success('Firm updated successfully', { position: 'top-right' });
          fetchFirms(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to update firm', { position: 'top-right' });
        }
      } else {
        // Create new firm
        const response = await api.post('/create', formData);
       
        if (response.status === 200) {
          toast.success('Firm added successfully', { position: 'top-right' });
          fetchFirms(); // Refresh list
          closeModal();
        } else {
          toast.error(response.data.message || 'Failed to add firm', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving firm:', error);
      toast.error(error.response?.data?.message || 'Failed to save firm', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!firms || firms.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel
    const excelData = firms.map((firm, index) => ({
      "Sr No": index + 1,
      "Firm Name": firm.firmName || "",
      "Print Name": firm.printName || "",
      "Address": firm.address || "",
      "City": firm.city || "",
      "State": firm.state || "",
      "Pincode": firm.pinCode || "",
      "Mobile": firm.mobileNo || "",
      "Phone": firm.phoneNo || "",
      "Email": firm.emailID || "",
      "GST No": firm.gstNo || "",
      "PAN No": firm.panNo || "",
      "CIN No": firm.cinNo || "",
      "TAN No": firm.tanNo || "",
      "Website": firm.website || "",
      "Bank Name": firm.bankName || "",
      "Account No": firm.accountNo || "",
      "Status": firm.status || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Firms");
    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `Firm_Master_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle firm deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this firm?")) {
      return;
    }

    try {
      const response = await api.delete(`/delete/${id}`);
      if (response.status === 200) {
        toast.success('Firm deleted successfully', {
          position: 'top-right',
        });
        fetchFirms(); // refresh table
      } else {
        toast.error(response.data.message || 'Failed to delete firm', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting firm:', error);
      toast.error(error.response?.data?.message || 'Failed to delete firm', { position: 'top-right' });
    }
  };

  const filteredFirms = firms.filter((firm) => {
    const search = searchTerm.toLowerCase();
   
    return (
      (firm.firmName && firm.firmName.toLowerCase().includes(search)) ||
      (firm.printName && firm.printName.toLowerCase().includes(search)) ||
      (firm.city && firm.city.toLowerCase().includes(search)) ||
      (firm.state && firm.state.toLowerCase().includes(search)) ||
      (firm.emailID && firm.emailID.toLowerCase().includes(search)) ||
      (firm.gstNo && firm.gstNo.toLowerCase().includes(search)) ||
      (firm.panNo && firm.panNo.toLowerCase().includes(search)) ||
      (firm.mobileNo && firm.mobileNo.toString().includes(search))
    );
  });

  // Style definitions (same as vendor)
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
    btnSuccess: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    btnWarning: {
      backgroundColor: '#f59e0b',
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
    trEven: {
      backgroundColor: '#ffffff'
    },
    trOdd: {
      backgroundColor: '#f8fafc'
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
    editBtn: {
      color: '#16a34a'
    },
    viewBtn: {
      color: '#eab308'
    },
    deleteBtn: {
      color: '#dc2626'
    },
    docBtn: {
      color: '#8b5cf6'
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
    documentsSection: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    },
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
    replaceSection: {
      padding: '15px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bae6fd',
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
     
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Firm Master Management</h1>
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
              Add Firm
            </button>
          </div>
        </div>

        {/* Firm Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Firms ({filteredFirms.length})</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input
                  type="text"
                  placeholder="Search firms..."
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                  <th style={styles.th}>Firm Name</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>GST No</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFirms.length > 0 ? filteredFirms.map((firm, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === firm.id;
                  const statusStyle = firm.status === 'Active' ? styles.statusActive : styles.statusInactive;

                  return (
                    <tr
                      key={firm.id}
                      style={{
                        ...styles.tr,
                        backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                      }}
                      onMouseEnter={() => setHoveredRow(firm.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{firm.firmName || ""}</td>
                      <td style={styles.td}>{firm.mobileNo || ""}</td>
                      <td style={styles.td}>{firm.emailID || ""}</td>
                      <td style={styles.td}>{firm.gstNo || ""}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...statusStyle }}>
                          {firm.status || "Active"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={{ ...styles.actionBtn, ...styles.editBtn }}
                            title="Edit"
                            onClick={() => openEditModal(firm)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.viewBtn }}
                            title="View"
                            onClick={() => openViewModal(firm)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.docBtn }}
                            title="Documents"
                            onClick={() => openDocumentModal(firm)}
                          >
                            <i className="fas fa-file-alt"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                            title="Delete"
                            onClick={() => handleDelete(firm.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" style={{ ...styles.td, textAlign: "center", padding: "30px" }}>
                      No firms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Firm Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Firm Details' : (editingFirm ? 'Edit Firm' : 'Add New Firm')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Firm ID - Read-only for edit/view */}
                {editingFirm && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Firm ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={editingFirm.id}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}
                
                {/* Firm Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="firmName">Firm Name *</label>
                  <input
                    type="text"
                    id="firmName"
                    name="firmName"
                    value={formData.firmName}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                  />
                </div>

                {/* Print Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="printName">Print Name</label>
                  <input
                    type="text"
                    id="printName"
                    name="printName"
                    value={formData.printName}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    disabled={isViewMode}
                  />
                </div>

                {/* Address Information */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address Information</label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    rows="3"
                    disabled={isViewMode}
                  />
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="pinCode"
                        name="pinCode"
                        placeholder="Pincode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Contact Information</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="phoneNo"
                        name="phoneNo"
                        placeholder="Phone Number"
                        value={formData.phoneNo}
                        onChange={handleNumberChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="mobileNo"
                        name="mobileNo"
                        placeholder="Mobile Number"
                        value={formData.mobileNo}
                        onChange={handleNumberChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="email"
                        id="emailID"
                        name="emailID"
                        placeholder="Email"
                        value={formData.emailID}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        placeholder="Website"
                        value={formData.website}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Information */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Tax Information</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="gstNo"
                        name="gstNo"
                        placeholder="GST Number"
                        value={formData.gstNo}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="panNo"
                        name="panNo"
                        placeholder="PAN Number"
                        value={formData.panNo}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="cinNo"
                        name="cinNo"
                        placeholder="CIN Number"
                        value={formData.cinNo}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="tanNo"
                        name="tanNo"
                        placeholder="TAN Number"
                        value={formData.tanNo}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Bank Information</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="bankName"
                        name="bankName"
                        placeholder="Bank Name"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="accountNo"
                        name="accountNo"
                        placeholder="Account Number"
                        value={formData.accountNo}
                        onChange={handleNumberChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="branchName"
                        name="branchName"
                        placeholder="Branch Name"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="ifscCode"
                        name="ifscCode"
                        placeholder="IFSC Code"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                {!isViewMode && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={isViewMode}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
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
                  {editingFirm ? 'Update Firm' : 'Save Firm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocModal && (
        <div style={styles.modal}>
          <div style={styles.docModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Firm Documents</h3>
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
                    placeholder="Enter document name (e.g., Registration Certificate, GST Certificate, etc.)"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    style={styles.formControl}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Select Files</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
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
                    style={{...styles.btn, ...styles.btnSuccess}}
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
                
                {firmDocuments.length > 0 ? (
                  <div style={styles.docGrid}>
                    {firmDocuments.map((doc) => {
                      const isImage = doc.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ||
                                     doc.filePath?.match(/\.(jpg|jpeg|png|gif)$/i);
                      const isPdf = doc.fileName?.match(/\.pdf$/i) ||
                                   doc.filePath?.match(/\.pdf$/i);
                      
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
                              style={{...styles.docActionBtn, backgroundColor: '#f59e0b', color: 'white'}}
                              onClick={() => {
                                setReplaceDocId(doc.id);
                                document.getElementById(`replace-file-${doc.id}`).click();
                              }}
                            >
                              <i className="fas fa-sync-alt"></i> 
                            </button>
                            <button
                              style={{...styles.docActionBtn, backgroundColor: '#ef4444', color: 'white'}}
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <i className="fas fa-trash"></i> 
                            </button>
                          </div>
                          
                          {/* Hidden file input for replace */}
                          <input
  id={`replace-file-${doc.id}`}
  type="file"
  style={{ display: 'none' }}
 onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    setReplaceFile(file);
    setReplaceDocId(doc.id);
  }
}}

  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
/>


                          
                          {/* Replace Document Section */}
                          {replaceDocId === doc.id && (
                            <div style={styles.replaceSection}>
                              <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Replace Document</label>
                                <div style={styles.formRow}>
                                  <div style={styles.formCol}>
                                    <label style={{...styles.fileLabel, display: 'block', textAlign: 'center'}}>
                                      <i className="fas fa-file-upload" style={{marginRight: '8px'}}></i>
                                      Select New File
                                      <input
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={handleReplaceFileSelect}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      />
                                    </label>
                                    {replaceFile && (
                                      <div style={{marginTop: '10px'}}>
                                        <small style={{color: '#10b981'}}>
                                          <i className="fas fa-check-circle"></i> {replaceFile.name}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                <button
                                  style={{...styles.btn, ...styles.btnSecondary}}
                                  onClick={() => {
                                    setReplaceDocId(null);
                                    setReplaceFile(null);
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  style={{...styles.btn, ...styles.btnSuccess}}
                                  onClick={handleReplaceDocument}
                                  disabled={!replaceFile}
                                >
                                  <i className="fas fa-sync-alt"></i> Replace Document
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                    <i className="fas fa-folder-open" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                    <p>No documents uploaded yet.</p>
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

export default FirmManagement;