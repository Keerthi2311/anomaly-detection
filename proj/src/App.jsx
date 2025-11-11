import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignUpForm from './components/SignUpForm.jsx'
import SignIn from './components/SignIn.jsx'
import Dashboard from './components/Dashboard.jsx'
import Profile from './components/Profile.jsx'
import TransactionHistory from './components/TransactionHistory.jsx'
import LoginInsights from './components/LoginInsights.jsx'
import AdvancedFeatures from './components/AdvancedFeatures.jsx'
import AuthenticationAnalytics from './components/AuthenticationAnalytics.jsx'
import NFTBanking from './components/NFTBanking.jsx'
import FeatureCollection from './components/FeatureCollection.jsx'
import AccountDetails from './components/AccountDetails.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import ResetPassword from './components/ResetPassword.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account-details" element={<AccountDetails />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/login-insights" element={<LoginInsights />} />
        <Route path="/advanced-features" element={<AdvancedFeatures />} />
        <Route path="/auth-analytics" element={<AuthenticationAnalytics />} />
        <Route path="/nft-banking" element={<NFTBanking />} />
        <Route path="/feature-collection" element={<FeatureCollection />} />
      </Routes>
    </Router>
  )
}

export default App
