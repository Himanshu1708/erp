// import React, { useState, useEffect } from 'react';
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import toast, { Toaster } from 'react-hot-toast';
// import axios from 'axios';

// const RolePermission = () => {
//   // State for Modal Visibility
//   const [editingData, setEditingData] = useState(null);
//   const [isViewMode, setIsViewMode] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [hoveredRow, setHoveredRow] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // State for Table Data
//   const [rolePermissions, setRolePermissions] = useState([]);
//   const [displayedPermissions, setDisplayedPermissions] = useState([]);

//   // State for the 3 Search Bars
//   const [searchUser, setSearchUser] = useState("");       // Stores User ID
//   const [searchModule, setSearchModule] = useState("");    // Stores Module Name
//   const [searchSubModule, setSearchSubModule] = useState(""); // Stores Sub Module Name

//   // State for API Data (Users List and Roles List)
//   const [usersList, setUsersList] = useState([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [rolesList, setRolesList] = useState([]);
//   const [rolesLoading, setRolesLoading] = useState(false);
//   const [userPermissions, setUserPermissions] = useState({}); // Store user's permissions
//   const [permissionDetails, setPermissionDetails] = useState({}); // Store permission details by ID
  
//   // State to store permission states for each user and module
//   const [userModulePermissions, setUserModulePermissions] = useState({});
//   // State to track if permissions have been loaded for each user
//   const [permissionsLoaded, setPermissionsLoaded] = useState({});

//   // State for Form Data (Inside Modal)
//   const [formData, setFormData] = useState({
//     userId: "",
//     userName: "",
//     module: "",
//     subModule: ""
//   });

//   // Updated permission mapping to match backend
//   const PERMISSION_MAP = {
//     "Project Management": {
//       create: "PROJECT_CREATE",
//       view: "PROJECT_VIEW",
//       edit: "PROJECT_UPDATE",
//       delete: "PROJECT_DELETE",
//       addDoc: "PROJECT_ADDDOC",
//       editDoc: "PROJECT_UPDATEDOC"
//     },
//     "Location Management": {
//       create: "LOCATION_CREATE",
//       view: "LOCATION_VIEW",
//       edit: "LOCATION_UPDATE",
//       delete: "LOCATION_DELETE",
//       addDoc: "LOCATION_ADDDOC",
//       editDoc: "LOCATION_UPDATEDOC"
//     },
//     "Store Management": {
//       create: "STORE_CREATE",
//       view: "STORE_VIEW",
//       edit: "STORE_UPDATE",
//       delete: "STORE_DELETE",
//       addDoc: "STORE_ADDDOC",
//       editDoc: "STORE_UPDATEDOC"
//     },
//     "Bio Machine": {
//       create: "BIO_MACHINE_CREATE",
//       view: "BIO_MACHINE_VIEW",
//       edit: "BIO_MACHINE_UPDATE",
//       delete: "BIO_MACHINE_DELETE",
//       addDoc: "BIO_MACHINE_ADDDOC",
//       editDoc: "BIO_MACHINE_UPDATEDOC"
//     },
//     "Condition Master": {
//       create: "CONDITION_CREATE",
//       view: "CONDITION_VIEW",
//       edit: "CONDITION_UPDATE",
//       delete: "CONDITION_DELETE",
//       addDoc: "CONDITION_ADDDOC",
//       editDoc: "CONDITION_UPDATEDOC"
//     },
//     "Firm": {
//       create: "FIRM_CREATE",
//       view: "FIRM_ALL",
//       edit: "FIRM_UPDATE",
//       delete: "FIRM_DELETEBYID",
//       addDoc: "ADD_DOC",
//       editDoc: "FIRM_UPDATEDOC"
//     },
//     "Contractor Master": {
//       create: "CONTRACTOR_CREATE",
//       view: "CONTRACTOR_VIEW",
//       edit: "CONTRACTOR_UPDATE",
//       delete: "CONTRACTOR_DELETE",
//       addDoc: "CONTRACTOR_ADDDOC",
//       editDoc: "CONTRACTOR_UPDATEDOC"
//     },
//     "Tax Management": {
//       create: "TAX_CREATE",
//       view: "TAX_VIEW",
//       edit: "TAX_UPDATE",
//       delete: "TAX_DELETE",
//       addDoc: "TAX_ADDDOC",
//       editDoc: "TAX_UPDATEDOC"
//     },
//     "Unit Management": {
//       create: "UNIT_CREATE",
//       view: "UNIT_VIEW",
//       edit: "UNIT_UPDATE",
//       delete: "UNIT_DELETE",
//       addDoc: "UNIT_ADDDOC",
//       editDoc: "UNIT_UPDATEDOC"
//     },
//     "Manufacturer Details": {
//       create: "MANUF_CREATE",
//       view: "MANUF_VIEW",
//       edit: "MANUF_UPDATE",
//       delete: "MANUF_DELETE",
//       addDoc: "MANUF_ADDDOC",
//       editDoc: "MANUF_UPDATEDOC"
//     },
//     "Category Management": {
//       create: "CATEG_CREATE",
//       view: "CATEG_VIEW",
//       edit: "CATEG_UPDATE",
//       delete: "CATEG_DELETE",
//       addDoc: "CATEG_ADDDOC",
//       editDoc: "CATEG_UPDATEDOC"
//     },
//     "Subcategory Management": {
//       create: "SUBCATEG_CREATE",
//       view: "SUBCATEG_VIEW",
//       edit: "SUBCATEG_UPDATE",
//       delete: "SUBCATEG_DELETE",
//       addDoc: "SUBCATEG_ADDDOC",
//       editDoc: "SUBCATEG_UPDATEDOC"
//     },
//     "Add Material": {
//       create: "ADD_CREATE",
//       view: "ADD_VIEW",
//       edit: "ADD_UPDATE",
//       delete: "ADD_DELETE",
//       addDoc: "ADD_ADDDOC",
//       editDoc: "ADD_UPDATEDOC"
//     },
//     "Material Management": {
//       create: "MATERIAL_CREATE",
//       view: "MATERIAL_VIEW",
//       edit: "MATERIAL_UPDATE",
//       delete: "MATERIAL_DELETE",
//       addDoc: "MATERIAL_ADDDOC",
//       editDoc: "MATERIAL_UPDATEDOC"
//     },
//     "Leave Allotment": {
//       create: "LEAVE_CREATE",
//       view: "LEAVE_VIEW",
//       edit: "LEAVE_UPDATE",
//       delete: "LEAVE_DELETE",
//       addDoc: "LEAVE_ADDDOC",
//       editDoc: "LEAVE_UPDATEDOC"
//     },
//     "Holiday Management": {
//       create: "HOLIDAY_CREATE",
//       view: "HOLIDAY_VIEW",
//       edit: "HOLIDAY_UPDATE",
//       delete: "HOLIDAY_DELETE",
//       addDoc: "HOLIDAY_ADDDOC",
//       editDoc: "HOLIDAY_UPDATEDOC"
//     },
//     "Group Master": {
//       create: "GROUP_CREATE",
//       view: "GROUP_VIEW",
//       edit: "GROUP_UPDATE",
//       delete: "GROUP_DELETE",
//       addDoc: "GROUP_ADDDOC",
//       editDoc: "GROUP_UPDATEDOC"
//     },
//     "Department": {
//       create: "DEP_CREATE",
//       view: "DEP_VIEW",
//       edit: "DEP_UPDATE",
//       delete: "DEP_DELETE",
//       addDoc: "DEP_ADDDOC",
//       editDoc: "DEP_UPDATEDOC"
//     },
//     "Designation": {
//       create: "DESIG_CREATE",
//       view: "DESIG_VIEW",
//       edit: "DESIG_UPDATE",
//       delete: "DESIG_DELETE",
//       addDoc: "DESIG_ADDDOC",
//       editDoc: "DESIG_UPDATEDOC"
//     },
//     "User Management": {
//       create: "STAFF_CREATE",
//       view: "STAFF_ALL",
//       edit: "STAFF_UPDATE",
//       delete: "STAFF_DELETE",
//       addDoc: "STAFF_ADDDOC",
//       editDoc: "STAFF_UPDATEDOC"
//     },
//     "Employee Management": {
//       create: "EMP_CREATE",
//       view: "EMP_VIEW",
//       edit: "EMP_UPDATE",
//       delete: "EMP_DELETE",
//       addDoc: "EMP_ADDDOC",
//       editDoc: "EMP_UPDATEDOC"
//     },
//     "Vendor Master": {
//       create: "VENDOR_CREATE",
//       view: "VENDOR_VIEW",
//       edit: "VENDOR_UPDATE",
//       delete: "VENDOR_DELETE",
//       addDoc: "VENDOR_ADDDOC",
//       editDoc: "VENDOR_UPDATEDOC"
//     },
//     "Vendor Material": {
//       create: "VENDOR_MATERIAL_CREATE",
//       view: "VENDOR_MATERIAL_VIEW",
//       edit: "VENDOR_MATERIAL_UPDATE",
//       delete: "VENDOR_MATERIAL_DELETE",
//       addDoc: "VENDOR_MATERIAL_ADDDOC",
//       editDoc: "VENDOR_MATERIAL_UPDATEDOC"
//     }
//   };

//   // --- Static Data Configuration ---
//   const moduleOptions = [
//     "Project Master",
//     "Material Master",
//     "HRM",
//     "Vendor Management"
//   ];

//   const subModuleOptions = {
//     "Project Master": [
//       "Project Management", 
//       "Location Management", 
//       "Store Management", 
//       "Bio Machine", 
//       "Condition Master", 
//       "Firm", 
//       "Contractor Master"
//     ],
//     "Material Master": [
//       "Tax Management", 
//       "Unit Management", 
//       "Manufacturer Details", 
//       "Category Management", 
//       "Subcategory Management", 
//       "Add Material", 
//       "Material Management"
//     ],
//     "HRM": [
//       "Leave Allotment", 
//       "Holiday Management", 
//       "Group Master", 
//       "Department", 
//       "Designation", 
//       "User Management", 
//       "Employee Management"
//     ],
//     "Vendor Management": [
//       "Vendor Master", 
//       "Vendor Material"
//     ]
//   };

//   // --- Styles ---
//   const styles = {
//     container: {
//       display: 'flex',
//       minHeight: '100vh',
//       fontFamily: "'Inter', sans-serif",
//       backgroundColor: '#f8fafc',
//       color: '#1e293b',
//       lineHeight: '1.6'
//     },
//     sidebar: {
//       width: '260px',
//       backgroundColor: '#ffffff',
//       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//       padding: '20px 0',
//       transition: 'all 0.3s ease'
//     },
//     mainContent: {
//       flex: '1',
//       padding: '30px',
//       overflowY: 'auto'
//     },
//     header: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '30px'
//     },
//     headerTitle: {
//       fontSize: '28px',
//       fontWeight: '700',
//       color: '#1e293b'
//     },
//     headerActions: {
//       display: 'flex',
//       gap: '15px'
//     },
//     btn: {
//       padding: '10px 20px',
//       border: 'none',
//       borderRadius: '6px',
//       fontWeight: '500',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       display: 'inline-flex',
//       alignItems: 'center',
//       gap: '8px'
//     },
//     btnPrimary: {
//       backgroundColor: '#1e40af',
//       color: '#ffffff'
//     },
//     btnSecondary: {
//       backgroundColor: '#ffffff',
//       color: '#1e293b',
//       border: '1px solid #e2e8f0'
//     },
//     btnDisabled: {
//       backgroundColor: '#94a3b8',
//       color: '#ffffff',
//       cursor: 'not-allowed'
//     },
//     tableContainer: {
//       backgroundColor: '#ffffff',
//       borderRadius: '10px',
//       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//       overflow: 'hidden'
//     },
//     tableHeader: {
//       padding: '20px',
//       borderBottom: '1px solid #e2e8f0',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center'
//     },
//     tableTitle: {
//       fontSize: '20px',
//       fontWeight: '600'
//     },
//     tableActions: {
//       display: 'flex',
//       gap: '10px',
//       flexWrap: 'wrap',
//       alignItems: 'center'
//     },
//     searchDropdownBox: {
//       position: 'relative'
//     },
//     searchSelect: {
//       padding: '8px 15px',
//       border: '1px solid #e2e8f0',
//       borderRadius: '6px',
//       width: '200px',
//       fontFamily: 'inherit',
//       backgroundColor: '#ffffff',
//       color: '#1e293b',
//       cursor: 'pointer'
//     },
//     table: {
//       width: '100%',
//       borderCollapse: 'collapse'
//     },
//     th: {
//       backgroundColor: '#dbeafe',
//       padding: '15px',
//       textAlign: 'left',
//       fontWeight: '600',
//       color: '#1e3a8a',
//       borderBottom: '1px solid #e2e8f0'
//     },
//     td: {
//       padding: '15px',
//       borderBottom: '1px solid #e2e8f0'
//     },
//     tr: {
//       transition: 'background-color 0.2s ease'
//     },
//     checkboxContainer: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: '8px'
//     },
//     checkbox: {
//       width: '18px',
//       height: '18px',
//       cursor: 'pointer'
//     },
//     permissionCell: {
//       textAlign: 'center'
//     },
//     loadingSpinner: {
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '200px'
//     },
//     dropdownLoading: {
//       position: 'absolute',
//       right: '10px',
//       top: '50%',
//       transform: 'translateY(-50%)',
//       color: '#64748b'
//     },
//     userTag: {
//       display: 'inline-block',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       fontSize: '12px',
//       fontWeight: '600',
//       marginLeft: '8px',
//       backgroundColor: '#e0e7ff',
//       color: '#3730a3'
//     },
//     permissionPreview: {
//       marginTop: '20px',
//       padding: '15px',
//       backgroundColor: '#f1f5f9',
//       borderRadius: '8px',
//       border: '1px solid #e2e8f0'
//     },
//     permissionPreviewTitle: {
//       fontWeight: '600',
//       marginBottom: '10px',
//       color: '#1e293b'
//     },
//     permissionChip: {
//       display: 'inline-block',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       fontSize: '12px',
//       margin: '2px',
//       backgroundColor: '#dbeafe',
//       color: '#1e3a8a'
//     }
//   };

//   const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

//   const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: { 'Content-Type': 'application/json' },
//   });

//   api.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem('token');
//       if (token) config.headers.Authorization = `Bearer ${token}`;
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );

//   // Load user module permissions from localStorage on component mount
//   useEffect(() => {
//     const storedPermissions = localStorage.getItem('userModulePermissions');
//     if (storedPermissions) {
//       try {
//         setUserModulePermissions(JSON.parse(storedPermissions));
//       } catch (error) {
//         console.error("Error parsing stored permissions:", error);
//       }
//     }
    
//     fetchBootstrapData();
//     fetchRoles();
//     fetchUsers();
//     fetchRolePermissions();
//     fetchPermissionDetails(); // Fetch all permission details
//   }, []);

//   // Save user module permissions to localStorage whenever they change
//   useEffect(() => {
//     if (Object.keys(userModulePermissions).length > 0) {
//       localStorage.setItem('userModulePermissions', JSON.stringify(userModulePermissions));
//     }
//   }, [userModulePermissions]);

//   useEffect(() => {
//     if (searchUser && searchModule) {
//       updateDisplayedPermissions();
//     } else {
//       setDisplayedPermissions([]);
//     }
//   }, [searchUser, searchModule, rolePermissions, userPermissions, permissionDetails, userModulePermissions]);

//   const fetchBootstrapData = async () => {
//     try {
//       await api.get("/auth/seed"); 
//     } catch (error) {
//       console.error("Error fetching bootstrap data:", error);
//     }
//   };

//   const fetchRoles = async () => {
//     try {
//       setRolesLoading(true);
//       const response = await api.get("/role/getAll");
//       const data = response.data; 
//       setRolesList(data.data || data || []); 
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//       toast.error("Failed to fetch roles from server", { position: "top-right" });
//     } finally {
//       setRolesLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       setUsersLoading(true);
//       const response = await api.get("auth/staff");
//       const data = response.data; 
//       setUsersList(data.data || data || []); 
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast.error("Failed to fetch users from server", { position: "top-right" });
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   // Fetch all permission details from the backend
//   const fetchPermissionDetails = async () => {
//     try {
//       const response = await api.get("/auth/permissions");
//       const permissions = response.data || [];
      
