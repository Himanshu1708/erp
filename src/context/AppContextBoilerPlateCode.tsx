// creating AppContext

import { createContext, ReactNode, useContext } from "react"

type AppContextType = {
    value : object
}

type ProviderProps = {
    children : ReactNode
}
const AppContext = createContext< AppContextType | undefined >(undefined)

export const AppContextProvider = ({children } : ProviderProps) => {

    const value = { value : {} }

    return <AppContext.Provider value={value}>
                    {children}
           </AppContext.Provider>
}

export const useAppContext = () => useContext(AppContext);