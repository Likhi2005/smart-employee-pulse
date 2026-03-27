import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './index.css'

function App() {
  const features = [
    {
      title: 'Lightning Fast',
      description: 'Experience instant HMR and optimized builds',
      icon: '⚡',
    },
    {
      title: 'React 19',
      description: 'Build with the latest React features',
      icon: '⚛️',
    },
    {
      title: 'Tailwind CSS',
      description: 'Beautiful, responsive design out of the box',
      icon: '🎨',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/80 shadow-sm sticky top-0 z-50">
        <div className="container-responsive flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <img src={viteLogo} alt="Vite" className="w-8 h-8" />
            <span className="text-2xl font-bold text-primary">Vite React</span>
          </div>
          <button className="btn-primary">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-responsive py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-primary">
                Welcome to Vite + React
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Build faster, ship smarter. Get started with this modern setup combining Vite, React 19, and Tailwind CSS for a seamless development experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Learn More</button>
              <button className="btn-outline">Explore Docs</button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72 bg-gradient-blue rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img
                src={reactLogo}
                alt="React"
                className="w-40 h-40 animate-bounce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-primary mb-4">Key Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to build modern, responsive web applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card text-center group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl mb-3 text-primary">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-purple py-16">
        <div className="container-responsive text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Start editing and watching your changes live with Hot Module Replacement
          </p>
          <button className="btn-primary">
            Start Building
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-responsive text-center">
          <p className="text-gray-400">
            Built with React, Vite, and Tailwind CSS. © 2024
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App