//       // Create a map of permission ID to permission name
//       const permissionMap = {};
//       permissions.forEach(p => {
//         permissionMap[p.id] = p.name;
//       });
      
//       setPermissionDetails(permissionMap);
//     } catch (error) {
//       console.error("Error fetching permission details:", error);
//       // If the endpoint doesn't exist, we'll use the PERMISSION_MAP
//     }
//   };

//   const fetchUserPermissions = async (userId) => {
//     try {
//       // First try to get permissions from the staff_permissions table
//       const response = await api.get(`/auth/staff/${userId}/permissions`);
      
//       let userPerms = [];
      
//       // Handle different response formats
//       if (response.data && Array.isArray(response.data)) {
//         // If the response is an array of permission objects
//         userPerms = response.data.map(p => p.name || p);
//       } else if (response.data && response.data.permissions) {
//         // If the response has a permissions property
//         userPerms = response.data.permissions.map(p => p.name || p);
//       } else if (response.data && typeof response.data === 'string') {
//         // If the response is a single permission string
//         userPerms = [response.data];
//       }
      
//       // If we still don't have permissions, try to get them from the staff_permissions table
//       if (userPerms.length === 0) {
//         try {
//           const staffPermsResponse = await api.get(`/auth/staff/${userId}/staff-permissions`);
          
//           if (staffPermsResponse.data && Array.isArray(staffPermsResponse.data)) {
//             // Map permission IDs to permission names using the permissionDetails map
//             userPerms = staffPermsResponse.data
//               .filter(sp => sp.permission_id) // Filter out any entries without permission_id
//               .map(sp => permissionDetails[sp.permission_id])
//               .filter(name => name); // Filter out any undefined names
//           }
//         } catch (staffPermsError) {
//           console.error("Error fetching staff permissions:", staffPermsError);
//         }
//       }
      
//       console.log(`User ${userId} permissions:`, userPerms);
//       setUserPermissions(prev => ({ ...prev, [userId]: userPerms }));
      
//       // Mark that permissions have been loaded for this user
//       setPermissionsLoaded(prev => ({ ...prev, [userId]: true }));
      
//       // Initialize user module permissions based on fetched permissions
//       initializeUserModulePermissions(userId, userPerms);
//     } catch (error) {
//       console.error("Error fetching user permissions:", error);
//       // If endpoint doesn't exist, initialize with empty array
//       setUserPermissions(prev => ({ ...prev, [userId]: [] }));
      
//       // Mark that permissions have been loaded for this user
//       setPermissionsLoaded(prev => ({ ...prev, [userId]: true }));
      
//       // Initialize with empty permissions
//       initializeUserModulePermissions(userId, []);
//     }
//   };

//   // Initialize user module permissions based on user's actual permissions
//   const initializeUserModulePermissions = (userId, userPerms) => {
//     // Create a map of all modules and their sub-modules with permission states
//     const modulePermissionsMap = {};
    
//     moduleOptions.forEach(module => {
//       const subModules = subModuleOptions[module] || [];
//       const subModulePermissions = {};
      
//       subModules.forEach(subModule => {
//         const permissions = PERMISSION_MAP[subModule] || {};
        
//         subModulePermissions[subModule] = {
//           create: userPerms.includes(permissions.create),
//           view: userPerms.includes(permissions.view),
//           edit: userPerms.includes(permissions.edit),
//           delete: userPerms.includes(permissions.delete),
//           addDoc: userPerms.includes(permissions.addDoc),
//           editDoc: userPerms.includes(permissions.editDoc)
//         };
//       });
      
//       modulePermissionsMap[module] = subModulePermissions;
//     });
    
//     // Only update if we don't already have permissions for this user
//     setUserModulePermissions(prev => {
//       if (!prev[userId]) {
//         return {
//           ...prev,
//           [userId]: modulePermissionsMap
//         };
//       }
//       return prev;
//     });
//   };

//   const fetchRolePermissions = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/role/getAll");
//       setRolePermissions(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching role permissions:", error);
//       setRolePermissions([]);
//       setLoading(false);
//     }
//   };

//   const updateDisplayedPermissions = () => {
//     if (!searchUser || !searchModule) {
//       setDisplayedPermissions([]);
//       return;
//     }
    
//     const selectedUser = usersList.find(u => 
//       u.id == searchUser || u.staffId == searchUser || u._id == searchUser
//     );
    
//     const moduleSubModules = subModuleOptions[searchModule] || [];
    
//     // Get user's permissions
//     const userPerms = userPermissions[searchUser] || [];
//     console.log(`Updating displayed permissions for user ${searchUser}, module ${searchModule}:`, userPerms);
    
//     // Get stored permissions for this user
//     const userPermissionsData = userModulePermissions[searchUser] || {};
//     const modulePermissions = userPermissionsData[searchModule] || {};
    
//     const permissionEntries = moduleSubModules.map(subModule => {
//       const existingPermission = rolePermissions.find(item => 
//         item.userId == searchUser && 
//         item.module === searchModule && 
//         item.subModule === subModule
//       );
      
//       if (existingPermission) {
//         return existingPermission;
//       } else {
//         // Always use the stored permissions for this sub-module if available
//         // Otherwise, create based on user's actual permissions
//         const storedPermissions = modulePermissions[subModule];
        
//         if (storedPermissions) {
//           return {
//             id: `new-${Date.now()}-${Math.random()}`,
//             userId: searchUser,
//             userName: selectedUser ? selectedUser.userName : "Unknown User",
//             module: searchModule,
//             subModule: subModule,
//             permissions: storedPermissions
//           };
//         } else {
//           // If we don't have stored permissions, create based on user's actual permissions
//           const subModulePermissions = PERMISSION_MAP[subModule] || {};
          
//           // Debug logging for Firm and User Management modules specifically
//           if (subModule === "Firm" || subModule === "User Management") {
//             console.log(`${subModule} permission mapping:`, subModulePermissions);
//             console.log(`User has ${subModulePermissions.create}:`, userPerms.includes(subModulePermissions.create));
//             console.log(`User has ${subModulePermissions.view}:`, userPerms.includes(subModulePermissions.view));
//           }
          
//           return {
//             id: `new-${Date.now()}-${Math.random()}`,
//             userId: searchUser,
//             userName: selectedUser ? selectedUser.userName : "Unknown User",
//             module: searchModule,
//             subModule: subModule,
//             permissions: {
//               create: userPerms.includes(subModulePermissions.create),
//               view: userPerms.includes(subModulePermissions.view),
//               edit: userPerms.includes(subModulePermissions.edit),
//               delete: userPerms.includes(subModulePermissions.delete),
//               addDoc: userPerms.includes(subModulePermissions.addDoc),
//               editDoc: userPerms.includes(subModulePermissions.editDoc)
//             }
//           };
//         }
//       }
//     });
    
//     setDisplayedPermissions(permissionEntries);
//   };

//   const handleModuleChange = (e) => {
//     setSearchModule(e.target.value);
//     setSearchSubModule("");
//   };

//   const filteredData = rolePermissions.filter((item) => {
//     const matchUser = searchUser ? item.userId == searchUser || item.userName?.toLowerCase().includes(searchUser.toLowerCase()) : true;
//     const matchModule = searchModule ? item.module === searchModule : true;
//     const matchSubModule = searchSubModule ? item.subModule === searchSubModule : true;
//     return matchUser && matchModule && matchSubModule;
//   });

//   // Get all selected permissions from ALL modules for the current user
//   const getAllSelectedPermissions = () => {
//     if (!searchUser) return [];
    
//     const allPermissions = [];
//     const userPermissionsData = userModulePermissions[searchUser] || {};
    
//     // Iterate through all modules
//     Object.keys(userPermissionsData).forEach(module => {
//       const modulePermissions = userPermissionsData[module];
      
//       // Iterate through all sub-modules in this module
//       Object.keys(modulePermissions).forEach(subModule => {
//         const subModulePermissions = modulePermissions[subModule];
//         const permissionMap = PERMISSION_MAP[subModule] || {};
        
