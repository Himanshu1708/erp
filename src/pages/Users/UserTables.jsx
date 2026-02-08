

// import React, { useState, useEffect } from 'react';
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import toast, { Toaster } from 'react-hot-toast';
// import axios from 'axios';
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// const UserManagement = () => {
//   // State for modal visibility
//   const [showModal, setShowModal] = useState(false);
//   const [hoveredRow, setHoveredRow] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingUser, setEditingUser] = useState(null);
//   const [isViewMode, setIsViewMode] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loggedInUser, setLoggedInUser] = useState(null);

//   // Departments state
//   const [departments, setDepartments] = useState([]);
//   const [deptLoading, setDeptLoading] = useState(false);

//   // Designations state
//   const [designations, setDesignations] = useState([]);
//   const [desigLoading, setDesigLoading] = useState(false);

//   // Image management states
//   const [userImage, setUserImage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [isUploadingImage, setIsUploadingImage] = useState(false);
//   const [currentStaffId, setCurrentStaffId] = useState(null);
//   const [currentImageId, setCurrentImageId] = useState(null);

//   // State for form data
//   const [formData, setFormData] = useState({
//     roleId: "",
//     userName: "",
//     email: "",
//     password: "",
//     department: "",
//     designation: "",
//     mobileNo: "",
//     createBy: "",
//     userImage: "",
//     status: "Active",
//     createdDate: new Date().toISOString()
//   });

//   // API base URL
//   const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
//   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pharma2.shop';

//   // Create axios instance with auth header
//   const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   // Add request interceptor for auth token
//   api.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

//   // *** KEY FUNCTION: Construct the full image URL from the filePath ***
//   const getImageUrl = (filePath) => {
//     if (!filePath) return null;
    
//     // If it's already a full URL or data URL, return it as is
//     if (filePath.startsWith('http') || filePath.startsWith('data:')) {
//       return filePath;
//     }
    
//     // Clean the file path by removing leading slash if it exists
//     let cleanPath = filePath.trim();
//     if (cleanPath.startsWith('/')) {
//       cleanPath = cleanPath.substring(1);
//     }
    
//     // Construct the full URL using the backend base URL and the cleaned file path
//     // Add a cache-busting timestamp to prevent showing stale images
//     const finalUrl = `${BACKEND_URL}/${cleanPath}?t=${Date.now()}`;
//     return finalUrl;
//   };

//   // Get placeholder image
//   const getPlaceholderImage = () => {
//     return `https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200`;
//   };

//   // *** KEY FUNCTION: Extract image info (filePath and id) from the user's documents array ***
//   const extractUserImage = (userData) => {
//     if (!userData || !userData.documents || !Array.isArray(userData.documents)) {
//       return null;
//     }
    
//     // Find the document where docType is "IMAGE"
//     const imageDoc = userData.documents.find(doc => 
//       (doc.docType === "IMAGE" || doc.doc_type === "IMAGE") && 
//       (doc.filePath || doc.file_path)
//     );
    
//     if (imageDoc) {
//       return {
//         id: imageDoc.id,
//         // Use filePath or file_path, whichever is available
//         filePath: imageDoc.filePath || imageDoc.file_path,
//       };
//     }
    
//     return null;
//   };

//   // Fetch logged-in user data
//   const fetchLoggedInUser = async () => {
//     try {
//       const response = await api.get('/auth/me');
//       if (response.data && response.data.status === 200) {
//         setLoggedInUser(response.data.data);
//         const userName = response.data.data.userName || response.data.data.email || 'Admin';
//         setFormData(prev => ({ ...prev, createBy: userName }));
//       }
//     } catch (error) {
//       console.error('Error fetching logged-in user:', error);
//       const tokenData = JSON.parse(localStorage.getItem('userData') || '{}');
//       if (tokenData.userName) {
//         setLoggedInUser(tokenData);
//         setFormData(prev => ({ ...prev, createBy: tokenData.userName }));
//       }
//     }
//   };

//   // Fetch all data on component mount
//   useEffect(() => {
//     fetchLoggedInUser();
//     fetchUsers();
//     fetchDepartments();
//     fetchDesignations();
//   }, []);

//   // Fetch departments 
//   const fetchDepartments = async () => {
//     try {
//       setDeptLoading(true);
//       const response = await api.get("/department/getAllDept");
//       if (response.status === 200 && Array.isArray(response.data)) {
//         setDepartments(response.data);
//       } else {
//         setDepartments([]);
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//       setDepartments([]);
//       toast.error("Failed to load departments");
//     } finally {
//       setDeptLoading(false);
//     }
//   };

//   // Fetch designation 
//   const fetchDesignations = async () => {
//     try {
//       setDesigLoading(true);
//       const response = await api.get("/designation/getAllDesig");
//       if (response.status === 200 && Array.isArray(response.data)) {
//         setDesignations(response.data);
//       } else {
//         setDesignations([]);
//       }
//     } catch (error) {
//       console.error("Error fetching designations:", error);
//       setDesignations([]);
//       toast.error("Failed to load designations");
//     } finally {
//       setDesigLoading(false);
//     }
//   };

//   // *** KEY FUNCTION: Fetch all users and process their image URLs ***
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/auth/staff');
      
//       if (response.data && response.data.status === 200) {
//         const usersData = response.data.data || [];
        
//         // Process each user to extract image information and construct the image URL
//         const processedUsers = usersData.map(user => {
//           // Extract the image object from the documents array
//           const imageInfo = extractUserImage(user);
          
//           // Default to a placeholder image
//           let imageUrl = getPlaceholderImage();
//           let hasImage = false;
          
//           // If image info exists, construct the full URL from the filePath
//           if (imageInfo && imageInfo.filePath) {
//             imageUrl = getImageUrl(imageInfo.filePath);
//             hasImage = true;
//           }
          
//           return {
//             ...user,
//             // Store the fully constructed URL for easy use in the component
//             imageUrl: imageUrl,
//             hasImage: hasImage,
//             imageId: imageInfo?.id,
//             imageInfo: imageInfo,
//             originalImagePath: imageInfo?.filePath // Keep original for debugging
//           };
//         });
        
//         setUsers(processedUsers);
//       } else {
//         toast.error(response.data?.message || 'Failed to fetch users');
//         setUsers([]);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       toast.error(error.response?.data?.message || 'Failed to fetch users');
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle image selection
//   const handleImageSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//       if (!validTypes.includes(file.type)) {
//         toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error('Image size should be less than 5MB');
//         return;
//       }
      
