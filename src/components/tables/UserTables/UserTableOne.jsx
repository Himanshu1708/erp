import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import toast from "react-hot-toast";
import useAppContext from "../../../context/AppContext";
import { useEffect, useState } from "react";


const UserTableOne = () => {
  const {axios} = useAppContext()
  const [tableData, setTableData] = useState()
  
  const fetchUsers = async() => {
  try {
    const token = localStorage.getItem('token') || null
    // const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/staff`,
    // const {data} = await axios.get(`https://pharma2.shop/api/auth/staff`,
     
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const { data } = await axios.get(
  `${BACKEND_URL}/api/auth/staff`
);

           {
              headers : {
                Authorization : `Bearer ${token}`
              }
           }   
    console.log(data.data)
    setTableData(data.data)
  } catch (error) {
    toast.error(error)
  }
} 
  useEffect( ()=> {
    fetchUsers()
  }, [] )

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token') || null
      const {data} = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast.success(data.message)
      console.log(data)
    } catch (error) {
      toast.error(error)
    }
  }


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400"
              >                
                Username
              </TableCell>
              {/* <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400"
              >
                Name
              </TableCell> */}
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-700 text-start text-theme-xs dark:text-gray-400"
              >
                Role
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-700 text-center text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order.user.image}
                        alt={order.user.name}
                      />
                    </div> */}
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.firstName + ' '+ order.lastName}
                      </span>
                      {/* <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.user.name}
                      </span> */}
                      {/* <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.user.role}
                      </span> */}
                    </div>
                  </div>
                </TableCell>
                {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.role}
                </TableCell> */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {/* {order.team.images.map((teamImage, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                      >
                        <img
                          width={24}
                          height={24}
                          src={teamImage}
                          alt={`Team member ${index + 1}`}
                          className="w-full size-6"
                        />
                      </div>
                    ))} */}
                    {order.email}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Active"
                        ? "success"
                        : order.status === "Pending"
                        ? "error"
                        : "warning"
                    }
                  >
                    {order.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                   <div className="flex flex-wrap items-center justify-center gap-6 md:gap-2">
            <button type="button" className="bg-white border-green-500 text-green-500 active:scale-95 transition text-sm flex items-center px-2 py-2 gap-1 rounded w-max border">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.672 6.763 5.58 15.854l-.166 2.995 2.995-.166L17.5 9.59m-2.828-2.828 1.348-1.349a2 2 0 1 1 2.829 2.829L17.5 9.59m-2.828-2.828L17.5 9.591" stroke="#1F2937" strokeWidth=".96" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit
            </button>
            <button type="button" className="bg-white  border-blue-500 text-blue-500 active:scale-95 transition text-sm flex items-center px-2 py-2 gap-1 rounded w-max border">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.5.5h-6A1.5 1.5 0 0 0 1 2v12a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 13 14V5M8.5.5 13 5M8.5.5V5H13m-3 3.75H4m6 3H4m1.5-6H4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View
            </button>
            <button type="button" onClick={() => deleteUser(order.id)} className="bg-white  border-red-400 text-red-400 active:scale-95 transition text-sm flex items-center px-2 py-2 gap-1 rounded w-max border">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 3.833h17m-4.25 0-.287-.766c-.28-.744-.419-1.115-.677-1.39a2.1 2.1 0 0 0-.852-.546C11.559 1 11.118 1 10.237 1H8.763c-.881 0-1.322 0-1.697.131a2.1 2.1 0 0 0-.852.546c-.258.275-.398.646-.676 1.39l-.288.766m10.625 0v9.634c0 1.586 0 2.38-.347 2.986a3.04 3.04 0 0 1-1.393 1.238c-.682.309-1.575.309-3.36.309h-2.55c-1.785 0-2.678 0-3.36-.309a3.04 3.04 0 0 1-1.393-1.238c-.347-.606-.347-1.4-.347-2.986V3.833m8.5 3.778v6.611m-4.25-6.61v6.61" stroke="#DC2626" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
            </button>
        </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
export default UserTableOne