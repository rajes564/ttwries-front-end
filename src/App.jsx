import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/AdminDashboard'
import ApplicantDashboard from './pages/ApplicantDashboard'
import FillApplication from './pages/FillApplication'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'  

const PAYPAL_OPTIONS = {
  'client-id': 'AbM0bAjEvicCGqTM6Gz8q0lhApNu85I79GaZ6FMQwxEGekXu2s8Cn_fkwCIIa7-oRC6zonegrDqrPK0I',
  currency: 'USD',
  intent: 'capture',
  components: 'buttons',
}

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />

        {/* ✅ PayPalScriptProvider wraps only this route */}
        <Route path="/dashboard" element={
          <PayPalScriptProvider options={PAYPAL_OPTIONS}>
            <ProtectedRoute><ApplicantDashboard /></ProtectedRoute>
          </PayPalScriptProvider>
        } />

        <Route path="/application/fill" element={
          <ProtectedRoute><FillApplication /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
// App.jsx
// import { PayPalButtons } from "@paypal/react-paypal-js";

// export default function App()  {
//   return (
//     <div>
//       <h1>Test PayPal</h1>

//       <PayPalButtons
//         createOrder={(data, actions) => {
//           return actions.order.create({
//             purchase_units: [{ amount: { value: "1.00" } }]
//           });
//         }}
//         onApprove={(data, actions) => {
//           return actions.order.capture().then(details => {
//             alert("Payment completed by " + details.payer.name.given_name);
//           });
//         }}
//       />
//     </div>
//   );
// }

// import {
//   PayPalProvider,
//   PayPalOneTimePaymentButton,
// } from "@paypal/react-paypal-js/sdk-v6";

// export default function App() {
//   return (
//     <PayPalProvider
//       options={{
//         clientId: "AbM0bAjEvicCGqTM6Gz8q0lhApNu85I79GaZ6FMQwxEGekXu2s8Cn_fkwCIIa7-oRC6zonegrDqrPK0I",
//         currency: "INR",
//         intent: "capture",
//         pageType: "checkout"
//       }}
//     >
//       <div>
//         <h1>Test PayPal (v9+ style)</h1>

//         <PayPalOneTimePaymentButton
//           amount="1.00"
//           onApprove={(data, actions) => {
//             return actions.order.capture().then((details) => {
//               alert("Payment completed by " + details.payer.name.given_name);
//             });
//           }}
//           // Optional: error handling, styling, etc.
//           onError={(err) => {
//             console.error("PayPal Error:", err);
//             alert("Something went wrong with the payment.");
//           }}
//           style={{
//             layout: "vertical",
//             color: "gold",
//             shape: "rect",
//             label: "paypal",
//           }}
//         />
//       </div>
//     </PayPalProvider>
//   );
// }