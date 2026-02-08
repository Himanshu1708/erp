import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const EmployeeManagement = () => {
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // State for dropdown data
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState({
    locations: false,
    departments: false,
    designations: false
  });

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({
    bankName: "",
    accountNo: "",
    branchName: "",
    ifscCode: "",
    status: "Active"
  });

  // Payhead state
  const [payheads, setPayheads] = useState([]);
  const [editingPayhead, setEditingPayhead] = useState(null);
  const [showPayheadModal, setShowPayheadModal] = useState(false);
  const [payheadFormData, setPayheadFormData] = useState({
    basicSalary: "",
    startDate: new Date().toISOString().split('T')[0],
    bonus: "",
    electrictyBill: "",
    esicEmployer: "",
    mediclaim: "",
    otherAllowance: "",
    providentFundEmployers: "",
    roomRent: "",
    travellingAllowances: "",
    advanceAgaintSalary: "",
    esicEmployee: "",
    mess: "",
    professionalTax: "",
    providentFundEmployee: "",
    travellingDiduction: "",
    totalSalary: ""
  });

  // State for form data
  const [formData, setFormData] = useState({
    empName: "",
    dept: "",
    designation: "",
    gender: "Male",
    loc: "",
    dob: "",
    doj: new Date().toISOString().split('T')[0],
    address: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
    mobile1: "",
    mobile2: "",
    email: "",
    panNo: "",
    adharNo: "",
    status: "Active"
  });

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

  // Function to handle API response
  const handleApiResponse = (response) => {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  };

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchEmployees();
    fetchLocations();
    fetchDepartments();
    fetchDesignations();
  }, []);

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setDropdownLoading(prev => ({ ...prev, locations: true }));
      const response = await api.get("/location/getAllLoc");
      if (response.status === 200) {
        const data = response.data;
        if (Array.isArray(data)) {
          setLocations(data);
        } else {
          console.error("Unexpected response format for locations:", data);
          setLocations([]);
        }
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to fetch locations");
      setLocations([]);
    } finally {
      setDropdownLoading(prev => ({ ...prev, locations: false }));
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDropdownLoading(prev => ({ ...prev, departments: true }));
      const response = await api.get("/department/getAllDept");
      if (response.status === 200) {
        const data = response.data;
        if (Array.isArray(data)) {
          setDepartments(data);
        } else {
          console.error("Unexpected response format for departments:", data);
          setDepartments([]);
        }
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
      setDepartments([]);
    } finally {
      setDropdownLoading(prev => ({ ...prev, departments: false }));
    }
  };

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      setDropdownLoading(prev => ({ ...prev, designations: true }));
      const response = await api.get("/designation/getAllDesig");
      if (response.status === 200) {
        const data = response.data;
        if (Array.isArray(data)) {
          setDesignations(data);
        } else {
          console.error("Unexpected response format for designations:", data);
          setDesignations([]);
        }
      } else {
        setDesignations([]);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      toast.error("Failed to fetch designations");
      setDesignations([]);
    } finally {
      setDropdownLoading(prev => ({ ...prev, designations: false }));
    }
  };

  // Fetch all employees - FIXED: Process the API response structure
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/emp/all");
     
      if (response.status === 200) {
        const data = handleApiResponse(response);
        console.log("Fetched employees from /all:", data); // Debug log
        
        if (Array.isArray(data)) {
          // The API returns an array of objects with employee, bankDetails, payheads, documents
          // We need to extract and flatten this structure
          const processedEmployees = data.map(item => {
            // Return a single object with all employee data combined
            return {
              ...item.employee,           // Spread employee properties
              bankDetails: item.bankDetails || [],  // Include bank details
              payheads: item.payheads || [],        // Include payheads
              documents: item.documents || []       // Include documents
            };
          });
          
          console.log("Processed employees:", processedEmployees); // Debug log
          setEmployees(processedEmployees);
        } else {
          console.error("Unexpected response format:", data);
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total salary from payhead form
  const calculateTotalSalary = () => {
    const {
      basicSalary = 0,
      bonus = 0,
      electrictyBill = 0,
      esicEmployer = 0,
      mediclaim = 0,
      otherAllowance = 0,
      providentFundEmployers = 0,
      roomRent = 0,
      travellingAllowances = 0,
      advanceAgaintSalary = 0,
      esicEmployee = 0,
      mess = 0,
      professionalTax = 0,
      providentFundEmployee = 0,
      travellingDiduction = 0
    } = payheadFormData;

    const earnings = parseFloat(basicSalary || 0) + 
                    parseFloat(bonus || 0) + 
                    parseFloat(electrictyBill || 0) + 
                    parseFloat(esicEmployer || 0) + 
                    parseFloat(mediclaim || 0) + 
                    parseFloat(otherAllowance || 0) + 
                    parseFloat(providentFundEmployers || 0) + 
                    parseFloat(roomRent || 0) + 
                    parseFloat(travellingAllowances || 0);

    const deductions = parseFloat(advanceAgaintSalary || 0) + 
                      parseFloat(esicEmployee || 0) + 
                      parseFloat(mess || 0) + 
                      parseFloat(professionalTax || 0) + 
                      parseFloat(providentFundEmployee || 0) + 
                      parseFloat(travellingDiduction || 0);

    const total = earnings - deductions;
    setPayheadFormData(prev => ({
      ...prev,
      totalSalary: total.toFixed(2)
    }));
  };

  // Open modal for adding new employee
  const openAddModal = () => {
    setEditingEmployee(null);
    setIsViewMode(false);
    setActiveTab("basic");
    setBankAccounts([]);
    setPayheads([]);
    setFormData({
      empName: "",
      dept: "",
      designation: "",
      gender: "Male",
      loc: "",
      dob: "",
      doj: new Date().toISOString().split('T')[0],
      address: "",
      state: "",
      city: "",
      pincode: "",
      phone: "",
      mobile1: "",
      mobile2: "",
      email: "",
      panNo: "",
      adharNo: "",
      status: "Active"
    });
    setShowModal(true);
  };

  // Open modal for editing employee - FIXED: Use data from employees state
  const openEditModal = async (employee) => {
    try {
      console.log("Opening edit modal for employee:", employee);
      
      // Use the employee data already in our state
      setEditingEmployee(employee);
      setIsViewMode(false);
      setActiveTab("basic");
     
      // Set form data from employee object
      setFormData({
        empName: employee.empName || "",
        dept: employee.dept || "",
        designation: employee.designation || "",
        gender: employee.gender || "Male",
        loc: employee.loc || "",
        dob: employee.dob || "",
        doj: employee.doj || new Date().toISOString().split('T')[0],
        address: employee.address || "",
        state: employee.state || "",
        city: employee.city || "",
        pincode: employee.pincode || "",
        phone: employee.phone || "",
        mobile1: employee.mobile1 || "",
        mobile2: employee.mobile2 || "",
        email: employee.email || "",
        panNo: employee.panNo || "",
        adharNo: employee.adharNo || "",
        status: employee.status || "Active"
      });

      // Set bank accounts and payheads from employee data
      setBankAccounts(employee.bankDetails || []);
      setPayheads(employee.payheads || []);
      
      console.log("Bank accounts set:", employee.bankDetails);
      console.log("Payheads set:", employee.payheads);
      
      setShowModal(true);
    } catch (error) {
      console.error("Error opening edit modal:", error);
      toast.error("Failed to open edit modal");
    }
  };

  // Open modal for viewing employee - FIXED: Use data from employees state
  const openViewModal = async (employee) => {
    try {
      console.log("Opening view modal for employee:", employee);
      
      // Use the employee data already in our state
      setEditingEmployee(employee);
      setIsViewMode(true);
      setActiveTab("basic");
     
      setFormData({
        empName: employee.empName || "",
        dept: employee.dept || "",
        designation: employee.designation || "",
        gender: employee.gender || "Male",
        loc: employee.loc || "",
        dob: employee.dob || "",
        doj: employee.doj || new Date().toISOString().split('T')[0],
        address: employee.address || "",
        state: employee.state || "",
        city: employee.city || "",
        pincode: employee.pincode || "",
        phone: employee.phone || "",
        mobile1: employee.mobile1 || "",
        mobile2: employee.mobile2 || "",
        email: employee.email || "",
        panNo: employee.panNo || "",
        adharNo: employee.adharNo || "",
        status: employee.status || "Active"
      });

      // Set bank accounts and payheads from employee data
      setBankAccounts(employee.bankDetails || []);
      setPayheads(employee.payheads || []);
      
      console.log("Bank accounts for view:", employee.bankDetails);
      console.log("Payheads for view:", employee.payheads);
      
      setShowModal(true);
    } catch (error) {
      console.error("Error opening view modal:", error);
      toast.error("Failed to open view modal");
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setIsViewMode(false);
    setActiveTab("basic");
    setBankAccounts([]);
    setPayheads([]);
  };

  // Bank Account Functions
  const openBankModal = (bank = null) => {
    setEditingBank(bank);
    setBankFormData(bank ? {
      bankName: bank.bankName || "",
      accountNo: bank.accountNo || "",
      branchName: bank.branchName || "",
      ifscCode: bank.ifscCode || "",
      status: bank.status || "Active"
    } : {
      bankName: "",
      accountNo: "",
      branchName: "",
      ifscCode: "",
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
      ifscCode: "",
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

  // UPDATED: Bank account handling with immediate state update
  const handleAddBankAccount = async () => {
    if (!editingEmployee) {
      toast.error("Please save employee first");
      return;
    }

    if (!bankFormData.bankName || !bankFormData.accountNo || !bankFormData.ifscCode) {
      toast.error("Bank Name, Account No, and IFSC Code are required");
      return;
    }

    try {
      let response;
      if (editingBank) {
        // Update existing bank account
        response = await api.put(`/emp/bank/${editingBank.id}`, bankFormData);
        if (response.status === 200) {
          toast.success('Bank account updated successfully');
          
          // IMMEDIATE STATE UPDATE - Update bank account in local state
          const updatedBankAccounts = bankAccounts.map(bank => 
            bank.id === editingBank.id ? { ...bank, ...bankFormData } : bank
          );
          setBankAccounts(updatedBankAccounts);
          
          // Update the employee in main employees list
          setEmployees(prev => prev.map(emp => {
            if (emp.id === editingEmployee.id) {
              return {
                ...emp,
                bankDetails: updatedBankAccounts
              };
            }
            return emp;
          }));
        }
      } else {
        // Add new bank account
        response = await api.post(`/emp/${editingEmployee.id}/bank`, bankFormData);
        if (response.status === 200) {
          toast.success('Bank account added successfully');
          
          // IMMEDIATE STATE UPDATE - Get the new bank account from response
          const newBankAccount = response.data?.data || response.data;
          const updatedBankAccounts = [...bankAccounts, newBankAccount];
          setBankAccounts(updatedBankAccounts);
          
          // Update the employee in main employees list
          setEmployees(prev => prev.map(emp => {
            if (emp.id === editingEmployee.id) {
              return {
                ...emp,
                bankDetails: updatedBankAccounts
              };
            }
            return emp;
          }));
        }
      }
      closeBankModal();
    } catch (error) {
      console.error('Error saving bank account:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save bank account';
      toast.error(errorMsg);
    }
  };

  // UPDATED: Delete bank account with immediate state update
  const handleDeleteBankAccount = async (bankId) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) {
      return;
    }

    try {
      const response = await api.delete(`/emp/bank/${bankId}`);
      if (response.status === 200) {
        toast.success('Bank account deleted successfully');
        
        // IMMEDIATE STATE UPDATE - Remove bank account from local state
        const updatedBankAccounts = bankAccounts.filter(bank => bank.id !== bankId);
        setBankAccounts(updatedBankAccounts);
        
        // Update the employee in main employees list
        setEmployees(prev => prev.map(emp => {
          if (emp.id === editingEmployee.id) {
            return {
              ...emp,
              bankDetails: updatedBankAccounts
            };
          }
          return emp;
        }));
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete bank account';
      toast.error(errorMsg);
    }
  };

  // Payhead Functions
  const openPayheadModal = (payhead = null) => {
    setEditingPayhead(payhead);
    if (payhead) {
      setPayheadFormData({
        basicSalary: payhead.basicSalary || "",
        startDate: payhead.startDate || new Date().toISOString().split('T')[0],
        bonus: payhead.bonus || "",
        electrictyBill: payhead.electrictyBill || "",
        esicEmployer: payhead.esicEmployer || "",
        mediclaim: payhead.mediclaim || "",
        otherAllowance: payhead.otherAllowance || "",
        providentFundEmployers: payhead.providentFundEmployers || "",
        roomRent: payhead.roomRent || "",
        travellingAllowances: payhead.travellingAllowances || "",
        advanceAgaintSalary: payhead.advanceAgaintSalary || "",
        esicEmployee: payhead.esicEmployee || "",
        mess: payhead.mess || "",
        professionalTax: payhead.professionalTax || "",
        providentFundEmployee: payhead.providentFundEmployee || "",
        travellingDiduction: payhead.travellingDiduction || "",
        totalSalary: payhead.totalSalary || ""
      });
    } else {
      setPayheadFormData({
        basicSalary: "",
        startDate: new Date().toISOString().split('T')[0],
        bonus: "",
        electrictyBill: "",
        esicEmployer: "",
        mediclaim: "",
        otherAllowance: "",
        providentFundEmployers: "",
        roomRent: "",
        travellingAllowances: "",
        advanceAgaintSalary: "",
        esicEmployee: "",
        mess: "",
        professionalTax: "",
        providentFundEmployee: "",
        travellingDiduction: "",
        totalSalary: ""
      });
    }
    setShowPayheadModal(true);
  };

  const closePayheadModal = () => {
    setShowPayheadModal(false);
    setEditingPayhead(null);
    setPayheadFormData({
      basicSalary: "",
      startDate: new Date().toISOString().split('T')[0],
      bonus: "",
      electrictyBill: "",
      esicEmployer: "",
      mediclaim: "",
      otherAllowance: "",
      providentFundEmployers: "",
      roomRent: "",
      travellingAllowances: "",
      advanceAgaintSalary: "",
      esicEmployee: "",
      mess: "",
      professionalTax: "",
      providentFundEmployee: "",
      travellingDiduction: "",
      totalSalary: ""
    });
  };

  const handlePayheadInputChange = (e) => {
    const { name, value } = e.target;
    setPayheadFormData({
      ...payheadFormData,
      [name]: value === '' ? '' : value
    });
  };

  const handlePayheadNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPayheadFormData({
        ...payheadFormData,
        [name]: value
      });
    }
  };

  // UPDATED: Payhead handling with immediate state update
  const handleAddPayhead = async () => {
    if (!editingEmployee) {
      toast.error("Please save employee first");
      return;
    }

    if (!payheadFormData.basicSalary) {
      toast.error("Basic Salary is required");
      return;
    }

    try {
      let response;
      if (editingPayhead) {
        // Update existing payhead
        response = await api.put(`/emp/payhead/updated/${editingPayhead.id}`, payheadFormData);
        if (response.status === 200) {
          toast.success('Payhead updated successfully');
          
          // IMMEDIATE STATE UPDATE - Update payhead in local state
          const updatedPayheads = payheads.map(payhead => 
            payhead.id === editingPayhead.id ? { ...payhead, ...payheadFormData } : payhead
          );
          setPayheads(updatedPayheads);
          
          // Update the employee in main employees list
          setEmployees(prev => prev.map(emp => {
            if (emp.id === editingEmployee.id) {
              return {
                ...emp,
                payheads: updatedPayheads
              };
            }
            return emp;
          }));
        }
      } else {
        // Add new payhead
        response = await api.post(`/emp/${editingEmployee.id}/payhead`, payheadFormData);
        if (response.status === 200) {
          toast.success('Payhead added successfully');
          
          // IMMEDIATE STATE UPDATE - Get the new payhead from response
          const newPayhead = response.data?.data || response.data;
          const updatedPayheads = [...payheads, newPayhead];
          setPayheads(updatedPayheads);
          
          // Update the employee in main employees list
          setEmployees(prev => prev.map(emp => {
            if (emp.id === editingEmployee.id) {
              return {
                ...emp,
                payheads: updatedPayheads
              };
            }
            return emp;
          }));
        }
      }
      closePayheadModal();
    } catch (error) {
      console.error('Error saving payhead:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save payhead';
      toast.error(errorMsg);
    }
  };

  // UPDATED: Delete payhead with immediate state update
  const handleDeletePayhead = async (payheadId) => {
    if (!window.confirm("Are you sure you want to delete this payhead?")) {
      return;
    }

    try {
      const response = await api.delete(`/emp/payhead/delete/${payheadId}`);
      if (response.status === 200) {
        toast.success('Payhead deleted successfully');
        
        // IMMEDIATE STATE UPDATE - Remove payhead from local state
        const updatedPayheads = payheads.filter(payhead => payhead.id !== payheadId);
        setPayheads(updatedPayheads);
        
        // Update the employee in main employees list
        setEmployees(prev => prev.map(emp => {
          if (emp.id === editingEmployee.id) {
            return {
              ...emp,
              payheads: updatedPayheads
            };
          }
          return emp;
        }));
      }
    } catch (error) {
      console.error('Error deleting payhead:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete payhead';
      toast.error(errorMsg);
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

  // UPDATED: Handle form submission with immediate state update
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!formData.empName) {
      toast.error("Employee Name is required", { position: 'top-right' });
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await api.put(`/emp/update/${editingEmployee.id}`, formData);
       
        if (response.status === 200) {
          toast.success('Employee updated successfully', { position: 'top-right' });
          
          // IMMEDIATE STATE UPDATE - Update employee in local state
          const updatedEmployeeData = response.data?.data || response.data;
          setEmployees(prev => prev.map(emp => 
            emp.id === editingEmployee.id ? { 
              ...emp, 
              ...updatedEmployeeData,
              bankDetails: emp.bankDetails, // Preserve existing bank details
              payheads: emp.payheads // Preserve existing payheads
            } : emp
          ));
          
          closeModal();
        } else {
          const errorMsg = response.data.message || 'Failed to update employee';
          toast.error(errorMsg, { position: 'top-right' });
        }
      } else {
        // Create new employee
        const response = await api.post('/emp/create', formData);
       
        if (response.status === 200) {
          toast.success('Employee added successfully', { position: 'top-right' });
          
          // IMMEDIATE STATE UPDATE - Add new employee to local state
          const newEmployee = response.data?.data || response.data;
          setEmployees(prev => [...prev, newEmployee]);
          
          closeModal();
        } else {
          const errorMsg = response.data.message || 'Failed to add employee';
          toast.error(errorMsg, { position: 'top-right' });
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save employee';
      toast.error(errorMsg, { position: 'top-right' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!employees || employees.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = employees.map((employee, index) => ({
      "Sr No": index + 1,
      "Employee Name": employee.empName || "",
      "Department": employee.dept || "",
      "Designation": employee.designation || "",
      "Gender": employee.gender || "",
      "Location": employee.loc || "",
      "Date of Birth": employee.dob || "",
      "Date of Joining": employee.doj || "",
      "Address": employee.address || "",
      "City": employee.city || "",
      "State": employee.state || "",
      "Pincode": employee.pincode || "",
      "Primary Mobile": employee.mobile1 || "",
      "Secondary Mobile": employee.mobile2 || "",
      "Phone": employee.phone || "",
      "Email": employee.email || "",
      "PAN No": employee.panNo || "",
      "Aadhar No": employee.adharNo || "",
      "Status": employee.status || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileData, `Employee_Master_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  // UPDATED: Handle employee deletion with immediate state update
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await api.delete(`/emp/delete/${id}`);
      if (response.status === 200) {
        toast.success('Employee deleted successfully', {
          position: 'top-right',
        });
        
        // IMMEDIATE STATE UPDATE - Remove employee from local state
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      } else {
        const errorMsg = response.data.message || 'Failed to delete employee';
        toast.error(errorMsg, {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete employee';
      toast.error(errorMsg, { position: 'top-right' });
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();
   
    return (
      (employee.empName && employee.empName.toLowerCase().includes(search)) ||
      (employee.dept && employee.dept.toLowerCase().includes(search)) ||
      (employee.designation && employee.designation.toLowerCase().includes(search)) ||
      (employee.email && employee.email.toLowerCase().includes(search)) ||
      (employee.panNo && employee.panNo.toLowerCase().includes(search)) ||
      (employee.adharNo && employee.adharNo.toLowerCase().includes(search)) ||
      (employee.mobile1 && employee.mobile1.toString().includes(search))
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
    bankAccountCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    payheadCard: {
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
    payheadDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
    },
    payheadEarnings: {
      padding: '15px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      marginBottom: '15px'
    },
    payheadDeductions: {
      padding: '15px',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      marginBottom: '15px'
    },
    payheadTotal: {
      padding: '15px',
      backgroundColor: '#f0fdf4',
      borderRadius: '8px',
      marginBottom: '15px'
    },
    salaryLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '10px'
    },
    salaryRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '10px',
      marginBottom: '10px'
    },
    dropdownLoading: {
      display: 'inline-block',
      marginLeft: '10px',
      color: '#64748b'
    },
    dateInputWrapper: {
      position: 'relative',
      width: '100%'
    },
    dateInputIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      pointerEvents: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
     
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Employee Management</h1>
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
              Add Employee
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>All Employees ({filteredEmployees.length})</div>
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
                  <th style={styles.th}>Employee Name</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Designation</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? filteredEmployees.map((employee, index) => {
                  const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                  const isHovered = hoveredRow === employee.id;
                  const statusStyle = employee.status === 'Active' || employee.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive;

                  return (
                    <tr
                      key={employee.id}
                      style={{
                        ...styles.tr,
                        backgroundColor: isHovered ? '#e2e8f0' : rowBgColor
                      }}
                      onMouseEnter={() => setHoveredRow(employee.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{employee.empName || ""}</td>
                      <td style={styles.td}>{employee.dept || ""}</td>
                      <td style={styles.td}>{employee.designation || ""}</td>
                      <td style={styles.td}>{employee.mobile1 || ""}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...statusStyle }}>
                          {employee.status || "Active"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={{ ...styles.actionBtn, ...styles.editBtn }}
                            title="Edit"
                            onClick={() => openEditModal(employee)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.viewBtn }}
                            title="View"
                            onClick={() => openViewModal(employee)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                            title="Delete"
                            onClick={() => handleDelete(employee.id)}
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
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Employee Modal */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isViewMode ? 'View Employee Details' : (editingEmployee ? 'Edit Employee' : 'Add New Employee')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div style={styles.tabs}>
              <div 
                style={activeTab === "basic" ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab("basic")}
              >
                <i className="fas fa-user" style={{marginRight: '8px'}}></i>
                Basic Information
              </div>
              <div 
                style={activeTab === "bank" ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab("bank")}
              >
                <i className="fas fa-university" style={{marginRight: '8px'}}></i>
                Bank Accounts ({bankAccounts.length})
              </div>
              <div 
                style={activeTab === "payhead" ? {...styles.tab, ...styles.activeTab} : styles.tab}
                onClick={() => setActiveTab("payhead")}
              >
                <i className="fas fa-money-bill-wave" style={{marginRight: '8px'}}></i>
                Payheads ({payheads.length})
              </div>
            </div>
            
            <div style={styles.modalBody}>
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <form onSubmit={handleSubmit}>
                  {editingEmployee && (
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel} htmlFor="id">Employee ID</label>
                      <input
                        type="text"
                        id="id"
                        name="id"
                        value={editingEmployee.id || ""}
                        style={styles.formControl}
                        disabled={true}
                      />
                    </div>
                  )}
                  
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="empName">Employee Name *</label>
                        <input
                          type="text"
                          id="empName"
                          name="empName"
                          value={formData.empName}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          required
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="dept">Department</label>
                        <select
                          id="dept"
                          name="dept"
                          value={formData.dept}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.department_name}>
                              {dept.department_name}
                            </option>
                          ))}
                        </select>
                        {dropdownLoading.departments && (
                          <span style={styles.dropdownLoading}>
                            <i className="fas fa-spinner fa-spin"></i> Loading...
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="designation">Designation</label>
                        <select
                          id="designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        >
                          <option value="">Select Designation</option>
                          {designations.map((desig) => (
                            <option key={desig.id} value={desig.designation_name}>
                              {desig.designation_name}
                            </option>
                          ))}
                        </select>
                        {dropdownLoading.designations && (
                          <span style={styles.dropdownLoading}>
                            <i className="fas fa-spinner fa-spin"></i> Loading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="gender">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="loc">Location</label>
                        <select
                          id="loc"
                          name="loc"
                          value={formData.loc}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        >
                          <option value="">Select Location</option>
                          {locations.map((loc) => (
                            <option key={loc.locationCode} value={loc.locationName}>
                              {loc.locationName}
                            </option>
                          ))}
                        </select>
                        {dropdownLoading.locations && (
                          <span style={styles.dropdownLoading}>
                            <i className="fas fa-spinner fa-spin"></i> Loading...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="dob">Date of Birth</label>
                        <div style={styles.dateInputWrapper}>
                          <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            style={{...styles.formControl, paddingRight: '40px'}}
                            disabled={isViewMode}
                          />
                          <i className="fas fa-calendar-alt" style={styles.dateInputIcon}></i>
                        </div>
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="doj">Date of Joining</label>
                        <div style={styles.dateInputWrapper}>
                          <input
                            type="date"
                            id="doj"
                            name="doj"
                            value={formData.doj}
                            onChange={handleInputChange}
                            style={{...styles.formControl, paddingRight: '40px'}}
                            disabled={isViewMode}
                          />
                          <i className="fas fa-calendar-alt" style={styles.dateInputIcon}></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="address">Address</label>
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
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="state">State</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="pincode">Pincode</label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleNumberChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="phone">Phone</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleNumberChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="mobile1">Primary Mobile *</label>
                        <input
                          type="text"
                          id="mobile1"
                          name="mobile1"
                          value={formData.mobile1}
                          onChange={handleNumberChange}
                          style={styles.formControl}
                          required
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="mobile2">Secondary Mobile</label>
                        <input
                          type="text"
                          id="mobile2"
                          name="mobile2"
                          value={formData.mobile2}
                          onChange={handleNumberChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="panNo">PAN No</label>
                        <input
                          type="text"
                          id="panNo"
                          name="panNo"
                          value={formData.panNo}
                          onChange={handleInputChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                    <div style={styles.formCol}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel} htmlFor="adharNo">Aadhar No</label>
                        <input
                          type="text"
                          id="adharNo"
                          name="adharNo"
                          value={formData.adharNo}
                          onChange={handleNumberChange}
                          style={styles.formControl}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>

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
              )}

              {/* Bank Accounts Tab */}
              {activeTab === "bank" && (
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h4 style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>
                      Bank Accounts
                      <span style={{fontSize: '14px', color: '#64748b', marginLeft: '10px'}}>
                        (Total: {bankAccounts.length})
                      </span>
                    </h4>
                    {!isViewMode && editingEmployee && (
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
                        <div key={bank.id || `bank-${index}`} style={styles.bankAccountCard}>
                          <div style={styles.bankAccountHeader}>
                            <div style={styles.bankAccountName}>
                              {bank.bankName || "Bank Account"}
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                marginLeft: '10px',
                                fontSize: '12px'
                              }}>
                                Active
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
                              <span style={styles.bankDetailValue}>{bank.accountNo || "N/A"}</span>
                            </div>
                            <div style={styles.bankDetailItem}>
                              <span style={styles.bankDetailLabel}>Branch</span>
                              <span style={styles.bankDetailValue}>{bank.branchName || "N/A"}</span>
                            </div>
                            <div style={styles.bankDetailItem}>
                              <span style={styles.bankDetailLabel}>IFSC Code</span>
                              <span style={styles.bankDetailValue}>{bank.ifscCode || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                      <i className="fas fa-university" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                      <p>No bank accounts found for this employee.</p>
                      {!isViewMode && editingEmployee && (
                        <p>Click "Add Bank Account" to add a new bank account.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payhead Tab */}
              {activeTab === "payhead" && (
                <div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h4 style={{fontSize: '18px', fontWeight: '600', color: '#1e293b'}}>
                      Salary Structure
                      <span style={{fontSize: '14px', color: '#64748b', marginLeft: '10px'}}>
                        (Total Payheads: {payheads.length})
                      </span>
                    </h4>
                    {!isViewMode && editingEmployee && (
                      <button
                        style={{...styles.btn, ...styles.btnSuccess}}
                        onClick={() => openPayheadModal()}
                      >
                        <i className="fas fa-plus"></i> Add Payhead
                      </button>
                    )}
                  </div>
                  
                  {payheads.length > 0 ? (
                    <div>
                      {payheads.map((payhead, index) => {
                        const earnings = (parseFloat(payhead.basicSalary || 0) + 
                                         parseFloat(payhead.bonus || 0) + 
                                         parseFloat(payhead.electrictyBill || 0) + 
                                         parseFloat(payhead.esicEmployer || 0) + 
                                         parseFloat(payhead.mediclaim || 0) + 
                                         parseFloat(payhead.otherAllowance || 0) + 
                                         parseFloat(payhead.providentFundEmployers || 0) + 
                                         parseFloat(payhead.roomRent || 0) + 
                                         parseFloat(payhead.travellingAllowances || 0)).toFixed(2);
                        
                        const deductions = (parseFloat(payhead.advanceAgaintSalary || 0) + 
                                           parseFloat(payhead.esicEmployee || 0) + 
                                           parseFloat(payhead.mess || 0) + 
                                           parseFloat(payhead.professionalTax || 0) + 
                                           parseFloat(payhead.providentFundEmployee || 0) + 
                                           parseFloat(payhead.travellingDiduction || 0)).toFixed(2);
                        
                        const netSalary = (parseFloat(earnings) - parseFloat(deductions)).toFixed(2);

                        return (
                          <div key={payhead.id || `payhead-${index}`} style={styles.payheadCard}>
                            <div style={styles.bankAccountHeader}>
                              <div style={styles.bankAccountName}>
                                Salary Structure #{index + 1}
                                <span style={{marginLeft: '10px', fontSize: '14px', color: '#64748b'}}>
                                  (Effective from: {payhead.startDate || "N/A"})
                                </span>
                              </div>
                              <div style={styles.actionButtons}>
                                {!isViewMode && (
                                  <>
                                    <button
                                      style={{ ...styles.actionBtn, ...styles.editBtn }}
                                      title="Edit"
                                      onClick={() => openPayheadModal(payhead)}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                                      title="Delete"
                                      onClick={() => handleDeletePayhead(payhead.id)}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div style={styles.payheadEarnings}>
                              <div style={styles.salaryLabel}>Earnings</div>
                              <div style={styles.payheadDetails}>
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Basic Salary</span>
                                  <span style={styles.bankDetailValue}>₹{payhead.basicSalary || "0"}</span>
                                </div>
                                {payhead.bonus && parseFloat(payhead.bonus) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Bonus</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.bonus}</span>
                                  </div>
                                )}
                                {payhead.electrictyBill && parseFloat(payhead.electrictyBill) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Electricity Bill</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.electrictyBill}</span>
                                  </div>
                                )}
                                {payhead.esicEmployer && parseFloat(payhead.esicEmployer) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>ESIC (Employer)</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.esicEmployer}</span>
                                  </div>
                                )}
                                {payhead.mediclaim && parseFloat(payhead.mediclaim) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Mediclaim</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.mediclaim}</span>
                                  </div>
                                )}
                                {payhead.otherAllowance && parseFloat(payhead.otherAllowance) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Other Allowance</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.otherAllowance}</span>
                                  </div>
                                )}
                                {payhead.providentFundEmployers && parseFloat(payhead.providentFundEmployers) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>PF (Employer)</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.providentFundEmployers}</span>
                                  </div>
                                )}
                                {payhead.roomRent && parseFloat(payhead.roomRent) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Room Rent</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.roomRent}</span>
                                  </div>
                                )}
                                {payhead.travellingAllowances && parseFloat(payhead.travellingAllowances) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Travel Allowance</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.travellingAllowances}</span>
                                  </div>
                                )}
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Total Earnings</span>
                                  <span style={{...styles.bankDetailValue, color: '#10b981', fontWeight: '600'}}>
                                    ₹{earnings}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={styles.payheadDeductions}>
                              <div style={styles.salaryLabel}>Deductions</div>
                              <div style={styles.payheadDetails}>
                                {payhead.advanceAgaintSalary && parseFloat(payhead.advanceAgaintSalary) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Advance</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.advanceAgaintSalary}</span>
                                  </div>
                                )}
                                {payhead.esicEmployee && parseFloat(payhead.esicEmployee) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>ESIC (Employee)</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.esicEmployee}</span>
                                  </div>
                                )}
                                {payhead.mess && parseFloat(payhead.mess) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Mess</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.mess}</span>
                                  </div>
                                )}
                                {payhead.professionalTax && parseFloat(payhead.professionalTax) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Professional Tax</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.professionalTax}</span>
                                  </div>
                                )}
                                {payhead.providentFundEmployee && parseFloat(payhead.providentFundEmployee) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>PF (Employee)</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.providentFundEmployee}</span>
                                  </div>
                                )}
                                {payhead.travellingDiduction && parseFloat(payhead.travellingDiduction) > 0 && (
                                  <div style={styles.bankDetailItem}>
                                    <span style={styles.bankDetailLabel}>Travel Deduction</span>
                                    <span style={styles.bankDetailValue}>₹{payhead.travellingDiduction}</span>
                                  </div>
                                )}
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Total Deductions</span>
                                  <span style={{...styles.bankDetailValue, color: '#ef4444', fontWeight: '600'}}>
                                    ₹{deductions}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={styles.payheadTotal}>
                              <div style={styles.salaryLabel}>Net Salary</div>
                              <div style={styles.payheadDetails}>
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Total Earnings</span>
                                  <span style={styles.bankDetailValue}>₹{earnings}</span>
                                </div>
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Total Deductions</span>
                                  <span style={styles.bankDetailValue}>₹{deductions}</span>
                                </div>
                                <div style={styles.bankDetailItem}>
                                  <span style={styles.bankDetailLabel}>Net Salary</span>
                                  <span style={{...styles.bankDetailValue, color: '#1e40af', fontWeight: '700', fontSize: '16px'}}>
                                    ₹{netSalary}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>
                      <i className="fas fa-money-bill-wave" style={{fontSize: '48px', marginBottom: '15px'}}></i>
                      <p>No payhead structure found for this employee.</p>
                      {!isViewMode && editingEmployee && (
                        <p>Click "Add Payhead" to add a salary structure.</p>
                      )}
                    </div>
                  )}
                </div>
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
                  {editingEmployee ? 'Update Employee' : 'Save Employee'}
                </button>
              )}
              {(activeTab === "bank" || activeTab === "payhead") && (
                <button
                  style={{...styles.btn, ...styles.btnInfo}}
                  onClick={() => setActiveTab("basic")}
                >
                  <i className="fas fa-arrow-left"></i> Back to Basic Info
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
                      <label style={styles.formLabel}>IFSC Code *</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={bankFormData.ifscCode}
                        onChange={handleBankInputChange}
                        style={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                </div>
                
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

      {/* Payhead Modal */}
      {showPayheadModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, maxWidth: '900px'}}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingPayhead ? 'Edit Payhead' : 'Add Payhead'}
              </h3>
              <button style={styles.modalClose} onClick={closePayheadModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={(e) => { e.preventDefault(); handleAddPayhead(); }}>
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Effective From *</label>
                      <div style={styles.dateInputWrapper}>
                        <input
                          type="date"
                          name="startDate"
                          value={payheadFormData.startDate}
                          onChange={handlePayheadInputChange}
                          style={{...styles.formControl, paddingRight: '40px'}}
                          required
                        />
                        <i className="fas fa-calendar-alt" style={styles.dateInputIcon}></i>
                      </div>
                    </div>
                  </div>
                  <div style={styles.formCol}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Basic Salary *</label>
                      <input
                        type="text"
                        name="basicSalary"
                        value={payheadFormData.basicSalary}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.payheadEarnings}>
                  <div style={styles.salaryLabel}>Earnings (Optional)</div>
                  <div style={styles.salaryRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Bonus</label>
                      <input
                        type="text"
                        name="bonus"
                        value={payheadFormData.bonus}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Electricity Bill</label>
                      <input
                        type="text"
                        name="electrictyBill"
                        value={payheadFormData.electrictyBill}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>ESIC (Employer)</label>
                      <input
                        type="text"
                        name="esicEmployer"
                        value={payheadFormData.esicEmployer}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Mediclaim</label>
                      <input
                        type="text"
                        name="mediclaim"
                        value={payheadFormData.mediclaim}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Other Allowance</label>
                      <input
                        type="text"
                        name="otherAllowance"
                        value={payheadFormData.otherAllowance}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>PF (Employer)</label>
                      <input
                        type="text"
                        name="providentFundEmployers"
                        value={payheadFormData.providentFundEmployers}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Room Rent</label>
                      <input
                        type="text"
                        name="roomRent"
                        value={payheadFormData.roomRent}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Travel Allowance</label>
                      <input
                        type="text"
                        name="travellingAllowances"
                        value={payheadFormData.travellingAllowances}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.payheadDeductions}>
                  <div style={styles.salaryLabel}>Deductions (Optional)</div>
                  <div style={styles.salaryRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Advance</label>
                      <input
                        type="text"
                        name="advanceAgaintSalary"
                        value={payheadFormData.advanceAgaintSalary}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>ESIC (Employee)</label>
                      <input
                        type="text"
                        name="esicEmployee"
                        value={payheadFormData.esicEmployee}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Mess</label>
                      <input
                        type="text"
                        name="mess"
                        value={payheadFormData.mess}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Professional Tax</label>
                      <input
                        type="text"
                        name="professionalTax"
                        value={payheadFormData.professionalTax}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>PF (Employee)</label>
                      <input
                        type="text"
                        name="providentFundEmployee"
                        value={payheadFormData.providentFundEmployee}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Travel Deduction</label>
                      <input
                        type="text"
                        name="travellingDiduction"
                        value={payheadFormData.travellingDiduction}
                        onChange={handlePayheadNumberChange}
                        style={styles.formControl}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.payheadTotal}>
                  <div style={styles.salaryLabel}>Total Salary</div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Net Salary (Auto-calculated)</label>
                    <input
                      type="text"
                      name="totalSalary"
                      value={payheadFormData.totalSalary}
                      style={styles.formControl}
                      disabled
                      readOnly
                    />
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <button
                      type="button"
                      style={{...styles.btn, ...styles.btnSecondary}}
                      onClick={calculateTotalSalary}
                    >
                      <i className="fas fa-calculator"></i> Calculate Total
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{...styles.btn, ...styles.btnSecondary}}
                onClick={closePayheadModal}
              >
                Cancel
              </button>
              <button
                style={{...styles.btn, ...styles.btnPrimary}}
                onClick={() => {
                  calculateTotalSalary();
                  setTimeout(() => handleAddPayhead(), 100);
                }}
              >
                {editingPayhead ? 'Update Payhead' : 'Save Payhead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
   
export default EmployeeManagement;