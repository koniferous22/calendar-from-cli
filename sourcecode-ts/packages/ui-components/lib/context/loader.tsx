import { useState, createContext, useContext, ReactNode } from 'react'
import { Loader } from '../components/Loader/loader'

const useLoader = (initialIsLoading = false) => {
  const [isLoading, setLoading] = useState(initialIsLoading)
  const showLoader = () => setLoading(true)
  const hideLoader = () => setLoading(false)
  return {
    isLoading,
    showLoader,
    hideLoader,
  }
}

const LoaderContext = createContext<ReturnType<typeof useLoader>>(null as any)

type Props = {
  children?: ReactNode
  // Initial value
  isLoading?: boolean
  shouldDisplayLoaderOverlay?: boolean
}

export const LoaderProvider = ({ shouldDisplayLoaderOverlay, children, isLoading }: Props) => {
  const ctxValue = useLoader(isLoading)
  return (
    <LoaderContext.Provider value={ctxValue}>
      {shouldDisplayLoaderOverlay && ctxValue.isLoading && <Loader />}
      {children}
    </LoaderContext.Provider>
  )
}

export const useLoaderContext = () => useContext(LoaderContext)
