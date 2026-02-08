import { createContext, useContext, useState } from "react"

// creating AppContext
const AppContext = createContext()

export const AppContextProvider = ({children}) => {
    const [user, setUser] = useState(null)

    const value = { user, setUser }

    return <AppContext.Provider value={ value }>
            {children}
           </AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext)