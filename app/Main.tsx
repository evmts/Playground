import {
  Outlet,
} from "@remix-run/react";
import { Providers } from "./Providers";

export const Main = () => (
  <main style={{ height: 'calc(100vh - 68px)' }} className="flex">
    <Providers>
      <Outlet />
    </Providers>
  </main>
)
