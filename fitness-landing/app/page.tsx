'use client'

import {
  Activity,
  Target,
  TrendingUp,
  Users,
  Smartphone,
  Download,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'download', 'contact']
      const scrollPosition = window.scrollY + 200

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    handleScroll() // Call once on mount
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative bg-white/30 backdrop-blur-xl rounded-full px-6 py-3 shadow-xl navbar-animated-border">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">FitTracker</span>
            </div>
            <div className="hidden md:flex space-x-6 relative">
              <button
                onClick={() => {
                  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-semibold transition-colors duration-500 ease-in-out relative ${activeSection === 'home'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
                  }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-semibold transition-colors duration-500 ease-in-out relative ${activeSection === 'features'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
                  }`}
              >
                Features
              </button>
              <button
                onClick={() => {
                  document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-semibold transition-colors duration-500 ease-in-out relative ${activeSection === 'download'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
                  }`}
              >
                Download
              </button>
              <button
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-semibold transition-colors duration-500 ease-in-out relative ${activeSection === 'contact'
                  ? 'text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
                  }`}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        </div>

        {/* Enhanced Gradient Orbs with Multiple Layers */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-gradient-to-br from-indigo-400/25 to-blue-400/25 rounded-full blur-2xl animate-pulse-slower"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-gradient-to-br from-fuchsia-300/25 to-purple-300/25 rounded-full blur-2xl animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-center"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
          <div className="particle particle-6"></div>
          <div className="particle particle-7"></div>
          <div className="particle particle-8"></div>
          <div className="particle particle-9"></div>
          <div className="particle particle-10"></div>
          <div className="particle particle-11"></div>
          <div className="particle particle-12"></div>
        </div>

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/10 to-white/40"></div>
        {/* Background Images with Enhanced Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] opacity-80">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
              <Image
                src="/walking_hero.png"
                alt="Walking Person"
                width={500}
                height={500}
                className="rounded-3xl shadow-2xl transform -rotate-12 object-cover relative z-10"
              />
            </div>
          </div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] opacity-80">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
              <Image
                src="/running_hero.png"
                alt="Running Person"
                width={500}
                height={500}
                className="rounded-3xl shadow-2xl transform rotate-12 object-cover relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight overflow-visible">
            Track Every Step
            <span className="block gradient-text mt-2 pb-2">Run Every Mile</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            The ultimate walking and running tracker. Monitor your pace, distance, and progress
            with precision designed for serious runners and casual walkers alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl">
              <Download className="h-5 w-5" />
              <span>Start Tracking</span>
            </button>
            <a href="/guide">
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-base font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 backdrop-blur-sm bg-white/60 shadow-lg hover:shadow-xl">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Stay Fit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our app combines powerful tracking features with an intuitive interface
              to help you reach your fitness goals faster.
            </p>
          </div>

          <div className="space-y-24">
            {/* Activity Tracking - Image Left */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/3">
                <div className="relative w-64 h-[500px] mx-auto border-2 border-blue-600/30 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl"></div>
                  <Image
                    src="/app_ss/activity.jpeg"
                    alt="Activity Tracking Screen"
                    width={256}
                    height={500}
                    className="relative z-10 object-contain w-full h-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Activity Tracking</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Monitor your daily activities with real-time tracking. View distance, pace, calories burned, and duration for every workout session. Get detailed insights into your performance and stay motivated with live stats.
                </p>
              </div>
            </div>

            {/* Goals - Image Right */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/3">
                <div className="relative w-64 h-[500px] mx-auto border-2 border-green-600/30 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl"></div>
                  <Image
                    src="/app_ss/goals.jpeg"
                    alt="Goals Screen"
                    width={256}
                    height={500}
                    className="relative z-10 object-contain w-full h-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Goal Setting</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Set personalized fitness goals and track your progress with detailed analytics, milestone celebrations, and achievement badges. Stay focused and motivated as you work towards your targets.
                </p>
              </div>
            </div>

            {/* History - Image Left */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/3">
                <div className="relative w-64 h-[500px] mx-auto border-2 border-purple-600/30 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl"></div>
                  <Image
                    src="/app_ss/history.jpeg"
                    alt="History Screen"
                    width={256}
                    height={500}
                    className="relative z-10 object-contain w-full h-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Workout History</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Review your complete workout history with detailed statistics, charts, and insights to understand your fitness journey. Analyze trends and see how far you've come.
                </p>
              </div>
            </div>

            {/* Profile - Image Right */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/3">
                <div className="relative w-64 h-[500px] mx-auto border-2 border-orange-600/30 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl"></div>
                  <Image
                    src="/app_ss/profile.jpeg"
                    alt="Profile Screen"
                    width={256}
                    height={500}
                    className="relative z-10 object-contain w-full h-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Personal Profile</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Customize your profile with personal stats, achievements, and preferences. Track your overall progress and milestones while celebrating your fitness accomplishments.
                </p>
              </div>
            </div>

            {/* Settings - Image Left */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/3">
                <div className="relative w-64 h-[500px] mx-auto border-2 border-cyan-600/30 rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl"></div>
                  <Image
                    src="/app_ss/settings.jpeg"
                    alt="Settings Screen"
                    width={256}
                    height={500}
                    className="relative z-10 object-contain w-full h-full rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Smart Settings</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Personalize your app experience with customizable settings, notifications, units, and privacy controls for optimal use. Make the app work exactly how you want it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-primary-100">Workouts Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8★</div>
              <div className="text-primary-100">App Store Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Download FitTracker today and join thousands of users who have transformed
            their fitness routines.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors cursor-pointer">
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </div>
            <div className="bg-black text-white px-6 py-3 rounded-lg flex items-center space-x-3 hover:bg-gray-800 transition-colors cursor-pointer">
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="text-xs">Get it on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-gray-700">Free to download</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-gray-700">No ads or subscriptions</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-gray-700">Works offline</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Activity className="h-6 w-6" />
              <span className="text-xl font-bold">FitTracker</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 FitTracker. All rights reserved.</p>
              <p className="mt-1">Built with ❤️ for fitness enthusiasts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}