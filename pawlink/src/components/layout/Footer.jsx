import { Link } from 'react-router-dom'

/**
 * Footer.jsx — Site Footer
 *
 * Sections:
 *  - Brand + tagline
 *  - Quick links
 *  - Copyright
 */

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
      <div className="container-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-extrabold text-xl text-white mb-3">
              <span className="text-2xl">🐾</span>
              <span>PawLink</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting stray animals with loving homes. Every paw deserves a chance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/animals" className="hover:text-primary-400 transition-colors">Browse Animals</Link></li>
              <li><Link to="/map"     className="hover:text-primary-400 transition-colors">Animal Map</Link></li>
              <li><Link to="/about"   className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Get Involved</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register"   className="hover:text-primary-400 transition-colors">Join as a Rescuer</Link></li>
              <li><Link to="/register"   className="hover:text-primary-400 transition-colors">Register your Shelter</Link></li>
              <li><Link to="/add-animal" className="hover:text-primary-400 transition-colors">Report a Stray</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {year} PawLink. Made with ❤️ for animals everywhere.
        </div>
      </div>
    </footer>
  )
}
