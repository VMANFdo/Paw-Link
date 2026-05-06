/**
 * Home.jsx — Landing Page
 * Route: /
 * Access: Public
 *
 * Sections:
 *  1. Hero — headline + CTA buttons
 *  2. Stats bar
 *  3. Featured Animals grid
 *  4. How It Works
 *  5. Call to Action banner
 */
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Happy Dog" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-20 text-white">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold mb-6 border border-primary-500/20">
              <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
              <span>Connecting Paws with Homes</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Give Them a <span className="text-primary-500">Second Chance</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              PawLink is the bridge between stray animals and loving families. 
              Report a stray, adopt a friend, or support local shelters — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/animals" className="btn-primary text-lg px-8 py-4 text-center">
                Browse Animals
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-4 text-center border-none">
                Join the Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-3xl shadow-xl -mt-32 relative z-30">
          {[
            { label: 'Active Rescues', value: '150+' },
            { label: 'Happy Adoptions', value: '1,200+' },
            { label: 'Verified Shelters', value: '45' },
            { label: 'Lives Saved', value: '3K+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">How You Can Help</h2>
          <p className="text-gray-600 text-lg">Whether you're an individual or an organization, there's a place for you at PawLink.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'Find & Report',
              desc: 'Found a stray? Pin their location, upload photos, and help them get rescued quickly.',
              icon: '📍',
              color: 'bg-primary-50'
            },
            {
              title: 'Adopt Forever',
              desc: 'Browse verified animals looking for a home and start your adoption journey today.',
              icon: '🏠',
              color: 'bg-secondary-50'
            },
            {
              title: 'Shelter Support',
              desc: 'Shelters can manage their rescues, medical records, and adoption requests in one dashboard.',
              icon: '🏥',
              color: 'bg-teal-50'
            }
          ].map((feature, i) => (
            <div key={i} className="card p-8 hover:translate-y-[-8px] transition-all duration-300">
              <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-3xl mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className="bg-primary-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-400 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to make a difference?</h2>
            <p className="text-xl text-primary-100 mb-10">Join thousands of others in building a safer world for our furry friends.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-black hover:bg-gray-100 transition-colors shadow-lg">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
