import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from 'react-query'
import { Header } from "./components/Header";
import './index.css'

const queryClient = new QueryClient()

export const loader: LoaderFunction = async () => {
  return json({});
};

export default function App() {
  return (
    <html className="h-full">
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Header />
            <main style={{height: 'calc(100vh - 68px)'}} className="flex">
              <Outlet />
            </main>
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

