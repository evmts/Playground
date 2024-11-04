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
    <html>
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
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Header />
            <main className="h-[calc(100vh-73px)]">
              <Outlet />
            </main>
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

