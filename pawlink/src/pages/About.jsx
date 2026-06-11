/**
 * About.jsx — Enhanced About PawLink Page
 * Route: /about
 * Access: Public
 * Features: Hero section, mission values, platform features, testimonials, impact stats, social media
 */

export default function About() {
  const aboutHeroImage =
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&fm=jpg&q=80&w=2400"

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-dark-950 py-20 md:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${aboutHeroImage}")` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/65 to-dark-950/85"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary-950/20 mix-blend-multiply" aria-hidden="true" />
        <div className="container-section relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <span className="text-6xl animate-bounce">🐾</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              About PawLink
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed drop-shadow">
              Connecting stray animals with loving homes. Every paw deserves a chance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">Join as a Rescuer</button>
              <button className="border-2 border-primary-400 bg-dark-950/35 text-primary-200 hover:bg-primary-500 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm">
                Browse Animals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="container-section">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Our Mission & Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 - Rescue */}
            <div className="card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/60">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Rescue & Care</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Providing emergency care and medical attention to injured stray animals in need.
              </p>
            </div>
            
            {/* Card 2 - Adoption */}
            <div className="card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-950/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-900/60">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Forever Homes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Matching rescued animals with loving families through our streamlined adoption process.
              </p>
            </div>
            
            {/* Card 3 - Community */}
            <div className="card p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Community Impact</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Empowering communities to report strays and make a meaningful difference together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-dark-950">
        <div className="container-section">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How PawLink Works
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-950/40 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Real-Time Animal Reporting</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pin exact GPS coordinates of stray animals with up to 5 photos and urgency levels.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-secondary-100 dark:bg-secondary-950/40 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 dark:text-secondary-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Verified Organization Profiles</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    All shelters and rescues undergo admin verification before appearing publicly.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Streamlined Adoption Process</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Submit adoption requests, track status, and connect directly with shelters.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Interactive Map Visualization */}
            <div className="relative">
              <div className="aspect-video bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-750">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Live Rescue Map</h4>
                </div>
                <div className="p-4 h-64 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 rounded-b-2xl">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🗺️</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Interactive map showing active rescues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="container-section">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Success Stories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah M.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Adopter</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "PawLink made adopting Max so easy! The process was transparent and the shelter team was amazing."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Mike R.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Community Rescuer</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Reporting stray animals has never been this simple. The map view helps us coordinate quickly!"
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Emma L.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Shelter Director</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The handover system has revolutionized how we receive animals. Much more efficient!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="py-16 bg-primary-50 dark:bg-dark-950">
        <div className="container-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">5,000</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Animals Rescued</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">2,500</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Families</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">800</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Shelters</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">150</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Communities Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <footer className="bg-white dark:bg-dark-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container-section">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">
                © 2024 PawLink. Made with ❤️ for animals everywhere.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.161-10.153-5.126-1.251 2.14-1.866 4.482-1.839 6.883.772 4.935 4.397 8.721 9.123 9.104-.993.206-2.03.321-3.1.321-.62 0-1.23-.06-1.82-.176.124.467.449.9.953 1.201-1.53.298-3.14.146-4.61-.279-1.42-.423-2.64-1.029-3.69-1.775-.327.53-.51 1.14-.51 1.79 0 1.55 1.24 2.81 2.81 2.81 2.54 0 4.85-2.17 5.41-5.15.41-1.41.61-2.85.61-4.32 0-.34-.03-.68-.09-1.02C19.998 6.884 20.5 5.5 20.5 4.557z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm8.962-12.5a1.77 1.77 0 11-3.54 0 1.77 1.77 0 013.54 0z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.25h-3.354zM5.337 7.433c-1.144 0-2.063.926-2.063 2.063 0 1.137.92 2.063 2.063 2.063 1.137 0 2.063-.926 2.063-2.063 0-1.137-.926-2.063-2.063-2.063zm1.749 13.019H3.589V9.007h3.497v11.445zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