//       setUserImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Upload staff image
//   const uploadStaffImage = async (staffId) => {
//     if (!userImage) {
//       toast.error("Please select an image to upload");
//       return;
//     }
//     setIsUploadingImage(true);
//     try {
//       const formData = new FormData();
//       formData.append("image", userImage);
//       const response = await api.post(`/auth/staff/${staffId}/upload-image`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       if (response.data && response.data.status === 200) {
//         toast.success('Image uploaded successfully.');
//         // Refresh users to get the new image path from the backend
//         fetchUsers(); 
//         closeModal();
//       } else {
//         toast.error(response.data?.message || 'Failed to upload image');
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       toast.error(error.response?.data?.message || 'Failed to upload image');
//     } finally {
//       setIsUploadingImage(false);
//     }
//   };

//   // Update staff image
//   const updateStaffImage = async () => {
//     if (!userImage || !currentImageId) {
//       toast.error("Please select a new image");
//       return;
//     }
//     setIsUploadingImage(true);
//     try {
//       const formData = new FormData();
//       formData.append("itemimage", userImage);
//       const response = await api.put(
//         `/auth/updateStaffDocument/${currentImageId}`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );
//       if (response.data && response.data.status === 200) {
//         toast.success('Image updated successfully');
//         // Refresh users to see the updated image
//         fetchUsers();
//         setUserImage(null);
//       } else {
//         toast.error(response.data?.message || 'Failed to update image');
//       }
//     } catch (error) {
//       console.error('Error updating image:', error);
//       toast.error(error.response?.data?.message || 'Failed to update image');
//     } finally {
//       setIsUploadingImage(false);
//     }
//   };

//   // Delete staff image
//   const deleteStaffImage = async (staffId) => {
//     if (!window.confirm("Are you sure you want to delete this image?")) return;
//     try {
//       const response = await api.delete(`/auth/staff/${staffId}/delete-image`);
//       if (response.data && response.data.status === 200) {
//         toast.success('Image deleted successfully');
//         // Refresh users to reflect the deletion
//         fetchUsers();
//       } else {
//         toast.error(response.data?.message || 'Failed to delete image');
//       }
//     } catch (error) {
//       console.error('Error deleting image:', error);
//       toast.error(error.response?.data?.message || 'Failed to delete image');
//     }
//   };

//   // Helper function to get role name from roleId
//   const getRoleName = (roleId) => {
//     switch(roleId) {
//       case 1: return "SUPERADMIN";
//       case 2: return "ADMIN";
//       case 3: return "USER";
//       default: return `Role ${roleId}`;
//     }
//   };

//   // Function to get user initials (first and last word)
//   const getUserInitials = (userName) => {
//     if (!userName) return "U";
    
//     const words = userName.trim().split(/\s+/);
//     if (words.length === 0) return "U";
    
//     const firstInitial = words[0].charAt(0).toUpperCase();
//     const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0).toUpperCase() : '';
    
//     return firstInitial + lastInitial;
//   };
  
//   // Open modal for adding new user
//   const openAddModal = () => {
//     setEditingUser(null);
//     setIsViewMode(false);
//     setUserImage(null);
//     setPreviewImage(getPlaceholderImage());
//     setCurrentStaffId(null);
//     setCurrentImageId(null);
//     setFormData({
//       roleId: "",
//       userName: "",
//       email: "",
//       password: "",
//       department: "",
//       designation: "",
//       mobileNo: "",
//       createBy: loggedInUser?.userName || loggedInUser?.email || "Admin",
//       userImage: "",
//       status: "Active",
//       createdDate: new Date().toISOString()
//     });
//     setShowModal(true);
//   };

//   // *** KEY FUNCTION: Open modal for editing user and display image from filePath ***
//   const openEditModal = async (user) => {
//     try {
//       setEditingUser(user);
//       setIsViewMode(false);
//       setCurrentStaffId(user.id);
      
//       // Use the already fetched user data to get the image info
//       const imageInfo = extractUserImage(user);
      
//       let imageUrl = getPlaceholderImage();
//       let imageId = null;
      
//       // If imageInfo exists, construct the URL from the filePath
//       if (imageInfo && imageInfo.filePath) {
//         imageUrl = getImageUrl(imageInfo.filePath);
//         imageId = imageInfo.id;
//       }
      
//       // Set the preview image in the modal to the constructed URL
//       setPreviewImage(imageUrl);
//       setCurrentImageId(imageId);
      
//       setFormData({
//         roleId: user.roleId || "",
//         userName: user.userName || "",
//         email: user.email || "",
//         password: "",
//         department: user.department || "",
//         designation: user.designation || "",
//         mobileNo: user.mobileNo || "",
//         createBy: user.createBy || loggedInUser?.userName || "Admin",
//         userImage: imageInfo?.filePath || "",
//         status: user.status || "Active",
//         createdDate: user.createdDate || new Date().toISOString()
//       });
//       setShowModal(true);
//     } catch (error) {
//       console.error('Error opening edit modal:', error);
//       toast.error('Failed to open edit modal');
//     }
//   };

//   // Open modal for viewing user
//   const openViewModal = async (user) => {
//     try {
//       setEditingUser(user);
//       setIsViewMode(true);
//       setCurrentStaffId(user.id);
      
//       const imageInfo = extractUserImage(user);
      
//       let imageUrl = getPlaceholderImage();
//       if (imageInfo && imageInfo.filePath) {
//         imageUrl = getImageUrl(imageInfo.filePath);
//       }
      
//       setPreviewImage(imageUrl);
      
//       setFormData({
//         roleId: user.roleId || "",
//         userName: user.userName || "",
//         email: user.email || "",
//         password: "********",
//         department: user.department || "",
//         designation: user.designation || "",
//         mobileNo: user.mobileNo || "",
//         createBy: user.createBy || "",
//         userImage: imageInfo?.filePath || "",
//         status: user.status || "Active",
//         createdDate: user.createdDate || new Date().toISOString()
//       });
//       setShowModal(true);
//     } catch (error) {
//       console.error('Error opening view modal:', error);
//       toast.error('Failed to open view modal');
//     }
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setEditingUser(null);
//     setIsViewMode(false);
//     setUserImage(null);
//     setPreviewImage(null);
//     setCurrentStaffId(null);
//     setCurrentImageId(null);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === 'createBy') return;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Handle form submission (create/update user)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.email.includes("@gmail.com")) {
//       toast.error("Email must contain @gmail.com", { position: 'top-right' });
//       return;
//     }
//     try {
//       const submitData = {
//         ...formData,
//         createBy: editingUser ? formData.createBy : (loggedInUser?.userName || loggedInUser?.email || "Admin")
//       };

//       let response;
//       if (editingUser) {
//         response = await api.put(`/auth/staff/${editingUser.id}`, submitData);
//       } else {
//         response = await api.post('/auth/staff', submitData);
//       }

//       if (response.data.status === 200) {
//         const message = editingUser ? 'User updated successfully' : 'User created successfully';
//         toast.success(message, { position: 'top-right' });
        
