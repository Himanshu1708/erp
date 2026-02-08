import { useState } from "react";
import { Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { IoIosArrowForward } from "react-icons/io";
import { RiEyeLine } from "react-icons/ri";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import useAppContext from "../../context/AppContext";
import toast from "react-hot-toast";

const SignUpForm = () => {
  const {axios, navigate} = useAppContext()
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [userData, setUserData] = useState(
    {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role:"SUPERADMIN"
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData( (prev)=> ({
          ...prev, 
          [name]:value
        }) )
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        const { data } = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/auth/superadmin/create`, userData )
        toast.success(data.message)
        navigate('/signin')
      } catch (error) {
        toast.error(error.response.data.message)
      }
    }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <IoIosArrowForward className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
           
            <form onSubmit={ (e)=> handleSubmit(e)}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value = {userData.firstName}
                      onChange={ (e)=> handleChange(e) }
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value = {userData.lastName}
                      onChange={ (e)=> handleChange(e) }
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value = {userData.email}
                    onChange={ (e)=> handleChange(e) }
                  />
                </div>
                {/* Role */}
                <div>
                  <Label>
                    Role<span className="text-error-500">*</span>
                  </Label>
                  <select className="w-full border p-2 rounded" name="role" id="role" onChange={ (e)=> handleChange(e) }>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      name='password'
                      type={showPassword ? "text" : "password"}
                      value = {userData.password}
                      onChange={ (e)=> handleChange(e) }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <RiEyeLine className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                {/* <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div> */}
                {/* <!-- Button --> */}
                <div>
                  <button type="submit" className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Sign Up
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignUpForm