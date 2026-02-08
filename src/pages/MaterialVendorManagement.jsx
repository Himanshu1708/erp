import React, { useState, useEffect, useRef } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/logo.png";

const MaterialVendorManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  //added
  const [loggedInUser, setLoggedInUser] = useState("");
  
  // Document related states
  const [selectedItem, setSelectedItem] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const [materialDocuments, setMaterialDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  
  //added
  const [previewFiles, setPreviewFiles] = useState([]);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editDocName, setEditDocName] = useState("");
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [editDocFile, setEditDocFile] = useState(null);

  //added
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // NEW: State for vendor materials
  const [vendorMaterials, setVendorMaterials] = useState([]);
  const [vendorMaterialsLoading, setVendorMaterialsLoading] = useState(false);

  //added
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  //added
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  //added 
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Add state for subcategories
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  // State for material items
  const [materialItems, setMaterialItems] = useState([]);
  // State for royalty visibility
  const [showRoyaltyFields, setShowRoyaltyFields] = useState(false);
  // State for attachments
  const [attachments, setAttachments] = useState([]);
  // State for calendar popup visibility
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showMMRDatePicker, setShowMMRDatePicker] = useState(false);
  // State for attachment preview
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  //added
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);

  // State for document upload fields
  const [documentFields, setDocumentFields] = useState([
    { id: 1, name: 'MATERIAL - PHOTO', file: null, preview: null },
    { id: 2, name: 'ROYALTY PHOTO', file: null, preview: null },
    { id: 3, name: 'SUPPLIER SLIP', file: null, preview: null }
  ]);
  
  // State for image preview modal
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  
  // Refs for date input elements
  const invoiceDateRef = useRef(null);
  const mmrDateRef = useRef(null);
  const fileInputRef = useRef(null);

  // NEW: State for PDF viewer modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // NEW: State to track if item has been saved
  const [itemSaved, setItemSaved] = useState(false);
  
  // NEW: State for form step (1: Item Details, 2: Documents)
  const [currentStep, setCurrentStep] = useState(1);

  // State for form data - Updated with new fields
  const [formData, setFormData] = useState({
    // MMR Details
    project: "",
    location: "",   // ✅ ADD
    store: "",
    vendor: "",
    inward_no: "",
    vehicle_no: "",
    vendor_representative: "",
    invoice_no: "",
    invoice_date: "",
    mmr_date: new Date().toISOString().split('T')[0], // Set current date by default
    remark: "",
    status: "",

    
    // Material Details (for the first item)
    item_name: "",
    unit: "",
    category: "",
    subcategory: "",
    gst_rate: "",
    rate: "",
    royalty: "no",
    anukramak_no: "",
    etp_no: "",
    royalty_qty: "",
    specification: "",
    rec_qty: "",
    less_amount: "",
    total_amount: "", // Added total_amount field

    addedBy: "",
    
    // Attachment
    attachment: null
    
  });

  // Style definitions (Same as requested reference code)
 const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#1e293b', lineHeight: '1.6' },
  sidebar: { width: '260px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '20px 0', transition: 'all 0.3s ease' },
  logo: { display: 'flex', alignItems: 'center', padding: '0 20px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' },
  logoIcon: { fontSize: '24px', color: '#1e40af', marginRight: '10px' },
  logoText: { fontSize: '20px', fontWeight: '700', color: '#1e40af' },
  menu: { listStyle: 'none' },
  menuItem: { marginBottom: '5px' },
  menuLink: { display: 'flex', alignItems: 'center', padding: '12px 20px', color: '#64748b', textDecoration: 'none', transition: 'all 0.2s ease' },
  menuLinkActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  menuIcon: { marginRight: '10px', width: '20px', textAlign: 'center' },
  mainContent: { flex: '1', padding: '30px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  headerTitle: { fontSize: '28px', fontWeight: '700', color: '#1e293b' },
  headerActions: { display: 'flex', gap: '15px' },
  btn: { padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  btnPrimary: { backgroundColor: '#1e40af', color: '#ffffff' },
  btnSecondary: { backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0' },
  btnSuccess: { backgroundColor: '#10b981', color: '#ffffff' },
  btnWarning: { backgroundColor: '#f59e0b', color: '#ffffff' },
  tableContainer: { backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden' },
  tableHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tableTitle: { fontSize: '20px', fontWeight: '600' },
  tableActions: { display: 'flex', gap: '10px' },
  searchBox: { position: 'relative' },
  searchInput: { padding: '8px 15px 8px 40px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '250px', fontFamily: 'inherit' },
  searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#dbeafe', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '15px', borderBottom: '1px solid #e2e8f0' },
  tr: { transition: 'background-color 0.2s ease' },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#f8fafc' },
  trHover: { backgroundColor: '#e2e8f0' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', display: 'inline-block' },
  statusActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  statusInactive: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  actionButtons: { display: 'flex', gap: '8px' },
  actionBtn: { width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
  actionBtnHover: { backgroundColor: '#3b82f6', color: '#ffffff' },
  editBtn: { color: '#16a34a' },
  viewBtn: { color: '#eab308' },
  deleteBtn: { color: '#dc2626' },
  docBtn: { color: '#8b5cf6' },
  pdfBtn: { color: '#ef4444' },
  modal: { display: 'flex', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '1000', alignItems: 'center', justifyContent: 'center' },
  modalContent: { backgroundColor: '#ffffff', borderRadius: '10px', width: '95%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  docModalContent: { backgroundColor: '#ffffff', borderRadius: '10px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  pdfModalContent: { backgroundColor: '#ffffff', borderRadius: '10px', width: '95%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '20px', fontWeight: '600' },
  modalClose: { background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' },
  modalBody: { padding: '20px' },
  formSection: { marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' },
  formGroup: { marginBottom: '20px' },
  formLabel: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' },
  formControl: { width: '100%', height: '40px', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit', fontSize: '14px', backgroundColor: '#ffffff', appearance: 'none', color: "#0f172a", WebkitAppearance: 'none', MozAppearance: 'none' },
  formControlDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' },
  selectWrapper: { position: 'relative' },
  selectArrow: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' },
  dateInputWrapper: { position: 'relative', width: '100%' },
  dateIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', cursor: 'pointer', pointerEvents: 'auto' },
  modalFooter: { padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  loadingSpinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' },
  materialItem: { display: 'flex', gap: '10px', marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' },
  materialItemFields: { display: 'flex', gap: '10px', flex: '1' },
  removeMaterialBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '4px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', cursor: 'pointer' },
  fileInput: { display: 'none' },
  fileLabel: { display: 'inline-flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' },
  fileLabelHover: { backgroundColor: '#f1f5f9', borderColor: '#94a3b8' },
  attachmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' },
  attachmentCard: { position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'all 0.3s ease', cursor: 'pointer', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '16px' },
  attachmentCardHover: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', transform: 'translateY(-2px)' },
  attachmentThumbnail: { width: '100%', height: '120px', objectFit: 'cover', backgroundColor: '#f8fafc', borderRadius: '6px' },
  attachmentInfo: { padding: '10px 0' },
  attachmentName: { fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  attachmentSize: { fontSize: '12px', color: '#64748b' },
  attachmentActions: { position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px', opacity: '0', transition: 'opacity 0.3s ease' },
  attachmentCardHoverActions: { opacity: '1' },
  attachmentActionBtn: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
  attachmentActionBtnHover: { backgroundColor: '#ffffff', transform: 'scale(1.1)' },
  previewModal: { display: 'flex', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: '2000', alignItems: 'center', justifyContent: 'center' },
  previewContent: { maxWidth: '90%', maxHeight: '90%', position: 'relative' },
  previewImage: { maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' },
  previewClose: { position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', fontSize: '30px', color: '#ffffff', cursor: 'pointer' },
  docIconContainer: { width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '6px' },
  docIcon: { fontSize: '48px', color: '#64748b' },
  docActions: { display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' },
  documentCard: { border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', marginBottom: '20px', transition: 'all 0.3s ease' },
  documentCardHover: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)', transform: 'translateY(-3px)' },
  documentsSection: { marginTop: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' },
  docTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1e293b' },
  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' },
  docCard: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
  docHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  docName: { fontWeight: '500', color: '#1e293b' },
  docDate: { fontSize: '12px', color: '#64748b' },
  docPreview: { height: '100px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' },
  docActions: { display: 'flex', gap: '8px' },
  docActionBtn: { flex: 1, padding: '6px 12px', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
  uploadSection: { padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px dashed #d1d5db', marginTop: '20px' },
  formRow: { display: 'flex', gap: '15px' },
  formCol: { flex: 1 },
  pdfViewerContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  pdfHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  pdfTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b' },
  pdfActions: { display: 'flex', gap: '10px' },
  pdfContent: { display: 'flex', gap: '20px' },
  pdfImageContainer: { flex: '1', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' },
  pdfImage: { width: '100%', height: 'auto', borderRadius: '4px' },
  headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
  pdfDataContainer: { flex: '1', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: '#ffffff' },
  pdfDataSection: { marginBottom: '20px' },
  pdfDataSectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' },
  pdfDataRow: { display: 'flex', marginBottom: '8px' },
  pdfDataLabel: { width: '150px', fontWeight: '500', color: '#475569' },
  pdfDataValue: { flex: 1, color: '#1e293b' },
  pdfTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  pdfTableHeader: { backgroundColor: '#f1f5f9', padding: '8px', textAlign: 'left', fontWeight: '500', color: '#334155', borderBottom: '1px solid #e2e8f0' },
  pdfTableCell: { padding: '8px', borderBottom: '1px solid #e2e8f0' },
  pdfDocument: { width: '100%', backgroundColor: 'white', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', border: '1px solid #ddd', borderRadius: '8px' },
  pdfDocumentHeader: { textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' },
  pdfDocumentTitle: { fontSize: '18px', fontWeight: 'bold', margin: '0' },
  pdfDocumentSubTitle: { fontSize: '14px', margin: '5px 0 0' },
  pdfDocumentSection: { marginBottom: '20px' },
  pdfDocumentSectionTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
  pdfDocumentRow: { display: 'flex', marginBottom: '5px' },
  pdfDocumentLabel: { width: '150px', fontWeight: 'bold' },
  pdfDocumentValue: { flex: 1 },
  pdfDocumentTable: { width: '100%', borderCollapse: 'collapse', margin: '10px 0' },
  pdfDocumentTableHeader: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f5f5f5' },
  pdfDocumentTableCell: { border: '1px solid #ddd', padding: '8px' },
  pdfDocumentFooter: { marginTop: '30px', borderTop: '1px solid #ddd', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' },
  documentUploadTable: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  documentUploadTableHeader: { backgroundColor: '#dbeafe', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' },
  documentUploadTableCell: { padding: '12px', borderBottom: '1px solid #e2e8f0' },
  documentUploadTableRow: { transition: 'background-color 0.2s ease' },
  documentUploadTableRowEven: { backgroundColor: '#ffffff' },
  documentUploadTableRowOdd: { backgroundColor: '#f8fafc' },
  documentUploadTableRowHover: { backgroundColor: '#e2e8f0' },
  documentSelectButton: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', marginRight: '8px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  documentCameraButton: { backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  documentPreview: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0', cursor: 'pointer' },
  documentPlaceholder: { width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' },
  addDocumentButton: { backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', marginTop: '10px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  removeDocumentButton: { backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  imagePreviewModal: { display: 'flex', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: '2000', alignItems: 'center', justifyContent: 'center' },
  imagePreviewContent: { maxWidth: '90%', maxHeight: '90%', position: 'relative' },
  imagePreviewClose: { position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', fontSize: '30px', color: '#ffffff', cursor: 'pointer' },
  imagePreviewImg: { maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' },
  photoUploadContainer: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc' },
  photoPreview: { position: 'relative', width: '100%', height: '150px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' },
  photoImage: { width: '100%', height: '100%', objectFit: 'cover' },
  photoActions: { position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '5px', opacity: 0, transition: 'opacity 0.3s ease' },
  photoActionBtn: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  photoPlaceholder: { width: '100%', height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '6px', marginBottom: '10px', color: '#64748b' },
  photoIcon: { fontSize: '36px', marginBottom: '10px' },
  photoButtons: { display: 'flex', gap: '10px' },
  photoButton: { flex: 1, padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px' },
  documentTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  documentTableHeader: { backgroundColor: '#dbeafe', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' },
  documentTableCell: { padding: '12px', borderBottom: '1px solid #e2e8f0' },
  documentTableRow: { transition: 'background-color 0.2s ease' },
  documentTableRowEven: { backgroundColor: '#ffffff' },
  documentTableRowOdd: { backgroundColor: '#f8fafc' },
  documentTableRowHover: { backgroundColor: '#e2e8f0' },
  documentActionsCell: { width: '120px' },
  documentActionIcon: { cursor: 'pointer', margin: '0 5px', fontSize: '16px' },
  documentViewIcon: { color: '#3b82f6' },
  documentDownloadIcon: { color: '#10b981' },
  documentEditIcon: { color: '#f59e0b' },
  documentDeleteIcon: { color: '#ef4444' },
  saveItemButtonContainer: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  stepIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative' },
  stepContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '600px' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepNumber: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px', marginBottom: '8px', transition: 'all 0.3s ease', zIndex: 2 },
  stepNumberActive: { backgroundColor: '#1e40af', color: '#ffffff', boxShadow: '0 4px 6px rgba(30, 64, 175, 0.3)' },
  stepNumberInactive: { backgroundColor: '#e2e8f0', color: '#64748b' },
  stepNumberCompleted: { backgroundColor: '#10b981', color: '#ffffff', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' },
  stepLabel: { fontSize: '14px', fontWeight: '500', color: '#64748b', textAlign: 'center' },
  stepLabelActive: { color: '#1e40af', fontWeight: '600' },
  stepLabelCompleted: { color: '#10b981', fontWeight: '600' },
  stepConnector: { position: 'absolute', top: '20px', left: '50%', right: '-50%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 1 },
  stepConnectorActive: { backgroundColor: '#1e40af' },
  stepConnectorCompleted: { backgroundColor: '#10b981' },
  stepContent: { display: 'block' },
  stepContentHidden: { display: 'none' },
  documentsMessage: { marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0369a1', textAlign: 'center', fontSize: '14px', fontWeight: '500' },
  materialItemSection: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f8fafc' },
  materialItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  materialItemTitle: { fontSize: '16px', fontWeight: '600', color: '#1e40af' },
  addMaterialButton: { backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' },
  addMaterialButtonHover: { backgroundColor: '#059669' }
};

  // API base URL
//   const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
//   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pharma2.shop';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("VITE_BACKEND_URL is not defined");
}

const API_BASE_URL = `${BACKEND_URL}/api`;


  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
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

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchProjects();
    fetchVendors();
    fetchMaterials(); 
    fetchUnits();    // ✅ ADD THIS
      fetchStores();
  }, []);

  //added
  useEffect(() => {
  const user = getUserFromToken();

  if (user) {
    // adjust field name based on backend
    setLoggedInUser(
      user.name ||
      user.fullName ||
      user.username ||
      user.sub ||
      "—"
    );
  }
}, []);


  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    } else {
      setSubcategories([]);
    }
  }, [formData.category]);

  // When vendor changes, fetch vendor materials and clear material selection
  useEffect(() => {
    if (formData.vendor) {
      fetchMaterialsByVendor(formData.vendor);
    } else {
      setVendorMaterials([]);
      // Clear material selection if vendor is cleared
      setFormData(prev => ({
        ...prev,
        item_name: "",
        unit: "",
        category: "",
        subcategory: "",
        gst_rate: ""
      }));
    }
  }, [formData.vendor]);


  //fetch store
  const fetchStores = async () => {
  try {
    setStoresLoading(true);

    const response = await api.get("/store/getStore"); 
    // ⚠️ baseURL = /api, isliye full path = /api/store/getStore

    if (Array.isArray(response.data)) {
      setStores(response.data);
    } else {
      setStores([]);
    }
  } catch (error) {
    console.error("Store fetch error:", error);
    setStores([]);
    toast.error("Failed to fetch stores");
  } finally {
    setStoresLoading(false);
  }
};


  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/materials/getall");
      
      if (response.status === 200) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setItems(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setItems(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadImageBase64 = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          console.warn("Canvas conversion failed:", error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.warn("Image load failed:", src);
        resolve(null);
      };
      
      img.src = src;
    });
  };

  //fetch project 
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);

      const response = await api.get("/project/getProjects");

      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Project fetch error:", error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  //fetch category 
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await api.get("/category/getAllCate");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error.response || error);
      setCategories([]);
      toast.error("Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  //fetch subcategories 
  const fetchSubcategories = async (categoryName) => {
    try {
      setSubcategoriesLoading(true);

      const response = await api.get("/category/getAllSubCate", {
        params: { category: categoryName }
      });

      if (Array.isArray(response.data)) {
        setSubcategories(response.data);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error(error);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  //fetch vendor
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);

      const response = await api.get("/vendor/all");

      // because backend returns Response wrapper
      if (response.data && Array.isArray(response.data.data)) {
        setVendors(response.data.data);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Vendor fetch error:", error);
      setVendors([]);
      toast.error("Failed to fetch vendors");
    } finally {
      setVendorsLoading(false);
    }
  };

// Fetch materials by vendor
const fetchMaterialsByVendor = async (vendorName) => {
  try {
    setVendorMaterialsLoading(true);
    
    const encodedVendor = encodeURIComponent(vendorName);

    const response = await api.get(
      `/vmaterial/getMaterialByVendor/${encodedVendor}`
    );

    if (Array.isArray(response.data)) {
      setVendorMaterials(response.data);
      toast.success(`Found ${response.data.length} materials for ${vendorName}`);
    } else if (response.data && Array.isArray(response.data.data)) {
      setVendorMaterials(response.data.data);
      toast.success(`Found ${response.data.data.length} materials for ${vendorName}`);
    } else {
      setVendorMaterials([]);
      toast.info(`No materials found for ${vendorName}`);
    }
  } catch (error) {
    console.error("Error fetching vendor materials:", error);
    setVendorMaterials([]);
    toast.error("Failed to fetch vendor materials");
  } finally {
    setVendorMaterialsLoading(false);
  }
};

  //added new
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));

      return decoded;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  //fetch material
  const fetchMaterials = async () => {
    try {
      setMaterialsLoading(true);

      const response = await api.get("/items/getItems");

      if (Array.isArray(response.data)) {
        setMaterials(response.data);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error("Material fetch error:", error);
      setMaterials([]);
      toast.error("Failed to fetch materials");
    } finally {
      setMaterialsLoading(false);
    }
  };

  //fetch units
  const fetchUnits = async () => {
    try {
      setUnitsLoading(true);

      const response = await api.get("/unit/getAllUnits"); 
      // ⚠️ path adjust karo agar controller mapping alag ho

      if (Array.isArray(response.data)) {
        setUnits(response.data);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Unit fetch error:", error);
      setUnits([]);
      toast.error("Failed to fetch units");
    } finally {
      setUnitsLoading(false);
    }
  };

  // Replace the existing fetchDocument function with this updated version
  const fetchDocument = async (filePath) => {
    try {
      if (!filePath) return getPlaceholderImage();

      const fullUrl = filePath.startsWith("http")
        ? filePath
        : filePath.startsWith("/")
        ? `${BACKEND_URL}${filePath}`
        : `${BACKEND_URL}/${filePath}`;

      // Get the authentication token
      const token = localStorage.getItem('token');
      
      // Create headers with authorization
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, { 
        headers,
        credentials: 'include' // Include credentials for cross-origin requests
      });

      if (!response.ok) throw new Error("Fetch failed");

      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (err) {
      console.error("Error fetching document:", err);
      return getPlaceholderImage();
    }
  };

  // Function to load all document images
  const loadDocumentImages = async (docList) => {
    const urls = {};

    for (const doc of docList) {
      const name = doc.docName || "";
      const path = doc.filePath || "";

      const isImage =
        name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
        path.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

      if (isImage) {
        try {
          const url = await fetchDocument(path);
          urls[doc.id] = url;
        } catch (err) {
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

  // Function to clear material selection
  const clearMaterialSelection = () => {
    setFormData(prev => ({
      ...prev,
      item_name: "",
      unit: "",
      category: "",
      subcategory: "",
      gst_rate: ""
    }));
  };

  // Handle file selection for upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    
    // Auto-generate document name from first file if not set
    if (!documentName && files.length > 0) {
      const fileName = files[0].name;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
      setDocumentName(nameWithoutExt);
    }
  };

  // ====== NUMBER TO WORDS FUNCTION ======
  const numberToWords = (num) => {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
      "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
      "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return "Zero Rupees Only";

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
      if (n < 100000)
        return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
      if (n < 10000000)
        return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
      return "";
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let words = numToWords(rupees) + " Rupees";
    
    if (paise > 0) {
      words += " and " + numToWords(paise) + " Paise";
    }
    
    words += " Only";
    return words;
  };

// ====== UPDATED PDF DOWNLOAD FUNCTION WITH SIMPLIFIED CALCULATIONS ======
const downloadMMRPdf = async (item) => {
  console.log("PDF Download triggered with item:", item); // Debug log
  
  if (!item) {
    toast.error("No data available for PDF generation");
    return;
  }

  try {
    // First fetch complete item data if needed
    let itemData = item;
    
    // Always fetch the complete item data to ensure we have all fields
    try {
      console.log("Fetching complete item data for PDF...");
      const response = await api.get(`/materials/getById/${item.id}`);
      
      if (response.status === 200) {
        let fetchedData = response.data;
        
        // If the response has a data property, use that
        if (response.data && response.data.data) {
          fetchedData = response.data.data;
        }
        
        console.log("Fetched item data for PDF:", fetchedData);
        // Merge the fetched data with the original item, giving priority to fetched data
        itemData = { ...item, ...fetchedData };
      }
    } catch (error) {
      console.error("Error fetching item data for PDF:", error);
      // Continue with existing item data
    }

    const doc = new jsPDF("p", "mm", "a4");
    
    // Make all text black
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    /* PAGE BORDER */
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    /* LOGO */
    try {
      const logoBase64 = await loadImageBase64(logo);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, 15, 30, 20);
      } else {
        doc.setFontSize(10);
        doc.text("H S TAGORE", 15, 25);
      }
    } catch (error) {
      console.warn("Logo error:", error);
      doc.setFontSize(10);
      doc.text("H S TAGORE", 15, 25);
    }

    /* HEADER */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      "H S TAGORE CONSTRUCTIONS ENGINEERS & CONTRACTORS",
      50,
      18
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "G-4, Girish Heights, L.I.C Square, Sadar, Nagpur - 440001",
      50,
      24
    );

    doc.line(15, 32, 195, 32);
    doc.setFontSize(11);
    doc.text("MMR", 105, 38, { align: "center" });

    /* EXTRACT DATA FROM ITEM */
    const pdfData = {
      // MMR Details
      mmrDate: itemData.mmrDate || itemData.mmr_date || "",
      mmrNo: itemData.id || itemData.mmrNo || itemData.mmr_no || "",
      project: itemData.project || "",
      store: itemData.store || itemData.project || "", // Use store if available, otherwise project
      vendor: itemData.vendor || "",
      invoiceNo: itemData.invoiceNo || itemData.invoice_no || "",
      invoiceDate: itemData.invoiceDate || itemData.invoice_date || "",
      inwardNo: itemData.inwardNo || itemData.inward_no || "",
      vehicleNo: itemData.vehicleNo || itemData.vehicle_no || "",
      remark: itemData.remark || "",
      vendorRepre: itemData.vendorRepre || itemData.vendor_representative || "",
      
      // Material Details
      materialName: itemData.materialName || itemData.item_name || itemData.material_name || "",
      unit: itemData.unit || "",
      recQty: parseFloat(itemData.recQty || itemData.rec_qty || 0),
      rate: parseFloat(itemData.rate || 0),
      gstRate: parseFloat(itemData.gst || itemData.gst_rate || 0),
      discount: parseFloat(itemData.lessAmt || itemData.less_amount || 0),
      totalAmt: parseFloat(itemData.totalAmt || itemData.total_amount || 0),
      
      // Royalty details
      royalty: itemData.royalty || "",
      royaltyQty: parseFloat(itemData.royaltyQty || itemData.royalty_qty || 0),
      royaltyRate: parseFloat(itemData.royaltyRate || 0),
      royaltyAmt: parseFloat(itemData.royaltyAmt || 0),
      royaltyGst: parseFloat(itemData.royaltyGst || 0),
      royaltyUnit: itemData.royaltyUnit || ""
    };

    console.log("PDF Data extracted:", pdfData); // Debug log

    /* CALCULATIONS */
    /* CALCULATIONS */
const qty = pdfData.recQty || 0;
const rate = pdfData.rate || 0;
const gstRate = pdfData.gstRate || 0;
const discount = pdfData.discount || 0;

// ✅ STEP 1: Apply GST to rate first
const rateWithGst = rate * (1 + gstRate / 100);

// ✅ STEP 2: Calculate amount with GST (Qty × Rate with GST)
const amountWithGst = qty * rateWithGst;

// ✅ STEP 3: Calculate amount after discount
const amountAfterDiscount = Math.max(amountWithGst - discount, 0);

// ✅ STEP 4: Calculate royalty amount with GST
const royaltyRate = pdfData.royaltyRate || 0;
const royaltyGstRate = pdfData.royaltyGst || 0;
const royaltyQty = pdfData.royaltyQty || 0;
const royaltyRateWithGst = royaltyRate * (1 + royaltyGstRate / 100);
const royaltyAmount = royaltyQty * royaltyRateWithGst;

// ✅ STEP 5: Calculate subtotal (material amount + royalty amount)
const subtotal = amountAfterDiscount + royaltyAmount;

    console.log("Calculations:", {
      qty, rate, discount,
      amountWithGst, amountAfterDiscount, royaltyAmount, subtotal
    }); // Debug log

    /* DETAILS TABLE */
    autoTable(doc, {
      startY: 42,
      theme: "grid",
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [0, 0, 0]
      },
      body: [
        ["MMR Date", pdfData.mmrDate || "", "MMR No", pdfData.mmrNo || ""],
        ["Store", pdfData.store || "", "Vendor", pdfData.vendor || ""],
        ["Invoice No", pdfData.invoiceNo || "", "Invoice Date", pdfData.invoiceDate || ""],
        ["Inward No", pdfData.inwardNo || "", "Vehicle No", pdfData.vehicleNo || ""],
        ["Remark", pdfData.remark || "", "", ""]
      ]
    });

    /* MATERIAL TABLE */
    const materialTableData = [
      [
        "1",
        pdfData.materialName || "",
        pdfData.unit || "NO",
        `${pdfData.gstRate.toFixed(2)}%`,
        discount.toFixed(2),
        qty.toFixed(3),
        rate.toFixed(2),
        amountAfterDiscount.toFixed(2)
      ]
    ];
    
    // Add royalty row if applicable
    if (pdfData.royalty && pdfData.royaltyQty > 0) {
      materialTableData.push([
        "2",
        "ROYALTY - " + (pdfData.materialName || ""),
        pdfData.royaltyUnit || "NO",
        `${pdfData.royaltyGst.toFixed(2)}%`,
        "0.00",
        pdfData.royaltyQty.toFixed(3),
        pdfData.royaltyRate.toFixed(2),
        pdfData.royaltyAmt.toFixed(2)
      ]);
    }

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 50) + 6,
      theme: "grid",
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold"
      },
      head: [[
        "Sr.No", "Item Description", "UOM", "GST %",
        "Discount", "Qty", "Rate", "Amount"
      ]],
      body: materialTableData
    });

    /* TOTAL BOX - DIRECT APPROACH TO FIX MMR AMOUNT */
    // Calculate the actual subtotal from the table data
    const calculatedSubtotal = materialTableData.reduce((sum, row) => sum + parseFloat(row[7]), 0);
    
    // Format to 2 decimal places
    const subtotalValue = calculatedSubtotal.toFixed(2);
    
    console.log("Final subtotal value:", subtotalValue); // Debug log

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      theme: "grid",
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 40 }
      },
      body: [
        ["Subtotal", subtotalValue],
        ["MMR Amount", subtotalValue] // ✅ FIXED: Removed ₹ symbol and used direct value
      ]
    });

    /* AMOUNT IN WORDS */
    const wordsY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Amount in Words:", 15, wordsY);
    doc.setFont("helvetica", "normal");
    
    // Use the exact same value for amount in words
    const amountWords = numberToWords(calculatedSubtotal);
    const maxWidth = 180;
    
    if (doc.getTextWidth(amountWords) > maxWidth) {
      // Split into two lines
      const wordsArray = amountWords.split(" ");
      let line1 = "";
      let line2 = "";
      let tempLine = "";
      
      for (let word of wordsArray) {
        if (doc.getTextWidth(tempLine + " " + word) < maxWidth) {
          tempLine += (tempLine ? " " : "") + word;
        } else {
          line1 = tempLine;
          line2 = word;
          // Add remaining words to line2
          const remainingIndex = wordsArray.indexOf(word) + 1;
          for (let i = remainingIndex; i < wordsArray.length; i++) {
            line2 += " " + wordsArray[i];
          }
          break;
        }
      }
      
      if (line1 && line2) {
        doc.text(line1, 15, wordsY + 5);
        doc.text(line2, 15, wordsY + 10);
      } else {
        doc.text(amountWords, 15, wordsY + 5);
      }
    } else {
      doc.text(amountWords, 15, wordsY + 5);
    }

    /* FOOTER SIGNATURES */
    const footerY = 260;
    doc.line(15, footerY, 95, footerY);
    doc.line(115, footerY, 195, footerY);

    doc.text(pdfData.vendorRepre || "-", 20, footerY + 6);
    doc.text("(Vendor Representative)", 35, footerY + 11);
    doc.text(loggedInUser || "-", 135, footerY + 6);
    doc.text("(Prepared By)", 150, footerY + 11);

    /* SAVE PDF */
    const fileName = `MMR_${pdfData.mmrNo || Date.now()}.pdf`;
    doc.save(fileName);
    toast.success("PDF downloaded successfully");

  } catch (err) {
    console.error("PDF download error:", err);
    toast.error("Failed to download PDF: " + err.message);
  }
};


  // Update the viewDocument function with this improved version
  const viewDocument = async (doc) => {
    if (!doc.filePath) {
      toast.error("No file path available");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Construct URL
      let documentUrl;
      if (doc.filePath.startsWith('http')) {
        documentUrl = doc.filePath;
      } else if (doc.filePath.startsWith('/')) {
        documentUrl = `${BACKEND_URL}${doc.filePath}`;
      } else {
        documentUrl = `${BACKEND_URL}/${doc.filePath}`;
      }

      // Fetch the document with authentication
      const response = await fetch(documentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Check file type
        const isImage = doc.docName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                       doc.filePath?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
        
        const isPdf = doc.docName?.match(/\.pdf$/i) ||
                     doc.filePath?.match(/\.pdf$/i);
        
        if (isImage) {
          // Open image in new tab
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${doc.docName || 'Document'}</title>
                <style>
                  body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; max-height: 90vh; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                </style>
              </head>
              <body>
                <img src="${url}" alt="${doc.docName || 'Document'}">
              </body>
              </html>
            `);
          }
        } else if (isPdf) {
          // For PDFs, use a more reliable approach
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>${doc.docName || 'PDF Document'}</title>
                <style>
                  body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
                  .pdf-container { width: 100%; height: 100vh; display: flex; flex-direction: column; }
                  .pdf-toolbar { padding: 10px; background: #333; color: white; display: flex; justify-content: space-between; }
                  .pdf-frame { flex: 1; width: 100%; border: none; }
                  .download-btn { background: #4CAF50; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
                </style>
              </head>
              <body>
                <div class="pdf-container">
                  <div class="pdf-toolbar">
                    <span>${doc.docName || 'PDF Document'}</span>
                    <button class="download-btn" onclick="downloadPdf()">Download</button>
                  </div>
                  <iframe class="pdf-frame" src="${url}"></iframe>
                </div>
                <script>
                  function downloadPdf() {
                    const a = document.createElement('a');
                    a.href = '${url}';
                    a.download = '${doc.docName || 'document.pdf'}';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                </script>
              </body>
              </html>
            `);
          }
        } else {
          // For other files (doc, docx, etc.), trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.docName || 'document';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        
        // Clean up the URL object after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        toast.error("Failed to load document");
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
      const token = localStorage.getItem('token');
      
      // Construct URL
      let documentUrl;
      if (doc.filePath.startsWith('http')) {
        documentUrl = doc.filePath;
      } else if (doc.filePath.startsWith('/')) {
        documentUrl = `${BACKEND_URL}${doc.filePath}`;
      } else {
        documentUrl = `${BACKEND_URL}/${doc.filePath}`;
      }

      // Fetch the document with authentication
      const response = await fetch(documentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.docName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL object
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
        toast.success("Document downloaded successfully");
      } else {
        toast.error("Failed to download document");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

// Delete document - UPDATED to refresh documents without closing modal
const handleDeleteDocument = async (docId) => {
  try {
    const response = await api.delete(`/materials/deleteDoc?id=${docId}`);
    
    if (response.status === 200) {
      toast.success(response.data.message || 'Document deleted successfully');
      
      // Clean up blob URL if exists
      if (imageUrls[docId]) {
        URL.revokeObjectURL(imageUrls[docId]);
        setImageUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[docId];
          return newUrls;
        });
      }
      
      // Refresh documents list - THIS IS THE KEY FIX
      await refreshDocuments();
    } else {
      toast.error(response.data.message || 'Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error(error.response?.data?.message || 'Failed to delete document');
  }
};

  // Function to refresh documents list
// Function to refresh documents list
const refreshDocuments = async () => {
  if (!editingItem?.id) return;
  
  try {
    setDocumentsLoading(true);
    const response = await api.get(`/materials/getById/${editingItem.id}`);

    if (response.status === 200) {
      let materialData = response.data?.data || response.data;

      let docs =
        materialData.documents ||
        materialData.materialDocuments ||
        materialData.docs ||
        [];

      if (!Array.isArray(docs)) docs = [];

      const mappedDocs = docs.map(doc => ({
        id: doc.id,
        docName: doc.fileName || doc.docName || "Document",
        filePath: doc.filePath,
        fileType: doc.fileType,
        createdAt: doc.createdAt || new Date().toISOString()
      }));

      setMaterialDocuments(mappedDocs);

      if (mappedDocs.length > 0) {
        loadDocumentImages(mappedDocs);
      }
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    setMaterialDocuments([]);
  } finally {
    setDocumentsLoading(false);
  }
};
  
  // Open edit document modal
  const openEditDocumentModal = (doc) => {
    setEditingDocument(doc);
    setEditDocName(doc.docName || "");
    setEditDocFile(null);
    setShowEditDocModal(true);
  };
  
  // Close edit document modal - UPDATED to refresh documents after closing
 // Close edit document modal - UPDATED to remove redundant document refresh
const closeEditDocumentModal = () => {
  setEditingDocument(null);
  setEditDocName("");
  setEditDocFile(null);
  setShowEditDocModal(false);
  // Removed the document refresh here as it's already handled in handleUpdateDocument
};
  
  // Handle file selection for edit
  const handleEditFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditDocFile(file);
    }
  };
  
// Update document - UPDATED to refresh documents after update
const handleUpdateDocument = async () => {
  if (!editingDocument) {
    toast.error("No document selected for editing");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('id', editingDocument.id);
    
    // Only include the file if a new one is selected
    if (editDocFile) {
      formData.append('file', editDocFile);
    }
    
    // Always include the document name
    if (editDocName && editDocName !== editingDocument.docName) {
      formData.append('docName', editDocName);
    }

    const response = await api.put('/materials/updateMatDoc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      toast.success(response.data.message || 'Document updated successfully');
      
      // Clean up blob URL if exists
      if (imageUrls[editingDocument.id]) {
        URL.revokeObjectURL(imageUrls[editingDocument.id]);
        setImageUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[editingDocument.id];
          return newUrls;
        });
      }
      
      // Close edit document modal
      closeEditDocumentModal();
      
      // Refresh documents list - THIS IS THE KEY FIX
      await refreshDocuments();
    } else {
      toast.error(response.data.message || 'Failed to update document');
    }
  } catch (error) {
    console.error('Error updating document:', error);
    toast.error(error.response?.data?.message || 'Failed to update document');
  }
};
  // Open modal for adding new item
 const openAddModal = () => {
  const today = new Date().toISOString().split('T')[0];

  setEditingItem(null);
  setIsViewMode(false);
  setItemSaved(false); // Reset item saved status
  setCurrentStep(1); // Start at step 1

  setFormData({
    // MMR Details
    project: "",
    location: "",
    store: "",
    vendor: "",
    inward_no: "",
    vehicle_no: "",
    vendor_representative: "",
    invoice_no: "",
    invoice_date: "",
    mmr_date: today,
    remark: "",

    // Material Details (for the first item)
    item_name: "",
    unit: "",
    category: "",
    subcategory: "",
    gst_rate: "",
    rate: "",
    royalty: "no",
    anukramak_no: "",
    etp_no: "",
    royalty_qty: "",
    specification: "",
    rec_qty: "",
    less_amount: "",
    total_amount: "",

    addedBy: loggedInUser,

    attachment: null
  });

  // Initialize with one material item
  setMaterialItems([{
    id: Date.now(), // temporary ID
    item_name: "",
    unit: "",
    category: "",
    subcategory: "",
    gst_rate: "",
    rate: "",
    royalty: "no",
    anukramak_no: "",
    etp_no: "",
    royalty_qty: "",
    specification: "",
    rec_qty: "",
    less_amount: "",
    showRoyaltyFields: false
  }]);

  setShowRoyaltyFields(false);
  setSubcategories([]);
  setAttachments([]);

  // ✅ Document state reset
  setMaterialDocuments([]);
  setUploadFiles([]);
  setDocumentName("");
  
  // Reset document fields
  setDocumentFields([
    { id: 1, name: 'MATERIAL - PHOTO', file: null, preview: null },
    { id: 2, name: 'ROYALTY PHOTO', file: null, preview: null },
    { id: 3, name: 'SUPPLIER SLIP', file: null, preview: null }
  ]);

  setShowModal(true);
};


// Open modal for editing item
const openEditModal = async (item) => {
  if (!item || item.id == null) {
    console.error("Edit clicked but item.id is missing", item);
    toast.error("Invalid item selected for edit");
    return;
  }

  setEditingItem({ ...item });
  setIsViewMode(false);
  setItemSaved(true); // Item is already saved in edit mode
  setCurrentStep(1); // Start at step 1

  setFormData({
    project: item.project || "",
    location: item.location || "",
    store: item.store || "",
    vendor: item.vendor || "",
    inward_no: item.inwardNo || "",
    vehicle_no: item.vehicleNo || "",
    vendor_representative: item.vendorRepre || "",
    invoice_no: item.invoiceNo || "",
    invoice_date: item.invoiceDate || "",
    mmr_date: item.mmrDate || new Date().toISOString().split("T")[0],
    remark: item.remark || "",
    status: item.status || "",

    item_name: item.materialName || item.material_name || "",
    unit: item.unit || "",
    category: item.category || "",
    subcategory: item.subcategory || "",
    gst_rate: item.gst ?? "",
    rate: item.rate ?? "",
    royalty: item.royalty || "no",
    anukramak_no: item.anukrmankNo || "",
    etp_no: item.etpNo || "",
    royalty_qty: item.royaltyQty ?? "",
    specification: item.specification || "",
    rec_qty: item.recQty ?? "",
    less_amount: item.lessAmt ?? "",
    total_amount: item.totalAmt ?? "",

    addedBy: item.addedBy || loggedInUser,
    attachment: null
  });

  // Initialize with one material item
  setMaterialItems([{
    id: Date.now(), // temporary ID
    item_name: item.materialName || item.material_name || "",
    unit: item.unit || "",
    category: item.category || "",
    subcategory: item.subcategory || "",
    gst_rate: item.gst ?? "",
    rate: item.rate ?? "",
    royalty: item.royalty || "no",
    anukramak_no: item.anukrmankNo || "",
    etp_no: item.etpNo || "",
    royalty_qty: item.royaltyQty ?? "",
    specification: item.specification || "",
    rec_qty: item.recQty ?? "",
    less_amount: item.lessAmt ?? "",
    showRoyaltyFields: item.royalty === "yes"
  }]);

  setShowRoyaltyFields(item.royalty === "yes");
  setAttachments([]);

  if (item.category) {
    fetchSubcategories(item.category);
  }

  // ✅ Load documents - THIS IS THE KEY FIX
  await refreshDocuments();

  // ✅ Reset upload state
  setUploadFiles([]);
  setDocumentName("");
  
  // Reset document fields
  setDocumentFields([
    { id: 1, name: 'MATERIAL - PHOTO', file: null, preview: null },
    { id: 2, name: 'ROYALTY PHOTO', file: null, preview: null },
    { id: 3, name: 'SUPPLIER SLIP', file: null, preview: null }
  ]);

  setShowModal(true);
};


// Open modal for viewing item
const openViewModal = async (item) => {
  setEditingItem(item);
  setIsViewMode(true);
  setItemSaved(true); // In view mode, item is already saved
  setCurrentStep(1); // Start at step 1

  setFormData({
    project: item.project || "",
    location: item.location || "",
    store: item.store || "",
    vendor: item.vendor || "",
    inward_no: item.inwardNo || "",
    vehicle_no: item.vehicleNo || "",
    vendor_representative: item.vendorRepre || "",
    invoice_no: item.invoiceNo || "",
    invoice_date: item.invoiceDate || "",
    mmr_date: item.mmrDate || new Date().toISOString().split("T")[0],
    remark: item.remark || "",
    status: item.status || "",

    item_name: item.materialName || item.material_name || "",
    unit: item.unit || "",
    category: item.category || "",
    subcategory: item.subcategory || "",
    gst_rate: item.gst ?? "",
    rate: item.rate ?? "",
    royalty: item.royalty || "no",
    anukramak_no: item.anukrmankNo || "",
    etp_no: item.etpNo || "",
    royalty_qty: item.royaltyQty ?? "",
    specification: item.specification || "",
    rec_qty: item.recQty ?? "",
    less_amount: item.lessAmt ?? "",
    total_amount: item.totalAmt ?? "",

    addedBy: item.addedBy || loggedInUser,
    attachment: null
  });

  // Initialize with one material item
  setMaterialItems([{
    id: Date.now(), // temporary ID
    item_name: item.materialName || item.material_name || "",
    unit: item.unit || "",
    category: item.category || "",
    subcategory: item.subcategory || "",
    gst_rate: item.gst ?? "",
    rate: item.rate ?? "",
    royalty: item.royalty || "no",
    anukramak_no: item.anukrmankNo || "",
    etp_no: item.etpNo || "",
    royalty_qty: item.royaltyQty ?? "",
    specification: item.specification || "",
    rec_qty: item.recQty ?? "",
    less_amount: item.lessAmt ?? "",
    showRoyaltyFields: item.royalty === "yes"
  }]);

  setShowRoyaltyFields(item.royalty === "yes");
  setAttachments([]);

  if (item.category) {
    fetchSubcategories(item.category);
  }

  // ✅ Load documents (same as edit) - THIS IS THE KEY FIX
  await refreshDocuments();

  setUploadFiles([]);
  setDocumentName("");
  
  // Reset document fields
  setDocumentFields([
    { id: 1, name: 'MATERIAL - PHOTO', file: null, preview: null },
    { id: 2, name: 'ROYALTY PHOTO', file: null, preview: null },
    { id: 3, name: 'SUPPLIER SLIP', file: null, preview: null }
  ]);

  setShowModal(true);
};


  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setIsViewMode(false);
    setItemSaved(false); // Reset item saved status
    setCurrentStep(1); // Reset to step 1
    setSubcategories([]); // Reset subcategories when closing modal
    setMaterialItems([]);
    setShowRoyaltyFields(false);
    setAttachments([]);
    setShowInvoiceDatePicker(false);
    setShowMMRDatePicker(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 🔹 Project → Location autofill
  if (name === "project") {
  const selectedProject = projects.find(
    (p) => p.project_name === value
  );

  setFormData(prev => ({
    ...prev,
    project: value,
    location: selectedProject?.location || "",
    store: "" // ❌ DO NOT auto-fill store here
  }));
  return;
}

    // 🔹 VENDOR CHANGE → FETCH VENDOR MATERIALS AND CLEAR MATERIAL SELECTION
    if (name === "vendor") {
      // Clear previously selected material when vendor changes
      setFormData(prev => ({ 
        ...prev, 
        vendor: value,
        item_name: "", // Clear material selection
        unit: "", // Clear unit
        category: "", // Clear category
        subcategory: "", // Clear subcategory
        gst_rate: "" // Clear GST
      }));
      
      // Fetch materials for the selected vendor
      if (value) {
        fetchMaterialsByVendor(value);
      } else {
        setVendorMaterials([]);
      }
      return;
    }

    // 🔥 MATERIAL SELECT → AUTO FETCH EVERYTHING OR CLEAR
    if (name === "item_name") {
      // If clear option selected
      if (value === "") {
        setFormData(prev => ({
          ...prev,
          item_name: "",
          unit: "",
          category: "",
          subcategory: "",
          gst_rate: ""
        }));
        return;
      }
      
      // Check if the material is from vendor materials or general materials
      // FIX: Check for material_name instead of item_name in vendor materials
      const selectedMaterial = vendorMaterials.find(
        (m) => m.material_name === value
      ) || materials.find(
        (m) => m.material_name === value
      );

      console.log("Selected Material:", selectedMaterial); // DEBUG

      if (!selectedMaterial) {
        // If material not found, clear all fields
        setFormData(prev => ({
          ...prev,
          item_name: value,
          unit: "",
          category: "",
          subcategory: "",
          gst_rate: ""
        }));
        return;
      }

      // Auto-fill all fields from selected material
      // FIX: Use material_name from the selected material
      setFormData(prev => ({
        ...prev,
        item_name: selectedMaterial.material_name,
        unit: selectedMaterial.unit || "",
        category: selectedMaterial.category || "",
        subcategory: selectedMaterial.sub_category || selectedMaterial.subcategory || "",
        gst_rate: selectedMaterial.gst || selectedMaterial.gst_rate || selectedMaterial.tax_rate || ""
      }));

      // 🔹 optional: category based subcategory list reload
      if (selectedMaterial.category) {
        fetchSubcategories(selectedMaterial.category);
      }

      return;
    }

    // 🔹 Category change → reset subcategory
    if (name === "category") {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: ""
      }));
      return;
    }

    // 🔹 Royalty toggle
    if (name === "royalty") {
      setFormData(prev => ({ ...prev, royalty: value }));
      setShowRoyaltyFields(value === "yes");
      return;
    }

    // 🔹 Status change - handle status sequence logic
    if (name === "status") {
      setFormData(prev => ({ ...prev, status: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to get status options based on current status
  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      "": ["Received", "Rejected", "Approved", "Unbilled", "Outstanding"], // Default for new items
      "Received": ["Rejected", "Approved", "Unbilled", "Outstanding"],
      "Rejected": ["Approved", "Unbilled", "Outstanding"],
      "Approved": ["Unbilled", "Outstanding"],
      "Unbilled": ["Outstanding"],
      "Outstanding": [] // No further options after Outstanding
    };
    
    return statusFlow[currentStatus] || [];
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      isNew: true
    }));
    setAttachments([...attachments, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const removeAttachment = (id) => {
    const newAttachments = attachments.filter(att => att.id !== id);
    setAttachments(newAttachments);
  };

  // Handle calendar icon click
  const handleCalendarClick = (field) => {
    if (field === 'invoice_date') {
      setShowInvoiceDatePicker(true);
      setShowMMRDatePicker(false);
      // Focus on the date input to trigger the calendar
      setTimeout(() => {
        invoiceDateRef.current && invoiceDateRef.current.showPicker && invoiceDateRef.current.showPicker();
      }, 0);
    } else if (field === 'mmr_date') {
      setShowMMRDatePicker(true);
      setShowInvoiceDatePicker(false);
      // Focus on the date input to trigger the calendar
      setTimeout(() => {
        mmrDateRef.current && mmrDateRef.current.showPicker && mmrDateRef.current.showPicker();
      }, 0);
    }
  };

  // Add a new material item
  const addMaterialItem = () => {
    const newItem = {
      id: Date.now(), // temporary ID
      item_name: "",
      unit: "",
      category: "",
      subcategory: "",
      gst_rate: "",
      rate: "",
      royalty: "no",
      anukramak_no: "",
      etp_no: "",
      royalty_qty: "",
      specification: "",
      rec_qty: "",
      less_amount: "",
      showRoyaltyFields: false // Add this property to track royalty field visibility
    };
    
    setMaterialItems([...materialItems, newItem]);
  };

  // Update a material item
// Update a material item
const updateMaterialItem = (id, field, value) => {
  setMaterialItems(prev =>
    prev.map(item => {
      if (item.id !== id) return item;

      // Handle material name selection with auto-fill
      if (field === "item_name") {
        // If clear option selected
        if (value === "") {
          return {
            ...item,
            item_name: "",
            unit: "",
            category: "",
            subcategory: "",
            gst_rate: ""
          };
        }
        
        // Check if the material is from vendor materials or general materials
        const selectedMaterial = vendorMaterials.find(
          (m) => m.material_name === value
        ) || materials.find(
          (m) => m.material_name === value
        );

        console.log("Selected Material:", selectedMaterial); // DEBUG

        if (!selectedMaterial) {
          // If material not found, clear all fields
          return {
            ...item,
            item_name: value,
            unit: "",
            category: "",
            subcategory: "",
            gst_rate: ""
          };
        }

        // Auto-fill all fields from selected material
        const updatedItem = {
          ...item,
          item_name: selectedMaterial.material_name,
          unit: selectedMaterial.unit || "",
          category: selectedMaterial.category || "",
          subcategory: selectedMaterial.sub_category || selectedMaterial.subcategory || "",
          gst_rate: selectedMaterial.gst || selectedMaterial.gst_rate || selectedMaterial.tax_rate || ""
        };

        // 🔹 optional: category based subcategory list reload
        if (selectedMaterial.category) {
          fetchSubcategories(selectedMaterial.category);
        }

        return updatedItem;
      }

      if (field === "royalty") {
        return {
          ...item,
          royalty: value,
          showRoyaltyFields: value === "yes"
        };
      }

      if (field === "category") {
        return {
          ...item,
          category: value,
          subcategory: ""
        };
      }

      return {
        ...item,
        [field]: value
      };
    })
  );
};

  // Remove a material item
  const removeMaterialItem = (id) => {
    setMaterialItems(materialItems.filter(item => item.id !== id));
  };

  // View attachment
  const viewAttachment = (attachment) => {
    setPreviewAttachment(attachment);
    setShowPreviewModal(true);
  };

  // Download attachment
  const downloadAttachment = (attachment) => {
    if (attachment.file) {
      // For new files
      const url = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (attachment.url) {
      // For existing files
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Edit attachment name
  const editAttachmentName = (id, newName) => {
    const updatedAttachments = attachments.map(att => {
      if (att.id === id) {
        return { ...att, name: newName };
      }
      return att;
    });
    setAttachments(updatedAttachments);
  };

  // Close preview modal
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewAttachment(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on file type
  const getFileIcon = (fileName, fileType) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return 'fa-image';
    } else if (['pdf'].includes(extension)) {
      return 'fa-file-pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'fa-file-word';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'fa-file-excel';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return 'fa-file-powerpoint';
    } else {
      return 'fa-file';
    }
  };

  // Check if file is an image
  const isImage = (fileName, fileType) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension);
  };

 
// Handle form submission (create/update item) - UPDATED to use your Spring Boot API
const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if material items array has at least one item with a material name
  const hasValidMaterialItem = materialItems.some(item => item.item_name && item.item_name.trim() !== '');
  
  if (!hasValidMaterialItem) {
    toast.error("Material Name is required");
    return;
  }

  try {
    // Create the payload matching your MaterialBulkDTO structure
    const payload = {
      // MMR Details
      project: formData.project,
      location: formData.location,
      store: formData.store,
      vendor: formData.vendor,
      inwardNo: formData.inward_no,
      vehicleNo: formData.vehicle_no,
      vendorRepre: formData.vendor_representative,
      invoiceNo: formData.invoice_no,
      invoiceDate: formData.invoice_date || null,
      mmrDate: formData.mmr_date || null,
      remark: formData.remark,
      specification: formData.specification || "",
      addedBy: loggedInUser,
      
      // Material Items List - Send all material items
      itemList: materialItems.map(item => ({
        materialName: item.item_name,
        unit: item.unit,
        category: item.category,
        subcategory: item.subcategory,
        royalty: item.royalty,
        anukrmankNo: item.royalty === "yes" ? item.anukramak_no : null,
        etpNo: item.royalty === "yes" ? item.etp_no : null,
        royaltyQty: item.royalty === "yes" ? (item.royalty_qty ? Number(item.royalty_qty) : null) : null,
        recQty: item.rec_qty ? Number(item.rec_qty) : null,
        lessAmt: item.less_amount ? Number(item.less_amount) : null
      }))
    };

    let response;

    if (editingItem && editingItem.id) {
      // Update existing item - use the regular update endpoint for single item
      // For now, we'll only update the first item in the list
      const singleItemPayload = {
        // MMR Details
        project: formData.project,
        location: formData.location,
        store: formData.store,
        vendor: formData.vendor,
        inwardNo: formData.inward_no,
        vehicleNo: formData.vehicle_no,
        vendorRepre: formData.vendor_representative,
        invoiceNo: formData.invoice_no,
        invoiceDate: formData.invoice_date || null,
        mmrDate: formData.mmr_date || null,
        remark: formData.remark,
        status: formData.status || "",
        specification: formData.specification || "",
        addedBy: loggedInUser,
        
        // Material Details - using the first material item
        materialName: materialItems[0]?.item_name || "",
        unit: materialItems[0]?.unit || "",
        category: materialItems[0]?.category || "",
        subcategory: materialItems[0]?.subcategory || "",
        gst: materialItems[0]?.gst_rate ? Number(materialItems[0].gst_rate) : null,
        rate: materialItems[0]?.rate ? Number(materialItems[0].rate) : null,
        royalty: materialItems[0]?.royalty || "no",
        anukrmankNo: materialItems[0]?.royalty === "yes" ? materialItems[0]?.anukramak_no : null,
        etpNo: materialItems[0]?.royalty === "yes" ? materialItems[0]?.etp_no : null,
        royaltyQty: materialItems[0]?.royalty === "yes" ? (materialItems[0]?.royalty_qty ? Number(materialItems[0].royalty_qty) : null) : null,
        specification: materialItems[0]?.specification || "",
        recQty: materialItems[0]?.rec_qty ? Number(materialItems[0].rec_qty) : null,
        lessAmt: materialItems[0]?.less_amount ? Number(materialItems[0].less_amount) : null,
        totalAmt: formData.total_amount ? Number(formData.total_amount) : null
      };

      response = await api.put(
        `/materials/update/${editingItem.id}`,
        singleItemPayload
      );
    } else {
      // Add new items using the bulk endpoint
      response = await api.post("/materials/addMat", payload);
    }

    if (response.status === 200) {
      let materialId;
      let newItemData;
      
      if (editingItem && editingItem.id) {
        materialId = editingItem.id;
        toast.success("Item updated successfully");
      } else {
        // For new items, extract ID from response
        if (response.data && response.data.id) {
          materialId = response.data.id;
          newItemData = response.data;
        } else if (response.data && response.data.data && response.data.data.id) {
          materialId = response.data.data.id;
          newItemData = response.data.data;
        }
        toast.success("Items saved successfully");
      }
      
      // Update editingItem state with the new ID for document upload
      if (materialId) {
        setEditingItem({ id: materialId, ...newItemData });
        setItemSaved(true); // Mark item as saved
        
        // Show success message
        toast.success("Items saved successfully. You can add documents from edit section.");
        
        // Close the modal after successful save (for add mode only)
        if (!editingItem) {
          closeModal();
        }
      }
      
      fetchItems();
    }
  } catch (error) {
    console.error("Error saving items:", error);
    toast.error(
      error.response?.data?.message || "Operation failed"
    );
  }
};

// Handle document upload separately - UPDATED with your API
// Handle document upload separately - UPDATED with your API
const handleUploadDocuments = async () => {
  // Check if we have a material ID
  if (!editingItem?.id) {
    toast.error("Please save the item first before uploading documents");
    return;
  }

  // Get documents to upload
  const documentsToUpload = documentFields.filter(field => field.file);
  
  if (documentsToUpload.length === 0) {
    toast.error("Please select at least one document to upload");
    return;
  }

  try {
    setIsUploading(true);
    
    // Prepare form data according to your API
    const formData = new FormData();
    formData.append('id', editingItem.id);
    
    // Add document names (array)
    documentsToUpload.forEach(field => {
      formData.append('docName', field.name === "OTHER" ? field.customName || "Document" : field.name);
    });
    
    // Add files (array)
    documentsToUpload.forEach(field => {
      formData.append('files', field.file);
    });

    // Call the API with your endpoint
    const response = await api.post('/materials/addMatDoc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      toast.success('Documents uploaded successfully');
      
      // Reset document fields after successful upload
      setDocumentFields(prev => prev.map(field => ({
        ...field,
        file: null,
        preview: null
      })));
      
      // Refresh documents list - THIS IS THE KEY FIX
      await refreshDocuments();
      
      // Show success and optionally close modal or reset
      toast.success("Documents uploaded successfully!");
      
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

// Add this function to handle file uploads for specific photo types
const handleFileUpload = async (e, docType) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  const file = files[0];
  
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }
  
  setIsUploading(true);
  
  try {
    // Check if a document of this type already exists
    const existingDoc = materialDocuments.find(doc => doc.docName === docType);
    
    if (existingDoc && !isViewMode) {
      // Delete the existing document first
      await handleDeleteDocument(existingDoc.id);
    }
    
    const formData = new FormData();
    formData.append('id', editingItem?.id);
    formData.append('docName', docType);
    formData.append('files', file);
    
    const response = await api.post('/materials/addMatDoc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.status === 200) {
      toast.success(`${docType.replace('-', ' ')} uploaded successfully`);
      
      // Refresh documents list
      const materialResponse = await api.get(`/materials/getById/${editingItem?.id}`);
      if (materialResponse.status === 200) {
        let materialData = materialResponse.data?.data || materialResponse.data;
        
        let docs = materialData.documents || materialData.materialDocuments || materialData.docs || [];
        
        if (!Array.isArray(docs)) docs = [];
        
        const mappedDocs = docs.map(doc => ({
          id: doc.id,
          docName: doc.fileName || doc.docName || "Document",
          filePath: doc.filePath,
          fileType: doc.fileType,
          createdAt: doc.createdAt || new Date().toISOString()
        }));
        
        setMaterialDocuments(mappedDocs);
        
        if (mappedDocs.length > 0) {
          loadDocumentImages(mappedDocs);
        }
      }
    } else {
      toast.error(response.data.message || 'Failed to upload photo');
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    toast.error(error.response?.data?.message || 'Failed to upload photo');
  } finally {
    setIsUploading(false);
    // Reset the file input
    e.target.value = '';
  }
};

  // Export to Excel
  const handleExportExcel = () => {
    if (!items || items.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Prepare clean data for Excel - Updated to include all table data
    const excelData = items.map((item, index) => ({
      "Sr No": index + 1,
      "Project": item.project || "",
      "Vendor": item.vendor || "",
      "Store": item.project || "",
      "Location": item.location || "",
      "MMR Date": item.mmrDate || "",
      "Status": item.status || "",
      "Item Code": item.item_code || "",
      "Item Name": item.materialName || item.item_name || item.material_name || "",
      "Material Code": item.material_code || "",
      "HSN Code": item.hsn_code || "",
      "Product Type": item.product_type || "",
      "Category": item.category || "",
      "Subcategory": item.subcategory || "",
      "Unit": item.unit || "",
      "Taxability": item.taxability || "",
      "Tax Rate (%)": item.gst || item.gst_rate || "",
      "CGST (%)": item.cgst_rate || "",
      "SGST (%)": item.sgst_rate || "",
      "IGST (%)": item.igst_rate || "",
      "Minimum Level": item.minimum_level || "",
      "Tolerance": item.tolerance || "",
      "Inward No": item.inwardNo || "",
      "Vehicle No": item.vehicleNo || "",
      "Vendor Representative": item.vendorRepre || "",
      "Invoice No": item.invoiceNo || "",
      "Invoice Date": item.invoiceDate || "",
      "Remark": item.remark || "",
      "Received Quantity": item.recQty || "",
      "Rate": item.rate || "",
      "Less Amount": item.lessAmt || "",
      "Total Amount": item.totalAmt || ""
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Download file
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Material_Management_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // Handle item deletion - Direct delete without confirmation
  const handleDelete = async (id) => {
    // Removed window.confirm for direct deletion
    
    try {
      const response = await api.delete(`/materials/delete/${id}`);

      if (response.status === 200) {
        toast.success('Item deleted successfully', {
          position: 'top-right',
        });
        fetchItems(); // refresh table
      } else {
        toast.error(response.data || 'Failed to delete item', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item', { position: 'top-right' });
    }
  };

  // Enhanced search functionality - Updated to include all fields
  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (item.item_name && item.item_name.toLowerCase().includes(search)) ||
      (item.material_name && item.material_name.toLowerCase().includes(search)) ||
      (item.item_code && item.item_code.toLowerCase().includes(search)) ||
      (item.category && item.category.toLowerCase().includes(search)) ||
      (item.hsn_code && item.hsn_code.toLowerCase().includes(search)) ||
      (item.status && item.status.toLowerCase().includes(search)) ||
      (item.project && item.project.toLowerCase().includes(search)) ||
      (item.vendor && item.vendor.toLowerCase().includes(search)) ||
      (item.project && item.project.toLowerCase().includes(search)) || // Store is same as project
      (item.location && item.location.toLowerCase().includes(search)) ||
      (item.mmrDate && item.mmrDate.toLowerCase().includes(search))
    );
  });

  // Function to fetch and display PDF data
  const viewPdfData = async (item) => {
    try {
      setPdfLoading(true);
      setShowPdfModal(true);
      
      // Use the existing items data instead of making a new API call
      // Find the item in the items array
      const itemData = items.find(i => i.id === item.id);
      
      if (itemData) {
        setPdfData(itemData);
      } else {
        // If not found in the items array, fetch it
        const response = await api.get(`/materials/getById/${item.id}`);
        
        if (response.status === 200) {
          // Check if the response has a data property
          const data = response.data && response.data.data ? response.data.data : response.data;
          setPdfData(data);
        } else {
          toast.error("Failed to fetch PDF data");
          setPdfData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching PDF data:", error);
      toast.error("Failed to fetch PDF data");
      setPdfData(null);
    } finally {
      setPdfLoading(false);
    }
  };

  // Close PDF modal
  const closePdfModal = () => {
    setShowPdfModal(false);
    setPdfData(null);
  };
  
  // Handle document field file change
const handleDocumentFileChange = (e, fieldId) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Create a preview for the selected file
  const reader = new FileReader();
  reader.onload = (event) => {
    setDocumentFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            file, 
            preview: event.target.result,
            // If it's "OTHER" type and no custom name is set, use filename without extension
            customName: field.name === "OTHER" && !field.customName 
              ? file.name.substring(0, file.name.lastIndexOf('.')) 
              : field.customName
          }
        : field
    ));
  };
  reader.readAsDataURL(file);
};
  
  // Add a new document field
const addDocumentField = () => {
  const newId = Math.max(...documentFields.map(f => f.id), 0) + 1;
  setDocumentFields(prev => [...prev, {
    id: newId,
    name: 'OTHER',
    file: null,
    preview: null,
    customName: `Document ${newId}`
  }]);
};
  
  // Remove a document field
  const removeDocumentField = (fieldId) => {
    setDocumentFields(prev => prev.filter(field => field.id !== fieldId));
  };
  
  // Handle document name change
const handleDocumentNameChange = (fieldId, newName) => {
  setDocumentFields(prev => prev.map(field => 
    field.id === fieldId 
      ? { ...field, name: newName }
      : field
  ));
};
  
  // Open image preview modal
  const openImagePreview = (src) => {
    setPreviewImageSrc(src);
    setShowImagePreviewModal(true);
  };
  
  // Close image preview modal
  const closeImagePreview = () => {
    setShowImagePreviewModal(false);
    setPreviewImageSrc("");
  };

  // Step Navigation Functions
  const goToStep = (step) => {
    if (step === 2 && !itemSaved && !editingItem) {
      toast.error("Please save the item first before uploading documents");
      return;
    }
    setCurrentStep(step);
  };

  // Step indicator component - Only show for edit mode
  // const StepIndicator = () => {
  //   // Only show step indicator for edit mode, not for add mode
  //   if (!editingItem) return null;
    
  //   return (
  //     <div style={styles.stepIndicator}>
  //       <div style={styles.stepContainer}>
  //         {/* Step 1: Item Details */}
  //         <div style={styles.stepItem}>
  //           <div 
  //             style={{
  //               ...styles.stepNumber,
  //               ...(currentStep === 1 ? styles.stepNumberActive : 
  //                    (itemSaved || editingItem || isViewMode) ? styles.stepNumberCompleted : styles.stepNumberInactive)
  //             }}
  //           >
  //             {itemSaved || editingItem || isViewMode ? <i className="fas fa-check"></i> : "1"}
  //           </div>
  //           <div 
  //             style={{
  //               ...styles.stepLabel,
  //               ...(currentStep === 1 ? styles.stepLabelActive : 
  //                    (itemSaved || editingItem || isViewMode) ? styles.stepLabelCompleted : {})
  //             }}
  //           >
  //             Item Details
  //           </div>
  //         </div>

  //         {/* Connector */}
  //         <div style={{
  //           ...styles.stepConnector,
  //           ...((itemSaved || editingItem || isViewMode) ? styles.stepConnectorCompleted : 
  //               (currentStep >= 2) ? styles.stepConnectorActive : {})
  //         }}></div>

  //         {/* Step 2: Documents */}
  //         <div style={styles.stepItem}>
  //           <div 
  //             style={{
  //               ...styles.stepNumber,
  //               ...(currentStep === 2 ? styles.stepNumberActive : 
  //                    (currentStep > 2) ? styles.stepNumberCompleted : styles.stepNumberInactive)
  //             }}
  //           >
  //             {currentStep > 2 ? <i className="fas fa-check"></i> : "2"}
  //           </div>
  //           <div 
  //             style={{
  //               ...styles.stepLabel,
  //               ...(currentStep === 2 ? styles.stepLabelActive : 
  //                    (currentStep > 2) ? styles.stepLabelCompleted : {})
  //             }}
  //           >
  //             Documents
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const StepIndicator = () => {
  // Show step indicator for both edit and view modes, not for add mode
  if (!editingItem) return null;
  
  return (
    <div style={styles.stepIndicator}>
      <div style={styles.stepContainer}>
        {/* Step 1: Item Details */}
        <div style={styles.stepItem}>
          <div 
            style={{
              ...styles.stepNumber,
              ...(currentStep === 1 ? styles.stepNumberActive : 
                   (itemSaved || editingItem || isViewMode) ? styles.stepNumberCompleted : styles.stepNumberInactive)
            }}
          >
            {itemSaved || editingItem || isViewMode ? <i className="fas fa-check"></i> : "1"}
          </div>
          <div 
            style={{
              ...styles.stepLabel,
              ...(currentStep === 1 ? styles.stepLabelActive : 
                   (itemSaved || editingItem || isViewMode) ? styles.stepLabelCompleted : {})
            }}
          >
            Item Details
          </div>
        </div>

        {/* Connector */}
        <div style={{
          ...styles.stepConnector,
          ...((itemSaved || editingItem || isViewMode) ? styles.stepConnectorCompleted : 
              (currentStep >= 2) ? styles.stepConnectorActive : {})
        }}></div>

        {/* Step 2: Documents */}
        <div style={styles.stepItem}>
          <div 
            style={{
              ...styles.stepNumber,
              ...(currentStep === 2 ? styles.stepNumberActive : 
                   (currentStep > 2) ? styles.stepNumberCompleted : styles.stepNumberInactive)
            }}
          >
            {currentStep > 2 ? <i className="fas fa-check"></i> : "2"}
          </div>
          <div 
            style={{
              ...styles.stepLabel,
              ...(currentStep === 2 ? styles.stepLabelActive : 
                   (currentStep > 2) ? styles.stepLabelCompleted : {})
            }}
          >
            Documents
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Material Management</h1>
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
              Add Item
            </button>
          </div>
        </div>

        {/* Item Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Material</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search items..." 
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
      <th style={styles.th}>Vendor</th>
      <th style={styles.th}>Store</th>
      <th style={styles.th}>Location</th>
      <th style={styles.th}>MMR Date</th>
      <th style={styles.th}>Status</th>  
      <th style={styles.th}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredItems.length > 0 ? filteredItems.map((item, index) => {
      // Zebra striping logic: White for even, Light Grey for odd
      const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const isHovered = hoveredRow === item.id;

      return (
        <tr 
          key={item.id}
          style={{
            ...styles.tr,
            backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
          }}
          onMouseEnter={() => setHoveredRow(item.id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <td style={styles.td}>{index + 1}</td>
          <td style={styles.td}>{item.project || ""}</td>
          <td style={styles.td}>{item.vendor || ""}</td>
          <td style={styles.td}>{item.project || ""}</td>
          <td style={styles.td}>{item.location || ""}</td>
          <td style={styles.td}>{item.mmrDate || ""}</td>

          <td style={styles.td}>
            {item.status ? (
              <span
                style={{
                  ...styles.statusBadge,
                  ...(item.status === "Approved"
                    ? styles.statusActive
                    : styles.statusInactive)
                }}
              >
                {item.status}
              </span>
            ) : (
              "-"
            )}
          </td>

          <td style={styles.td}>
            <div style={styles.actionButtons}>
              <button 
                style={{...styles.actionBtn, ...styles.editBtn}} // Green for Edit
                title="Edit"
                onClick={() => openEditModal(item)}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                style={{...styles.actionBtn, ...styles.viewBtn}} // Yellow for View
                title="View"
                onClick={() => openViewModal(item)}
              >
                <i className="fas fa-eye"></i>
              </button>
              <button
                style={{...styles.actionBtn, ...styles.pdfBtn}}
                title="Download PDF"
                onClick={() => downloadMMRPdf(item)}
              >
                <i className="fas fa-file-pdf"></i>
              </button>
              <button 
                style={{...styles.actionBtn, ...styles.deleteBtn}} // Red for Delete
                title="Delete"
                onClick={() => handleDelete(item.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      );
    }) : (
      <tr>
        <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
          No items found matching your search.
        </td>
      </tr>
    )}
  </tbody>
</table>
          )}
        </div>
      </main>

      {/* Item Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Item' : (editingItem ? 'Edit Item' : 'Add New Item')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Step Indicator - Only show for edit mode */}
            {editingItem && <StepIndicator />}
            
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* For Add Mode: Only show Item Details */}
                {!editingItem && (
                  <div style={styles.stepContent}>
                    {/* MMR Details Section */}
                    <div style={styles.formSection}>
                      <h4 style={styles.sectionTitle}>MMR Details</h4>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Project */}
                        <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                          <label style={styles.formLabel}>Project</label>
                          <div style={styles.selectWrapper}>
                            <select
                              name="project"
                              value={formData.project}
                              onChange={handleInputChange}
                              disabled={isViewMode || projectsLoading}
                              style={styles.formControl}
                            >
                              <option value="">Select Project</option>
                              {projects.map(proj => (
                                <option key={proj.id} value={proj.project_name}>
                                  {proj.project_name}
                                </option>
                              ))}
                            </select>
                            <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                          </div>
                        </div>

                        {/* Location (Auto-filled) */}
                        <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                          <label style={styles.formLabel}>Location</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            style={styles.formControl}
                            disabled
                          />
                        </div>

                        {/* Store Dropdown */}
                        <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                          <label style={styles.formLabel}>Store</label>
                          <div style={{ 
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff'
                          }}>
                            <select
                              name="store"
                              value={formData.store || ""}
                              onChange={handleInputChange}
                              disabled={storesLoading}
                              style={styles.formControl}
                            >
                              <option value="">Select Store</option>

                              {stores.map((s) => (
                                <option key={s.id} value={s.store}>
                                  {s.store}
                                </option>
                              ))}
                            </select>

                            <i 
                              className="fas fa-chevron-down" 
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#64748b',
                                pointerEvents: 'none'
                              }}
                            ></i>
                          </div>
                        </div>

                        {/* Vendor */}
                        <div style={{ ...styles.formGroup, flex: '1 1 30%' }}>
                          <label style={styles.formLabel} htmlFor="vendor">
                            Vendor
                          </label>

                          <div style={styles.selectWrapper}>
                            <select
                              id="vendor"
                              name="vendor"
                              value={formData.vendor || ""}
                              onChange={handleInputChange}
                              style={{
                                ...styles.formControl,
                                ...(isViewMode || vendorsLoading ? styles.formControlDisabled : {})
                              }}
                              disabled={isViewMode || vendorsLoading}
                            >
                              {/* Default placeholder */}
                              <option value="">
                                {vendorsLoading ? "Loading vendors..." : "Select Vendor"}
                              </option>

                              {/* Dynamic vendors */}
                              {vendors.map((v) => {
                                const name =
                                  v.vendor_name ||
                                  v.vendorName ||
                                  v.name ||
                                  v.vendor ||
                                  "";

                                return (
                                  <option key={v.id} value={name}>
                                    {name}
                                  </option>
                                );
                              })}
                            </select>

                            <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                          </div>
                        </div>

                        {/* Inward No */}
                        <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                          <label style={styles.formLabel} htmlFor="inward_no">Inward No</label>
                          <input
                            type="text"
                            id="inward_no"
                            name="inward_no"
                            value={formData.inward_no}
                            onChange={handleInputChange}
                            style={styles.formControl}
                            disabled={isViewMode}
                          />
                        </div>

                        {/* Vehicle No */}
                        <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                          <label style={styles.formLabel} htmlFor="vehicle_no">Vehicle No</label>
                          <input
                            type="text"
                            id="vehicle_no"
                            name="vehicle_no"
                            value={formData.vehicle_no}
                            onChange={handleInputChange}
                            style={styles.formControl}
                            disabled={isViewMode}
                          />
                        </div>

                        {/* Vendor Representative */}
                        <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                          <label style={styles.formLabel} htmlFor="vendor_representative">Vendor Representative</label>
                          <input
                            type="text"
                            id="vendor_representative"
                            name="vendor_representative"
                            value={formData.vendor_representative}
                            onChange={handleInputChange}
                            style={styles.formControl}
                            disabled={isViewMode}
                          />
                        </div>

                        {/* Invoice No */}
                        <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                          <label style={styles.formLabel} htmlFor="invoice_no">Invoice No</label>
                          <input
                            type="text"
                            id="invoice_no"
                            name="invoice_no"
                            value={formData.invoice_no}
                            onChange={handleInputChange}
                            style={styles.formControl}
                            disabled={isViewMode}
                          />
                        </div>

                        {/* Invoice Date */}
                        <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                          <label style={styles.formLabel} htmlFor="invoice_date">Invoice Date</label>
                          <div style={styles.dateInputWrapper}>
                            <input
                              ref={invoiceDateRef}
                              type="date"
                              id="invoice_date"
                              name="invoice_date"
                              value={formData.invoice_date}
                              onChange={handleInputChange}
                              style={styles.formControl}
                              disabled={isViewMode}
                            />
                            <i 
                              className="fas fa-calendar-alt" 
                              style={styles.dateIcon}
                              onClick={() => !isViewMode && handleCalendarClick('invoice_date')}
                            ></i>
                          </div>
                        </div>

                        {/* MMR Date and Remark in same row */}
                        <div style={{...styles.formGroup, flex: '1 1 100%', display: 'flex', gap: '20px'}}>
                          {/* MMR Date */}
                          <div style={{...styles.formGroup, flex: '1 1 50%'}}>
                            <label style={styles.formLabel} htmlFor="mmr_date">MMR Date</label>
                            <div style={styles.dateInputWrapper}>
                              <input
                                ref={mmrDateRef}
                                type="date"
                                id="mmr_date"
                                name="mmr_date"
                                value={formData.mmr_date || new Date().toISOString().split('T')[0]} // Use current date if no value
                                onChange={handleInputChange}
                                style={styles.formControl}
                                disabled={isViewMode}
                              />
                              <i 
                                className="fas fa-calendar-alt" 
                                style={styles.dateIcon}
                                onClick={() => !isViewMode && handleCalendarClick('mmr_date')}
                              ></i>
                            </div>
                          </div>

                          {/* Remark */}
                          <div style={{...styles.formGroup, flex: '1 1 50%'}}>
                            <label style={styles.formLabel} htmlFor="remark">Remark</label>
                            <textarea
                              id="remark"
                              name="remark"
                              value={formData.remark}
                              onChange={handleInputChange}
                              style={{
                                ...styles.formControl,
                                height: '40px',
                                resize: 'vertical'
                              }}
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Material Details Section */}
                    <div style={styles.formSection}>
                      <div style={styles.materialItemHeader}>
                        <h4 style={styles.sectionTitle}>Material Details</h4>
                        {!isViewMode && (
                          <button
                            type="button"
                            style={styles.addMaterialButton}
                            onClick={addMaterialItem}
                          >
                            <i className="fas fa-plus"></i>
                            Add New
                          </button>
                        )}
                      </div>
                      
                      {/* Material Items - Now using the materialItems array */}
                      {materialItems.map((item, index) => (
                        <div key={item.id} style={styles.materialItemSection}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h5 style={{ margin: 0, color: '#1e40af', fontSize: '16px' }}>
                              Material Item {index + 1}
                            </h5>
                            {!isViewMode && materialItems.length > 1 && (
                              <button
                                type="button"
                                style={styles.removeMaterialBtn}
                                onClick={() => removeMaterialItem(item.id)}
                                title="Remove Material Item"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          
                          <div style={{ 
                            ...styles.materialItem, 
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '15px'
                          }}>
                            {/* Material/Item Name with Clear Button */}
                            <div style={{ 
                              ...styles.formGroup, 
                              flex: '2',
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'flex-end'
                            }}>
                              <div style={{ flex: 1 }}>
                                <label style={styles.formLabel} htmlFor={`item_name_${item.id}`}>
                                  Material / Item Name
                                </label>

                                <div style={styles.selectWrapper}>
                                  <select
                                    id={`item_name_${item.id}`}
                                    name="item_name"
                                    value={item.item_name || ""}
                                    onChange={(e) => updateMaterialItem(item.id, 'item_name', e.target.value)}
                                    style={{
                                      ...styles.formControl,
                                      ...(isViewMode || materialsLoading ? styles.formControlDisabled : {})
                                    }}
                                    disabled={isViewMode || materialsLoading}
                                  >
                                    <option value="">
                                      {vendorMaterialsLoading 
                                        ? "Loading vendor materials..." 
                                        : formData.vendor 
                                          ? `Select ${formData.vendor}'s Material` 
                                          : "Select Material"
                                      }
                                    </option>
                                    
                                    {/* Clear option - visible when a material is selected */}
                                    {item.item_name && (
                                      <option value="" style={{ color: '#ef4444', fontStyle: 'italic' }}>
                                        ✕ Clear Selection
                                      </option>
                                    )}
                                    
                                    {/* Show vendor materials if vendor is selected and materials exist */}
                                    {formData.vendor && vendorMaterials.length > 0 ? (
                                      <optgroup label={`${formData.vendor}'s Materials`}>
                                        {vendorMaterials.map((mat) => (
                                          <option key={mat.id} value={mat.material_name}>
                                            {mat.material_name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ) : formData.vendor && vendorMaterials.length === 0 && !vendorMaterialsLoading ? (
                                      <optgroup label="No materials found">
                                        <option value="" disabled>No materials available for this vendor</option>
                                      </optgroup>
                                    ) : null}
                                    
                                    {/* Show all materials only when no vendor is selected */}
                                    {!formData.vendor && (
                                      <optgroup label="All Materials">
                                        {materials.map((mat) => (
                                          <option key={mat.id} value={mat.material_name}>
                                            {mat.material_name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )}
                                  </select>

                                  <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                                </div>
                              </div>
                            </div>

                            {/* Unit */}
                            <div style={{ ...styles.formGroup, flex: '1' }}>
                              <label style={styles.formLabel}>Unit</label>
                              <input
                                type="text"
                                value={item.unit || ""}
                                onChange={(e) => updateMaterialItem(item.id, 'unit', e.target.value)}
                                style={{
                                  ...styles.formControl,
                                  backgroundColor: "#f1f5f9"
                                }}
                                disabled
                              />
                            </div>

                            {/* Category */}
                            <div style={{ ...styles.formGroup, flex: '1' }}>
                              <label style={styles.formLabel}>Category</label>
                              <input
                                type="text"
                                value={item.category || ""}
                                onChange={(e) => updateMaterialItem(item.id, 'category', e.target.value)}
                                style={{
                                  ...styles.formControl,
                                  backgroundColor: "#f1f5f9"
                                }}
                                disabled
                              />
                            </div>

                            {/* Subcategory */}
                            <div style={{ ...styles.formGroup, flex: '1' }}>
                              <label style={styles.formLabel}>Subcategory</label>
                              <input
                                type="text"
                                value={item.subcategory || ""}
                                onChange={(e) => updateMaterialItem(item.id, 'subcategory', e.target.value)}
                                style={{
                                  ...styles.formControl,
                                  backgroundColor: "#f1f5f9"
                                }}
                                disabled
                              />
                            </div>

                            {/* Royalty */}
                            <div style={{...styles.formGroup, flex: '1'}}>
                              <label style={styles.formLabel} htmlFor={`royalty_${item.id}`}>Royalty</label>
                              <div style={styles.selectWrapper}>
                                <select
                                  id={`royalty_${item.id}`}
                                  value={item.royalty}
                                  onChange={(e) => updateMaterialItem(item.id, 'royalty', e.target.value)}
                                  style={{
                                    ...styles.formControl,
                                    ...(isViewMode ? styles.formControlDisabled : {})
                                  }}
                                  disabled={isViewMode}
                                >
                                  <option value="no">No</option>
                                  <option value="yes">Yes</option>
                                </select>
                                <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                              </div>
                            </div>
                          </div>

                          {/* Royalty Fields (shown only when royalty is "yes") */}
                          {item.showRoyaltyFields && (
                            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', marginBottom: '15px' }}>
                              {/* Anukramak No */}
                              <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                <label style={styles.formLabel} htmlFor={`anukramak_no_${item.id}`}>Anukramak No</label>
                                <input
                                  type="text"
                                  id={`anukramak_no_${item.id}`}
                                  value={item.anukramak_no}
                                  onChange={(e) => updateMaterialItem(item.id, 'anukramak_no', e.target.value)}
                                  style={styles.formControl}
                                  disabled={isViewMode}
                                />
                              </div>

                              {/* ETP No */}
                              <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                <label style={styles.formLabel} htmlFor={`etp_no_${item.id}`}>ETP No</label>
                                <input
                                  type="text"
                                  id={`etp_no_${item.id}`}
                                  value={item.etp_no}
                                  onChange={(e) => updateMaterialItem(item.id, 'etp_no', e.target.value)}
                                  style={styles.formControl}
                                  disabled={isViewMode}
                                />
                              </div>

                              {/* Royalty QTY */}
                              <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                <label style={styles.formLabel} htmlFor={`royalty_qty_${item.id}`}>Royalty QTY</label>
                                <input
                                  type="number"
                                  id={`royalty_qty_${item.id}`}
                                  value={item.royalty_qty}
                                  onChange={(e) => updateMaterialItem(item.id, 'royalty_qty', e.target.value)}
                                  style={styles.formControl}
                                  step="0.01"
                                  disabled={isViewMode}
                                />
                              </div>
                            </div>
                          )}

                          {/* Rec Qty, Rate, GST, Less Amount in same row */}
                          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
                            {/* Rec. Qty */}
                            <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                              <label style={styles.formLabel} htmlFor={`rec_qty_${item.id}`}>Rec. Qty</label>
                              <input
                                type="number"
                                id={`rec_qty_${item.id}`}
                                value={item.rec_qty}
                                onChange={(e) => updateMaterialItem(item.id, 'rec_qty', e.target.value)}
                                style={styles.formControl}
                                step="0.01"
                                disabled={isViewMode}
                              />
                            </div>

                            {/* Rate */}
                            <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                              <label style={styles.formLabel} htmlFor={`rate_${item.id}`}>Rate</label>
                              <input
                                type="number"
                                id={`rate_${item.id}`}
                                value={item.rate}
                                onChange={(e) => updateMaterialItem(item.id, 'rate', e.target.value)}
                                style={styles.formControl}
                                step="0.01"
                                disabled={isViewMode}
                              />
                            </div>

                            {/* GST% */}
                            <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                              <label style={styles.formLabel} htmlFor={`gst_rate_${item.id}`}>GST%</label>
                              <input
                                type="number"
                                id={`gst_rate_${item.id}`}
                                value={item.gst_rate}
                                onChange={(e) => updateMaterialItem(item.id, 'gst_rate', e.target.value)}
                                style={styles.formControl}
                                step="0.01"
                                disabled={isViewMode}
                              />
                            </div>

                            {/* Less Amount */}
                            <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                              <label style={styles.formLabel} htmlFor={`less_amount_${item.id}`}>Less Amount</label>
                              <input
                                type="number"
                                id={`less_amount_${item.id}`}
                                value={item.less_amount}
                                onChange={(e) => updateMaterialItem(item.id, 'less_amount', e.target.value)}
                                style={styles.formControl}
                                step="0.01"
                                disabled={isViewMode}
                              />
                            </div>
                          </div>
                          
                          {/* Specification */}
                          <div style={{ ...styles.formGroup, marginTop: '15px' }}>
                            <label style={styles.formLabel} htmlFor={`specification_${item.id}`}>Specification</label>
                            <textarea
                              id={`specification_${item.id}`}
                              value={item.specification}
                              onChange={(e) => updateMaterialItem(item.id, 'specification', e.target.value)}
                              style={{
                                ...styles.formControl,
                                height: '80px',
                                resize: 'vertical'
                              }}
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Documents Message for Add Mode */}
                      <div style={styles.documentsMessage}>
                        <i className="fas fa-info-circle" style={{marginRight: '8px'}}></i>
                        You can add documents from the edit section after saving the item.
                      </div>
                    </div>
                  </div>
                )}

                {/* For Edit Mode: Show steps based on currentStep */}
                {editingItem && (
                  <>
                    {/* Step 1: Item Details for Edit Mode */}
                    <div 
                      style={
                        currentStep === 1 ? styles.stepContent : styles.stepContentHidden
                      }
                    >
                      {/* MMR Details Section */}
                      <div style={styles.formSection}>
                        <h4 style={styles.sectionTitle}>MMR Details</h4>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          {/* Project */}
                          <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                            <label style={styles.formLabel}>Project</label>
                            <div style={styles.selectWrapper}>
                              <select
                                name="project"
                                value={formData.project}
                                onChange={handleInputChange}
                                disabled={isViewMode || projectsLoading}
                                style={styles.formControl}
                              >
                                <option value="">Select Project</option>
                                {projects.map(proj => (
                                  <option key={proj.id} value={proj.project_name}>
                                    {proj.project_name}
                                  </option>
                                ))}
                              </select>
                              <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                            </div>
                          </div>

                          {/* Location (Auto-filled) */}
                          <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                            <label style={styles.formLabel}>Location</label>
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              style={styles.formControl}
                              disabled
                            />
                          </div>

                          {/* addedby */}
                          <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                            <label style={styles.formLabel}>Added By</label>
                            <input
                              type="text"
                              value={formData.addedBy || ""}
                              disabled
                              style={{
                                ...styles.formControl,
                                backgroundColor: "#f1f5f9"
                              }}
                            />
                          </div>

                          {/* Store Dropdown */}
                          <div style={{ ...styles.formGroup, flex: '1 1 45%' }}>
                            <label style={styles.formLabel}>Store</label>
                            
                            {isViewMode ? (
                              <input
                                type="text"
                                value={formData.store || ""}
                                style={{
                                  ...styles.formControl,
                                  backgroundColor: "#f1f5f9"
                                }}
                                disabled
                              />
                            ) : (
                              <div style={{ 
                                position: 'relative',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                backgroundColor: '#ffffff'
                              }}>
                                <select
                                  name="store"
                                  value={formData.store || ""}
                                  onChange={handleInputChange}
                                  disabled={storesLoading}
                                  style={styles.formControl}
                                >
                                  <option value="">Select Store</option>

                                  {stores.map((s) => (
                                    <option key={s.id} value={s.store}>
                                      {s.store}
                                    </option>
                                  ))}
                                </select>

                                <i 
                                  className="fas fa-chevron-down" 
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b',
                                    pointerEvents: 'none'
                                  }}
                                ></i>
                              </div>
                            )}
                          </div>

                          {/* Status – ONLY Edit & View */}
                          <div style={{ ...styles.formGroup, flex: '1 1 30%' }}>
                            <label style={styles.formLabel}>Status</label>

                            {isViewMode ? (
                              // VIEW MODE → TEXT ONLY
                              <input
                                type="text"
                                value={formData.status || ""}
                                style={{
                                  ...styles.formControl,
                                  backgroundColor: "#f1f5f9"
                                }}
                                disabled
                              />
                            ) : (
                              // EDIT MODE → DROPDOWN WITH STATUS SEQUENCE LOGIC
                              <div style={styles.selectWrapper}>
                                <select
                                  name="status"
                                  value={formData.status || ""}
                                  onChange={handleInputChange}
                                  style={styles.formControl}
                                  disabled={formData.status === "Outstanding"} // Disable if Outstanding
                                >
                                  <option value="">Select Status</option>
                                  {getStatusOptions(formData.status || "").map(status => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                  {/* Show current status if it's not in the available options (e.g., "Outstanding") */}
                                  {formData.status && !getStatusOptions(formData.status || "").includes(formData.status) && (
                                    <option value={formData.status} disabled>
                                      {formData.status} (Final Status)
                                    </option>
                                  )}
                                </select>
                                <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                              </div>
                            )}
                          </div>

                          {/* Vendor */}
                          <div style={{ ...styles.formGroup, flex: '1 1 30%' }}>
                            <label style={styles.formLabel} htmlFor="vendor">
                              Vendor
                            </label>

                            <div style={styles.selectWrapper}>
                              <select
                                id="vendor"
                                name="vendor"
                                value={formData.vendor || ""}
                                onChange={handleInputChange}
                                style={{
                                  ...styles.formControl,
                                  ...(isViewMode || vendorsLoading ? styles.formControlDisabled : {})
                                }}
                                disabled={isViewMode || vendorsLoading}
                              >
                                {/* Default placeholder */}
                                <option value="">
                                  {vendorsLoading ? "Loading vendors..." : "Select Vendor"}
                                </option>

                                {/* Dynamic vendors */}
                                {vendors.map((v) => {
                                  const name =
                                    v.vendor_name ||
                                    v.vendorName ||
                                    v.name ||
                                    v.vendor ||
                                    "";

                                  return (
                                    <option key={v.id} value={name}>
                                      {name}
                                    </option>
                                  );
                                })}
                              </select>

                              <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                            </div>
                          </div>

                          {/* Inward No */}
                          <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                            <label style={styles.formLabel} htmlFor="inward_no">Inward No</label>
                            <input
                              type="text"
                              id="inward_no"
                              name="inward_no"
                              value={formData.inward_no}
                              onChange={handleInputChange}
                              style={styles.formControl}
                              disabled={isViewMode}
                            />
                          </div>

                          {/* Vehicle No */}
                          <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                            <label style={styles.formLabel} htmlFor="vehicle_no">Vehicle No</label>
                            <input
                              type="text"
                              id="vehicle_no"
                              name="vehicle_no"
                              value={formData.vehicle_no}
                              onChange={handleInputChange}
                              style={styles.formControl}
                              disabled={isViewMode}
                            />
                          </div>

                          {/* Vendor Representative */}
                          <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                            <label style={styles.formLabel} htmlFor="vendor_representative">Vendor Representative</label>
                            <input
                              type="text"
                              id="vendor_representative"
                              name="vendor_representative"
                              value={formData.vendor_representative}
                              onChange={handleInputChange}
                              style={styles.formControl}
                              disabled={isViewMode}
                            />
                          </div>

                          {/* Invoice No */}
                          <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                            <label style={styles.formLabel} htmlFor="invoice_no">Invoice No</label>
                            <input
                              type="text"
                              id="invoice_no"
                              name="invoice_no"
                              value={formData.invoice_no}
                              onChange={handleInputChange}
                              style={styles.formControl}
                              disabled={isViewMode}
                            />
                          </div>

                          {/* Invoice Date */}
                          <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                            <label style={styles.formLabel} htmlFor="invoice_date">Invoice Date</label>
                            <div style={styles.dateInputWrapper}>
                              <input
                                ref={invoiceDateRef}
                                type="date"
                                id="invoice_date"
                                name="invoice_date"
                                value={formData.invoice_date}
                                onChange={handleInputChange}
                                style={styles.formControl}
                                disabled={isViewMode}
                              />
                              <i 
                                className="fas fa-calendar-alt" 
                                style={styles.dateIcon}
                                onClick={() => !isViewMode && handleCalendarClick('invoice_date')}
                              ></i>
                            </div>
                          </div>

                          {/* MMR Date and Remark in same row */}
                          <div style={{...styles.formGroup, flex: '1 1 100%', display: 'flex', gap: '20px'}}>
                            {/* MMR Date */}
                            <div style={{...styles.formGroup, flex: '1 1 50%'}}>
                              <label style={styles.formLabel} htmlFor="mmr_date">MMR Date</label>
                              <div style={styles.dateInputWrapper}>
                                <input
                                  ref={mmrDateRef}
                                  type="date"
                                  id="mmr_date"
                                  name="mmr_date"
                                  value={formData.mmr_date || new Date().toISOString().split('T')[0]} // Use current date if no value
                                  onChange={handleInputChange}
                                  style={styles.formControl}
                                  disabled={isViewMode}
                                />
                                <i 
                                  className="fas fa-calendar-alt" 
                                  style={styles.dateIcon}
                                  onClick={() => !isViewMode && handleCalendarClick('mmr_date')}
                                ></i>
                              </div>
                            </div>

                            {/* Remark */}
                            <div style={{...styles.formGroup, flex: '1 1 50%'}}>
                              <label style={styles.formLabel} htmlFor="remark">Remark</label>
                              <textarea
                                id="remark"
                                name="remark"
                                value={formData.remark}
                                onChange={handleInputChange}
                                style={{
                                  ...styles.formControl,
                                  height: '40px',
                                  resize: 'vertical'
                                }}
                                disabled={isViewMode}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Material Details Section */}
                      <div style={styles.formSection}>
                        <div style={styles.materialItemHeader}>
                          <h4 style={styles.sectionTitle}>Material Details</h4>
                          {!isViewMode && (
                            <button
                              type="button"
                              style={styles.addMaterialButton}
                              onClick={addMaterialItem}
                            >
                              <i className="fas fa-plus"></i>
                              Add New
                            </button>
                          )}
                        </div>
                        
                        {/* Material Items - Now using the materialItems array */}
                        {materialItems.map((item, index) => (
                          <div key={item.id} style={styles.materialItemSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h5 style={{ margin: 0, color: '#1e40af', fontSize: '16px' }}>
                                Material Item {index + 1}
                              </h5>
                              {!isViewMode && materialItems.length > 1 && (
                                <button
                                  type="button"
                                  style={styles.removeMaterialBtn}
                                  onClick={() => removeMaterialItem(item.id)}
                                  title="Remove Material Item"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                            
                            <div style={{ 
                              ...styles.materialItem, 
                              display: 'flex',
                              gap: '10px',
                              marginBottom: '15px'
                            }}>
                              {/* Material/Item Name with Clear Button */}
                              <div style={{ 
                                ...styles.formGroup, 
                                flex: '2',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-end'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <label style={styles.formLabel} htmlFor={`item_name_${item.id}`}>
                                    Material / Item Name
                                  </label>

                                  <div style={styles.selectWrapper}>
                                    <select
                                      id={`item_name_${item.id}`}
                                      name="item_name"
                                      value={item.item_name || ""}
                                      onChange={(e) => updateMaterialItem(item.id, 'item_name', e.target.value)}
                                      style={{
                                        ...styles.formControl,
                                        ...(isViewMode || materialsLoading ? styles.formControlDisabled : {})
                                      }}
                                      disabled={isViewMode || materialsLoading}
                                    >
                                      <option value="">
                                        {vendorMaterialsLoading 
                                          ? "Loading vendor materials..." 
                                          : formData.vendor 
                                            ? `Select ${formData.vendor}'s Material` 
                                            : "Select Material"
                                        }
                                      </option>
                                      
                                      {/* Clear option - visible when a material is selected */}
                                      {item.item_name && (
                                        <option value="" style={{ color: '#ef4444', fontStyle: 'italic' }}>
                                          ✕ Clear Selection
                                        </option>
                                      )}
                                      
                                      {/* Show vendor materials if vendor is selected and materials exist */}
                                      {formData.vendor && vendorMaterials.length > 0 ? (
                                        <optgroup label={`${formData.vendor}'s Materials`}>
                                          {vendorMaterials.map((mat) => (
                                            <option key={mat.id} value={mat.material_name}>
                                              {mat.material_name}
                                            </option>
                                          ))}
                                        </optgroup>
                                      ) : formData.vendor && vendorMaterials.length === 0 && !vendorMaterialsLoading ? (
                                        <optgroup label="No materials found">
                                          <option value="" disabled>No materials available for this vendor</option>
                                        </optgroup>
                                      ) : null}
                                      
                                      {/* Show all materials only when no vendor is selected */}
                                      {!formData.vendor && (
                                        <optgroup label="All Materials">
                                          {materials.map((mat) => (
                                            <option key={mat.id} value={mat.material_name}>
                                              {mat.material_name}
                                            </option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </select>

                                    <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                                  </div>
                                </div>
                              </div>

                              {/* Unit */}
                              <div style={{ ...styles.formGroup, flex: '1' }}>
                                <label style={styles.formLabel}>Unit</label>
                                <input
                                  type="text"
                                  value={item.unit || ""}
                                  onChange={(e) => updateMaterialItem(item.id, 'unit', e.target.value)}
                                  style={{
                                    ...styles.formControl,
                                    backgroundColor: "#f1f5f9"
                                  }}
                                  disabled
                                />
                              </div>

                              {/* Category */}
                              <div style={{ ...styles.formGroup, flex: '1' }}>
                                <label style={styles.formLabel}>Category</label>
                                <input
                                  type="text"
                                  value={item.category || ""}
                                  onChange={(e) => updateMaterialItem(item.id, 'category', e.target.value)}
                                  style={{
                                    ...styles.formControl,
                                    backgroundColor: "#f1f5f9"
                                  }}
                                  disabled
                                />
                              </div>

                              {/* Subcategory */}
                              <div style={{ ...styles.formGroup, flex: '1' }}>
                                <label style={styles.formLabel}>Subcategory</label>
                                <input
                                  type="text"
                                  value={item.subcategory || ""}
                                  onChange={(e) => updateMaterialItem(item.id, 'subcategory', e.target.value)}
                                  style={{
                                    ...styles.formControl,
                                    backgroundColor: "#f1f5f9"
                                  }}
                                  disabled
                                />
                              </div>

                              {/* Royalty */}
                              <div style={{...styles.formGroup, flex: '1'}}>
                                <label style={styles.formLabel} htmlFor={`royalty_${item.id}`}>Royalty</label>
                                <div style={styles.selectWrapper}>
                                  <select
                                    id={`royalty_${item.id}`}
                                    value={item.royalty}
                                    onChange={(e) => updateMaterialItem(item.id, 'royalty', e.target.value)}
                                    style={{
                                      ...styles.formControl,
                                      ...(isViewMode ? styles.formControlDisabled : {})
                                    }}
                                    disabled={isViewMode}
                                  >
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                  </select>
                                  <i className="fas fa-chevron-down" style={styles.selectArrow}></i>
                                </div>
                              </div>
                            </div>

                            {/* Royalty Fields (shown only when royalty is "yes") */}
                            {item.showRoyaltyFields && (
                              <div style={{ display: 'flex', gap: '20px', marginTop: '15px', marginBottom: '15px' }}>
                                {/* Anukramak No */}
                                <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                  <label style={styles.formLabel} htmlFor={`anukramak_no_${item.id}`}>Anukramak No</label>
                                  <input
                                    type="text"
                                    id={`anukramak_no_${item.id}`}
                                    value={item.anukramak_no}
                                    onChange={(e) => updateMaterialItem(item.id, 'anukramak_no', e.target.value)}
                                    style={styles.formControl}
                                    disabled={isViewMode}
                                  />
                                </div>

                                {/* ETP No */}
                                <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                  <label style={styles.formLabel} htmlFor={`etp_no_${item.id}`}>ETP No</label>
                                  <input
                                    type="text"
                                    id={`etp_no_${item.id}`}
                                    value={item.etp_no}
                                    onChange={(e) => updateMaterialItem(item.id, 'etp_no', e.target.value)}
                                    style={styles.formControl}
                                    disabled={isViewMode}
                                  />
                                </div>

                                {/* Royalty QTY */}
                                <div style={{...styles.formGroup, flex: '1 1 30%'}}>
                                  <label style={styles.formLabel} htmlFor={`royalty_qty_${item.id}`}>Royalty QTY</label>
                                  <input
                                    type="number"
                                    id={`royalty_qty_${item.id}`}
                                    value={item.royalty_qty}
                                    onChange={(e) => updateMaterialItem(item.id, 'royalty_qty', e.target.value)}
                                    style={styles.formControl}
                                    step="0.01"
                                    disabled={isViewMode}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Rec Qty, Rate, GST, Less Amount in same row */}
                            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
                              {/* Rec. Qty */}
                              <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                                <label style={styles.formLabel} htmlFor={`rec_qty_${item.id}`}>Rec. Qty</label>
                                <input
                                  type="number"
                                  id={`rec_qty_${item.id}`}
                                  value={item.rec_qty}
                                  onChange={(e) => updateMaterialItem(item.id, 'rec_qty', e.target.value)}
                                  style={styles.formControl}
                                  step="0.01"
                                  disabled={isViewMode}
                                />
                              </div>

                              {/* Rate */}
                              <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                                <label style={styles.formLabel} htmlFor={`rate_${item.id}`}>Rate</label>
                                <input
                                  type="number"
                                  id={`rate_${item.id}`}
                                  value={item.rate}
                                  onChange={(e) => updateMaterialItem(item.id, 'rate', e.target.value)}
                                  style={styles.formControl}
                                  step="0.01"
                                  disabled={isViewMode}
                                />
                              </div>

                              {/* GST% */}
                              <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                                <label style={styles.formLabel} htmlFor={`gst_rate_${item.id}`}>GST%</label>
                                <input
                                  type="number"
                                  id={`gst_rate_${item.id}`}
                                  value={item.gst_rate}
                                  onChange={(e) => updateMaterialItem(item.id, 'gst_rate', e.target.value)}
                                  style={styles.formControl}
                                  step="0.01"
                                  disabled={isViewMode}
                                />
                              </div>

                              {/* Less Amount */}
                              <div style={{ ...styles.formGroup, flex: '1 1 25%' }}>
                                <label style={styles.formLabel} htmlFor={`less_amount_${item.id}`}>Less Amount</label>
                                <input
                                  type="number"
                                  id={`less_amount_${item.id}`}
                                  value={item.less_amount}
                                  onChange={(e) => updateMaterialItem(item.id, 'less_amount', e.target.value)}
                                  style={styles.formControl}
                                  step="0.01"
                                  disabled={isViewMode}
                                />
                              </div>
                            </div>
                            
                            {/* Specification */}
                            <div style={{ ...styles.formGroup, marginTop: '15px' }}>
                              <label style={styles.formLabel} htmlFor={`specification_${item.id}`}>Specification</label>
                              <textarea
                                id={`specification_${item.id}`}
                                value={item.specification}
                                onChange={(e) => updateMaterialItem(item.id, 'specification', e.target.value)}
                                style={{
                                  ...styles.formControl,
                                  height: '80px',
                                  resize: 'vertical'
                                }}
                                disabled={isViewMode}
                              />
                            </div>
                          </div>
                        ))}
                        
                        {/* Total Amount - Non-editable in view and edit modes */}
                        <div style={{ ...styles.formGroup, marginTop: '15px' }}>
                          <label style={styles.formLabel} htmlFor="total_amount">Total Amount</label>
                          <input
                            type="number"
                            id="total_amount"
                            name="total_amount"
                            value={formData.total_amount}
                            style={{
                              ...styles.formControl,
                              backgroundColor: "#f1f5f9"
                            }}
                            step="0.01"
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Documents Section for Edit Mode */}
                    <div 
                      style={
                        currentStep === 2 ? styles.stepContent : styles.stepContentHidden
                      }
                    >
                      <div style={styles.formSection}>
                        <h4 style={styles.sectionTitle}>Material Photos & Documents</h4>
                        
                        {/* Display existing documents */}
                        {materialDocuments.length > 0 && (
                          <div style={{marginBottom: '20px'}}>
                            <h5 style={{marginBottom: '10px', color: '#1e293b', fontSize: '16px'}}>Existing Documents</h5>
                            <table style={styles.documentTable}>
                              <thead>
                                <tr>
                                  <th style={styles.documentTableHeader}>Document Name</th>
                                  <th style={styles.documentTableHeader}>Preview</th>
                                 <th style={styles.documentActionsCell}>
  {!isViewMode ? "Actions" : ""}
</th>

                                </tr>
                              </thead>
                              <tbody>
                                {materialDocuments.map((doc, index) => {
                                  const isEven = index % 2 === 0;
                                  const isImage = doc.docName?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                                                 doc.filePath?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
                                  
                                  return (
                                    <tr 
                                      key={doc.id}
                                      style={{
                                        ...styles.documentTableRow,
                                        ...(isEven ? styles.documentTableRowEven : styles.documentTableRowOdd)
                                      }}
                                    >
                                      <td style={styles.documentTableCell}>
                                        {doc.docName || "Document"}
                                      </td>
                                      <td style={styles.documentTableCell}>
                                        {isImage ? (
                                           <img 
  src={imageUrls[doc.id] || getPlaceholderImage()} 
  alt={doc.docName}
  style={{
    cursor: 'pointer',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  }}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = getPlaceholderImage();
  }}
  onClick={() =>
    openImagePreview(
      imageUrls[doc.id] || getPlaceholderImage()
    )
  }
/>

                                        ) : doc.docName?.match(/\.pdf$/i) ? (
                                          <i className="fas fa-file-pdf fa-3x" style={{color: '#ef4444'}}></i>
                                        ) : (
                                          <i className="fas fa-file-alt fa-3x" style={{color: '#94a1b4'}}></i>
                                        )}
                                      </td>
                                   <td
  style={{
    ...styles.documentTableCell,
    ...styles.documentActionsCell
  }}
>

                                        {!isViewMode && (
                                          <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                                            <button
                                              style={{...styles.actionBtn, ...styles.viewBtn}}
                                              onClick={() => viewDocument(doc)}
                                              title="View"
                                            >
                                              <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                              style={{...styles.actionBtn, ...styles.docBtn}}
                                              onClick={() => downloadDocument(doc)}
                                              title="Download"
                                            >
                                              <i className="fas fa-download"></i>
                                            </button>
                                            <button
                                              style={{...styles.actionBtn, ...styles.editBtn}}
                                              onClick={() => openEditDocumentModal(doc)}
                                              title="Replace"
                                            >
                                              <i className="fas fa-sync-alt"></i>
                                            </button>
                                            <button
                                              style={{...styles.actionBtn, ...styles.deleteBtn}}
                                              onClick={() => handleDeleteDocument(doc.id)}
                                              title="Delete"
                                            >
                                              <i className="fas fa-trash"></i>
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {/* Upload new documents section - only show in add/edit mode */}
                        {!isViewMode && (
                          <>
                            <h5 style={{marginBottom: '10px', color: '#1e293b', fontSize: '16px'}}>Upload New Documents</h5>
                            <table style={styles.documentUploadTable}>
                              <thead>
                                <tr>
                                  <th style={styles.documentUploadTableHeader}>Document Type</th>
                                  <th style={styles.documentUploadTableHeader}>Select File</th>
                                  <th style={styles.documentUploadTableHeader}>Preview</th>
                                  <th style={styles.documentUploadTableHeader}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {documentFields.map((field, index) => {
                                  const isEven = index % 2 === 0;
                                  return (
                                    <tr 
                                      key={field.id}
                                      style={{
                                        ...styles.documentUploadTableRow,
                                        ...(isEven ? styles.documentUploadTableRowEven : styles.documentUploadTableRowOdd)
                                      }}
                                    >
                                      <td style={styles.documentUploadTableCell}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                          <select
                                            value={field.name}
                                            onChange={(e) => handleDocumentNameChange(field.id, e.target.value)}
                                            style={{
                                              ...styles.formControl,
                                              width: '100%',
                                              height: 'auto',
                                              padding: '6px 10px'
                                            }}
                                          >
                                            <option value="MATERIAL - PHOTO">MATERIAL - PHOTO</option>
                                            <option value="ROYALTY PHOTO">ROYALTY PHOTO</option>
                                            <option value="SUPPLIER SLIP">SUPPLIER SLIP</option>
                                            <option value="OTHER">OTHER</option>
                                          </select>
                                          
                                          {/* Show input field for custom name if "OTHER" is selected */}
                                          {field.name === "OTHER" && (
                                            <input
                                              type="text"
                                              placeholder="Enter document name"
                                              value={field.customName || ""}
                                              onChange={(e) => setDocumentFields(prev => prev.map(f => 
                                                f.id === field.id 
                                                  ? { ...f, customName: e.target.value }
                                                  : f
                                              ))}
                                              style={{
                                                ...styles.formControl,
                                                flex: 1,
                                                padding: '6px 10px'
                                              }}
                                            />
                                          )}
                                        </div>
                                      </td>
                                      <td style={styles.documentUploadTableCell}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <label style={styles.documentSelectButton}>
                                            <i className="fas fa-upload"></i> Choose File
                                            <input
                                              type="file"
                                              accept="image/*,.pdf,.doc,.docx"
                                              style={{ display: "none" }}
                                              onChange={(e) => handleDocumentFileChange(e, field.id)}
                                            />
                                          </label>
                                        </div>
                                      </td>
                                      <td style={styles.documentUploadTableCell}>
                                        {field.preview ? (
                                          <img 
                                            src={field.preview} 
                                            alt={field.name}
                                            style={styles.documentPreview}
                                            onClick={() => openImagePreview(field.preview)}
                                          />
                                        ) : (
                                          <div style={styles.documentPlaceholder}>
                                            <i className="fas fa-image"></i>
                                          </div>
                                        )}
                                      </td>
                                      <td style={styles.documentUploadTableCell}>
                                        {field.file && (
                                          <button
                                            style={styles.removeDocumentButton}
                                            onClick={() => setDocumentFields(prev => prev.map(f => 
                                              f.id === field.id 
                                                ? { ...f, file: null, preview: null, customName: "" }
                                                : f
                                            ))}
                                            title="Remove"
                                          >
                                            <i className="fas fa-trash"></i> Clear
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            
                            {/* Add Document Field Button */}
                            <button 
                              style={styles.addDocumentButton}
                              onClick={addDocumentField}
                            >
                              <i className="fas fa-plus"></i> Add Another Document
                            </button>
                            
                            {/* Save Documents Button - Always show when there are documents to upload */}
                            {documentFields.some(field => field.file) && (
                              <div style={{marginTop: '20px', textAlign: 'center'}}>
                                <button 
                                  style={{...styles.btn, ...styles.btnSuccess, padding: '12px 24px', fontSize: '16px'}}
                                  onClick={handleUploadDocuments}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin"></i>
                                      Uploading Documents...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save"></i>
                                      Save Documents
                                    </>
                                  )}
                                </button>
                                <p style={{marginTop: '10px', color: '#64748b', fontSize: '14px'}}>
                                  Click to upload selected documents
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
            
            {/* Modal Footer Buttons */}
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closeModal}
              >
                Close
              </button>
              
              {/* Add Mode: Only show Save Item button */}
              {!editingItem && !isViewMode && (
                <button 
                  style={{...styles.btn, ...styles.btnPrimary}}
                  type="button"
                  onClick={handleSubmit}
                >
                  Save Item
                </button>
              )}
              
              {/* Edit Mode: Show step navigation */}
              {editingItem && !isViewMode && (
                <>
                  {currentStep === 1 && (
                    <>
                      <button 
                        style={{...styles.btn, ...styles.btnSecondary}}
                        onClick={() => goToStep(2)}
                      >
                        Go to Documents
                      </button>
                      <button 
                        style={{...styles.btn, ...styles.btnPrimary}}
                        type="button"
                        onClick={handleSubmit}
                      >
                        Update Item
                      </button>
                    </>
                  )}
                  
                  {currentStep === 2 && (
                    <>
                      <button 
                        style={{...styles.btn, ...styles.btnSecondary}}
                        onClick={() => goToStep(1)}
                      >
                        <i className="fas fa-arrow-left"></i> Back to Item Details
                      </button>
                      {documentFields.some(field => field.file) && (
                        <button 
                          style={{...styles.btn, ...styles.btnSuccess}}
                          type="button"
                          onClick={handleUploadDocuments}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i> Uploading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save"></i> Save Documents
                            </>
                          )}
                        </button>
                      )}
                      <button 
                        style={{...styles.btn, ...styles.btnPrimary}}
                        type="button"
                        onClick={() => goToStep(1)}
                      >
                        Back to Item Details
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditDocModal && editingDocument && (
        <div style={styles.modal}>
          <div style={styles.docModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Document</h3>
              <button style={styles.modalClose} onClick={closeEditDocumentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Document Name</label>
                <input
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  style={styles.formControl}
                  placeholder="Enter document name"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Replace File (Optional)</label>
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <label style={{...styles.fileLabel, display: 'block', textAlign: 'center'}}>
                      <i className="fas fa-file-upload" style={{marginRight: '8px'}}></i>
                      Choose New File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleEditFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    {editDocFile && (
                      <div style={{marginTop: '10px'}}>
                        <small style={{color: '#10b981'}}>
                          <i className="fas fa-check-circle"></i> New file selected: {editDocFile.name}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Current File</label>
                <div style={styles.docPreview}>
                  {editingDocument.docName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                   <img 
  src={imageUrls[editingDocument.id] || getPlaceholderImage()} 
  alt={editingDocument.docName}
  style={{
    cursor: 'pointer',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  }}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = getPlaceholderImage();
  }}
  onClick={() =>
    openImagePreview(
      imageUrls[editingDocument.id] || getPlaceholderImage()
    )
  }
/>

                  ) : editingDocument.docName?.match(/\.pdf$/i) ? (
                    <i className="fas fa-file-pdf fa-3x" style={{color: '#ef4444'}}></i>
                  ) : (
                    <i className="fas fa-file-alt fa-3x" style={{color: '#94a1b4'}}></i>
                  )}
                </div>
                <p style={{textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#64748b'}}>
                  {editingDocument.docName || "Document"}
                </p>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closeEditDocumentModal}
              >
                Cancel
              </button>
              <button 
                style={{...styles.btn, ...styles.btnPrimary}} 
                onClick={handleUpdateDocument}
                disabled={!editDocName.trim()}
              >
                Update Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <div style={styles.modal}>
          <div style={styles.pdfModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>MMR Document</h3>
              <button style={styles.modalClose} onClick={closePdfModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              {pdfLoading ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
              ) : pdfData ? (
                <div style={styles.pdfDocument}>
                  {/* Document Header */}
                  <div style={styles.pdfDocumentHeader}>
                    <h2 style={styles.pdfDocumentTitle}>H S TAGORE CONSTRUCTIONS ENGINEERS & CONTRACTORS</h2>
                    <p style={styles.pdfDocumentSubTitle}>MMR</p>
                  </div>
                  
                  {/* MMR Details */}
                  <div style={styles.pdfDocumentSection}>
                    <h3 style={styles.pdfDocumentSectionTitle}>MMR Details</h3>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>MMR Date:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.mmrDate || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Project:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.project || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Store:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.project || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Vendor:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.vendor || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Inward No:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.inwardNo || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Vehicle No:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.vehicleNo || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Vendor Representative:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.vendorRepre || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Invoice No:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.invoiceNo || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Invoice Date:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.invoiceDate || "-"}</span>
                    </div>
                  </div>
                  
                  {/* Material Details */}
                  <div style={styles.pdfDocumentSection}>
                    <h3 style={styles.pdfDocumentSectionTitle}>Material Details</h3>
                    <table style={styles.pdfDocumentTable}>
                      <thead>
                        <tr>
                          <th style={styles.pdfDocumentTableHeader}>Item</th>
                          <th style={styles.pdfDocumentTableHeader}>Description</th>
                          <th style={styles.pdfDocumentTableHeader}>Quantity</th>
                          <th style={styles.pdfDocumentTableHeader}>Unit</th>
                          <th style={styles.pdfDocumentTableHeader}>Rate</th>
                          <th style={styles.pdfDocumentTableHeader}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={styles.pdfDocumentTableCell}>1</td>
                          <td style={styles.pdfDocumentTableCell}>{pdfData.materialName || "-"}</td>
                          <td style={styles.pdfDocumentTableCell}>{pdfData.recQty || "-"}</td>
                          <td style={styles.pdfDocumentTableCell}>{pdfData.unit || "-"}</td>
                          <td style={styles.pdfDocumentTableCell}>{pdfData.rate || "-"}</td>
                          <td style={styles.pdfDocumentTableCell}>
                            {(pdfData.recQty && pdfData.rate) ? (parseFloat(pdfData.recQty) * parseFloat(pdfData.rate)).toFixed(2) : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    
                    {/* GST Details */}
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>GST Rate:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.gst || "-"}</span>
                    </div>
                    
                    {/* Calculations */}
                    {(pdfData.recQty && pdfData.rate) && (
                      <>
                        <div style={styles.pdfDocumentRow}>
                          <span style={styles.pdfDocumentLabel}>Amount:</span>
                          <span style={styles.pdfDocumentValue}>
                            {(parseFloat(pdfData.recQty) * parseFloat(pdfData.rate)).toFixed(2)}
                          </span>
                        </div>
                        {pdfData.gst && (
                          <>
                            <div style={styles.pdfDocumentRow}>
                              <span style={styles.pdfDocumentLabel}>GST Amount:</span>
                              <span style={styles.pdfDocumentValue}>
                                {((parseFloat(pdfData.recQty) * parseFloat(pdfData.rate)) * parseFloat(pdfData.gst) / 100).toFixed(2)}
                              </span>
                            </div>
                            <div style={styles.pdfDocumentRow}>
                              <span style={styles.pdfDocumentLabel}>CGST:</span>
                              <span style={styles.pdfDocumentValue}>
                                {((parseFloat(pdfData.recQty) * parseFloat(pdfData.rate)) * parseFloat(pdfData.gst) / 200).toFixed(2)}
                              </span>
                            </div>
                            <div style={styles.pdfDocumentRow}>
                              <span style={styles.pdfDocumentLabel}>SGST:</span>
                              <span style={styles.pdfDocumentValue}>
                                {((parseFloat(pdfData.recQty) * parseFloat(pdfData.rate)) * parseFloat(pdfData.gst) / 200).toFixed(2)}
                              </span>
                            </div>
                            <div style={styles.pdfDocumentRow}>
                              <span style={styles.pdfDocumentLabel}>MMR Amount:</span>
                              <span style={styles.pdfDocumentValue}>
                                ₹ {(parseFloat(pdfData.recQty) * parseFloat(pdfData.rate) * (1 + parseFloat(pdfData.gst) / 100)).toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    
                    {/* Royalty Details (if applicable) */}
                    {pdfData.royalty === "yes" && (
                      <>
                        <div style={styles.pdfDocumentRow}>
                          <span style={styles.pdfDocumentLabel}>Anukramak No:</span>
                          <span style={styles.pdfDocumentValue}>{pdfData.anukrmankNo || "-"}</span>
                        </div>
                        <div style={styles.pdfDocumentRow}>
                          <span style={styles.pdfDocumentLabel}>ETP No:</span>
                          <span style={styles.pdfDocumentValue}>{pdfData.etpNo || "-"}</span>
                        </div>
                        <div style={styles.pdfDocumentRow}>
                          <span style={styles.pdfDocumentLabel}>Royalty Quantity:</span>
                          <span style={styles.pdfDocumentValue}>{pdfData.royaltyQty || "-"}</span>
                        </div>
                      </>
                    )}
                    
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Specification:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.specification || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Less Amount:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.lessAmt || "-"}</span>
                    </div>
                    <div style={styles.pdfDocumentRow}>
                      <span style={styles.pdfDocumentLabel}>Total Amount:</span>
                      <span style={styles.pdfDocumentValue}>{pdfData.totalAmt || "-"}</span>
                    </div>
                  </div>
                  
                  {/* Document Footer */}
                  <div style={styles.pdfDocumentFooter}>
                    <div>
                      <p>Prepared By:</p>
                      <p>{loggedInUser}</p>
                    </div>

                    <div>
                      <p>Vendor Representative:</p>
                      <p>{pdfData.vendorRepre || "-"}</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                  <i className="fas fa-exclamation-triangle" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                  <p>No PDF data available.</p>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button 
                style={{...styles.btn, ...styles.btnSecondary}} 
                onClick={closePdfModal}
              >
                Close
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                disabled={!pdfData}
                onClick={() => {
                  try {
                    downloadMMRPdf(pdfData);
                  } catch (error) {
                    console.error("PDF download error:", error);
                    toast.error("PDF download failed: " + error.message);
                  }
                }}
              >
                <i className="fas fa-file-pdf"></i> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreviewModal && (
        <div style={styles.imagePreviewModal}>
          <div style={styles.imagePreviewContent}>
            <button 
              style={styles.imagePreviewClose} 
              onClick={closeImagePreview}
            >
              <i className="fas fa-times"></i>
            </button>
            <img 
              src={previewImageSrc} 
              alt="Document Preview"
              style={styles.imagePreviewImg}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewAttachment && (
        <div style={styles.previewModal} onClick={closePreviewModal}>
          <div style={styles.previewContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.previewClose} onClick={closePreviewModal}>
              <i className="fas fa-times"></i>
            </button>
            {isImage(previewAttachment.name, previewAttachment.type) ? (
              <img 
                src={previewAttachment.url || previewAttachment.file && URL.createObjectURL(previewAttachment.file)} 
                alt={previewAttachment.name}
                style={styles.previewImage}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '400px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <i className={`fas ${getFileIcon(previewAttachment.name, previewAttachment.type)}`} style={{ 
                  fontSize: '80px', 
                  color: '#64748b',
                  marginBottom: '20px'
                }}></i>
                <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>{previewAttachment.name}</h3>
                <p style={{ color: '#64748b' }}>File size: {formatFileSize(previewAttachment.size)}</p>
                <button 
                  style={{...styles.btn, ...styles.btnPrimary, marginTop: '20px'}}
                  onClick={() => downloadAttachment(previewAttachment)}
                >
                  <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialVendorManagement;