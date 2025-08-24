import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Zap,
  Users,
  Rocket,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Set initial visibility for animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animated background particles - disabled on mobile for performance
  useEffect(() => {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;
    
    // Skip animation on mobile devices
    if (isMobile) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles = [];
      // Reduce particles on smaller screens for better performance
      const particleCount = window.innerWidth > 1200 ? 80 : window.innerWidth > 768 ? 50 : 30;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          color: Math.random() > 0.7 ? '#9333ea' : Math.random() > 0.4 ? '#ec4899' : '#6366f1'
        });
      }
      return particles;
    };

    let particles = createParticles();

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle, index) => {
        // Mouse interaction
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = (200 - distance) / 200;
          particle.x += dx * force * 0.008;
          particle.y += dy * force * 0.008;
        }

        // Floating motion
        particle.x += particle.speedX + Math.sin(time + index) * 0.2;
        particle.y += particle.speedY + Math.cos(time + index) * 0.15;

        // Wrap around edges
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animateParticles);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    resizeCanvas();
    animateParticles();

    window.addEventListener('resize', resizeCanvas);
    // Only add mouse move listener on desktop
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      // Only remove mouse move listener if it was added
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationId);
    };
  }, [mousePosition]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  // 3D Tilt effect for cards - disabled on mobile for performance
  const handleCardTilt = (e, card) => {
    // Skip 3D effects on mobile devices
    if (window.innerWidth <= 768) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleCardReset = (card) => {
    // Skip 3D effects on mobile devices
    if (window.innerWidth <= 768) return;
    
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Project Tracking",
      description: "Stay on top of client projects with our sleek futuristic dashboard.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Client Analytics",
      description: "Gain deep insights with modern analytics & data visualizations.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Smart Reminders",
      description: "Never miss a meeting or deadline with AI-powered reminders.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Collaboration",
      description: "Work seamlessly with your team inside one platform.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const benefits = [
    "Futuristic interface designed for productivity",
    "AI-powered insights tailored to your business",
    "Secure cloud infrastructure with 99.99% uptime",
    "Continuous updates with cutting-edge features"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black relative overflow-hidden">
      {/* Mobile-optimized static background */}
      <div className="md:hidden absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-purple-900/20"></div>
      {/* Animated Background - Hidden on mobile for performance */}
      <canvas
        ref={canvasRef}
        className="hidden md:block absolute inset-0 w-full h-full opacity-40"
      />

      {/* Floating Gradient Orbs - Hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '10s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s', animationDuration: '12s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          CLIENTO
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6 text-white/80">
            <button className="hover:text-white transition-colors duration-300">Features</button>
            <button className="hover:text-white transition-colors duration-300">Why Choose</button>
            <button className="hover:text-white transition-colors duration-300">Contact</button>
          </div>
          <div className="flex items-center space-x-4 ml-8">
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 text-white/90 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Sign Up
            </button>
          </div>
        </div>
        <button className="md:hidden text-white">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 container mx-auto px-6 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Large Bold Heading */}
          <h1 className={`fade-in-element text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            CLIENTO
          </h1>

          {/* Sub-heading */}
          <h2 className={`fade-in-element text-2xl md:text-3xl font-light mb-8 text-white/90 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.2s'}}>
            A product by <span className="font-semibold text-purple-400">DevelopSuite</span>
          </h2>

          {/* Tagline */}
          <p className={`fade-in-element text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.4s'}}>
            Smart, simple, and futuristic client management system.
          </p>

          {/* Glowing Get Started Button */}
          <button
            onClick={handleGetStarted}
            className={`fade-in-element group relative px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
            style={{animationDelay: '0.6s'}}
          >
            <span className="flex items-center gap-3">
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 container mx-auto px-6 py-24">
        <h2 className={`fade-in-element text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.3s'}}>
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
                         <div
               key={index}
               className={`fade-in-element feature-card group relative p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl hover:bg-gradient-to-br hover:from-white/15 hover:to-white/20 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
               style={{
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                 perspective: '1000px',
                 animationDelay: `${0.5 + index * 0.1}s`,
                 transformStyle: 'preserve-3d'
               }}
               onMouseMove={(e) => handleCardTilt(e, e.currentTarget)}
               onMouseLeave={(e) => handleCardReset(e.currentTarget)}
             >
                             {/* 3D Effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

               {/* Card Glow Effect */}
               <div className="card-glow absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 transition-all duration-500 -z-10"></div>

               {/* Removed Neon Accent Line */}

                             <div className="relative z-10">
                 <div className={`card-icon w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                   {feature.icon}
                 </div>
                 <h3 className="card-title text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                   {feature.title}
                 </h3>
                 <p className="card-description text-white/70 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                   {feature.description}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose CLIENTO Section */}
      <section className="relative z-20 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className={`fade-in-element text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.3s'}}>
            Why Choose CLIENTO?
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className={`fade-in-element space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0 -translate-x-8'}`} style={{animationDelay: '0.5s'}}>
              <p className="text-xl text-white/80 leading-relaxed">
                Experience a futuristic interface that blends simplicity and power.
                Designed for modern businesses, built for tomorrow.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className={`fade-in-element flex items-center gap-4 group ${isVisible ? 'animate-fade-in-left' : 'opacity-0 -translate-x-8'}`}
                    style={{animationDelay: `${0.7 + index * 0.1}s`}}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80 text-lg group-hover:text-white transition-colors duration-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Futuristic Mockup */}
            <div className={`fade-in-element relative ${isVisible ? 'animate-fade-in-right' : 'opacity-0 translate-x-8'}`} style={{animationDelay: '0.6s'}}>
              {/* Glowing Background Effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl animate-pulse"></div>

              {/* Mockup Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="bg-black/50 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white/60 text-sm">CLIENTO Dashboard</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-2">47</div>
                      <div className="text-sm text-white/60">Active Projects</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-2">156</div>
                      <div className="text-sm text-white/60">Total Clients</div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Recent Activity</span>
                      <button className="text-purple-400 text-sm hover:text-purple-300">View All</button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">New client onboarding completed</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">Project milestone achieved</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-white/80 text-sm">Team collaboration updated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 container mx-auto px-6 py-24 text-center">
        <div className={`fade-in-element max-w-4xl mx-auto p-12 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.4s'}}>
          <h2 className={`fade-in-element text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.6s'}}>
            Ready to Transform Your Business?
          </h2>
          <p className={`fade-in-element text-xl text-white/70 mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.8s'}}>
            Join thousands of businesses who trust CLIENTO to streamline their client relationships.
          </p>
                     <button
             onClick={handleGetStarted}
             className={`fade-in-element btn-hover group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white font-bold text-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
             style={{animationDelay: '1s'}}
           >
                         <span className="flex items-center gap-2">
               Start Free Trial
               <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
             </span>
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 bg-black/50 backdrop-blur-2xl border-t border-white/10 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                CLIENTO
              </div>
              <p className="text-white/60">© DevelopSuite. All rights reserved.</p>
            </div>

            <div className="flex space-x-12 text-white/60">
              <button className="hover:text-white transition-colors duration-300">Contact</button>
              <button className="hover:text-white transition-colors duration-300">About</button>
              <button className="hover:text-white transition-colors duration-300">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
