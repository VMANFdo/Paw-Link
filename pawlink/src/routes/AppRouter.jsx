import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RestrictionGuard from './RestrictionGuard'

// Layout
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

// Pages
import Home             from '../pages/Home'
import BrowseAnimals    from '../pages/BrowseAnimals'
import AnimalDetails    from '../pages/AnimalDetails'
import AddAnimal        from '../pages/AddAnimal'
import ManageAnimals    from '../pages/ManageAnimals'
import Login            from '../pages/Login'
import Register         from '../pages/Register'
import Dashboard        from '../pages/Dashboard'
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
import SuspendedPage    from '../pages/SuspendedPage'
import OrgPending       from '../pages/OrgPending'
import NotFound         from '../pages/NotFound'

/**
 * AppRouter.jsx — Central Route Configuration
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWrapper />}>
          <Route element={<RestrictionGuard />}>
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
              <Route path="/org-setup"     element={<OrgSetup />} />
              <Route path="/manage-animals" element={<ManageAnimals />} />
            </Route>

            {/* Admin-only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            {/* Suspended Page & Pending Gate (Inside RestrictionGuard now) */}
            <Route path="/suspended" element={<SuspendedPage />} />
            <Route path="/org-pending" element={<OrgPending />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function LayoutWrapper() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
