import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { store } from './redux/store.js'
import { Provider } from "react-redux"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedLayout from './layouts/ProtectedLayout.jsx'
import CreateProduct from './pages/admin/CreateProduct.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "/product/:id",
        element: <ProductDetails />
      },
      {
        path: "/cart",
        element: (
          <ProtectedLayout>
            <Cart />
          </ProtectedLayout>
        )
      },
      {
        path: "/orders",
        element: (
          <ProtectedLayout>
            <Orders />
          </ProtectedLayout>
        )
      },
      {
        path: "/admin/createProduct",
        element: (
          <ProtectedLayout isAdmin={true}>
            <CreateProduct />
          </ProtectedLayout>
        )
      },
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedLayout isAdmin={true}>
            <Dashboard />
          </ProtectedLayout>
        )
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </Provider>
  </StrictMode>,
)
