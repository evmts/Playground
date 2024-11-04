import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { QueryClient, QueryClientProvider } from 'react-query'
import './index.css'

const queryClient = new QueryClient()

export const loader: LoaderFunction = async () => {
  // You can add any server-side logic here if needed
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
          <main>
          <Outlet />
          </main>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