//         // Add permissions based on checked boxes
//         if (subModulePermissions.create && permissionMap.create) {
//           allPermissions.push(permissionMap.create);
//         }
//         if (subModulePermissions.view && permissionMap.view) {
//           allPermissions.push(permissionMap.view);
//         }
//         if (subModulePermissions.edit && permissionMap.edit) {
//           allPermissions.push(permissionMap.edit);
//         }
//         if (subModulePermissions.delete && permissionMap.delete) {
//           allPermissions.push(permissionMap.delete);
//         }
//         if (subModulePermissions.addDoc && permissionMap.addDoc) {
//           allPermissions.push(permissionMap.addDoc);
//         }
//         if (subModulePermissions.editDoc && permissionMap.editDoc) {
//           allPermissions.push(permissionMap.editDoc);
//         }
//       });
//     });
    
//     // Remove duplicates
//     return [...new Set(allPermissions)];
//   };

//   // HandleSubmit for Multiple Permission Assignments
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!searchUser) {
//       toast.error("Please select a user first", { position: 'top-right' });
//       return;
//     }

//     // Get ALL selected permissions from ALL modules
//     const allSelectedPermissions = getAllSelectedPermissions();
    
//     if (allSelectedPermissions.length === 0) {
//       toast.error("Please select at least one permission", { position: 'top-right' });
//       return;
//     }

//     try {
//       setSaving(true);
      
//       // Convert userId to number
//       const userIdNumber = Number(searchUser);
      
//       // Use the assign-permissions endpoint
//       const url = `/auth/staff/${userIdNumber}/assign-permissions`;
      
//       console.log(`Sending PUT request to: ${API_BASE_URL}${url}`);
//       console.log("Total permissions being assigned:", allSelectedPermissions.length);
//       console.log("Permissions:", allSelectedPermissions);

//       // Send ALL permissions as an array
//       const response = await api.put(url, allSelectedPermissions);
      
//       if (response.status === 200) {
//         toast.success(`${allSelectedPermissions.length} permissions assigned successfully`, { 
//           position: 'top-right',
//           duration: 4000 
//         });
        
//         // Update user permissions in state with the newly assigned permissions
//         setUserPermissions(prev => ({ 
//           ...prev, 
//           [searchUser]: allSelectedPermissions 
//         }));
        
//         // Refresh the displayed permissions to show updated state
//         updateDisplayedPermissions();
//       } else {
//         toast.error(`Unexpected response: ${response.status}`, { position: 'top-right' });
//         return;
//       }
      
//       // Fetch fresh data from server
//       await fetchRolePermissions();
      
//     } catch (error) {
//       console.error('Error assigning permissions:', error);
//       if (error.response) {
//         console.error("Backend Response Data:", error.response.data);
//         console.error("Status:", error.response.status);
//         console.error("Headers:", error.response.headers);
        
//         if (error.response.data && error.response.data.message) {
//           toast.error(`Failed: ${error.response.data.message}`, { position: 'top-right' });
//         } else {
//           toast.error('Failed to assign permissions. Please check console for details.', { position: 'top-right' });
//         }
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//         toast.error('No response from server. Please check network connection.', { position: 'top-right' });
//       } else {
//         toast.error('Request setup error: ' + error.message, { position: 'top-right' });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`/role/delete/${id}`);
//       toast.success('Deleted successfully', { position: 'top-right' });
//       fetchRolePermissions();
//     } catch (error) {
//       toast.error('Failed to delete', { position: 'top-right' });
//     }
//   };

//   const handlePermissionToggle = (id, permissionType, value) => {
//     // Update the displayed permissions
//     const updatedPermissions = displayedPermissions.map(item => 
//       item.id === id ? { 
//         ...item, 
//         permissions: { 
//           ...item.permissions, 
//           [permissionType]: value 
//         } 
//       } : item
//     );
//     setDisplayedPermissions(updatedPermissions);
    
//     // Also update the stored permissions for this user and module
//     if (searchUser && searchModule) {
//       const item = updatedPermissions.find(p => p.id === id);
      
//       if (item) {
//         setUserModulePermissions(prev => {
//           const currentUserPermissions = prev[searchUser] || {};
//           const currentModulePermissions = currentUserPermissions[searchModule] || {};
//           const currentSubModulePermissions = currentModulePermissions[item.subModule] || {};
          
//           return {
//             ...prev,
//             [searchUser]: {
//               ...currentUserPermissions,
//               [searchModule]: {
//                 ...currentModulePermissions,
//                 [item.subModule]: {
//                   ...currentSubModulePermissions,
//                   [permissionType]: value
//                 }
//               }
//             }
//           };
//         });
//       }
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'userId') {
//       const selectedUser = usersList.find(u => u.id == value || u.staffId == value || u._id == value); 
//       setFormData({
//         ...formData,
//         userId: value,
//         userName: selectedUser ? selectedUser.userName : ""
//       });
//       setSearchUser(value);
      
//       // Fetch user permissions when a user is selected
//       if (value && !permissionsLoaded[value]) {
//         fetchUserPermissions(value);
//       }
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }

//     if (name === 'module') {
//       setFormData(prev => ({ ...prev, subModule: "" }));
//     }
//   };

//   // Function to assign permissions to a specific user
//   const assignPermissionsToUser = async (userId, permissions) => {
//     try {
//       const userIdNumber = Number(userId);
//       const url = `/auth/staff/${userIdNumber}/assign-permissions`;
      
//       const response = await api.put(url, permissions);
      
//       if (response.status === 200) {
//         toast.success(`${permissions.length} permissions assigned successfully`, { 
//           position: 'top-right',
//           duration: 4000 
//         });
        
//         // Update user permissions in state with the newly assigned permissions
//         setUserPermissions(prev => ({ 
//           ...prev, 
//           [userId]: permissions 
//         }));
        
//         return true;
//       } else {
//         toast.error(`Unexpected response: ${response.status}`, { position: 'top-right' });
//         return false;
//       }
//     } catch (error) {
//       console.error('Error assigning permissions:', error);
//       if (error.response) {
//         if (error.response.data && error.response.data.message) {
//           toast.error(`Failed: ${error.response.data.message}`, { position: 'top-right' });
//         } else {
//           toast.error('Failed to assign permissions. Please check console for details.', { position: 'top-right' });
//         }
//       } else if (error.request) {
//         toast.error('No response from server. Please check network connection.', { position: 'top-right' });
//       } else {
//         toast.error('Request setup error: ' + error.message, { position: 'top-right' });
//       }
//       return false;
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <Toaster position="top-right" />
      
//       <main style={styles.mainContent}>
//         <div style={styles.header}>
//           <h1 style={styles.headerTitle}>Role & Permission Management</h1>
//           <div style={styles.headerActions}>
//             <button 
//               style={{...styles.btn, ...(saving ? styles.btnDisabled : styles.btnPrimary)}} 
//               onClick={handleSubmit}
//               disabled={!searchUser || saving}
//             >
//               <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> 
//               {saving ? 'Saving...' : `Save All Permissions`}
//             </button>
//           </div>
//         </div>

//         <div style={styles.tableContainer}>
//           <div style={styles.tableHeader}>
//             <div style={styles.tableTitle}>Permissions List</div>
            
//             <div style={styles.tableActions}>
//               <div style={styles.searchDropdownBox}>
//                 <select
//                   style={styles.searchSelect}
//                   value={searchUser}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setSearchUser(value);
//                     handleInputChange({ target: { name: 'userId', value } });
//                   }}
//                   disabled={usersLoading}
//                 >
//                   <option value="">{usersLoading ? "Loading users..." : "Select User"}</option>
//                   {usersList.map(user => (
//                     <option key={user.id || user.staffId || user._id} value={user.id || user.staffId || user._id}>
//                       {user.userName}
//                     </option>
//                   ))}
//                 </select>
//                 {usersLoading && (
//                   <div style={styles.dropdownLoading}>
//                     <i className="fas fa-spinner fa-spin"></i>
//                   </div>
//                 )}
//               </div>

