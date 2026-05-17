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
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animalService } from '../services/animalService'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeUsers: 0,
    needShelter: 0,
    organizations: 0,
    livesSaved: 0
  })

  useEffect(() => {
    animalService.getPublicStats()
      .then(res => setStats(res.data.data))
      .catch(err => console.error('Failed to fetch stats', err))
  }, [])
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
              {user ? (
                user.role !== 'admin' && (
                  <Link to="/add-animal" className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-lg px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all text-center">
                    Post New Animal
                  </Link>
                )
              ) : (
                <Link to="/login" className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-lg px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all text-center">
                  Post New Animal
                </Link>
              )}
              {user ? (
                <Link to="/dashboard" className="text-primary-400 text-lg px-8 py-4 text-center font-bold hover:underline">
                  Go to Dashboard &rarr;
                </Link>
              ) : (
                <Link to="/register" className="text-primary-400 text-lg px-8 py-4 text-center font-bold hover:underline">
                  Join the Mission &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-3xl shadow-xl -mt-32 relative z-30">
          {[
            { label: 'Active Users',   value: stats.activeUsers },
            { label: 'Need Shelter',   value: stats.needShelter },
            { label: 'Organizations',  value: stats.organizations },
            { label: 'Saved Lives',    value: stats.livesSaved },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="container py-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">How it Works</h2>
          <p className="text-gray-600 text-lg">Follow these simple steps to start your journey with PawLink.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Adoption Guidelines */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
              🐕
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-8">Want to adopt a pet?</h3>
            <ul className="space-y-6">
              {[
                { step: '1', text: 'Navigate to browse animals' },
                { step: '2', text: 'Choose the animal' },
                { step: '3', text: 'Send an image with the animals in the poster to author and an adoption request' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-sm">
                    {item.step}
                  </span>
                  <p className="text-gray-600 font-medium pt-1">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Rescue Guidelines */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
              📢
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-8">Want to report a Rescue?</h3>
            <ul className="space-y-6">
              {[
                { step: '1', text: 'Create a new account' },
                { step: '2', text: 'Post about the animal' },
                { step: '3', text: 'Confirm adoption request upon the proof' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center font-black text-sm">
                    {item.step}
                  </span>
                  <p className="text-gray-600 font-medium pt-1">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
<section className="container mx-auto px-6 md:px-12 lg:px-20">
  <div className="grid md:grid-cols-2 gap-10">
    
    {/* Person CTA */}
    <div className="bg-primary-600 rounded-[2.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl flex flex-col items-center h-full">
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 bg-primary-500 rounded-full blur-3xl opacity-40"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 leading-snug">
          Did you find a pet who need a care ?
        </h2>
        
        <p className="text-base md:text-lg opacity-90 max-w-md">
          Share details and help connect them with loving adopters.
        </p>
      </div>
      
      <div className="relative z-10 mt-auto">
        {user ? (
          <Link 
            to="/add-animal" 
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md inline-block"
          >
            Post New Animal
          </Link>
        ) : (
          <Link 
            to="/register" 
            state={{ role: 'person' }} 
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md inline-block"
          >
            Register as Person
          </Link>
        )}
      </div>
    </div>
    
    {/* Organization CTA */}
    <div className="bg-secondary-600 rounded-[2.5rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl flex flex-col items-center h-full">
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-44 h-44 bg-secondary-500 rounded-full blur-3xl opacity-40"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 leading-snug">
          Are you an organization who can provide shelter to strays ?
        </h2>
        
        <p className="text-base md:text-lg opacity-90 max-w-md">
          Register to manage rescues and support stray animals with care.
        </p>
      </div>
      
      <div className="relative z-10 mt-auto">
        {user ? (
          <Link 
            to="/profile" 
            className="bg-white text-secondary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md inline-block"
          >
            Go to Profile
          </Link>
        ) : (
          <Link 
            to="/register" 
            state={{ role: 'organization' }} 
            className="bg-white text-secondary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-md inline-block"
          >
            Register as Organization
          </Link>
        )}
      </div>
    </div>
    
  </div>
</section>

    </div>
  )
}
