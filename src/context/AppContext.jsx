// creating AppContext

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import toast from "react-hot-toast"

const AppContext = createContext()

export const AppContextProvider = ({children }) => {

    const [user, setUser] = useState(localStorage.getItem('user') || null)
    const [role, setRole] = useState(localStorage.getItem('role') || null)
    const navigate = useNavigate()

    useEffect( ()=> { 
        console.log(user,role)       
    }, [user, role] )

    const value  = { user, setUser, role, setRole, axios, toast, navigate } 
    console.log(role)

    return <AppContext.Provider value={value}>
                    {children}
           </AppContext.Provider>
}

const useAppContext = () => useContext(AppContext);

export default useAppContext