//         if (userImage) {
//           if (editingUser) {
//             if (currentImageId) {
//               await updateStaffImage();
//             } else {
//               await uploadStaffImage(editingUser.id);
//             }
//           } else {
//             const newUserId = response.data.data?.id;
//             if (newUserId) {
//               await uploadStaffImage(newUserId);
//             }
//           }
//         } else {
//           fetchUsers();
//           closeModal();
//         }
//       } else {
//         toast.error(response.data.message || 'Failed to save user', { position: 'top-right' });
//       }
//     } catch (error) {
//       console.error('Error saving user:', error);
//       toast.error(error.response?.data?.message || 'Failed to save user', { position: 'top-right' });
//     }
//   };

//   // Export to Excel
//   const handleExportExcel = () => {
//     if (!users || users.length === 0) {
//       toast.error("No data available to export");
//       return;
//     }
//     const excelData = users.map((user, index) => ({
//       "Sr No": index + 1,
//       "User Name": user.userName,
//       "Email": user.email,
//       "Role": getRoleName(user.roleId),
//       "Department": user.department,
//       "Designation": user.designation,
//       "Mobile Number": user.mobileNo,
//       "Status": user.status,
//       "Created By": user.createBy || "N/A",
//       "Created Date": user.createdDate ? new Date(user.createdDate).toLocaleDateString() : ""
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(excelData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
//     saveAs(fileData, `User_Management_${Date.now()}.xlsx`);
//   };

//   // Handle user deletion
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     try {
//       const response = await api.delete(`/auth/delete/staff/${id}`);
//       if (response.data.status === 200) {
//         toast.success('User deleted successfully', { position: 'top-right' });
//         fetchUsers();
//       } else {
//         toast.error(response.data.message || 'Failed to delete user', { position: 'top-right' });
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       toast.error(error.response?.data?.message || 'Failed to delete user', { position: 'top-right' });
//     }
//   };

//   const filteredUsers = users.filter((user) => {
//     const search = searchTerm.toLowerCase();
//     const roleName = getRoleName(user.roleId).toLowerCase();
//     return (
//       user.userName?.toLowerCase().includes(search) ||
//       user.email?.toLowerCase().includes(search) ||
//       roleName.includes(search) ||
//       user.department?.toLowerCase().includes(search) ||
//       user.designation?.toLowerCase().includes(search)
//     );
//   });

//   // Style definitions
//   const styles = {
//     container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', color: '#1e293b', lineHeight: '1.6' },
//     mainContent: { flex: '1', padding: '30px', overflowY: 'auto' },
//     header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
//     headerTitle: { fontSize: '28px', fontWeight: '700', color: '#1e293b' },
//     headerActions: { display: 'flex', gap: '15px' },
//     btn: { padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '8px' },
//     btnPrimary: { backgroundColor: '#1e40af', color: '#ffffff' },
//     btnSecondary: { backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0' },
//     btnSuccess: { backgroundColor: '#10b981', color: '#ffffff' },
//     btnWarning: { backgroundColor: '#f59e0b', color: '#ffffff' },
//     btnDanger: { backgroundColor: '#ef4444', color: '#ffffff' },
//     tableContainer: { backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden' },
//     tableHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//     tableTitle: { fontSize: '20px', fontWeight: '600' },
//     tableActions: { display: 'flex', gap: '10px' },
//     searchBox: { position: 'relative' },
//     searchInput: { padding: '8px 15px 8px 40px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '250px', fontFamily: 'inherit' },
//     searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
//     table: { width: '100%', borderCollapse: 'collapse' },
//     th: { backgroundColor: '#dbeafe', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' },
//     td: { padding: '15px', borderBottom: '1px solid #e2e8f0' },
//     tr: { transition: 'background-color 0.2s ease' },
//     trHover: { backgroundColor: '#e2e8f0' },
//     userAvatarContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
//     userAvatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#1e293b' },
//     statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', display: 'inline-block' },
//     statusActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
//     statusInactive: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
//     actionButtons: { display: 'flex', gap: '8px' },
//     actionBtn: { width: '32px', height: '32px', borderRadius: '6px', border: 'none', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
//     modal: { display: 'flex', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '1000', alignItems: 'center', justifyContent: 'center' },
//     // *** CORRECTED SYNTAX ERROR HERE ***
//     modalContent: { backgroundColor: '#ffffff', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
//     modalHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//     modalTitle: { fontSize: '20px', fontWeight: '600' },
//     modalClose: { background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' },
//     modalBody: { padding: '20px' },
//     formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
//     formGroup: { marginBottom: '20px' },
//     formGroupFullWidth: { gridColumn: 'span 2' },
//     formLabel: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' },
//     formControl: { width: '100%', padding: '10px 15px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit', transition: 'all 0.2s ease' },
//     modalFooter: { padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
//     loadingSpinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' },
//     passwordContainer: { position: 'relative' },
//     passwordToggle: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#64748b' },
//     imageUploadSection: { gridColumn: 'span 2', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' },
//     imagePreviewContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
//     imagePreview: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0', backgroundColor: '#f1f5f9' },
//     imageActions: { display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' },
//     fileInput: { display: 'none' },
//   };

//   return (
//     <div style={styles.container}>
//       <Toaster position="top-right" />
//       <main style={styles.mainContent}>
//         <div style={styles.header}>
//           <h1 style={styles.headerTitle}>User Management</h1>
//           <div style={styles.headerActions}>
//             <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={handleExportExcel}>
//               <i className="fas fa-download"></i> Export
//             </button>
//             <button style={{...styles.btn, ...styles.btnPrimary}} onClick={openAddModal}>
//               <i className="fas fa-plus"></i> Add User
//             </button>
//           </div>
//         </div>

//         <div style={styles.tableContainer}>
//           <div style={styles.tableHeader}>
//             <div style={styles.tableTitle}>All Users ({filteredUsers.length})</div>
//             <div style={styles.tableActions}>
//               <div style={styles.searchBox}>
//                 <i className="fas fa-search" style={styles.searchIcon}></i>
//                 <input type="text" placeholder="Search users..." style={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//               </div>
//             </div>
//           </div>
          
//           {loading ? (
//             <div style={styles.loadingSpinner}>
//               <i className="fas fa-spinner fa-spin fa-2x"></i>
//             </div>
//           ) : (
//             <table style={styles.table}>
//               <thead>
//                 <tr>
//                   <th style={styles.th}>Sr No</th>
//                   <th style={styles.th}>User Name</th>
//                   <th style={styles.th}>Email</th>
//                   <th style={styles.th}>Role</th>
//                   <th style={styles.th}>Department</th>
//                   <th style={styles.th}>Mobile Number</th>
//                   <th style={styles.th}>Status</th>
//                   <th style={styles.th}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
//                   const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
//                   const isHovered = hoveredRow === user.id;
//                   return (
//                     <tr key={user.id} style={{ ...styles.tr, backgroundColor: isHovered ? '#e2e8f0' : rowBgColor }} onMouseEnter={() => setHoveredRow(user.id)} onMouseLeave={() => setHoveredRow(null)}>
//                       <td style={styles.td}>{index + 1}</td>
//                       <td style={styles.td}>
//                         <div style={styles.userAvatarContainer}>
//                           {user.hasImage ? (
//                             <img src={user.imageUrl} alt={user.userName} style={styles.userAvatar} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
//                           ) : null}
//                           <div style={{...styles.userAvatar, display: user.hasImage ? 'none' : 'flex' }}>{getUserInitials(user.userName)}</div>
//                           <span>{user.userName}</span>
//                         </div>
//                       </td>
//                       <td style={styles.td}>{user.email}</td>
//                       <td style={styles.td}>{getRoleName(user.roleId)}</td>
//                       <td style={styles.td}>{user.department}</td>
//                       <td style={styles.td}>{user.mobileNo}</td>
//                       <td style={styles.td}>
//                         <span style={{ ...styles.statusBadge, ...(user.status === 'Active' ? styles.statusActive : styles.statusInactive) }}>
//                           {user.status || 'Active'}
//                         </span>
//                       </td>
//                       <td style={styles.td}>
//                         <div style={styles.actionButtons}>
//                           <button style={{...styles.actionBtn, color: '#16a34a'}} title="Edit" onClick={() => openEditModal(user)}>
//                             <i className="fas fa-edit"></i>
//                           </button>
//                           <button style={{...styles.actionBtn, color: '#eab308'}} title="View" onClick={() => openViewModal(user)}>
//                             <i className="fas fa-eye"></i>
//                           </button>
//                           <button style={{...styles.actionBtn, color: '#dc2626'}} title="Delete" onClick={() => handleDelete(user.id)}>
//                             <i className="fas fa-trash"></i>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr>
//                     <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '30px'}}>No users found matching your search.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </main>

//       {showModal && (
//         <div style={styles.modal}>
//           <div style={styles.modalContent}>
//             <div style={styles.modalHeader}>
//               <h3 style={styles.modalTitle}>{isViewMode ? 'View User' : (editingUser ? 'Edit User' : 'Add New User')}</h3>
//               <button style={styles.modalClose} onClick={closeModal}>
//                 <i className="fas fa-times"></i>
//               </button>
//             </div>
//             <div style={styles.modalBody}>
//               <form onSubmit={handleSubmit}>
//                 <div style={styles.imageUploadSection}>
//                   <div style={styles.imagePreviewContainer}>
//                     <img src={previewImage || getPlaceholderImage()} alt="User Preview" style={styles.imagePreview} onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderImage(); }} />
//                     {!isViewMode && (
//                       <div style={styles.imageActions}>
//                         <label style={{...styles.btn, ...styles.btnSecondary, cursor: 'pointer'}}>
//                           <i className="fas fa-camera"></i> {userImage ? 'Change Image' : 'Select Image'}
//                           <input type="file" accept="image/*" style={styles.fileInput} onChange={handleImageSelect} />
//                         </label>
//                         {userImage && (
//                           <>
//                             <button type="button" style={{...styles.btn, ...styles.btnSuccess}} onClick={() => { if (editingUser) { if (currentImageId) { updateStaffImage(); } else { uploadStaffImage(editingUser.id); } } }} disabled={isUploadingImage}>
//                               {isUploadingImage ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
//                               {editingUser ? (currentImageId ? 'Update Image' : 'Upload Image') : 'Upload Image'}
//                             </button>
//                             <button type="button" style={{...styles.btn, ...styles.btnSecondary}} onClick={() => { setUserImage(null); if (editingUser) { setPreviewImage(users.find(u => u.id === editingUser.id)?.imageUrl || getPlaceholderImage()); } else { setPreviewImage(getPlaceholderImage()); } }}>
//                               <i className="fas fa-times"></i> Clear
//                             </button>
//                           </>
//                         )}
//                         {editingUser && users.find(u => u.id === editingUser.id)?.hasImage && !userImage && (
//                           <button type="button" style={{...styles.btn, ...styles.btnDanger}} onClick={() => deleteStaffImage(editingUser.id)}>
//                             <i className="fas fa-trash"></i> Delete Image
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div style={styles.formGrid}>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="roleId">Role</label>
//                     <select id="roleId" name="roleId" value={formData.roleId} onChange={handleInputChange} style={styles.formControl} required disabled={isViewMode}>
//                       <option value="">Select Role</option>
//                       <option value="2">Admin</option>
//                       <option value="3">User</option>
//                     </select>
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="userName">User Name</label>
//                     <input type="text" id="userName" name="userName" required value={formData.userName} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode} />
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="email">Email <span style={{color: '#ef4444'}}>*</span></label>
//                     <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode} />
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="password">Password <span style={{color: '#ef4444'}}>*</span></label>
//                     <div style={styles.passwordContainer}>
//                       <input type={showPassword ? "text" : "password"} id="password" name="password" required={!editingUser} value={formData.password} onChange={handleInputChange} style={styles.formControl} placeholder={editingUser ? "Leave blank to keep current password" : "Enter your password"} disabled={isViewMode} />
//                       {!isViewMode && (
//                         <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
//                           {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="department">Department</label>
//                     <select id="department" name="department" value={formData.department} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode || deptLoading}>
//                       <option value="">{deptLoading ? "Loading departments..." : "Select Department"}</option>
//                       {departments.map((dept) => (
//                         <option key={dept.id} value={dept.department_name}>{dept.department_name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="designation">Designation</label>
//                     <select id="designation" name="designation" value={formData.designation} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode || desigLoading}>
//                       <option value="">{desigLoading ? "Loading designations..." : "Select Designation"}</option>
//                       {designations.map((desig) => (
//                         <option key={desig.id} value={desig.designation_name}>{desig.designation_name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="mobileNo">Mobile Number</label>
//                     <input type="tel" id="mobileNo" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode} />
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="status">Status</label>
//                     <select id="status" name="status" value={formData.status} onChange={handleInputChange} style={styles.formControl} disabled={isViewMode}>
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                     </select>
//                   </div>
//                   <div style={styles.formGroup}>
//                     <label style={styles.formLabel} htmlFor="createBy">Created By</label>
//                     <input type="text" id="createBy" name="createBy" value={formData.createBy} style={{...styles.formControl, backgroundColor: '#f1f5f9', cursor: 'not-allowed'}} disabled={true} readOnly />
//                   </div>
//                   <input type="hidden" name="createdDate" value={formData.createdDate} />
//                 </div>
//               </form>
//             </div>
//             <div style={styles.modalFooter}>
//               <button style={{...styles.btn, ...styles.btnSecondary}} onClick={closeModal}>Cancel</button>
//               {!isViewMode && (
//                 <button style={{...styles.btn, ...styles.btnPrimary}} onClick={handleSubmit} disabled={isUploadingImage}>
//                   {isUploadingImage ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : (editingUser ? 'Update User' : 'Save User')}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UserManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // Designations state
  const [designations, setDesignations] = useState([]);
  const [desigLoading, setDesigLoading] = useState(false);

  // Roles state
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);

  // Image management states
  const [userImage, setUserImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  // Image viewing modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    roleId: "",
    userName: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    mobileNo: "",
    createBy: "",
    userImage: "",
    status: "Active",
    createdDate: new Date().toISOString()
  });

  // API base URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://pharma2.shop';
  const API_BASE_URL = `${BACKEND_URL}/api`;

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

  // Get image URL function
  const getImageUrl = (filePath) => {
    if (!filePath) return null;

    const cacheBuster = `t=${Date.now()}`;

    if (filePath.startsWith("http")) {
      return `${filePath}?${cacheBuster}`;
    }

    if (filePath.startsWith("/")) {
      return `${BACKEND_URL}${filePath}?${cacheBuster}`;
    }

    return `${BACKEND_URL}/${filePath}?${cacheBuster}`;
  };

  // Get placeholder image
  const getPlaceholderImage = () => {
    return `https://ui-avatars.com/api/?name=User&background=random&color=fff&size=200`;
  };

  // View image in modal
  const viewImage = async (imagePath, fileName = "User Image") => {
    if (!imagePath) {
      toast.error("No image path available");
      return;
    }
    
    try {
      setImageLoading(true);
      
      const imageUrl = getImageUrl(imagePath);
      const token = localStorage.getItem('token');
      const response = await fetch(imageUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        setViewingImage({
          url: objectUrl,
          name: fileName
        });
        setShowImageModal(true);
      } else {
        throw new Error('Failed to fetch image');
      }
    } catch (error) {
      console.error("Error viewing image:", error);
      toast.error("Failed to open image");
    } finally {
      setImageLoading(false);
    }
  };

  // Close image modal
  const closeImageModal = () => {
    if (viewingImage && viewingImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(viewingImage.url);
    }
    setShowImageModal(false);
    setViewingImage(null);
  };

  // Download image
  const downloadImage = async (imagePath, fileName = "user-image") => {
    if (!imagePath) {
      toast.error("No image path available");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const fileUrl = getImageUrl(imagePath);

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
      const extension = imagePath.split('.').pop() || 'jpg';
      a.download = `${fileName}.${extension}`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  // Extract image from user data
  const extractUserImage = (userData) => {
    if (!userData) return null;
    
    if (userData.documents && Array.isArray(userData.documents)) {
      const imageDoc = userData.documents.find(doc => 
        (doc.docType === "IMAGE" || doc.doc_type === "IMAGE") && 
        (doc.file_path || doc.filePath)
      );
      if (imageDoc) {
        return {
          id: imageDoc.id || imageDoc.doc_id,
          filePath: imageDoc.file_path || imageDoc.filePath,
          docType: imageDoc.docType || imageDoc.doc_type,
          fileName: imageDoc.file_name || imageDoc.fileName
        };
      }
    }
    
    if (userData.data && userData.data.documents && Array.isArray(userData.data.documents)) {
      const imageDoc = userData.data.documents.find(doc => 
        (doc.docType === "IMAGE" || doc.doc_type === "IMAGE") && 
        (doc.file_path || doc.filePath)
      );
      if (imageDoc) {
        return {
          id: imageDoc.id || imageDoc.doc_id,
          filePath: imageDoc.file_path || imageDoc.filePath,
          docType: imageDoc.docType || imageDoc.doc_type,
          fileName: imageDoc.file_name || imageDoc.fileName
        };
      }
    }
    
    if (userData.file_path) {
      return {
        filePath: userData.file_path,
        fileName: userData.file_name || "user-image"
      };
    }
    
    if (userData.userImage) {
      return {
        filePath: userData.userImage,
        fileName: "user-image"
      };
    }
    
    if (userData.staffImage && userData.staffImage.filePath) {
      return {
        id: userData.staffImage.id,
        filePath: userData.staffImage.filePath,
        fileName: userData.staffImage.fileName || "user-image"
      };
    }
    
    return null;
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchLoggedInUser();
    fetchUsers();
    fetchDepartments();
    fetchDesignations();
    fetchRoles();
    
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (viewingImage && viewingImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(viewingImage.url);
      }
    };
  }, []);

  // Fetch roles - Only Admin (ID: 2) and User (ID: 3)
  const fetchRoles = async () => {
    try {
      setRoleLoading(true);
      const response = await api.get('/auth/roles');
      
      if (response.data && response.data.status === 200) {
        // Filter roles to only show Admin (ID: 2) and User (ID: 3)
        const filteredRoles = (response.data.data || []).filter(role => 
          role.id === 2 || role.id === 3
        );
        
        // If no roles found from API, use default Admin and User
        if (filteredRoles.length === 0) {
          setRoles([
            { id: 2, name: "Admin" },
            { id: 3, name: "User" }
          ]);
        } else {
          setRoles(filteredRoles);
        }
      } else {
        // Use only Admin and User roles
        setRoles([
          { id: 2, name: "Admin" },
          { id: 3, name: "User" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Use only Admin and User roles on error
      setRoles([
        { id: 2, name: "Admin" },
        { id: 3, name: "User" }
      ]);
      toast.error("Failed to load roles");
    } finally {
      setRoleLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const response = await api.get('/department/getAllDept');
      
      if (response.status === 200) {
        if (response.data && response.data.status === 200) {
          setDepartments(response.data.data || []);
        } else if (Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          setDepartments([]);
        }
      } else {
        setDepartments([]);
        toast.error("Failed to load departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      toast.error("Failed to load departments");
    } finally {
      setDeptLoading(false);
    }
  };

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      setDesigLoading(true);
      const response = await api.get('/designation/getAllDesig');
      
      if (response.status === 200) {
        if (response.data && response.data.status === 200) {
          setDesignations(response.data.data || []);
        } else if (Array.isArray(response.data)) {
          setDesignations(response.data);
        } else {
          setDesignations([]);
        }
      } else {
        setDesignations([]);
        toast.error("Failed to load designations");
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      setDesignations([]);
      toast.error("Failed to load designations");
    } finally {
      setDesigLoading(false);
    }
  };

  // Fetch logged-in user data
  const fetchLoggedInUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.status === 200) {
        setLoggedInUser(response.data.data);
        const userName = response.data.data.userName || response.data.data.email || 'Admin';
        setFormData(prev => ({
          ...prev,
          createBy: userName
        }));
      }
    } catch (error) {
      console.error('Error fetching logged-in user:', error);
      const tokenData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (tokenData.userName) {
        setLoggedInUser(tokenData);
        setFormData(prev => ({
          ...prev,
          createBy: tokenData.userName
        }));
      }
    }
  };

  // Fetch all users with their images
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/staff');
      
      if (response.data && response.data.status === 200) {
        const usersData = response.data.data || [];
        
        const processedUsers = usersData.map((user) => {
          const imageInfo = extractUserImage(user);
          
          let imageUrl = null;
          let hasImage = false;
          
          if (imageInfo && imageInfo.filePath) {
            imageUrl = getImageUrl(imageInfo.filePath);
            hasImage = true;
            
            setImageUrls(prev => ({
              ...prev,
              [user.id]: imageUrl
            }));
          }
          
          return {
            ...user,
            imageUrl: imageUrl,
            hasImage: hasImage,
            imageId: imageInfo?.id,
            imageInfo: imageInfo,
            imagePath: imageInfo?.filePath,
            imageName: imageInfo?.fileName || `${user.userName}_image`
          };
        });
        
        setUsers(processedUsers);
      } else {
        toast.error(response.data?.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setUserImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload staff image
  const uploadStaffImage = async (staffId) => {
    if (!userImage) {
      toast.error("Please select an image to upload");
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append("image", userImage);

      const response = await axios.post(
        `${API_BASE_URL}/auth/staff/${staffId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.status === 200) {
        toast.success('Image uploaded successfully');
        
        let filePath = response.data.data;
        
        if (typeof response.data.data === 'object') {
          filePath = response.data.data.file_path || response.data.data.filePath || response.data.data.url;
        }
        
        if (filePath) {
          const newImageUrl = getImageUrl(filePath);
          
          const updatedUsers = users.map(user => {
            if (user.id === staffId) {
              return {
                ...user,
                imageUrl: newImageUrl,
                hasImage: true,
                imagePath: filePath
              };
            }
            return user;
          });
          setUsers(updatedUsers);
          
          setImageUrls(prev => ({
            ...prev,
            [staffId]: newImageUrl
          }));
          
          setPreviewImage(newImageUrl);
          setUserImage(null);
          
          setTimeout(() => {
            fetchUsers();
          }, 1000);
        }
      } else {
        toast.error(response.data?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Update staff image
  const updateStaffImage = async () => {
    if (!userImage || !currentImageId) {
      toast.error("Please select a new image");
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append("id", currentImageId);
      formData.append("itemimage", userImage);

      const response = await axios.put(
        `${API_BASE_URL}/auth/updateStaffDocument/${currentImageId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.status === 200) {
        toast.success('Image updated successfully');
        
        const currentUser = users.find(user => user.id === currentStaffId);
        if (currentUser) {
          let filePath = response.data.data;
          if (typeof filePath === 'object') {
            filePath = filePath.filePath || filePath.file_path;
          }
          
          const newImageUrl = getImageUrl(filePath || currentUser.imagePath);
          
          const updatedUsers = users.map(user => {
            if (user.id === currentStaffId) {
              return {
                ...user,
                imageUrl: newImageUrl,
                imagePath: filePath || user.imagePath
              };
            }
            return user;
          });
          setUsers(updatedUsers);
          
          setImageUrls(prev => ({
            ...prev,
            [currentStaffId]: newImageUrl
          }));
          
          setPreviewImage(newImageUrl);
        }
        
        setUserImage(null);
        
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        toast.error(response.data?.message || 'Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error(error.response?.data?.message || 'Failed to update image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete staff image
  const deleteStaffImage = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await api.delete(`/auth/staff/${staffId}/delete-image`);
      
      if (response.data && response.data.status === 200) {
        toast.success('Image deleted successfully');
        
        const updatedUsers = users.map(user => {
          if (user.id === staffId) {
            return {
              ...user,
              imageUrl: null,
              hasImage: false,
              imageInfo: null,
              imageId: null,
              imagePath: null
            };
          }
          return user;
        });
        setUsers(updatedUsers);
        
        setImageUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[staffId];
          return newUrls;
        });
        
        if (currentStaffId === staffId) {
          setPreviewImage(null);
        }
        
        setTimeout(() => {
          fetchUsers();
        }, 500);
      } else {
        toast.error(response.data?.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Failed to delete image');
    }
  };

  // Helper function to get role name from roleId
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  };

  // Open modal for adding new user
  const openAddModal = () => {
    setEditingUser(null);
    setIsViewMode(false);
    setUserImage(null);
    setPreviewImage(null);
    setCurrentStaffId(null);
    setCurrentImageId(null);
    setFormData({
      roleId: "",
      userName: "",
      email: "",
      password: "",
      department: "",
      designation: "",
      mobileNo: "",
      createBy: loggedInUser?.userName || loggedInUser?.email || "Admin",
      userImage: "",
      status: "Active",
      createdDate: new Date().toISOString()
    });
    setShowModal(true);
  };

  // Open modal for editing user
  const openEditModal = async (user) => {
    try {
      setEditingUser(user);
      setIsViewMode(false);
      setCurrentStaffId(user.id);
      
      const response = await api.get(`/auth/staff/${user.id}`);
      
      if (response.data && response.data.status === 200) {
        const userDetails = response.data.data;
        const imageInfo = extractUserImage(userDetails);
        
        let imageUrl = null;
        let imageId = null;
        
        if (imageInfo) {
          imageUrl = getImageUrl(imageInfo.filePath);
          imageId = imageInfo.id;
        }
        
        setPreviewImage(imageUrl);
        setCurrentImageId(imageId);
        
        setFormData({
          roleId: user.roleId || user.role?.id || "",
          userName: user.userName || "",
          email: user.email || "",
          password: "",
          department: user.department || "",
          designation: user.designation || "",
          mobileNo: user.mobileNo || "",
          createBy: user.createBy || loggedInUser?.userName || "Admin",
          userImage: imageInfo?.filePath || "",
          status: user.status || "Active",
          createdDate: user.createdDate || new Date().toISOString()
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  // Open modal for viewing user
  const openViewModal = async (user) => {
    try {
      setEditingUser(user);
      setIsViewMode(true);
      setCurrentStaffId(user.id);
      
      const response = await api.get(`/auth/staff/${user.id}`);
      
      if (response.data && response.data.status === 200) {
        const userDetails = response.data.data;
        const imageInfo = extractUserImage(userDetails);
        
        let imageUrl = null;
        
        if (imageInfo) {
          imageUrl = getImageUrl(imageInfo.filePath);
        }
        
        setPreviewImage(imageUrl);
        
        setFormData({
          roleId: user.roleId || user.role?.id || "",
          userName: user.userName || "",
          email: user.email || "",
          password: "********",
          department: user.department || "",
          designation: user.designation || "",
          mobileNo: user.mobileNo || "",
          createBy: user.createBy || "",
          userImage: imageInfo?.filePath || "",
          status: user.status || "Active",
          createdDate: user.createdDate || new Date().toISOString()
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setIsViewMode(false);
    setUserImage(null);
    setPreviewImage(null);
    setCurrentStaffId(null);
    setCurrentImageId(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'createBy') {
      return;
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission (create/update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate role selection
    if (!formData.roleId) {
      toast.error("Role is required", { position: 'top-right' });
      return;
    }

    // Validate email contains @gmail.com
    if (!formData.email.includes("@gmail.com")) {
      toast.error("Email must contain @gmail.com", { position: 'top-right' });
      return;
    }

    try {
      const submitData = {
        ...formData,
        createBy: editingUser ? formData.createBy : (loggedInUser?.userName || loggedInUser?.email || "Admin")
      };

      let response;
      if (editingUser) {
        response = await api.put(`/auth/staff/${editingUser.id}`, submitData);
      } else {
        response = await api.post('/auth/staff', submitData);
      }

      if (response.data.status === 200) {
        const message = editingUser ? 'User updated successfully' : 'User created successfully';
        toast.success(message, { position: 'top-right' });
        
        if (userImage) {
          if (editingUser) {
            if (currentImageId) {
              await updateStaffImage();
            } else {
              await uploadStaffImage(editingUser.id);
            }
          } else {
            const newUserId = response.data.data?.id;
            if (newUserId) {
              await uploadStaffImage(newUserId);
            }
          }
        } else {
          fetchUsers();
        }
        
        closeModal();
      } else {
        toast.error(response.data.message || 'Failed to save user', { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user', { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!users || users.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = users.map((user, index) => ({
      "Sr No": index + 1,
      "User Name": user.userName,
      "Email": user.email,
      "Role": getRoleName(user.roleId),
      "Department": user.department,
      "Designation": user.designation,
      "Mobile Number": user.mobileNo,
      "Status": user.status,
      "Created By": user.createBy || "N/A",
      "Created Date": user.createdDate
        ? new Date(user.createdDate).toLocaleDateString()
        : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `User_Management_${Date.now()}.xlsx`);
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      const response = await api.delete(`/auth/delete/staff/${id}`);

      if (response.data.status === 200) {
        toast.success('User deleted successfully', {
          position: 'top-right',
        });
        fetchUsers();
      } else {
        toast.error(response.data.message || 'Failed to delete user', {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete user',
        { position: 'top-right' }
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const roleName = getRoleName(user.roleId).toLowerCase();

    return (
      user.userName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      roleName.includes(search) ||
      user.department?.toLowerCase().includes(search) ||
      user.designation?.toLowerCase().includes(search) ||
      user.createBy?.toLowerCase().includes(search)
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
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#1e3a8a'
      }
    },
    btnSecondary: {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      '&:hover': {
        backgroundColor: '#f8fafc'
      }
    },
    btnSuccess: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#0da271'
      }
    },
    btnWarning: {
      backgroundColor: '#f59e0b',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#e68a00'
      }
    },
    btnDanger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#dc2626'
      }
    },
    btnInfo: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
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
      fontFamily: 'inherit',
      '&:focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
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
      transition: 'background-color 0.2s ease',
    },
    trHover: {
      backgroundColor: '#e2e8f0'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #e2e8f0',
      backgroundColor: '#f1f5f9',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
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
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    },
    editBtn: {
      color: '#16a34a',
      '&:hover': {
        backgroundColor: 'rgba(22, 163, 74, 0.1)'
      }
    },
    viewBtn: {
      color: '#eab308',
      '&:hover': {
        backgroundColor: 'rgba(234, 179, 8, 0.1)'
      }
    },
    imageBtn: {
      color: '#8b5cf6',
      '&:hover': {
        backgroundColor: 'rgba(139, 92, 246, 0.1)'
      }
    },
    deleteBtn: {
      color: '#dc2626',
      '&:hover': {
        backgroundColor: 'rgba(220, 38, 38, 0.1)'
      }
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
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    imageModalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
      cursor: 'pointer',
      '&:hover': {
        color: '#1e293b'
      }
    },
    modalBody: {
      padding: '20px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
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
      transition: 'all 0.2s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      },
      '&:disabled': {
        backgroundColor: '#f8fafc',
        cursor: 'not-allowed'
      }
    },
    formControlError: {
      borderColor: '#ef4444',
      '&:focus': {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
      }
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
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#64748b',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      '&:hover': {
        color: '#1e293b'
      }
    },
    imageUploadSection: {
      gridColumn: 'span 2',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    },
    imagePreviewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px'
    },
    imagePreview: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #e2e8f0',
      backgroundColor: '#f1f5f9',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    },
    imageActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center'
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
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#e2e8f0'
      }
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '5px'
    },
    imageViewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    },
    imageView: {
      maxWidth: '100%',
      maxHeight: '500px',
      objectFit: 'contain',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    imageName: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#1e293b',
      textAlign: 'center'
    },
    imageActionsRow: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      width: '100%'
    }
  };

  return (
    <div style={styles.container}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>User Management</h1>
          <div style={styles.headerActions}>
            <button
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={handleExportExcel}
            >
              <i className="fas fa-download"></i>
              Export Excel
            </button>
            <button 
              style={{...styles.btn, ...styles.btnPrimary}} 
              onClick={openAddModal}
            >
              <i className="fas fa-plus"></i>
              Add New User
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Users ({filteredUsers.length})</div>
            <div style={styles.tableActions}>
              <div style={styles.searchBox}>
                <i className="fas fa-search" style={styles.searchIcon}></i>
                <input 
                  type="text" 
                  placeholder="Search users..." 
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
              <span style={{marginLeft: '10px'}}>Loading users...</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr No</th>
                  <th style={styles.th}>User Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Mobile Number</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === user.id;
                  
                  return (
                  <tr 
                    key={user.id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                    }}
                    onMouseEnter={() => setHoveredRow(user.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.hasImage ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.userName} 
                            style={styles.userAvatar}
                            onClick={() => viewImage(user.imagePath, `${user.userName}_image`)}
                            title="Click to view image"
                          />
                        ) : (
                          <div style={styles.userAvatar}>
                            {user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span>{user.userName}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{getRoleName(user.roleId)}</td>
                    <td style={styles.td}>{user.department || 'N/A'}</td>
                    <td style={styles.td}>{user.mobileNo}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(user.status === 'Active' ? styles.statusActive : styles.statusInactive)
                      }}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        {user.hasImage && (
                          <button 
                            style={{...styles.actionBtn, ...styles.imageBtn}}
                            title="View Image"
                            onClick={() => viewImage(user.imagePath, `${user.userName}_image`)}
                          >
                            <i className="fas fa-image"></i>
                          </button>
                        )}
                        <button 
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          title="Edit"
                          onClick={() => openEditModal(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.viewBtn}}
                          title="View Details"
                          onClick={() => openViewModal(user)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          title="Delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      <i className="fas fa-users fa-2x" style={{color: '#94a3b8', marginBottom: '15px'}}></i>
                      <p>No users found matching your search.</p>
                      <button 
                        style={{...styles.btn, ...styles.btnSecondary, marginTop: '10px'}}
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View User' : (editingUser ? 'Edit User' : 'Add New User')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                {/* Image Upload Section */}
                <div style={styles.imageUploadSection}>
                  <div style={styles.imagePreviewContainer}>
                    <img 
                      src={previewImage || getPlaceholderImage()} 
                      alt="User Preview"
                      style={styles.imagePreview}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getPlaceholderImage();
                      }}
                      onClick={() => {
                        if (editingUser?.imagePath && !userImage) {
                          viewImage(editingUser.imagePath, `${editingUser.userName}_image`);
                        }
                      }}
                      title={editingUser?.imagePath && !userImage ? "Click to view image" : ""}
                    />
                    {!isViewMode && (
                      <div style={styles.imageActions}>
                        <label style={{...styles.fileLabel, ...styles.btnSecondary}}>
                          <i className="fas fa-camera"></i>
                          {userImage ? 'Change Image' : 'Select Image'}
                          <input
                            type="file"
                            accept="image/*"
                            style={styles.fileInput}
                            onChange={handleImageSelect}
                          />
                        </label>
                        {userImage && (
                          <>
                            <button
                              type="button"
                              style={{...styles.btn, ...styles.btnSuccess}}
                              onClick={() => {
                                if (editingUser) {
                                  if (currentImageId) {
                                    updateStaffImage();
                                  } else {
                                    uploadStaffImage(editingUser.id);
                                  }
                                }
                              }}
                              disabled={isUploadingImage}
                            >
                              {isUploadingImage ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-upload"></i>
                              )}
                              {editingUser ? (currentImageId ? 'Update Image' : 'Upload Image') : 'Upload Image'}
                            </button>
                            <button
                              type="button"
                              style={{...styles.btn, ...styles.btnSecondary}}
                              onClick={() => {
                                setUserImage(null);
                                if (editingUser) {
                                  setPreviewImage(users.find(u => u.id === editingUser.id)?.imageUrl || null);
                                } else {
                                  setPreviewImage(null);
                                }
                              }}
                            >
                              <i className="fas fa-times"></i>
                              Clear
                            </button>
                          </>
                        )}
                        {editingUser && users.find(u => u.id === editingUser.id)?.hasImage && !userImage && (
                          <>
                            <button
                              type="button"
                              style={{...styles.btn, ...styles.btnInfo}}
                              onClick={() => viewImage(editingUser.imagePath, `${editingUser.userName}_image`)}
                            >
                              <i className="fas fa-eye"></i>
                              View Image
                            </button>
                            <button
                              type="button"
                              style={{...styles.btn, ...styles.btnDanger}}
                              onClick={() => deleteStaffImage(editingUser.id)}
                            >
                              <i className="fas fa-trash"></i>
                              Delete Image
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formGrid}>
                  {/* Role Selection - Only Admin (ID: 2) and User (ID: 3) */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="roleId">
                      Role <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      style={{
                        ...styles.formControl,
                        ...(!formData.roleId ? styles.formControlError : {})
                      }}
                      required
                      disabled={isViewMode || roleLoading}
                    >
                      <option value="">
                        {roleLoading ? "Loading roles..." : "Select Role"}
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {!formData.roleId && !isViewMode && (
                      <div style={styles.errorMessage}>Please select a role</div>
                    )}
                  </div>

                  {/* User Name */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="userName">
                      User Name <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      required
                      value={formData.userName}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={isViewMode}
                    />
                  </div>

                  {/* Email */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="email">
                      Email <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        ...styles.formControl,
                        ...(formData.email && !formData.email.includes("@gmail.com") ? styles.formControlError : {})
                      }}
                      disabled={isViewMode}
                      placeholder="example@gmail.com"
                    />
                    {formData.email && !formData.email.includes("@gmail.com") && !isViewMode && (
                      <div style={styles.errorMessage}>Email must contain @gmail.com</div>
                    )}
                  </div>

                  {/* Password */}
                  {!isViewMode && (
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="password">
                        Password {!editingUser && <span style={{color: '#ef4444'}}>*</span>}
                      </label>
                      <div style={styles.passwordContainer}>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          required={!editingUser}
                          value={formData.password}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          placeholder={editingUser ? "Leave blank to keep current password" : "Enter your password"}
                          disabled={isViewMode}
                        />
                        <button
                          type="button"
                          style={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <i className="fas fa-eye-slash"></i>
                          ) : (
                            <i className="fas fa-eye"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Department */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="department">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={isViewMode || deptLoading}
                    >
                      <option value="">
                        {deptLoading ? "Loading departments..." : "Select Department"}
                      </option>
                      {departments.map((dept, index) => (
                        <option key={dept.id || index} value={dept.department_name || dept.name}>
                          {dept.department_name || dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="designation">Designation</label>
                    <select
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={isViewMode || desigLoading}
                    >
                      <option value="">
                        {desigLoading ? "Loading designations..." : "Select Designation"}
                      </option>
                      {designations.map((desig, index) => (
                        <option key={desig.id || index} value={desig.designation_name || desig.name}>
                          {desig.designation_name || desig.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Number */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="mobileNo">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      style={styles.formControl}
                      disabled={isViewMode}
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>

                  {/* Status */}
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

                  {/* Created By */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="createBy">Created By</label>
                    <input
                      type="text"
                      id="createBy"
                      name="createBy"
                      value={formData.createBy}
                      style={{...styles.formControl, backgroundColor: '#f1f5f9', cursor: 'not-allowed'}}
                      disabled={true}
                      readOnly
                    />
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
                  disabled={isUploadingImage || !formData.roleId || (formData.email && !formData.email.includes("@gmail.com"))}
                >
                  {isUploadingImage ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    editingUser ? 'Update User' : 'Save User'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewing Modal */}
      {showImageModal && (
        <div style={styles.modal}>
          <div style={styles.imageModalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>View Image</h3>
              <button style={styles.modalClose} onClick={closeImageModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              {imageLoading ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                  <span style={{marginLeft: '10px'}}>Loading image...</span>
                </div>
              ) : viewingImage ? (
                <div style={styles.imageViewContainer}>
                  <div style={styles.imageName}>
                    {viewingImage.name}
                  </div>
                  <img 
                    src={viewingImage.url} 
                    alt="User Image"
                    style={styles.imageView}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getPlaceholderImage();
                    }}
                  />
                  <div style={styles.imageActionsRow}>
                    <button
                      style={{...styles.btn, ...styles.btnInfo}}
                      onClick={() => downloadImage(viewingImage.url, viewingImage.name)}
                    >
                      <i className="fas fa-download"></i>
                      Download Image
                    </button>
                    <button
                      style={{...styles.btn, ...styles.btnSecondary}}
                      onClick={closeImageModal}
                    >
                      <i className="fas fa-times"></i>
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '40px'}}>
                  <i className="fas fa-image fa-3x" style={{color: '#94a3b8', marginBottom: '15px'}}></i>
                  <p>No image available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;