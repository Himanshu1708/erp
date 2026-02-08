import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import useAppContext from "../../context/AppContext";
import { RiEyeLine } from "react-icons/ri";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import Input from "../../components/form/input/InputField";
import toast, { Toaster } from "react-hot-toast";

const AddUser = () => {
  const { axios } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);

  // Updated to match your Java entity fields
  const initialState = {
    role: "",
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
  };

  const [formData, setFormData] = useState(initialState);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email contains @gmail.com
    if (!formData.email.includes("@gmail.com")) {
      toast.error("Email must contain @gmail.com");
      return;
    }

    try {
      const token = localStorage.getItem("token") || null;

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/staff/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('User Created Successfully');
      setFormData(initialState);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <Toaster/>
      <PageMeta title="User Registration" description="User Registration" />
      <PageBreadcrumb pageTitle="User Registration" />

      <div className="max-w-full mx-auto p-6 bg-white shadow-md rounded-lg text-gray-700">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Role */}
          <div>
            <label className="block mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>

          {/* User Name */}
          <div>
            <label className="block mb-1">User Name</label>
            <input
              type="text"
              name="userName"
              required
              value={formData.userName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1">Email <span className="text-red-500">*</span> (must be @gmail.com)</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <RiEyeLine className="size-5 text-gray-500" />
                ) : (
                  <AiOutlineEyeInvisible className="size-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block mb-1">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block mb-1">Mobile Number</label>
            <input
              type="number"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Created By */}
          <div>
            <label className="block mb-1">Created By</label>
            <input
              type="text"
              name="createBy"
              value={formData.createBy}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* User Image */}
          <div>
            <label className="block mb-1">User Image URL</label>
            <input
              type="text"
              name="userImage"
              value={formData.userImage}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Hidden field for createdDate */}
          <input
            type="hidden"
            name="createdDate"
            value={formData.createdDate}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;