import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import UserTables from "./pages/Users/UserTables";
import useAppContext from "./context/AppContext";
import SignIn from "./pages/AuthPages/SignIn";
import { Toaster } from "react-hot-toast";
import SignUp from "./pages/AuthPages/SignUp";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/ProjectManagement";
import AddUser from "./pages/Users/AddUser1";
import Calendar from "./pages/Calendar";
import UserProfiles from "./pages/UserProfiles";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import VendorManagement from "./pages/Vendor/VendorTable";
import UserManagement from "./pages/Users/UserTables";
import FirmManagement from "./pages/Users/FirmManagement";
import ProjectManagement from "./pages/Forms/ProjectManagement";
import Designation from './pages/Designation';
import DepartmentManagement from "./pages/Vendor/DepartmentManagement";
import Location from "./pages/Vendor/Location";
import LeaveManagement from "./pages/LeaveManagement";
import StoreManagement from "./pages/StoreManagement";
import HolidayManagement from "./components/tables/BasicTables/HolidayManagement";;  
import UnitManagement from "./pages/Unit";
import ManufacturerManagement from "./pages/ManufacturerManagement";
import CategoryManagement from "./pages/CategoryManagement";
import SubCategoryManagement from "./pages/SubategoryManagement";
import ItemManagement from "./pages/ItemManagement";
import VendorMasterManagement from "./pages/VendorMaster";
import GroupMasterManagement from "./pages/GroupMasterManagement";
import VendorMaterialManagement from "./pages/VendorMaterialManagement";
import BioMachineManagement from "./pages/BioMachine";
// import ContractorMaster from "./pages/ConditionMaster";
import ConditionMaster from "./pages/ConditionMaster";
import EmployeeManagement from "./pages/EmployeeManagement";
import LedgerOpeningBalance from "./pages/LedgerOpeningBalance";
import ContractorMaster from "./pages/ContractorMaster";
import MaterialVendorManagement from "./pages/MaterialVendorManagement"
import RolePermission from "./pages/Rolepermission";
import AttendanceManagement from "./pages/Vendor/AttendanceManagement";
import StoreInventory from "./pages/StoreInventory";
import TaxManagement from "./pages/Tax";

const App = () => {
  const { role } = useAppContext();

  return (
    <>
      {/* <Toaster /> */}
      {/* <ScrollToTop /> */}

      <Routes>

        {/* ✅ Signin is ALWAYS public */}
        <Route path="/signin" element={<SignIn />} />

        {/* ✅ Protected routes */}
        <Route element={role ? <AppLayout /> : <Navigate to="/signin" />}>
          <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/holiday" element={<HolidayManagement />} />
          <Route path="/user-tables" element={<UserManagement />} />
          {/* <Route path="/vendor-tables" element={<VendorManagement />} /> */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/firmManagement" element={<FirmManagement />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          {/* <Route path="/project-docs" element={<ProjectDocs />} /> */}
          <Route path="/desig" element={<Designation />} />
          <Route path="/dep" element={<DepartmentManagement />} />
          <Route path="/location" element={<Location />} />
          <Route path="/condition" element={<ConditionMaster/>} />
          <Route path="/leaveallotment" element={<LeaveManagement />} />
          <Route path="/store" element={<StoreManagement />} />
          <Route path="/mmr" element={<MaterialVendorManagement />} />
          <Route path="/terms" element={<LeaveManagement />} />
          <Route path="/biomachine" element={<BioMachineManagement />} />
          <Route path="/tax" element={<TaxManagement />} />
          <Route path="/unit" element={<UnitManagement />} />
          <Route path="/manuf" element={< ManufacturerManagement />} />
          <Route path="/category" element={< CategoryManagement />} />
          <Route path="/subcategory" element={< SubCategoryManagement/>} />
          <Route path="/item" element={< ItemManagement/>} />
          <Route path="/vendormaster" element={< VendorMasterManagement/>} />
          <Route path="/groupmaster" element={< GroupMasterManagement/>} />
          <Route path="/vendormaterial" element={< VendorMaterialManagement/>} />
          <Route path="/employee" element={< EmployeeManagement/>} />
          <Route path="/rolepermission" element={< RolePermission/>} />
          <Route path="/contractormaster" element={< ContractorMaster/>} />
          <Route path="/attendanceManagement" element={< AttendanceManagement/>} />
          <Route path="/storeinv" element={< StoreInventory/>} />
          {/* <Route path="/ledgeropeningbalance" element={< LedgerOpeningBalance/>} /> */}
        </Route>

        {/* Signup */}
        <Route path="/superadminofkstarsignup" element={<SignUp />} />

      </Routes>
    </>
  );
};

export default App;
