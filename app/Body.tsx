import {
  Scripts,
} from "@remix-run/react";
import { Header } from "./components/Header";
import { Main } from "./Main";
import './index.css'

export const Body = () => (
  <body>
    <div className="flex-1 min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <Main />
    </div>
    <Scripts />
  </body>
)
