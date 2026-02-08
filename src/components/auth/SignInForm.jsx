import { useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { RiEyeLine } from "react-icons/ri";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Link } from "react-router-dom";
import useAppContext from "../../context/AppContext";
import { jwtDecode } from "jwt-decode";
import AOS from "aos";
import "aos/dist/aos.css";
import toast, { Toaster } from "react-hot-toast";


const SignInForm = () => {
  const { axios, setUser, setRole, navigate } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);


//   e.preventDefault();

//   const email = userData.email.trim();
//   const password = userData.password.trim();

//   // ✅ EMAIL REQUIRED
//   if (!email) {
//     toast.error("Email is required");
//     return;
//   }

//   // ✅ EMAIL FORMAT CHECK
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     toast.error("Please enter a valid email address");
//     return;
//   }

//   // ✅ PASSWORD REQUIRED
//   if (!password) {
//     toast.error("Password is required");
//     return;
//   }

//   // ✅ PASSWORD LENGTH
//   if (password.length < 6) {
//     toast.error("Password must be at least 6 characters");
//     return;
//   }

//   try {
//     const token = localStorage.getItem("token");

//     const response = await axios.post(
//       `${import.meta.env.VITE_BACKEND_URL}/api/auth/staff/login`,
//       { email, password },
//       token
//         ? { headers: { Authorization: `Bearer ${token}` } }
//         : {}
//     );

//     const { data } = response;

//     const decoded = jwtDecode(data.token);

//     setUser(decoded?.sub);
//     setRole(data.role);

//     localStorage.setItem("user", decoded?.sub);
//     localStorage.setItem("role", data.role);
//     localStorage.setItem("token", data.token);

//     toast.success(data.message || "Sign in successful");
//     navigate("/", { replace: true });

//   } catch (error) {
//     toast.error(
//       error?.response?.data?.message || "Login failed. Please try again!"
//     );
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();

  const email = userData.email.trim();
  const password = userData.password.trim();

  // ✅ EMAIL REQUIRED
  if (!email) {
    toast.error("Email is required");
    return;
  }

  // ✅ EMAIL FORMAT CHECK
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  // ✅ PASSWORD REQUIRED
  if (!password) {
    toast.error("Password is required");
    return;
  }

  // ✅ PASSWORD LENGTH
  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/staff/login`,
      { email, password },
      token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {}
    );

    const { data } = response;

    const decoded = jwtDecode(data.token);

    // ✅ SAVE userName FROM RESPONSE, NOT FROM TOKEN
    setUser(data.userName); // Use data.userName instead of decoded?.sub
    setRole(data.role);

    // ✅ SAVE ALL IMPORTANT DATA TO localStorage
    localStorage.setItem("user", data.userName); // Save the actual userName
    localStorage.setItem("userName", data.userName); // Save it again as userName
    localStorage.setItem("role", data.role);
    localStorage.setItem("token", data.token);
    localStorage.setItem("loginResponse", JSON.stringify(data)); // Save entire response

    console.log("✅ Login successful! userName:", data.userName);
    console.log("✅ Full response data:", data);

    toast.success(data.message || "Sign in successful");
    navigate("/", { replace: true });

  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Login failed. Please try again!"
    );
  }
};


  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {/* 🔔 TOASTER */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
        <div
          className="w-full max-w-md pt-10 mx-auto"
          data-aos="fade-down"
          data-aos-delay="100"
        >
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 transition-colors hover:text-blue-800"
          >
            {/* <IoIosArrowForward className="size-5" />
            Back to dashboard */}
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
          <div
            className="bg-white p-8 rounded-lg shadow-md border border-gray-200"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div
              className="mb-5 sm:mb-8"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h1 className="mb-2 font-semibold text-gray-900 text-title-sm sm:text-title-md">
                Sign In
              </h1>
              <p className="text-sm text-gray-600">
                Enter your email and password to sign in!
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="400">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div data-aos="fade-up" data-aos-delay="500">
                    <Label className="text-gray-700">
                      Email <span className="text-blue-600">*</span>{" "}
                    </Label>
                   <Input
  name="email"
  value={userData.email}
  onChange={handleChangeUser}
  placeholder="info@gmail.com"
  required
/>

                  </div>

                  <div data-aos="fade-up" data-aos-delay="600">
                    <Label className="text-gray-700">
                      Password <span className="text-blue-600">*</span>{" "}
                    </Label>
                    <div className="relative">
                     <Input
  name="password"
  value={userData.password}
  type={showPassword ? "text" : "password"}
  onChange={handleChangeUser}
  required
/>

                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 hover:text-blue-600"
                      >
                        {showPassword ? (
                          <RiEyeLine className="size-5" />
                        ) : (
                          <AiOutlineEyeInvisible className="size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div data-aos="fade-up" data-aos-delay="700">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-[1.02]"
                      size="sm"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
