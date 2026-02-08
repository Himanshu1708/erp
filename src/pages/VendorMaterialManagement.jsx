import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const VendorMaterialManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [vendorMaterials, setVendorMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [taxes, setTaxes] = useState([]);
  
  //me add kel
  const calculateTotalRoyaltyGst = (rate, gst) => {
    const royalty = parseFloat(rate) || 0;
    const gstPercent = parseFloat(gst) || 0;
    const total = royalty + (royalty * gstPercent / 100);
    return Math.round(total * 100) / 100; // round to 2 decimals
  };

  // New state to store full item details for auto-fetch
  const [itemsDetails, setItemsDetails] = useState([]);

  const [formData, setFormData] = useState({
    project: "",
    vendor: "",
    material_name: "",
    unit: "",
    status: "Active",
    category: "",
    sub_category: "",
    pre_rate: "",
    rate: "",
    gst: "",
    royality_rate: "",
    totalRoyaltyGst: "",  // <-- add this
    update_date: new Date().toISOString().split("T")[0],
    specification: ""
  });

  const styles = {
    container:{display:"flex",minHeight:"100vh",fontFamily:"'Inter', sans-serif",background:"#f8fafc"},
    mainContent:{flex:1,padding:30},
    header:{display:"flex",justifyContent:"space-between",marginBottom:30},
    headerTitle:{fontSize:28,fontWeight:700,color:"#1e293b"},
    btn:{padding:"10px 20px",borderRadius:6,border:"none",cursor:"pointer",display:"inline-flex",gap:8},
    btnPrimary:{background:"#1e40af",color:"#fff"},
    btnSecondary:{background:"#fff",border:"1px solid #e2e8f0",color:"#1e293b"},
    tableContainer:{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 4px 6px -1px rgba(0, 0, 0, 0.1)"},
    table:{width:"100%",borderCollapse:"collapse"},
    th:{background:"#dbeafe",padding:15,textAlign:"left",fontWeight:600,color:"#1e3a8a"},
    td:{padding:15,borderBottom:"1px solid #e2e8f0"},
    actionBtn:{width:32,height:32,borderRadius:6,border:"none",cursor:"pointer",marginRight:5},
    editBtn:{color:"#16a34a"},
    viewBtn:{color:"#eab308"},
    deleteBtn:{color:"#dc2626"},
    modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999},
    modalContent:{background:"#fff",borderRadius:10,width:"90%",maxWidth:800,maxHeight:"90vh",overflowY:"auto"},
    modalHeader:{padding:20,borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between"},
    modalTitle:{fontSize:20,fontWeight:600},
    modalClose:{background:"none",border:"none",fontSize:24,color:"#64748b",cursor:"pointer"},
    modalBody:{padding:20},
    modalFooter:{padding:20,borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10},
    formGroup:{marginBottom:20},
    formLabel:{display:"block",marginBottom:8,fontWeight:500,color:"#1e293b"},
    formControl:{width:"100%",padding:10,border:"1px solid #e2e8f0",borderRadius:6,fontFamily:"inherit"},
    formRow:{display:"flex",gap:20},
    formHalf:{flex:1},
    loadingSpinner:{display:"flex",justifyContent:"center",alignItems:"center",height:200},
    statusBadge:{padding:"4px 10px",borderRadius:20,fontSize:14,fontWeight:500,display:"inline-block"},
    statusActive:{backgroundColor:"rgba(16, 185, 129, 0.1)",color:"#10b981"},
    statusInactive:{backgroundColor:"rgba(239, 68, 68, 0.1)",color:"#ef4444"}
  };

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(config=>{
    const token = localStorage.getItem("token");
    if(token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(()=>{
    fetchDropdownData();
    fetchVendorMaterials();
  },[]);

const fetchDropdownData = async () => {
  try {
    /* ===================== PROJECTS (unchanged) ===================== */
    const projectRes = await api.get("/project/getProjects");
    const projectData = Array.isArray(projectRes.data)
      ? projectRes.data
      : projectRes.data?.data || projectRes.data?.content || [];

    setProjects(
      projectData
        .map(p => p.project_name || p.name)
        .filter(Boolean)
    );

    /* ===================== VENDORS (FIXED) ===================== */
    const vendorRes = await api.get("/vendor/all");

    console.log("Vendor API response:", vendorRes.data);

    const vendorList = vendorRes.data?.data || [];   // 🔥 FIX

    setVendors(
      vendorList
        .map(v => v.vendorName)   // ✅ ONLY vendor name
        .filter(Boolean)
    );

    /* ===================== MATERIAL / ITEMS (UPDATED) ===================== */
    const itemRes = await api.get("/items/getItems");

    const itemData = Array.isArray(itemRes.data)
      ? itemRes.data
      : itemRes.data?.data || itemRes.data?.content || [];

    // Store both item names and full details
    setItems(
      itemData
        .map(i => i.item_name)
        .filter(Boolean)
    );
    
    // Store full item details for auto-fetch functionality
    setItemsDetails(itemData);

    /* ===================== TAX (unchanged) ===================== */
    const taxRes = await api.get("/tax/getTax");
    const taxData = Array.isArray(taxRes.data)
      ? taxRes.data
      : taxRes.data?.data || [];

    setTaxes(
      taxData
        .map(t => t.tax)
        .filter(t => t !== null && t !== undefined)
    );

  } catch (error) {
    console.error("Dropdown API error:", error);
    toast.error("Failed to load dropdown data");
  }
};

  const fetchVendorMaterials = async()=>{
    try{
      setLoading(true);
      const res = await api.get("/vmaterial/getVMaterials");
      setVendorMaterials(res.data||[]);
    }finally{ setLoading(false); }
  };

  // New function to handle material name change and auto-fetch details
  const handleMaterialNameChange = (e) => {
    const materialName = e.target.value;
    setFormData({...formData, material_name: materialName});
    
    // Auto-fetch unit, category, and subcategory when material is selected
    if (materialName && !isViewMode) {
      const selectedItem = itemsDetails.find(item => item.item_name === materialName);
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          unit: selectedItem.unit || "",
          category: selectedItem.category || "",
          sub_category: selectedItem.subcategory || ""
        }));
      }
    }
  };

  const openAddModal = ()=>{
    setEditingMaterial(null);
    setIsViewMode(false);
    setFormData({
      project: "",
      vendor: "",
      material_name: "",
      unit: "",
      status: "Active",
      category: "",
      sub_category: "",
      pre_rate: "",
      rate: "",
      gst: "",
      royality_rate: "",
      update_date: new Date().toISOString().split("T")[0],
      specification: ""
    });
    setShowModal(true);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setIsViewMode(false);
    setFormData({
      project: material.project || "",
      vendor: material.vendor || "",
      material_name: material.material_name || "",
      unit: material.unit || "",
      status: material.status || "Active",
      category: material.category || "",
      sub_category: material.sub_category || "",
      pre_rate: material.pre_rate || "",
      rate: material.rate || "",
      gst: material.gst || "",
      royality_rate: material.royality_rate || "",
      update_date: material.update_date || new Date().toISOString().split("T")[0],
      specification: material.specification || ""
    });
    setShowModal(true);
  };

  const openViewModal = (material) => {
    setEditingMaterial(material);
    setIsViewMode(true);
    setFormData({
      project: material.project || "",
      vendor: material.vendor || "",
      material_name: material.material_name || "",
      unit: material.unit || "",
      status: material.status || "Active",
      category: material.category || "",
      sub_category: material.sub_category || "",
      pre_rate: material.pre_rate || "",
      rate: material.rate || "",
      gst: material.gst || "",
      royality_rate: material.royality_rate || "",
      update_date: material.update_date || new Date().toISOString().split("T")[0],
      specification: material.specification || ""
    });
    setShowModal(true);
  };

  const closeModal = ()=>{
    setShowModal(false);
    setEditingMaterial(null);
    setIsViewMode(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;

    // Use the special handler for material name
    if (name === "material_name") {
      handleMaterialNameChange(e);
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };

        // Auto-calculate totalRoyaltyGst when GST or royality_rate changes
        if (name === "gst" || name === "royality_rate") {
          updated.totalRoyaltyGst = calculateTotalRoyaltyGst(
            updated.royality_rate,
            updated.gst
          );
        }

        return updated;
      });
    }
  };

  const handleSubmit = async e=>{
    e.preventDefault();
    try{
      // Convert string values to numbers where needed
      const payload = {
        ...formData,
        pre_rate: formData.pre_rate ? parseFloat(formData.pre_rate) : null,
        rate: formData.rate ? parseFloat(formData.rate) : null,
        gst: formData.gst ? parseFloat(formData.gst) : null,
        royality_rate: formData.royality_rate ? parseFloat(formData.royality_rate) : null,
        totalRoyaltyGst: formData.totalRoyaltyGst ? parseFloat(formData.totalRoyaltyGst) : null
      };

      if(editingMaterial){
        await api.put(`/vmaterial/update_VMaterial/${editingMaterial.id}`,payload);
        toast.success("Updated successfully");
      }else{
        await api.post("/vmaterial/addVMaterial",payload);
        toast.success("Added successfully");
      }
      fetchVendorMaterials();
      closeModal();
    }catch(error){
      console.error("Save error:", error);
      toast.error(error.response?.data || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vmaterial/deleteVMaterial/${id}`);
      toast.success("Deleted successfully");
      fetchVendorMaterials();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleExportExcel = () => {
    if (!vendorMaterials || vendorMaterials.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = vendorMaterials.map((material, index) => ({
      "Sr No": index + 1,
      "Project": material.project || "",
      "Vendor": material.vendor || "",
      "Material Name": material.material_name || "",
      "Unit": material.unit || "",
      "Status": material.status || "",
      "Category": material.category || "",
      "Sub Category": material.sub_category || "",
      "Previous Rate": material.pre_rate || "",
      "Rate": material.rate || "",
      "Royalty GST (%)": material.gst || "",
      "Royalty Rate": material.royality_rate || "",
      "Date": material.update_date || "",
      "Specification": material.specification || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VendorMaterials");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Vendor_Material_${Date.now()}.xlsx`);
    toast.success("Excel file exported successfully");
  };

  const filteredVendorMaterials = vendorMaterials.filter((material) => {
    const search = searchTerm.toLowerCase();
    
    return (
      (material.project && material.project.toLowerCase().includes(search)) ||
      (material.vendor && material.vendor.toLowerCase().includes(search)) || 
      (material.material_name && material.material_name.toLowerCase().includes(search)) ||
      (material.category && material.category.toLowerCase().includes(search))
    );
  });

  return (
    <div style={styles.container}>
     <Toaster
  position="top-right"
  reverseOrder={false}
/>

      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Vendor Material Management</h1>
          <div style={{display: "flex", gap: 15}}>
            <button style={{...styles.btn,...styles.btnSecondary}} onClick={handleExportExcel}>
              <i className="fas fa-download"/> Export
            </button>
            <button style={{...styles.btn,...styles.btnPrimary}} onClick={openAddModal}>
              <i className="fas fa-plus"/> Add Vendor Material
            </button>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={{padding: 20, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div style={{fontSize: 20, fontWeight: 600}}>All Vendor Materials</div>
            <div style={{position: "relative"}}>
              <i className="fas fa-search" style={{position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#64748b"}}></i>
              <input 
                type="text" 
                placeholder="Search materials..." 
                style={{padding: "8px 15px 8px 40px", border: "1px solid #e2e8f0", borderRadius: 6, width: 250, fontFamily: "inherit"}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Vendor</th>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Rate</th>
                  <th style={styles.th}>Royalty GST (%)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendorMaterials.length > 0 ? filteredVendorMaterials.map(m=>(
                  <tr key={m.id} style={{backgroundColor: hoveredRow === m.id ? "#f1f5f9" : ""}} 
                      onMouseEnter={() => setHoveredRow(m.id)} 
                      onMouseLeave={() => setHoveredRow(null)}>
                    <td style={styles.td}>{m.project}</td>
                    <td style={styles.td}>{m.vendor}</td>
                    <td style={styles.td}>{m.material_name}</td>
                    <td style={styles.td}>{m.category}</td>
                    <td style={styles.td}>{m.unit}</td>
                    <td style={styles.td}>{m.rate}</td>
                    <td style={styles.td}>{m.gst}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(m.status === 'Active' ? styles.statusActive : styles.statusInactive)
                      }}>
                        {m.status || 'Active'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={{...styles.actionBtn, ...styles.editBtn}} onClick={()=>openEditModal(m)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button style={{...styles.actionBtn, ...styles.viewBtn}} onClick={()=>openViewModal(m)} title="View">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={()=>handleDelete(m.id)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} style={{...styles.td, textAlign: "center", padding: 30}}>
                      No vendor materials found matching your search.
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
                {isViewMode ? 'View Vendor Material' : (editingMaterial ? 'Edit Vendor Material' : 'Add New Vendor Material')}
              </h3>
              <button style={styles.modalClose} onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                <div style={styles.formRow}>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Project *</label>
                      <select name="project" value={formData.project} onChange={handleChange} style={styles.formControl} required disabled={isViewMode}>
                        <option value="">Select Project</option>
                        {projects.map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Vendor *</label>
                      <select
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        style={styles.formControl}
                        required
                        disabled={isViewMode}
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Material Name *</label>
                  <select name="material_name" value={formData.material_name} onChange={handleChange} style={styles.formControl} required disabled={isViewMode}>
                    <option value="">Select Material</option>
                    {items.map(i=><option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Unit</label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                        placeholder="Enter Unit"
                      />
                    </div>
                  </div>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={styles.formControl}
                        disabled={isViewMode}
                        placeholder="Enter Category"
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Sub Category</label>
                  <input
                    type="text"
                    name="sub_category"
                    value={formData.sub_category}
                    onChange={handleChange}
                    style={styles.formControl}
                    disabled={isViewMode}
                    placeholder="Enter Sub Category"
                  />
                </div>

                {/* Only show Previous Rate field in edit mode, not in add mode */}
                {editingMaterial && (
                  <div style={styles.formRow}>
                    <div style={styles.formHalf}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Previous Rate</label>
                        <input type="number" name="pre_rate" value={formData.pre_rate} onChange={handleChange} style={styles.formControl} step="0.01" disabled={isViewMode} />
                      </div>
                    </div>
                    <div style={styles.formHalf}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}> Rate</label>
                        <input type="number" name="rate" value={formData.rate} onChange={handleChange} style={styles.formControl} step="0.01" disabled={isViewMode} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Show only Current Rate in add mode */}
                {!editingMaterial && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}> Rate</label>
                    <input type="number" name="rate" value={formData.rate} onChange={handleChange} style={styles.formControl} step="0.01" disabled={isViewMode} />
                  </div>
                )}

                <div style={styles.formRow}>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Date</label>
                      <input type="date" name="update_date" value={formData.update_date} onChange={handleChange} style={styles.formControl} disabled={isViewMode} />
                    </div>
                  </div>
                  <div style={styles.formHalf}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Royalty GST (%)</label>
                      <select name="gst" value={formData.gst} onChange={handleChange} style={styles.formControl} disabled={isViewMode}>
                        <option value="">Select Royalty GST</option>
                        {taxes.map(t=><option key={t} value={t}>{t}%</option>)}
                      </select>
                    </div>  
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Royalty Rate</label>
                  <input type="number" name="royality_rate" value={formData.royality_rate} onChange={handleChange} style={styles.formControl} step="0.01" disabled={isViewMode} />
                </div>

                  <div style={styles.formGroup}>
    <label style={styles.formLabel}>Total Royalty (Including GST)</label>
    <input
      type="number"
      name="totalRoyaltyGst"
      value={formData.totalRoyaltyGst}
      style={styles.formControl}
      disabled
    />
  </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Specification</label>
                  <textarea name="specification" value={formData.specification} onChange={handleChange} style={styles.formControl} rows="3" disabled={isViewMode}></textarea>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={{...styles.btn,...styles.btnSecondary}} onClick={closeModal}>Cancel</button>
                {!isViewMode && (
                  <button type="submit" style={{...styles.btn,...styles.btnPrimary}}>
                    {editingMaterial ? 'Update' : 'Save'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMaterialManagement;