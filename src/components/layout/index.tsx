import { ReactNode } from "react";
import Sidebar from "../sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full h-screen p-3 bg-pink-100 overflow-x-hidden overflow-y-auto">{children}</main>
    </div>
  )
}