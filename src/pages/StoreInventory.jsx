import React, { useState, useEffect } from 'react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const StoreInventory = () => {
  // State variables
  const [stores, setStores] = useState([]);
  const [currentMaterials, setCurrentMaterials] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('stores'); // 'stores', 'materials', or 'transactions'
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    used: 0,
    damage: 0,
    transfer: 0,
    toStore: ""
  });
  // New state variables for search filters
  const [searchMaterial, setSearchMaterial] = useState('');
  const [searchFromStore, setSearchFromStore] = useState('');
  const [searchToStore, setSearchToStore] = useState('');

  // API configuration
  // const API_BASE = 'http://localhost:8080';
  // const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTdXBlckFkbWluQGdtYWlsLmNvbSIsImlhdCI6MTc2Nzg1NDMzMSwiZXhwIjoxNzgzNDA2MzMxfQ.Ysf-6K_E4-eAIwa_y4ySonpOQ76AJIDcfMQ6TS5L42E";

  const API_BASE = import.meta.env.VITE_BACKEND_URL;
const TOKEN = localStorage.getItem("token");


  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/json'
    }
  });

  // Style definitions (matching the RolePermission component)
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      lineHeight: '1.6',
      padding: '30px'
    },
    mainContent: {
      flex: '1',
      padding: '0',
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
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    storeCard: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '20px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    storeCardHover: {
      transform: 'translateY(-5px)'
    },
    storeName: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#111827'
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
      gap: '8px',
      margin: '4px'
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
    btnManage: {
      backgroundColor: '#1e40af',
      color: 'white'
    },
    btnEdit: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    btnDelete: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    btnSave: {
      backgroundColor: '#16a34a',
      color: 'white',
      padding: '10px 24px'
    },
    btnClose: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    backBtn: {
      marginBottom: '16px',
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    tableContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      marginBottom: '24px'
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
    trHover: {
      backgroundColor: '#f1f5f9'
    },
    modal: {
      display: 'flex',
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.55)',
      zIndex: '1000',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '92%',
      maxWidth: '640px',
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: '0 20px 30px rgba(0,0,0,0.25)'
    },
    modalHeader: {
      padding: '20px 24px',
      fontSize: '1.45rem',
      fontWeight: '600',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    },
    modalBody: {
      padding: '24px'
    },
    modalFooter: {
      padding: '20px 24px',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'right'
    },
    sectionTitle: {
      fontSize: '1.18rem',
      fontWeight: '600',
      color: '#1e40af',
      margin: '28px 0 16px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e5e7eb'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '20px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    formItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    formLabel: {
      fontWeight: '500',
      color: '#374151'
    },
    formControl: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '1rem'
    },
    formControlReadonly: {
      background: '#f3f4f6',
      color: '#4b5563'
    },
    hint: {
      fontSize: '0.84rem',
      color: '#6b7280',
      marginTop: '4px'
    },
    statusMessage: {
      margin: '16px 0',
      padding: '12px',
      borderRadius: '6px',
      fontWeight: '500'
    },
    statusLoading: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    statusError: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    }
  };

  // Load stores on component mount
  useEffect(() => {
    loadStores();
  }, []);

  // Fetch stores
  const loadStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/store/getStore');
      setStores(res.data);
    } catch (err) {
      toast.error(`Failed to load stores: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load materials for a specific store
  const loadMaterialsForStore = async (storeName) => {
    setCurrentStore(storeName);
    setView('materials');
    
    try {
      setLoading(true);
      const res = await api.get('/api/storeInven/getall');
      const allItems = res.data;
      // Filter materials for this store
      const filteredItems = allItems.filter(item => item.store === storeName);
      setCurrentMaterials(filteredItems);
    } catch (err) {
      toast.error(`Failed to load materials: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load all transactions (not filtered by store)
  const loadAllTransactions = async () => {
    setView('transactions');
    
    try {
      setLoading(true);
      const res = await api.get('/api/storeInven/getAllTrasactions');
      setTransactions(res.data);
    } catch (err) {
      toast.error(`Failed to load transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Go back to stores view
  const showStoresView = () => {
    setView('stores');
    setCurrentStore(null);
    setCurrentMaterials([]);
    setTransactions([]);
    // Reset search filters when going back
    setSearchMaterial('');
    setSearchFromStore('');
    setSearchToStore('');
  };

  // Open edit modal
  const openEdit = (id) => {
    const item = currentMaterials.find(i => i.id === id);
    if (!item) {
      toast.error("Item not found");
      return;
    }

    setCurrentItem(item);
    setFormData({
      used: 0,
      damage: 0,
      transfer: 0,
      toStore: ""
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save changes - REMOVED ALL VALIDATIONS
  const saveChanges = async () => {
    if (!currentItem) return;
    
    const { used, damage, transfer, toStore } = formData;
    
    if (transfer > 0 && !toStore) {
      toast.error("Please select a destination store for transfer");
      return;
    }
    
    try {
      const dto = {
        used: Number(used) || 0,
        damage: Number(damage) || 0,
        transfer: Number(transfer) || 0,
        fromStore: currentItem.store,
        toStore: transfer > 0 ? toStore : null
      };
      
      const response = await api.put(
        `/api/storeInven/updateInven/${currentItem.materialId}/${currentItem.id}`,
        dto
      );
      
      if (response.status === 200) {
        toast.success("Inventory updated successfully");
        closeModal();
        loadMaterialsForStore(currentStore); // Refresh current store materials
      } else {
        throw new Error(response.data || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Save failed: ${err.message}`);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!confirm("This Material Only Delete From Store Not From MMR...Are You Sure?")) return;
    
    try {
      const response = await api.delete(`/api/storeInven/deletebyid/${id}`);
      
      if (response.status === 200) {
        toast.success("Material deleted successfully");
        loadMaterialsForStore(currentStore); // Refresh current store materials
      } else {
        throw new Error(response.data || `HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Filter transactions based on search criteria
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const materialMatch = !searchMaterial || 
        (transaction.materialName && transaction.materialName.toLowerCase().includes(searchMaterial.toLowerCase()));
      
      const fromStoreMatch = !searchFromStore || 
        (transaction.fromStore && transaction.fromStore.toLowerCase().includes(searchFromStore.toLowerCase()));
      
      const toStoreMatch = !searchToStore || 
        (transaction.toStore && transaction.toStore.toLowerCase().includes(searchToStore.toLowerCase()));
      
      return materialMatch && fromStoreMatch && toStoreMatch;
    });
  };

  return (
    <div style={styles.container}>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      
      <main style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Store Management</h1>
          <div style={styles.headerActions}>
            <button 
              style={{...styles.btn, ...styles.btnSecondary}} 
              onClick={loadAllTransactions}
            >
              <i className="fas fa-history"></i> Transaction History
            </button>
          </div>
        </div>

        {/* Status Message */}
        {loading && (
          <div style={{...styles.statusMessage, ...styles.statusLoading}}>
            {view === 'stores' ? 'Loading stores...' : 
             view === 'materials' ? `Loading materials for ${currentStore}...` :
             'Loading transactions...'}
          </div>
        )}

        {/* Stores View */}
        {view === 'stores' && (
          <div id="storesView">
            <div style={styles.cardContainer}>
              {stores.length === 0 ? (
                <p style={{textAlign: 'center', gridColumn: '1/-1'}}>No stores found</p>
              ) : (
                stores.map(store => (
                  <div 
                    key={store.id} 
                    style={styles.storeCard}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.storeName}>{store.store || 'Unnamed Store'}</div>
                    <button 
                      style={{...styles.btn, ...styles.btnManage}} 
                      onClick={() => loadMaterialsForStore(store.store)}
                    >
                      <i className="fas fa-boxes"></i> Manage Store
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Materials View */}
        {view === 'materials' && (
          <div id="materialsView">
            <button style={styles.backBtn} onClick={showStoresView}>
              <i className="fas fa-arrow-left"></i> Back to Stores
            </button>
            
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>Materials in {currentStore}</div>
              </div>
              
              {loading ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Material Name</th>
                      <th style={styles.th}>Total Qty</th>
                      <th style={styles.th}>Unused</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMaterials.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                          No materials in this store
                        </td>
                      </tr>
                    ) : (
                      currentMaterials.map(item => (
                        <tr 
                          key={item.id}
                          style={styles.tr}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <td style={styles.td}>{item.materialName || '—'}</td>
                          <td style={styles.td}>{Number(item.recQty || 0).toFixed(2)}</td>
                          <td style={styles.td}>{Number(item.unused || 0).toFixed(2)}</td>
                          <td style={styles.td}>
                            <button 
                              style={{...styles.btn, ...styles.btnEdit}} 
                              onClick={() => openEdit(item.id)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button 
                              style={{...styles.btn, ...styles.btnDelete}} 
                              onClick={() => deleteItem(item.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Transactions View */}
        {view === 'transactions' && (
          <div id="transactionsView">
            <button style={styles.backBtn} onClick={showStoresView}>
              <i className="fas fa-arrow-left"></i> Back to Stores
            </button>
            
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>All Transaction History</div>
              </div>
              
              {/* Search Filters */}
              <div style={{padding: '20px', borderBottom: '1px solid #e2e8f0'}}>
                <div style={styles.grid3}>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Search by Material Name</label>
                    <input 
                      type="text" 
                      value={searchMaterial}
                      onChange={(e) => setSearchMaterial(e.target.value)}
                      placeholder="Enter material name..."
                      style={styles.formControl}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Search by From Store</label>
                    <input 
                      type="text" 
                      value={searchFromStore}
                      onChange={(e) => setSearchFromStore(e.target.value)}
                      placeholder="Enter from store..."
                      style={styles.formControl}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Search by To Store</label>
                    <input 
                      type="text" 
                      value={searchToStore}
                      onChange={(e) => setSearchToStore(e.target.value)}
                      placeholder="Enter to store..."
                      style={styles.formControl}
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
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Material Name</th>
                      <th style={styles.th}>From Store</th>
                      <th style={styles.th}>To Store</th>
                      <th style={styles.th}>Transfer Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions().length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>
                          {transactions.length === 0 ? 'No transactions found' : 'No transactions match your search criteria'}
                        </td>
                      </tr>
                    ) : (
                      getFilteredTransactions().map(transaction => (
                        <tr 
                          key={transaction.id}
                          style={styles.tr}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <td style={styles.td}>{formatDate(transaction.date)}</td>
                          <td style={styles.td}>{transaction.materialName || '—'}</td>
                          <td style={styles.td}>{transaction.fromStore || '—'}</td>
                          <td style={styles.td}>{transaction.toStore || '—'}</td>
                          <td style={styles.td}>{Number(transaction.transfer || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && currentItem && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                Edit Inventory Item
              </div>
              <div style={styles.modalBody}>
                <div style={styles.sectionTitle}>Current Values (Read-only)</div>
                <div style={styles.grid2}>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Material Name</label>
                    <input 
                      type="text" 
                      value={currentItem.materialName || '—'} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Store</label>
                    <input 
                      type="text" 
                      value={currentItem.store || '—'} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Total Qty (recQty)</label>
                    <input 
                      type="number" 
                      value={Number(currentItem.recQty || 0).toFixed(2)} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Already Used</label>
                    <input 
                      type="number" 
                      value={Number(currentItem.used || 0).toFixed(2)} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Already Damaged</label>
                    <input 
                      type="number" 
                      value={Number(currentItem.damage || 0).toFixed(2)} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Already Transferred</label>
                    <input 
                      type="number" 
                      value={Number(currentItem.transfer || 0).toFixed(2)} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}><strong>Unused (Available)</strong></label>
                    <input 
                      type="number" 
                      value={Number(currentItem.unused || 0).toFixed(2)} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly, fontWeight: 'bold', color: '#166534'}}
                    />
                  </div>
                </div>

                <div style={styles.sectionTitle}>New Consumption / Movement</div>
                <div style={styles.grid2}>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Used Qty <small>(new)</small></label>
                    <input 
                      type="number" 
                      id="used"
                      name="used"
                      min="0" 
                      step="0.01" 
                      value={formData.used}
                      onChange={handleInputChange}
                      style={styles.formControl}
                    />
                    <div style={styles.hint}>max: {Number(currentItem.unused || 0).toFixed(2)}</div>
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Damage Qty <small>(new)</small></label>
                    <input 
                      type="number" 
                      id="damage"
                      name="damage"
                      min="0" 
                      step="0.01" 
                      value={formData.damage}
                      onChange={handleInputChange}
                      style={styles.formControl}
                    />
                    <div style={styles.hint}>max: {Number(currentItem.recQty || 0).toFixed(2)}</div>
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>Transfer Qty <small>(new)</small></label>
                    <input 
                      type="number" 
                      id="transfer"
                      name="transfer"
                      min="0" 
                      step="0.01" 
                      value={formData.transfer}
                      onChange={handleInputChange}
                      style={styles.formControl}
                    />
                    <div style={styles.hint}>max: {Number(currentItem.unused || 0).toFixed(2)}</div>
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.formLabel}>From Store</label>
                    <input 
                      type="text" 
                      value={currentItem.store || '—'} 
                      readOnly 
                      style={{...styles.formControl, ...styles.formControlReadonly}}
                    />
                  </div>
                  <div style={styles.formItem}>
                     <label style={styles.formLabel}>
  To Store{" "}
   <small style={{ fontWeight: "normal", color: "#777" }}>
     (required if transfer &gt; 0)
   </small>
 </label>

                    <select 
                      id="toStore"
                      name="toStore"
                      value={formData.toStore}
                      onChange={handleInputChange}
                      style={styles.formControl}
                    >
                      <option value="">— select store —</option>
                      {stores.map(store => {
                        const storeName = store.store || store.name || '';
                        return storeName && storeName !== currentItem.store ? (
                          <option key={store.id} value={storeName}>
                            {storeName}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={{...styles.btn, ...styles.btnClose}} 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  style={{...styles.btn, ...styles.btnSave}}
                  onClick={saveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoreInventory;