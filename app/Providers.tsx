import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactNode } from "react";

const queryClient = new QueryClient()

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
