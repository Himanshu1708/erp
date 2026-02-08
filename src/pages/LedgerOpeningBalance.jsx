import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import toast, { Toaster } from 'react-hot-toast';

// --- Internal Definitions (to resolve import errors) ---
const PageMeta = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
};

const PageBreadcrumb = ({ pageTitle }) => {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            Home
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <a href="#" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Applications</a>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{pageTitle}</span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

const ComponentCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

// Helper to convert file to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const LedgerOpeningBalance = () => {
  // -- State --
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [filterGroup, setFilterGroup] = useState("[ALL]");
  const [filterMachine, setFilterMachine] = useState("[Select]");
  const [filterLocation, setFilterLocation] = useState("[ALL]");

  // Form Data
  const [formData, setFormData] = useState({
    ledgerName: "",
    group: "",
    machine: "",
    location: "",
    balanceType: "Debit",
    amount: "",
    voucherImage: null,
  });

  // Dropdown Options (Dummy Data)
  const groupOptions = ["[ALL]", "Raw Material", "Finished Goods", "Spare Parts", "Expenses"];
  const machineOptions = ["[Select]", "CNC Machine 01", "Lathe Machine 02", "Packing Unit", "Boiler"];
  const locationOptions = ["[ALL]", "Warehouse A", "Factory Floor", "Main Store", "Quality Control"];

  const STORAGE_KEY = "ledger_opening_balance_data";

  // -- Effects --
  useEffect(() => {
    loadData();
  }, []);

  // -- Handlers --

  const loadData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setLedgers(Array.isArray(parsedData) ? parsedData : []);
      } else {
        // Load Dummy Data if empty
        const dummyData = [
          { id: 1, ledgerName: "Steel Rods Purchase", group: "Raw Material", machine: "CNC Machine 01", location: "Warehouse A", balanceType: "Debit", amount: "50000", voucherImage: null },
          { id: 2, ledgerName: "Finished Widgets", group: "Finished Goods", machine: "Packing Unit", location: "Main Store", balanceType: "Credit", amount: "12000", voucherImage: null },
          { id: 3, ledgerName: "Motor Repair", group: "Spare Parts", machine: "Lathe Machine 02", location: "Factory Floor", balanceType: "Debit", amount: "3500", voucherImage: null },
        ];
        setLedgers(dummyData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (ledger = null) => {
    if (ledger) {
      setEditingId(ledger.id);
      setFormData({
        ledgerName: ledger.ledgerName || "",
        group: ledger.group || "",
        machine: ledger.machine || "",
        location: ledger.location || "",
        balanceType: ledger.balanceType || "Debit",
        amount: ledger.amount || "",
        voucherImage: ledger.voucherImage || null,
      });
    } else {
      setEditingId(null);
      // When adding new, pre-fill Group, Machine, Location from the current filters
      const initialGroup = filterGroup !== "[ALL]" ? filterGroup : "";
      const initialMachine = filterMachine !== "[Select]" ? filterMachine : "";
      const initialLocation = filterLocation !== "[ALL]" ? filterLocation : "";

      setFormData({
        ledgerName: "",
        group: initialGroup,
        machine: initialMachine,
        location: initialLocation,
        balanceType: "Debit",
        amount: "",
        voucherImage: null,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, voucherImage: file }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form data
      if (!formData.ledgerName || !formData.group || !formData.machine || !formData.location || !formData.amount) {
        toast.error("Please fill all required fields");
        setSaving(false);
        return;
      }

      let imagePayload = formData.voucherImage;
      
      if (imagePayload instanceof File) {
        try {
          imagePayload = await fileToBase64(imagePayload);
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("Failed to process the image file.");
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        voucherImage: imagePayload,
        id: editingId ? editingId : Date.now(),
      };

      let updatedLedgers;
      if (editingId) {
        updatedLedgers = ledgers.map((item) => (item.id === editingId ? payload : item));
        toast.success("Ledger entry updated successfully");
      } else {
        updatedLedgers = [...ledgers, payload];
        toast.success("Ledger entry added successfully");
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLedgers));
        setLedgers(updatedLedgers);
        closeModal();
      } catch (saveError) {
        toast.error("Storage quota exceeded. The image might be too large to save locally.");
        console.error("LocalStorage save failed:", saveError);
      }
    } catch (error) {
      console.error("Error in save process:", error);
      toast.error("Failed to save ledger entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const updated = ledgers.filter((item) => item.id !== id);
        setLedgers(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        toast.success("Ledger entry deleted successfully");
      } catch (error) {
        console.error("Error deleting entry:", error);
        toast.error("Failed to delete ledger entry");
      }
    }
  };

  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
        "ID": item.id,
        "Ledger Name": item.ledgerName,
        "Group": item.group,
        "Machine": item.machine,
        "Location": item.location,
        "Balance Type": item.balanceType,
        "Amount": item.amount,
        "Has Voucher": item.voucherImage ? "Yes" : "No"
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Data");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "Ledger_Opening_Balance.xlsx");
      toast.success("Excel file exported successfully");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export Excel file");
    }
  };

  // -- Filtering Logic --
  const filteredData = ledgers.filter((item) => {
    const matchGroup = filterGroup === "[ALL]" || item.group === filterGroup;
    const matchMachine = filterMachine === "[Select]" || item.machine === filterMachine;
    const matchLocation = filterLocation === "[ALL]" || item.location === filterLocation;
    return matchGroup && matchMachine && matchLocation;
  });

  // View image in a new tab
  const viewImage = (imageData, ledgerName) => {
    if (!imageData) return;
    
    const imageWindow = window.open();
    imageWindow.document.write(`
      <html>
        <head>
          <title>${ledgerName} - Voucher</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f5f5f5; }
            img { max-width: 100%; max-height: 90vh; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          </style>
        </head>
        <body>
          <img src="${imageData}" alt="${ledgerName} Voucher" />
        </body>
      </html>
    `);
  };

  return (
    <>
      <PageMeta
        title="Ledger Opening Balance Dashboard | TailAdmin"
        description="Manage Ledger Opening Balances"
      />
      <PageBreadcrumb pageTitle="Ledger Opening Balance" />
      <Toaster position="top-right" />

      <div className="space-y-6">
        <ComponentCard title="Manage Opening Balance">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-sm text-gray-500">
              Manage your ledger entries, attach vouchers, and filter by machine or location.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save / Add New
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export to Excel
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Select Group */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Group</label>
              <div className="relative">
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white shadow-sm"
                >
                  {groupOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Machine */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Machine</label>
              <div className="relative">
                <select
                  value={filterMachine}
                  onChange={(e) => setFilterMachine(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white shadow-sm"
                >
                  {machineOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Location</label>
              <div className="relative">
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white shadow-sm"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ledger Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Machine
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((ledger, index) => (
                    <tr key={ledger.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ledger.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ledger.ledgerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ledger.group}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ledger.machine}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ledger.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ledger.balanceType === 'Debit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {ledger.balanceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {parseFloat(ledger.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ledger.voucherImage ? (
                          <button 
                            onClick={() => viewImage(ledger.voucherImage, ledger.ledgerName)}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                          >
                            View Image
                          </button>
                        ) : (
                          <span className="text-gray-400">No File</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openModal(ledger)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(ledger.id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-sm text-gray-500">
                      No data found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </ComponentCard>
      </div>

      {/* Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  {editingId ? "Edit Ledger Entry" : "Add New Ledger Entry"}
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ledger Name</label>
                    <input 
                      type="text" 
                      name="ledgerName" 
                      required 
                      value={formData.ledgerName} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Group</label>
                      <select 
                        name="group" 
                        required 
                        value={formData.group} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select...</option>
                        {groupOptions.filter(g => g !== "[ALL]").map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Machine</label>
                      <select 
                        name="machine" 
                        required 
                        value={formData.machine} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select...</option>
                        {machineOptions.filter(m => m !== "[Select]").map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Location</label>
                      <select 
                        name="location" 
                        required 
                        value={formData.location} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select...</option>
                        {locationOptions.filter(l => l !== "[ALL]").map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Balance Type</label>
                      <select 
                        name="balanceType" 
                        value={formData.balanceType} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="Debit">Debit</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input 
                      type="number" 
                      name="amount" 
                      required 
                      step="0.01"
                      value={formData.amount} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Voucher Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.voucherImage && typeof formData.voucherImage === 'string' && (
                      <p className="text-xs text-green-600 mt-1">Current image attached.</p>
                    )}
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Entry"
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LedgerOpeningBalance;