//               <div style={styles.searchDropdownBox}>
//                 <select
//                   style={styles.searchSelect}
//                   value={searchModule}
//                   onChange={handleModuleChange}
//                 >
//                   <option value="">Select Module</option>
//                   {moduleOptions.map(mod => (
//                     <option key={mod} value={mod}>{mod}</option>
//                   ))}
//                 </select>
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
//                   <th style={styles.th}>Sub Module</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>Create</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>View</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>Edit</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>Delete</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>Add Doc</th>
//                   <th style={{...styles.th, ...styles.permissionCell}}>Edit Doc</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {displayedPermissions.length > 0 ? displayedPermissions.map((item, index) => {
//                   const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
//                   return (
//                     <tr 
//                       key={item.id}
//                       style={{
//                         ...styles.tr,
//                         backgroundColor: hoveredRow === item.id ? '#e2e8f0' : rowBgColor
//                       }}
//                       onMouseEnter={() => setHoveredRow(item.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                     >
//                       <td style={styles.td}>
//                         {index + 1}
//                         {item.userName && (
//                           <span style={styles.userTag}>User: {item.userName}</span>
//                         )}
//                       </td>
//                       <td style={styles.td}>{item.subModule}</td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.create || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'create', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.view || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'view', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.edit || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'edit', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.delete || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'delete', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.addDoc || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'addDoc', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                       <td style={{...styles.td, ...styles.permissionCell}}>
//                         <div style={styles.checkboxContainer}>
//                           <input
//                             type="checkbox"
//                             style={styles.checkbox}
//                             checked={item.permissions?.editDoc || false}
//                             onChange={(e) => handlePermissionToggle(item.id, 'editDoc', e.target.checked)}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr>
//                     <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
//                       {searchUser && searchModule ? 
//                         "No permissions found for the selected user and module. You can set permissions by checking the checkboxes above." : 
//                         "Please select a user and module to view and set permissions."
//                       }
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
        
//         {/* Permission Preview Section */}
//         {searchUser && (
//           <div style={styles.permissionPreview}>
//             <div style={styles.permissionPreviewTitle}>
//               All Selected Permissions ({getAllSelectedPermissions().length} permissions)
//             </div>
//             <div>
//               {getAllSelectedPermissions().length > 0 ? (
//                 getAllSelectedPermissions().map(perm => (
//                   <span key={perm} style={styles.permissionChip}>{perm}</span>
//                 ))
//               ) : (
//                 <span style={{ color: '#64748b' }}>No permissions selected</span>
//               )}
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default RolePermission;


