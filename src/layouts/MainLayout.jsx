import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'
import PromptToCartDrawer from '../components/PromptToCartDrawer'
import { Outlet } from "react-router-dom"

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 selection:bg-indigo-600 selection:text-white">
      <div>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
      <PromptToCartDrawer />
      <ChatWidget />
      <Footer />
    </div>
  )
}

export default MainLayout
