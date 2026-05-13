import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Layout
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

// Pages
import Home             from '../pages/Home'
import BrowseAnimals    from '../pages/BrowseAnimals'
import AnimalDetails    from '../pages/AnimalDetails'
import AddAnimal        from '../pages/AddAnimal'
import Login            from '../pages/Login'
import Register         from '../pages/Register'
import Dashboard        from '../pages/Dashboard'
import OrganizationDashboard from '../pages/OrganizationDashboard'
import AdminDashboard   from '../pages/AdminDashboard'
import Profile          from '../pages/Profile'
import RescueRequests   from '../pages/RescueRequests'
import AdoptionRequests from '../pages/AdoptionRequests'
import MapView          from '../pages/MapView'
import Messages         from '../pages/Messages'
import About            from '../pages/About'
import Contact          from '../pages/Contact'
import SheltersListing  from '../pages/SheltersListing'
import ShelterDetails   from '../pages/ShelterDetails'
import OrgSetup         from '../pages/OrgSetup'
import NotFound         from '../pages/NotFound'

/**
 * AppRouter.jsx — Central Route Configuration
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/"              element={<Home />} />
          <Route path="/animals"       element={<BrowseAnimals />} />
          <Route path="/animals/:id"   element={<AnimalDetails />} />
          <Route path="/map"           element={<MapView />} />
          <Route path="/shelters"      element={<SheltersListing />} />
          <Route path="/shelters/:id"  element={<ShelterDetails />} />
          <Route path="/about"         element={<About />} />
          <Route path="/contact"       element={<Contact />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />

          {/* Private Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/add-animal"        element={<AddAnimal />} />
            <Route path="/profile"           element={<Profile />} />
            <Route path="/adoptions"         element={<AdoptionRequests />} />
            <Route path="/rescues"           element={<RescueRequests />} />
            <Route path="/messages"          element={<Messages />} />
          </Route>

          {/* Organization-only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['organization', 'admin']} />}>
            <Route path="/org-dashboard" element={<OrganizationDashboard />} />
            <Route path="/org-setup"     element={<OrgSetup />} />
          </Route>

          {/* Admin-only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