import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const RolePermission = () => {
  // State for Modal Visibility
  const [editingData, setEditingData] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [saving, setSaving] = useState(false);

  // State for Table Data
  const [rolePermissions, setRolePermissions] = useState([]);
  const [displayedPermissions, setDisplayedPermissions] = useState([]);

  // State for the 3 Search Bars
  const [searchUser, setSearchUser] = useState("");       // Stores User ID
  const [searchModule, setSearchModule] = useState("");    // Stores Module Name
  const [searchSubModule, setSearchSubModule] = useState(""); // Stores Sub Module Name

  // State for API Data (Users List and Roles List)
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState({}); // Store user's permissions
  const [permissionDetails, setPermissionDetails] = useState({}); // Store permission details by ID
  
  // State to store permission states for each user and module
  const [userModulePermissions, setUserModulePermissions] = useState({});
  // State to track if permissions have been loaded for each user
  const [permissionsLoaded, setPermissionsLoaded] = useState({});

  // State for Form Data (Inside Modal)
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    module: "",
    subModule: ""
  });

  // Updated permission mapping to match backend
  const PERMISSION_MAP = {
    "Project Management": {
      create: "PROJECT_CREATE",
      view: "PROJECT_VIEW",
      edit: "PROJECT_UPDATE",
      delete: "PROJECT_DELETE",
      addDoc: "PROJECT_ADDDOC",
      editDoc: "PROJECT_UPDATEDOC",
      deleteDoc: "PROJECT_DELETEDOC"
    },
    "Location Management": {
      create: "LOCATION_CREATE",
      view: "LOCATION_VIEW",
      edit: "LOCATION_UPDATE",
      delete: "LOCATION_DELETE",
      addDoc: "LOCATION_ADDDOC",
      editDoc: "LOCATION_UPDATEDOC",
      deleteDoc: "LOCATION_DELETEDOC"
    },
    "Store Management": {
      create: "STORE_CREATE",
      view: "STORE_VIEW",
      edit: "STORE_UPDATE",
      delete: "STORE_DELETE",
      addDoc: "STORE_ADDDOC",
      editDoc: "STORE_UPDATEDOC",
      deleteDoc: "STORE_DELETEDOC"
    },
    "Bio Machine": {
      create: "BIO_MACHINE_CREATE",
      view: "BIO_MACHINE_VIEW",
      edit: "BIO_MACHINE_UPDATE",
      delete: "BIO_MACHINE_DELETE",
      addDoc: "BIO_MACHINE_ADDDOC",
      editDoc: "BIO_MACHINE_UPDATEDOC",
      deleteDoc: "BIO_MACHINE_DELETEDOC"
    },
    "Condition Master": {
      create: "CONDITION_CREATE",
      view: "CONDITION_VIEW",
      edit: "CONDITION_UPDATE",
      delete: "CONDITION_DELETE",
      addDoc: "CONDITION_ADDDOC",
      editDoc: "CONDITION_UPDATEDOC",
      deleteDoc: "CONDITION_DELETEDOC"
    },
    "Firm": {
      create: "FIRM_CREATE",
      view: "FIRM_ALL",
      edit: "FIRM_UPDATE",
      delete: "FIRM_DELETEBYID",
      addDoc: "ADD_DOC",
      editDoc: "FIRM_UPDATEDOC",
      deleteDoc: "FIRM_DELETEDOC"
    },
    "Contractor Master": {
      create: "CONTRACTOR_CREATE",
      view: "CONTRACTOR_VIEW",
      edit: "CONTRACTOR_UPDATE",
      delete: "CONTRACTOR_DELETE",
      addDoc: "CONTRACTOR_ADDDOC",
      editDoc: "CONTRACTOR_UPDATEDOC",
      deleteDoc: "CONTRACTOR_DELETEDOC"
    },
    "Tax Management": {
      create: "TAX_CREATE",
      view: "TAX_VIEW",
      edit: "TAX_UPDATE",
      delete: "TAX_DELETE",
      addDoc: "TAX_ADDDOC",
      editDoc: "TAX_UPDATEDOC",
      deleteDoc: "TAX_DELETEDOC"
    },
    "Unit Management": {
      create: "UNIT_CREATE",
      view: "UNIT_VIEW",
      edit: "UNIT_UPDATE",
      delete: "UNIT_DELETE",
      addDoc: "UNIT_ADDDOC",
      editDoc: "UNIT_UPDATEDOC",
      deleteDoc: "UNIT_DELETEDOC"
    },
    "Manufacturer Details": {
      create: "MANUF_CREATE",
      view: "MANUF_VIEW",
      edit: "MANUF_UPDATE",
      delete: "MANUF_DELETE",
      addDoc: "MANUF_ADDDOC",
      editDoc: "MANUF_UPDATEDOC",
      deleteDoc: "MANUF_DELETEDOC"
    },
    "Category Management": {
      create: "CATEG_CREATE",
      view: "CATEG_VIEW",
      edit: "CATEG_UPDATE",
      delete: "CATEG_DELETE",
      addDoc: "CATEG_ADDDOC",
      editDoc: "CATEG_UPDATEDOC",
      deleteDoc: "CATEG_DELETEDOC"
    },
    "Subcategory Management": {
      create: "SUBCATEG_CREATE",
      view: "SUBCATEG_VIEW",
      edit: "SUBCATEG_UPDATE",
      delete: "SUBCATEG_DELETE",
      addDoc: "SUBCATEG_ADDDOC",
      editDoc: "SUBCATEG_UPDATEDOC",
      deleteDoc: "SUBCATEG_DELETEDOC"
    },
    "Add Material": {
      create: "ADD_CREATE",
      view: "ADD_VIEW",
      edit: "ADD_UPDATE",
      delete: "ADD_DELETE",
      addDoc: "ADD_ADDDOC",
      editDoc: "ADD_UPDATEDOC",
      deleteDoc: "ADD_DELETEDOC"
    },
    "Material Management": {
      create: "MATERIAL_CREATE",
      view: "MATERIAL_VIEW",
      edit: "MATERIAL_UPDATE",
      delete: "MATERIAL_DELETE",
      addDoc: "MATERIAL_ADDDOC",
      editDoc: "MATERIAL_UPDATEDOC",
      deleteDoc: "MATERIAL_DELETEDOC"
    },
    "Leave Allotment": {
      create: "LEAVE_CREATE",
      view: "LEAVE_VIEW",
      edit: "LEAVE_UPDATE",
      delete: "LEAVE_DELETE",
      addDoc: "LEAVE_ADDDOC",
      editDoc: "LEAVE_UPDATEDOC",
      deleteDoc: "LEAVE_DELETEDOC"
    },
    "Holiday Management": {
      create: "HOLIDAY_CREATE",
      view: "HOLIDAY_VIEW",
      edit: "HOLIDAY_UPDATE",
      delete: "HOLIDAY_DELETE",
      addDoc: "HOLIDAY_ADDDOC",
      editDoc: "HOLIDAY_UPDATEDOC",
      deleteDoc: "HOLIDAY_DELETEDOC"
    },
    "Group Master": {
      create: "GROUP_CREATE",
      view: "GROUP_VIEW",
      edit: "GROUP_UPDATE",
      delete: "GROUP_DELETE",
      addDoc: "GROUP_ADDDOC",
      editDoc: "GROUP_UPDATEDOC",
      deleteDoc: "GROUP_DELETEDOC"
    },
    "Department": {
      create: "DEP_CREATE",
      view: "DEP_VIEW",
      edit: "DEP_UPDATE",
      delete: "DEP_DELETE",
      addDoc: "DEP_ADDDOC",
      editDoc: "DEP_UPDATEDOC",
      deleteDoc: "DEP_DELETEDOC"
    },
    "Designation": {
      create: "DESIG_CREATE",
      view: "DESIG_VIEW",
      edit: "DESIG_UPDATE",
      delete: "DESIG_DELETE",
      addDoc: "DESIG_ADDDOC",
      editDoc: "DESIG_UPDATEDOC",
      deleteDoc: "DESIG_DELETEDOC"
    },
    "User Management": {
      create: "STAFF_CREATE",
      view: "STAFF_ALL",
      edit: "STAFF_UPDATE",
      delete: "STAFF_DELETE",
      addDoc: "STAFF_ADDDOC",
      editDoc: "STAFF_UPDATEDOC",
      deleteDoc: "STAFF_DELETEDOC"
    },
    "Employee Management": {
      create: "EMP_CREATE",
      view: "EMP_VIEW",
      edit: "EMP_UPDATE",
      delete: "EMP_DELETE",
      addDoc: "EMP_ADDDOC",
      editDoc: "EMP_UPDATEDOC",
      deleteDoc: "EMP_DELETEDOC"
    },
    "Vendor Master": {
      create: "VENDOR_CREATE",
      view: "VENDOR_VIEW",
      edit: "VENDOR_UPDATE",
      delete: "VENDOR_DELETE",
      addDoc: "VENDOR_ADDDOC",
      editDoc: "VENDOR_UPDATEDOC",
      deleteDoc: "VENDOR_DELETEDOC"
    },
    "Vendor Material": {
      create: "VENDOR_MATERIAL_CREATE",
      view: "VENDOR_MATERIAL_VIEW",
      edit: "VENDOR_MATERIAL_UPDATE",
      delete: "VENDOR_MATERIAL_DELETE",
      addDoc: "VENDOR_MATERIAL_ADDDOC",
      editDoc: "VENDOR_MATERIAL_UPDATEDOC",
      deleteDoc: "VENDOR_MATERIAL_DELETEDOC"
    }
  };

  // --- Static Data Configuration ---
  const moduleOptions = [
    "Project Master",
    "Material Master",
    "HRM",
    "Vendor Management"
  ];

  const subModuleOptions = {
    "Project Master": [
      "Project Management", 
      "Location Management", 
      "Store Management", 
      "Bio Machine", 
      "Condition Master", 
      "Firm", 
      "Contractor Master"
    ],
    "Material Master": [
      "Tax Management", 
      "Unit Management", 
      "Manufacturer Details", 
      "Category Management", 
      "Subcategory Management", 
      "Add Material", 
      "Material Management"
    ],
    "HRM": [
      "Leave Allotment", 
      "Holiday Management", 
      "Group Master", 
      "Department", 
      "Designation", 
      "User Management", 
      "Employee Management"
    ],
    "Vendor Management": [
      "Vendor Master", 
      "Vendor Material"
    ]
  };

  // Modules that should have document permissions enabled
  const modulesWithDocPermissions = [
    "Project Management",
    "Firm", 
    "Vendor Master",
    "Material Management",
    "User Management",
    "Contractor Master"
  ];

  // --- Styles ---
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
    btnDisabled: {
      backgroundColor: '#94a3b8',
      color: '#ffffff',
      cursor: 'not-allowed'
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
      gap: '10px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    searchDropdownBox: {
      position: 'relative'
    },
    searchSelect: {
      padding: '8px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      width: '200px',
      fontFamily: 'inherit',
      backgroundColor: '#ffffff',
      color: '#1e293b',
      cursor: 'pointer'
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
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    disabledCheckbox: {
      width: '18px',
      height: '18px',
      cursor: 'not-allowed',
      opacity: '0.5'
    },
    permissionCell: {
      textAlign: 'center'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    },
    dropdownLoading: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
    },
    userTag: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '8px',
      backgroundColor: '#e0e7ff',
      color: '#3730a3'
    },
    permissionPreview: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f1f5f9',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    permissionPreviewTitle: {
      fontWeight: '600',
      marginBottom: '10px',
      color: '#1e293b'
    },
    permissionChip: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      margin: '2px',
      backgroundColor: '#dbeafe',
      color: '#1e3a8a'
    }
  };

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Load user module permissions from localStorage on component mount
  useEffect(() => {
    const storedPermissions = localStorage.getItem('userModulePermissions');
    if (storedPermissions) {
      try {
        setUserModulePermissions(JSON.parse(storedPermissions));
      } catch (error) {
        console.error("Error parsing stored permissions:", error);
      }
    }
    
    fetchBootstrapData();
    fetchRoles();
    fetchUsers();
    fetchRolePermissions();
    fetchPermissionDetails(); // Fetch all permission details
  }, []);

  // Save user module permissions to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(userModulePermissions).length > 0) {
      localStorage.setItem('userModulePermissions', JSON.stringify(userModulePermissions));
    }
  }, [userModulePermissions]);

  useEffect(() => {
    if (searchUser && searchModule) {
      updateDisplayedPermissions();
    } else {
      setDisplayedPermissions([]);
    }
  }, [searchUser, searchModule, rolePermissions, userPermissions, permissionDetails, userModulePermissions]);

  const fetchBootstrapData = async () => {
    try {
      await api.get("/auth/seed"); 
    } catch (error) {
      console.error("Error fetching bootstrap data:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await api.get("/role/getAll");
      const data = response.data; 
      setRolesList(data.data || data || []); 
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles from server", { position: "top-right" });
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get("auth/staff");
      const data = response.data; 
      setUsersList(data.data || data || []); 
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users from server", { position: "top-right" });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch all permission details from the backend
  const fetchPermissionDetails = async () => {
    try {
      const response = await api.get("/auth/permissions");
      const permissions = response.data || [];
      
      // Create a map of permission ID to permission name
      const permissionMap = {};
      permissions.forEach(p => {
        permissionMap[p.id] = p.name;
      });
      
      setPermissionDetails(permissionMap);
    } catch (error) {
      console.error("Error fetching permission details:", error);
      // If the endpoint doesn't exist, we'll use the PERMISSION_MAP
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      // First try to get permissions from the staff_permissions table
      const response = await api.get(`/auth/staff/${userId}/permissions`);
      
      let userPerms = [];
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        // If the response is an array of permission objects
        userPerms = response.data.map(p => p.name || p);
      } else if (response.data && response.data.permissions) {
        // If the response has a permissions property
        userPerms = response.data.permissions.map(p => p.name || p);
      } else if (response.data && typeof response.data === 'string') {
        // If the response is a single permission string
        userPerms = [response.data];
      }
      
      // If we still don't have permissions, try to get them from the staff_permissions table
      if (userPerms.length === 0) {
        try {
          const staffPermsResponse = await api.get(`/auth/staff/${userId}/staff-permissions`);
          
          if (staffPermsResponse.data && Array.isArray(staffPermsResponse.data)) {
            // Map permission IDs to permission names using the permissionDetails map
            userPerms = staffPermsResponse.data
              .filter(sp => sp.permission_id) // Filter out any entries without permission_id
              .map(sp => permissionDetails[sp.permission_id])
              .filter(name => name); // Filter out any undefined names
          }
        } catch (staffPermsError) {
          console.error("Error fetching staff permissions:", staffPermsError);
        }
      }
      
      console.log(`User ${userId} permissions:`, userPerms);
      setUserPermissions(prev => ({ ...prev, [userId]: userPerms }));
      
      // Mark that permissions have been loaded for this user
      setPermissionsLoaded(prev => ({ ...prev, [userId]: true }));
      
      // Initialize user module permissions based on fetched permissions
      initializeUserModulePermissions(userId, userPerms);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      // If endpoint doesn't exist, initialize with empty array
      setUserPermissions(prev => ({ ...prev, [userId]: [] }));
      
      // Mark that permissions have been loaded for this user
      setPermissionsLoaded(prev => ({ ...prev, [userId]: true }));
      
      // Initialize with empty permissions
      initializeUserModulePermissions(userId, []);
    }
  };

  // Initialize user module permissions based on user's actual permissions
  const initializeUserModulePermissions = (userId, userPerms) => {
    // Create a map of all modules and their sub-modules with permission states
    const modulePermissionsMap = {};
    
    moduleOptions.forEach(module => {
      const subModules = subModuleOptions[module] || [];
      const subModulePermissions = {};
      
      subModules.forEach(subModule => {
        const permissions = PERMISSION_MAP[subModule] || {};
        
        subModulePermissions[subModule] = {
          create: userPerms.includes(permissions.create),
          view: userPerms.includes(permissions.view),
          edit: userPerms.includes(permissions.edit),
          delete: userPerms.includes(permissions.delete),
          addDoc: userPerms.includes(permissions.addDoc),
          editDoc: userPerms.includes(permissions.editDoc),
          deleteDoc: userPerms.includes(permissions.deleteDoc)
        };
      });
      
      modulePermissionsMap[module] = subModulePermissions;
    });
    
    // Only update if we don't already have permissions for this user
    setUserModulePermissions(prev => {
      if (!prev[userId]) {
        return {
          ...prev,
          [userId]: modulePermissionsMap
        };
      }
      return prev;
    });
  };

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/role/getAll");
      setRolePermissions(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      setRolePermissions([]);
      setLoading(false);
    }
  };

  const updateDisplayedPermissions = () => {
    if (!searchUser || !searchModule) {
      setDisplayedPermissions([]);
      return;
    }
    
    const selectedUser = usersList.find(u => 
      u.id == searchUser || u.staffId == searchUser || u._id == searchUser
    );
    
    const moduleSubModules = subModuleOptions[searchModule] || [];
    
    // Get user's permissions
    const userPerms = userPermissions[searchUser] || [];
    console.log(`Updating displayed permissions for user ${searchUser}, module ${searchModule}:`, userPerms);
    
    // Get stored permissions for this user
    const userPermissionsData = userModulePermissions[searchUser] || {};
    const modulePermissions = userPermissionsData[searchModule] || {};
    
    const permissionEntries = moduleSubModules.map(subModule => {
      const existingPermission = rolePermissions.find(item => 
        item.userId == searchUser && 
        item.module === searchModule && 
        item.subModule === subModule
      );
      
      if (existingPermission) {
        return existingPermission;
      } else {
        // Always use the stored permissions for this sub-module if available
        // Otherwise, create based on user's actual permissions
        const storedPermissions = modulePermissions[subModule];
        
        if (storedPermissions) {
          return {
            id: `new-${Date.now()}-${Math.random()}`,
            userId: searchUser,
            userName: selectedUser ? selectedUser.userName : "Unknown User",
            module: searchModule,
            subModule: subModule,
            permissions: storedPermissions
          };
        } else {
          // If we don't have stored permissions, create based on user's actual permissions
          const subModulePermissions = PERMISSION_MAP[subModule] || {};
          
          // Debug logging for Firm and User Management modules specifically
          if (subModule === "Firm" || subModule === "User Management") {
            console.log(`${subModule} permission mapping:`, subModulePermissions);
            console.log(`User has ${subModulePermissions.create}:`, userPerms.includes(subModulePermissions.create));
            console.log(`User has ${subModulePermissions.view}:`, userPerms.includes(subModulePermissions.view));
          }
          
          return {
            id: `new-${Date.now()}-${Math.random()}`,
            userId: searchUser,
            userName: selectedUser ? selectedUser.userName : "Unknown User",
            module: searchModule,
            subModule: subModule,
            permissions: {
              create: userPerms.includes(subModulePermissions.create),
              view: userPerms.includes(subModulePermissions.view),
              edit: userPerms.includes(subModulePermissions.edit),
              delete: userPerms.includes(subModulePermissions.delete),
              addDoc: userPerms.includes(subModulePermissions.addDoc),
              editDoc: userPerms.includes(subModulePermissions.editDoc),
              deleteDoc: userPerms.includes(subModulePermissions.deleteDoc)
            }
          };
        }
      }
    });
    
    setDisplayedPermissions(permissionEntries);
  };

  const handleModuleChange = (e) => {
    setSearchModule(e.target.value);
    setSearchSubModule("");
  };

  const filteredData = rolePermissions.filter((item) => {
    const matchUser = searchUser ? item.userId == searchUser || item.userName?.toLowerCase().includes(searchUser.toLowerCase()) : true;
    const matchModule = searchModule ? item.module === searchModule : true;
    const matchSubModule = searchSubModule ? item.subModule === searchSubModule : true;
    return matchUser && matchModule && matchSubModule;
  });

  // Get all selected permissions from ALL modules for the current user
  const getAllSelectedPermissions = () => {
    if (!searchUser) return [];
    
    const allPermissions = [];
    const userPermissionsData = userModulePermissions[searchUser] || {};
    
    // Iterate through all modules
    Object.keys(userPermissionsData).forEach(module => {
      const modulePermissions = userPermissionsData[module];
      
      // Iterate through all sub-modules in this module
      Object.keys(modulePermissions).forEach(subModule => {
        const subModulePermissions = modulePermissions[subModule];
        const permissionMap = PERMISSION_MAP[subModule] || {};
        
        // Add permissions based on checked boxes
        if (subModulePermissions.create && permissionMap.create) {
          allPermissions.push(permissionMap.create);
        }
        if (subModulePermissions.view && permissionMap.view) {
          allPermissions.push(permissionMap.view);
        }
        if (subModulePermissions.edit && permissionMap.edit) {
          allPermissions.push(permissionMap.edit);
        }
        if (subModulePermissions.delete && permissionMap.delete) {
          allPermissions.push(permissionMap.delete);
        }
        if (subModulePermissions.addDoc && permissionMap.addDoc) {
          allPermissions.push(permissionMap.addDoc);
        }
        if (subModulePermissions.editDoc && permissionMap.editDoc) {
          allPermissions.push(permissionMap.editDoc);
        }
        if (subModulePermissions.deleteDoc && permissionMap.deleteDoc) {
          allPermissions.push(permissionMap.deleteDoc);
        }
      });
    });
    
    // Remove duplicates
    return [...new Set(allPermissions)];
  };

  // HandleSubmit for Multiple Permission Assignments
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchUser) {
      toast.error("Please select a user first", { position: 'top-right' });
      return;
    }

    // Get ALL selected permissions from ALL modules
    const allSelectedPermissions = getAllSelectedPermissions();
    
    if (allSelectedPermissions.length === 0) {
      toast.error("Please select at least one permission", { position: 'top-right' });
      return;
    }

    try {
      setSaving(true);
      
      // Convert userId to number
      const userIdNumber = Number(searchUser);
      
      // Use the assign-permissions endpoint
      const url = `/auth/staff/${userIdNumber}/assign-permissions`;
      
      console.log(`Sending PUT request to: ${API_BASE_URL}${url}`);
      console.log("Total permissions being assigned:", allSelectedPermissions.length);
      console.log("Permissions:", allSelectedPermissions);

      // Send ALL permissions as an array
      const response = await api.put(url, allSelectedPermissions);
      
      if (response.status === 200) {
        toast.success(`${allSelectedPermissions.length} permissions assigned successfully`, { 
          position: 'top-right',
          duration: 4000 
        });
        
        // Update user permissions in state with the newly assigned permissions
        setUserPermissions(prev => ({ 
          ...prev, 
          [searchUser]: allSelectedPermissions 
        }));
        
        // Refresh the displayed permissions to show updated state
        updateDisplayedPermissions();
      } else {
        toast.error(`Unexpected response: ${response.status}`, { position: 'top-right' });
        return;
      }
      
      // Fetch fresh data from server
      await fetchRolePermissions();
      
    } catch (error) {
      console.error('Error assigning permissions:', error);
      if (error.response) {
        console.error("Backend Response Data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
        
        if (error.response.data && error.response.data.message) {
          toast.error(`Failed: ${error.response.data.message}`, { position: 'top-right' });
        } else {
          toast.error('Failed to assign permissions. Please check console for details.', { position: 'top-right' });
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error('No response from server. Please check network connection.', { position: 'top-right' });
      } else {
        toast.error('Request setup error: ' + error.message, { position: 'top-right' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/role/delete/${id}`);
      toast.success('Deleted successfully', { position: 'top-right' });
      fetchRolePermissions();
    } catch (error) {
      toast.error('Failed to delete', { position: 'top-right' });
    }
  };

  const handlePermissionToggle = (id, permissionType, value) => {
    // Update the displayed permissions
    const updatedPermissions = displayedPermissions.map(item => 
      item.id === id ? { 
        ...item, 
        permissions: { 
          ...item.permissions, 
          [permissionType]: value 
        } 
      } : item
    );
    setDisplayedPermissions(updatedPermissions);
    
    // Also update the stored permissions for this user and module
    if (searchUser && searchModule) {
      const item = updatedPermissions.find(p => p.id === id);
      
      if (item) {
        setUserModulePermissions(prev => {
          const currentUserPermissions = prev[searchUser] || {};
          const currentModulePermissions = currentUserPermissions[searchModule] || {};
          const currentSubModulePermissions = currentModulePermissions[item.subModule] || {};
          
          return {
            ...prev,
            [searchUser]: {
              ...currentUserPermissions,
              [searchModule]: {
                ...currentModulePermissions,
                [item.subModule]: {
                  ...currentSubModulePermissions,
                  [permissionType]: value
                }
              }
            }
          };
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'userId') {
      const selectedUser = usersList.find(u => u.id == value || u.staffId == value || u._id == value); 
      setFormData({
        ...formData,
        userId: value,
        userName: selectedUser ? selectedUser.userName : ""
      });
      setSearchUser(value);
      
      // Fetch user permissions when a user is selected
      if (value && !permissionsLoaded[value]) {
        fetchUserPermissions(value);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === 'module') {
      setFormData(prev => ({ ...prev, subModule: "" }));
    }
  };

  // Function to assign permissions to a specific user
  const assignPermissionsToUser = async (userId, permissions) => {
    try {
      const userIdNumber = Number(userId);
      const url = `/auth/staff/${userIdNumber}/assign-permissions`;
      
      const response = await api.put(url, permissions);
      
      if (response.status === 200) {
        toast.success(`${permissions.length} permissions assigned successfully`, { 
          position: 'top-right',
          duration: 4000 
        });
        
        // Update user permissions in state with the newly assigned permissions
        setUserPermissions(prev => ({ 
          ...prev, 
          [userId]: permissions 
        }));
        
        return true;
      } else {
        toast.error(`Unexpected response: ${response.status}`, { position: 'top-right' });
        return false;
      }
    } catch (error) {
      console.error('Error assigning permissions:', error);
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          toast.error(`Failed: ${error.response.data.message}`, { position: 'top-right' });
        } else {
          toast.error('Failed to assign permissions. Please check console for details.', { position: 'top-right' });
        }
      } else if (error.request) {
        toast.error('No response from server. Please check network connection.', { position: 'top-right' });
      } else {
        toast.error('Request setup error: ' + error.message, { position: 'top-right' });
      }
      return false;
    }
  };

  // Check if a permission should be enabled for a specific sub-module
  const isPermissionEnabled = (subModule, permissionType) => {
    // Delete permission is always disabled for User Management
    if (subModule === "User Management" && permissionType === "delete") {
      return false;
    }
    
    // Document permissions are only enabled for specific modules
    if (permissionType === "addDoc" || permissionType === "editDoc" || permissionType === "deleteDoc") {
      return modulesWithDocPermissions.includes(subModule);
    }
    
    // All other permissions are enabled
    return true;
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Role & Permission Management</h1>
          <div style={styles.headerActions}>
            <button 
              style={{...styles.btn, ...(saving ? styles.btnDisabled : styles.btnPrimary)}} 
              onClick={handleSubmit}
              disabled={!searchUser || saving}
            >
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> 
              {saving ? 'Saving...' : `Save All Permissions`}
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>Permissions List</div>
            
            <div style={styles.tableActions}>
              <div style={styles.searchDropdownBox}>
                <select
                  style={styles.searchSelect}
                  value={searchUser}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchUser(value);
                    handleInputChange({ target: { name: 'userId', value } });
                  }}
                  disabled={usersLoading}
                >
                  <option value="">{usersLoading ? "Loading users..." : "Select User"}</option>
                  {usersList.map(user => (
                    <option key={user.id || user.staffId || user._id} value={user.id || user.staffId || user._id}>
                      {user.userName}
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <div style={styles.dropdownLoading}>
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </div>

              <div style={styles.searchDropdownBox}>
                <select
                  style={styles.searchSelect}
                  value={searchModule}
                  onChange={handleModuleChange}
                >
                  <option value="">Select Module</option>
                  {moduleOptions.map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
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
                  <th style={styles.th}>Sub Module</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Create</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>View</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Edit</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Delete</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Add Doc</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Edit Doc</th>
                  <th style={{...styles.th, ...styles.permissionCell}}>Delete Doc</th>
                </tr>
              </thead>
              <tbody>
                {displayedPermissions.length > 0 ? displayedPermissions.map((item, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  return (
                    <tr 
                      key={item.id}
                      style={{
                        ...styles.tr,
                        backgroundColor: hoveredRow === item.id ? '#e2e8f0' : rowBgColor
                      }}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={styles.td}>
                        {index + 1}
                        {item.userName && (
                          <span style={styles.userTag}>User: {item.userName}</span>
                        )}
                      </td>
                      <td style={styles.td}>{item.subModule}</td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'create') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.create || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'create', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'create')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'view') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.view || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'view', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'view')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'edit') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.edit || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'edit', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'edit')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'delete') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.delete || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'delete', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'delete')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'addDoc') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.addDoc || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'addDoc', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'addDoc')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'editDoc') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.editDoc || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'editDoc', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'editDoc')}
                          />
                        </div>
                      </td>
                      <td style={{...styles.td, ...styles.permissionCell}}>
                        <div style={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            style={isPermissionEnabled(item.subModule, 'deleteDoc') ? styles.checkbox : styles.disabledCheckbox}
                            checked={item.permissions?.deleteDoc || false}
                            onChange={(e) => handlePermissionToggle(item.id, 'deleteDoc', e.target.checked)}
                            disabled={!isPermissionEnabled(item.subModule, 'deleteDoc')}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="9" style={{...styles.td, textAlign: 'center', padding: '30px'}}>
                      {searchUser && searchModule ? 
                        "No permissions found for the selected user and module. You can set permissions by checking the checkboxes above." : 
                        "Please select a user and module to view and set permissions."
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Permission Preview Section */}
        {searchUser && (
          <div style={styles.permissionPreview}>
            <div style={styles.permissionPreviewTitle}>
              All Selected Permissions ({getAllSelectedPermissions().length} permissions)
            </div>
            <div>
              {getAllSelectedPermissions().length > 0 ? (
                getAllSelectedPermissions().map(perm => (
                  <span key={perm} style={styles.permissionChip}>{perm}</span>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No permissions selected</span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RolePermission;