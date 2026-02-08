import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const VendorMasterManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Document management states
  const [showDocModal, setShowDocModal] = useState(false);
  const [vendorDocuments, setVendorDocuments] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  
  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bankName: "",
    accountNo: "",
    branchName: "",
    routingNo: "",
    accountType: "Savings",
    status: "Active"
  });

  // State for form data
  const [formData, setFormData] = useState({
    vendorName: "",
    address1: "",
    address2: "",
    selectState: "",
    city: "",
    pincode: "",
    phone: "",
    mobile: "",
    email: "",
    panNo: "",
    gstNo: "",
    aadharNo: "",
    status: "Active"
  });

  // API Configuration
  // const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/vendor`;
  // const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pharma2.shop';

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API_BASE_URL = `${BACKEND_URL}/api/vendor`;

 
  
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

  // Get document URL for viewing/downloading
  const getDocumentUrl = (filePath) => {
    if (!filePath) return "";
    
    // Check if filePath is already a full URL
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Check if filePath starts with '/'
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullUrl = `${BACKEND_URL}/${cleanPath}`;
    
    return fullUrl;
  };

  // Fetch document with authentication
  const fetchDocument = async (filePath) => {
    try {
      const token = localStorage.getItem('token');
      const url = getDocumentUrl(filePath);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
      } else {
        console.error('Failed to fetch document:', response.status);
        return getPlaceholderImage();
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      return getPlaceholderImage();
    }
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

  // Function to load all document images
  const loadDocumentImages = async (docList) => {
    const urls = {};
    for (const doc of docList) {
      if (doc.filePath) {
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

  // Fetch all vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/all");
     
      if (response.status === 200) {
        const responseData = response.data;
        
        // Check for response.data.data structure
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setVendors(responseData.data);
        } else if (Array.isArray(responseData)) {
          setVendors(responseData);
        } else {
          console.error("Unexpected response format:", responseData);
          setVendors([]);
          toast.error("Unexpected data format received");
        }
      } else {
        setVendors([]);
        toast.error("Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor bank accounts
  const fetchVendorBanks = async (vendorId) => {
    try {
      const response = await api.get(`/getBandById/${vendorId}`);
      
      if (response.status === 200) {
        const banks = response.data || [];
        setBankAccounts(Array.isArray(banks) ? banks : []);
        return banks;
      } else {
        setBankAccounts([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast.error("Failed to fetch bank accounts");
      setBankAccounts([]);
      return [];
    }
  };

  // NEW: Fetch vendor details using /get/{id} endpoint
  const fetchVendorDetailsById = async (vendorId) => {
    try {
      const response = await api.get(`/get/${vendorId}`);
      
      if (response.status === 200) {
        const responseData = response.data;
        
        // Check if response has status and data
        if (responseData && responseData.status === 200) {
          // Vendor details are in responseData.data
          return responseData.data;
        } else {
          console.error("Unexpected response structure:", responseData);
          return null;
        }
      } else {
        console.error("Failed to fetch vendor details");
        return null;
      }
    } catch (error) {
      console.error("Error fetching vendor details by ID:", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendor details");
      return null;
    }
  };

  // Open document modal - UPDATED to use /get/{id}
  const openDocumentModal = async (vendor) => {
    try {
      setSelectedVendorId(vendor.id);
      setShowDocModal(true);
      
      // Fetch vendor details using /get/{id} endpoint
      const vendorData = await fetchVendorDetailsById(vendor.id);
      
      if (vendorData) {
        const docs = vendorData.documents || [];
        setVendorDocuments(docs);
        
        // Load document images
        if (docs.length > 0) {
          loadDocumentImages(docs);
        }
        
        toast.success("Documents loaded successfully");
      } else {
        toast.error("Failed to load documents");
        setVendorDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(error.response?.data?.message || "Failed to load documents");
      setVendorDocuments([]);
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
    setSelectedVendorId(null);
    setVendorDocuments([]);
    setUploadFiles([]);
    setUploadDocName("");
  };

  // Handle file selection for upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    
    if (!uploadDocName && files.length > 0) {
      const fileName = files[0].name;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      setUploadDocName(nameWithoutExt);
    }
  };

  // Upload documents
  const handleUploadDocuments = async () => {
    if (!selectedVendorId) {
      toast.error("No vendor selected");
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
      formData.append('id', selectedVendorId);
      
      const docNames = uploadFiles.map((file, index) => 
        uploadDocName + (uploadFiles.length > 1 ? `_${index + 1}` : '')
      );
      
      docNames.forEach(name => {
        formData.append('docName', name);
      });
      
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/addVenDoc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        toast.success(responseData.message || 'Documents uploaded successfully');
        
        // Refresh documents list using /get/{id}
        const vendorData = await fetchVendorDetailsById(selectedVendorId);
        if (vendorData) {
          const docs = vendorData.documents || [];
          setVendorDocuments(docs);
          
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

  // View document
  const viewDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file available");
      return;
    }

    try {
      const blobUrl = await fetchDocument(doc.filePath);

      if (!blobUrl) {
        toast.error("Unable to load document");
        return;
      }

      const filePath = doc.filePath.toLowerCase();
      const isImage = filePath.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
      const isPdf = filePath.match(/\.pdf$/);

      const newWindow = window.open();
      if (!newWindow) {
        toast.error("Popup blocked. Allow popups.");
        return;
      }

      if (isImage) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Document</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: #f5f5f5;
                  height: 100vh;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              </style>
            </head>
            <body>
              <img src="${blobUrl}" />
            </body>
          </html>
        `);
      } 
      else if (isPdf) {
        newWindow.document.write(`
          <html>
            <head>
              <title>PDF</title>
              <style>
                html, body {
                  margin: 0;
                  height: 100%;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                }
              </style>
            </head>
            <body>
              <iframe src="${blobUrl}"></iframe>
            </body>
          </html>
        `);
      } 
      else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = doc.fileName || "document";
        a.click();
      }

    } catch (error) {
      console.error("View document error:", error);
      toast.error("Failed to open document");
    }
  };

  // Download document
  const downloadDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file available");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const documentUrl = getDocumentUrl(doc.filePath);

      const response = await fetch(documentUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const fileName = doc.fileName || 
                      doc.filePath.split('/').pop() || 
                      "document";
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

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
        const responseData = response.data;
        toast.success(responseData.message || 'Document deleted successfully');
        
        // Remove from local state
        setVendorDocuments(prev => prev.filter(doc => doc.id !== docId));
        
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

  // Update document
  const handleUpdateDocument = async (docId, file) => {
    if (!docId || !file) {
      toast.error("Please select a file to update");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id', docId);
      formData.append('itemimage', file);

      const response = await api.put('/updateProjectDoc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const responseData = response.data;
        toast.success(responseData.message || 'Document updated successfully');
        
        // Refresh documents list using /get/{id}
        const vendorData = await fetchVendorDetailsById(selectedVendorId);
        if (vendorData) {
          const docs = vendorData.documents || [];
          setVendorDocuments(docs);
          
          // Load new document images
          if (docs.length > 0) {
            loadDocumentImages(docs);
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error(error.response?.data?.message || 'Failed to update document');
    }
  };

  // Open modal for adding new vendor
  const openAddModal = () => {
    setEditingVendor(null);
    setIsViewMode(false);
    setBankAccounts([]);
    setFormData({
      vendorName: "",
      address1: "",
      address2: "",
      selectState: "",
      city: "",
      pincode: "",
      phone: "",
      mobile: "",
      email: "",
      panNo: "",
      gstNo: "",
      aadharNo: "",
      status: "Active"
    });
    setShowModal(true);
  };

  // Open modal for editing vendor - UPDATED to use /get/{id}
  const openEditModal = async (vendor) => {
    try {
      // Fetch vendor details using /get/{id} endpoint
      const vendorDetails = await fetchVendorDetailsById(vendor.id);
     
      if (vendorDetails) {
        setEditingVendor(vendorDetails);
        setIsViewMode(false);
       
        setFormData({
          vendorName: vendorDetails.vendorName || "",
          address1: vendorDetails.address1 || "",
          address2: vendorDetails.address2 || "",
          selectState: vendorDetails.selectState || "",
          city: vendorDetails.city || "",
          pincode: vendorDetails.pincode || "",
          phone: vendorDetails.phone || "",
          mobile: vendorDetails.mobile || "",
          email: vendorDetails.email || "",
          panNo: vendorDetails.panNo || "",
          gstNo: vendorDetails.gstNo || "",
          aadharNo: vendorDetails.aadharNo || "",
          status: vendorDetails.status || "Active"
        });

        // Fetch bank accounts
        await fetchVendorBanks(vendor.id);
        setShowModal(true);
      } else {
        toast.error("Failed to fetch vendor details");
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendor details");
    }
  };

  // Open modal for viewing vendor - UPDATED to use /get/{id}
  const openViewModal = async (vendor) => {
    try {
      // Fetch vendor details using /get/{id} endpoint
      const vendorDetails = await fetchVendorDetailsById(vendor.id);
     
      if (vendorDetails) {
        setEditingVendor(vendorDetails);
        setIsViewMode(true);
       
        setFormData({
          vendorName: vendorDetails.vendorName || "",
          address1: vendorDetails.address1 || "",
          address2: vendorDetails.address2 || "",
          selectState: vendorDetails.selectState || "",
          city: vendorDetails.city || "",
          pincode: vendorDetails.pincode || "",
          phone: vendorDetails.phone || "",
          mobile: vendorDetails.mobile || "",
          email: vendorDetails.email || "",
          panNo: vendorDetails.panNo || "",
          gstNo: vendorDetails.gstNo || "",
          aadharNo: vendorDetails.aadharNo || "",
          status: vendorDetails.status || "Active"
        });

        // Fetch bank accounts
        await fetchVendorBanks(vendor.id);
        setShowModal(true);
      } else {
        toast.error("Failed to fetch vendor details");
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendor details");
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setIsViewMode(false);
    setBankAccounts([]);
  };

  // Bank Account Functions
  const openBankModal = (bank = null) => {
    setEditingBank(bank);
    setBankFormData(bank ? {
      bankName: bank.bankName || "",
      accountNo: bank.accountNo || "",
      branchName: bank.branchName || "",
      routingNo: bank.routingNo || "",
      accountType: bank.accountType || "Savings",
      status: bank.status || "Active"
    } : {
      bankName: "",
      accountNo: "",
      branchName: "",
      routingNo: "",
      accountType: "Savings",
      status: "Active"
    });
    setShowBankModal(true);
  };

  const closeBankModal = () => {
    setShowBankModal(false);
    setEditingBank(null);
    setBankFormData({
      bankName: "",
      accountNo: "",
      branchName: "",
      routingNo: "",
      accountType: "Savings",
      status: "Active"
    });
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankFormData({
      ...bankFormData,
      [name]: value
    });
  };

  // Add or update bank account
  const handleAddBankAccount = async () => {
    if (!editingVendor) {
      toast.error("Please save vendor first");
      return;
    }

    // Basic validation
    if (!bankFormData.bankName || !bankFormData.accountNo) {
      toast.error("Bank Name and Account No are required");
      return;
    }

    try {
      if (editingBank) {
        // Update existing bank account
        const response = await api.put(`/updateBank/${editingBank.id}`, bankFormData);
        
        if (response.status === 200) {
          const responseData = response.data;
          toast.success(responseData.message || 'Bank account updated successfully');
          // Refresh bank accounts
          await fetchVendorBanks(editingVendor.id);
          closeBankModal();
        } else {
          toast.error(response.data.message || 'Failed to update bank account');
        }
      } else {
        // Add new bank account
        const response = await api.post(`/addBank/${editingVendor.id}`, [bankFormData]);
        
        if (response.status === 200) {
          const responseData = response.data;
          toast.success(responseData.message || 'Bank account added successfully');
          // Refresh bank accounts
          await fetchVendorBanks(editingVendor.id);
          closeBankModal();
        } else {
          toast.error(response.data.message || 'Failed to add bank account');
        }
      }
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error(error.response?.data?.message || 'Failed to save bank account');
    }
  };

  // Delete bank account
  const handleDeleteBankAccount = async (bankId) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) {
      return;
    }

    try {
      const response = await api.delete(`/deleteBank/${bankId}`);
      
      if (response.status === 200) {
        const responseData = response.data;
        toast.success(responseData.message || 'Bank account deleted successfully');
        // Refresh bank accounts
        await fetchVendorBanks(editingVendor.id);
      } else {
        toast.error(response.data.message || 'Failed to delete bank account');
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bank account');
    }
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
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission (create/update vendor)
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!formData.vendorName) {
      toast.error("Vendor Name is required", { position: 'top-right' });
      return;
    }

    try {
      if (editingVendor) {
        // Update existing vendor
        const response = await api.put(`/update/${editingVendor.id}`, formData);
       
        if (response.status === 200) {
          const responseData = response.data;
          toast.success(responseData.message || 'Vendor updated successfully', { position: 'top-right' });
          fetchVendors();
          // Fetch vendor details again using /get/{id}
          const updatedVendor = await fetchVendorDetailsById(editingVendor.id);
          if (updatedVendor) {
            setEditingVendor(updatedVendor);
          }
          // Fetch bank accounts again after update
          await fetchVendorBanks(editingVendor.id);
        } else {
          toast.error(response.data.message || 'Failed to update vendor', { position: 'top-right' });
        }
      } else {
        // Create new vendor
        const response = await api.post('/create', formData);
       
        if (response.status === 200) {
          const responseData = response.data;
          
          // Extract vendor ID from response
          let newVendorId = null;
          
          if (responseData && responseData.data && responseData.data.id) {
            newVendorId = responseData.data.id;
          } else if (responseData && responseData.id) {
            newVendorId = responseData.id;
          } else if (responseData.message && responseData.message.includes('created successfully')) {
            const match = responseData.message.match(/\d+/);
            if (match) {
              newVendorId = parseInt(match[0]);
            }
          }

          if (newVendorId) {
            // Set as editing vendor to enable bank account management
            setEditingVendor({ id: newVendorId });
            // Fetch vendor details using /get/{id}
            const newVendorDetails = await fetchVendorDetailsById(newVendorId);
            if (newVendorDetails) {
              setEditingVendor(newVendorDetails);
            }
            // Fetch bank accounts for the new vendor
            await fetchVendorBanks(newVendorId);
          }
          
          toast.success(responseData.message || 'Vendor added successfully', { position: 'top-right' });
          fetchVendors();
        } else {
          toast.error(response.data.message || 'Failed to add vendor', { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(error.response?.data?.message || 'Failed to save vendor', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!vendors || vendors.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = vendors.map((vendor, index) => ({
      "Sr No": index + 1,
      "Vendor Name": vendor.vendorName || "",
      "Address 1": vendor.address1 || "",
      "Address 2": vendor.address2 || "",
      "City": vendor.city || "",
      "State": vendor.selectState || "",
      "Pincode": vendor.pincode || "",
      "Mobile": vendor.mobile || "",
      "Phone": vendor.phone || "",
      "Email": vendor.email || "",
      "PAN No": vendor.panNo || "",
      "GST No": vendor.gstNo || "",
      "Aadhar No": vendor.aadharNo || "",
      "Status": vendor.status || "Active"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `Vendor_Master_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle vendor deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      const response = await api.delete(`/delete/${id}`);
      if (response.status === 200) {
        const responseData = response.data;
        toast.success(responseData.message || 'Vendor deleted successfully', {
          position: 'top-right',
        });
        fetchVendors();
      } else {
        toast.error(response.data.message || 'Failed to delete vendor', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(error.response?.data?.message || 'Failed to delete vendor', { position: 'top-right' });
    }
  };

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((vendor) => {
    const search = searchTerm.toLowerCase();
   
    return (
      (vendor.vendorName && vendor.vendorName.toLowerCase().includes(search)) ||
      (vendor.city && vendor.city.toLowerCase().includes(search)) ||
      (vendor.selectState && vendor.selectState.toLowerCase().includes(search)) ||
      (vendor.email && vendor.email.toLowerCase().includes(search)) ||
      (vendor.gstNo && vendor.gstNo.toLowerCase().includes(search)) ||
      (vendor.panNo && vendor.panNo.toLowerCase().includes(search)) ||
      (vendor.mobile && vendor.mobile.toString().includes(search))
    );
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
    bankBtn: {
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
      maxWidth: '900px',
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
    },
    bankTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px'
    },
    bankHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    bankAccountCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    bankAccountHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    bankAccountName: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '16px'
    },
    bankAccountDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '10px',
      marginBottom: '10px'
    },
    bankDetailItem: {
      display: 'flex',
      flexDirection: 'column'
    },
    bankDetailLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px'
    },
    bankDetailValue: {
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
     
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Vendor Master Management</h1>
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
              Add Vendor
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Vendors ({filteredVendors.length})</div>
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
                  <th style={styles.th}>Vendor Name</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>State</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>GST No</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length > 0 ? filteredVendors.map((vendor, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === vendor.id;

                  return (
                    <tr
                      key={vendor.id}
                      style={{
                        ...styles.tr,
                        backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                      }}
                      onMouseEnter={() => setHoveredRow(vendor.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{vendor.vendorName || ""}</td>
                      <td style={styles.td}>{vendor.city || ""}</td>
                      <td style={styles.td}>{vendor.selectState || ""}</td>
                      <td style={styles.td}>{vendor.mobile || ""}</td>
                      <td style={styles.td}>{vendor.email || ""}</td>
                      <td style={styles.td}>{vendor.gstNo || ""}</td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={{ ...styles.actionBtn, ...styles.editBtn }}
                            title="Edit"
                            onClick={() => openEditModal(vendor)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.viewBtn }}
                            title="View"
                            onClick={() => openViewModal(vendor)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.docBtn }}
                            title="Documents"
                            onClick={() => openDocumentModal(vendor)}
                          >
                            <i className="fas fa-file-alt"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                            title="Delete"
                            onClick={() => handleDelete(vendor.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" style={{ ...styles.td, textAlign: "center", padding: "30px" }}>
                      No vendors found.
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
                {isViewMode ? 'View Vendor Details' : (editingVendor ? 'Edit Vendor' : 'Add New Vendor')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {editingVendor && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="id">Vendor ID</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={editingVendor.id}
                      style={styles.formControl}
                      disabled={true}
                    />
                  </div>
                )}
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel} htmlFor="vendorName">Vendor Name *</label>
                  <input
                    type="text"
                    id="vendorName"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleInputChange}
                    style={styles.formControl}
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Address Information</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="address1"
                        name="address1"
                        placeholder="Address Line 1"
                        value={formData.address1}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="address2"
                        name="address2"
                        placeholder="Address Line 2"
                        value={formData.address2}
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
                        id="selectState"
                        name="selectState"
                        placeholder="State"
                        value={formData.selectState}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
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
                        id="pincode"
                        name="pincode"
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Contact Information</label>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleNumberChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="mobile"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={formData.mobile}
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
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Tax Information</label>
                  <div style={styles.formRow}>
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
                  </div>
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <input
                        type="text"
                        id="aadharNo"
                        name="aadharNo"
                        placeholder="Aadhar Number"
                        value={formData.aadharNo}
                        onChange={handleInputChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                      />
                    </div>
                    <div style={styles.formCol}>
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
                  </div>
                </div>
              </form>
              
              <div style={{marginTop: '30px'}}>
                <div style={styles.bankHeader}>
                  <h4 style={styles.docTitle}>
                    Bank Accounts
                    <span style={{fontSize: '14px', color: '#64748b', marginLeft: '10px'}}>
                      (Active: {bankAccounts.filter(b => b.status === 'Active').length}, 
                      Total: {bankAccounts.length})
                    </span>
                  </h4>
                  {!isViewMode && editingVendor && (
                    <button
                      style={{...styles.btn, ...styles.btnSuccess}}
                      onClick={() => openBankModal()}
                    >
                      <i className="fas fa-plus"></i> Add Bank Account
                    </button>
                  )}
                </div>
                
                {bankAccounts.length > 0 ? (
                  <div>
                    {bankAccounts.map((bank, index) => (
                      <div key={bank.id || index} style={styles.bankAccountCard}>
                        <div style={styles.bankAccountHeader}>
                          <div style={styles.bankAccountName}>
                            {bank.bankName}
                            <span style={{
                              ...styles.statusBadge,
                              ...(bank.status === 'Active' ? styles.statusActive : styles.statusInactive),
                              marginLeft: '10px',
                              fontSize: '12px'
                            }}>
                              {bank.status}
                            </span>
                          </div>
                          <div style={styles.actionButtons}>
                            {!isViewMode && (
                              <>
                                <button
                                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                                  title="Edit"
                                  onClick={() => openBankModal(bank)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                                  title="Delete"
                                  onClick={() => handleDeleteBankAccount(bank.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div style={styles.bankAccountDetails}>
                          <div style={styles.bankDetailItem}>
                            <span style={styles.bankDetailLabel}>Account Number</span>
                            <span style={styles.bankDetailValue}>{bank.accountNo}</span>
                          </div>
                          <div style={styles.bankDetailItem}>
                            <span style={styles.bankDetailLabel}>Branch</span>
                            <span style={styles.bankDetailValue}>{bank.branchName || "N/A"}</span>
                          </div>
                          <div style={styles.bankDetailItem}>
                            <span style={styles.bankDetailLabel}>Account Type</span>
                            <span style={styles.bankDetailValue}>{bank.accountType || "Savings"}</span>
                          </div>
                          {bank.routingNo && (
                            <div style={styles.bankDetailItem}>
                              <span style={styles.bankDetailLabel}>Routing No</span>
                              <span style={styles.bankDetailValue}>{bank.routingNo}</span>
                            </div>
                          )}
                        </div>
                        
                        {bank.updatedAt && (
                          <div style={{fontSize: '12px', color: '#64748b', textAlign: 'right'}}>
                            Updated: {new Date(bank.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                    <i className="fas fa-university" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                    <p>No bank accounts found for this vendor.</p>
                    {!isViewMode && editingVendor && (
                      <p>Click "Add Bank Account" to add a new bank account.</p>
                    )}
                  </div>
                )}
              </div>
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

      {/* Bank Account Modal */}
      {showBankModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button style={styles.modalClose} onClick={closeBankModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={(e) => { e.preventDefault(); handleAddBankAccount(); }}>
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Bank Name *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={bankFormData.bankName}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Account Number *</label>
                      <input
                        type="text"
                        name="accountNo"
                        value={bankFormData.accountNo}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Branch Name</label>
                      <input
                        type="text"
                        name="branchName"
                        value={bankFormData.branchName}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                      />
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Account Type</label>
                      <select
                        name="accountType"
                        value={bankFormData.accountType}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                      >
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Salary">Salary</option>
                        <option value="NRI">NRI</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Routing No</label>
                      <input
                        type="text"
                        name="routingNo"
                        value={bankFormData.routingNo}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                      />
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Status</label>
                      <select
                        name="status"
                        value={bankFormData.status}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={closeBankModal}
              >
                Cancel
              </button>
              <button
                style={{...styles.btn, ...styles.btnPrimary}}
                onClick={handleAddBankAccount}
              >
                {editingBank ? 'Update Bank Account' : 'Save Bank Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocModal && (
        <div style={styles.modal}>
          <div style={styles.docModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Vendor Documents</h3>
              <button style={styles.modalClose} onClick={closeDocModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.uploadSection}>
                <h4 style={styles.docTitle}>Upload Documents</h4>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Document Name</label>
                  <input
                    type="text"
                    placeholder="Enter document name (e.g., PAN Card, GST Certificate, Agreement, etc.)"
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

              <div style={styles.documentsSection}>
                <h4 style={styles.docTitle}>Uploaded Documents</h4>
                
                {vendorDocuments.length > 0 ? (
                  <div style={styles.docGrid}>
                    {vendorDocuments.map((doc) => {
                      const filePath = doc.filePath || '';
                      const isImage = filePath.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
                      const isPdf = filePath.match(/\.pdf$/i);
                      
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
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                                input.onchange = (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleUpdateDocument(doc.id, file);
                                  }
                                };
                                input.click();
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

export default VendorMasterManagement;

