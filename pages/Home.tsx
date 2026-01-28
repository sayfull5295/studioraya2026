
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KetupatIcon, STRINGS, PelitaIcon } from '../constants';
import { User } from '../types';

const CONCEPTS = [
  {
    id: 'muji',
    title: 'Modern Muji',
    description: 'Estetik minimalis rona kayu & putih yang tenang untuk suasana raya yang lebih damai.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1920',
    color: 'from-stone-900/40',
    price: '199',
    promoTag: 'Sesi 20 Minit • 5 Digital'
  },
  {
    id: 'moden',
    title: 'Moden Estetik',
    description: 'Minimalisme premium rona emerald & emas untuk gaya raya kontemporari.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1920',
    color: 'from-emerald-900/40',
    price: '299',
    promoTag: 'Sesi 30 Minit • 10 Digital'
  },
  {
    title: 'Taman Cahaya',
    id: 'taman',
    description: 'Keindahan floral & pencahayaan natural yang ceria untuk memori yang segar.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1920',
    color: 'from-blue-900/40',
    price: '149',
    promoTag: 'Pakej Solo/Kanak-kanak'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentConcept, setCurrentConcept] = useState(0);
  const revealsRef = useRef<HTMLDivElement[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null') as User | null;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentConcept((prev) => (prev + 1) % CONCEPTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    revealsRef.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToReveals = (el: HTMLDivElement | null) => {
    if (el && !revealsRef.current.includes(el)) {
      revealsRef.current.push(el);
    }
  };

  const handleBookClick = (conceptId: string) => {
    if (currentUser && currentUser.role !== 'user') {
      navigate('/admin');
    } else {
      navigate(`/booking?theme=${conceptId}`);
    }
  };

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${15 + Math.random() * 20}s`,
      delay: `${Math.random() * 10}s`,
    }));
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white bg-emerald-950 pt-24 pb-16">
        {CONCEPTS.map((concept, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
              index === currentConcept ? 'opacity-50 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img 
              src={concept.image} 
              alt={concept.title}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentConcept ? 'scale-110' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/30 to-emerald-950/95"></div>
          </div>
        ))}

        <div className="absolute inset-0 z-10 pointer-events-none">
          {particles.map((p) => (
            <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay, top: '-5%' }} />
          ))}
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-10">
          <div className="space-y-4 animate-reveal">
            <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px w-12 bg-gold/50"></div>
                <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">Studio Raya 2026 by Threesixty</span>
                <div className="h-px w-12 bg-gold/50"></div>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-bold leading-tight drop-shadow-2xl">
                Abadikan <span className="text-gold italic">Memori</span> Raya
            </h1>
            <p className="text-base md:text-lg text-cream/70 font-light max-w-2xl mx-auto italic">
              "Setiap senyuman adalah cerita, setiap detik adalah warisan yang abadi."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-4">
            {CONCEPTS.map((concept, idx) => (
              <div key={idx} ref={addToReveals} className="reveal flex flex-col space-y-4 group" style={{ transitionDelay: `${idx * 0.2}s` }}>
                <button 
                  onClick={() => handleBookClick(concept.id)}
                  className="relative h-72 md:h-[420px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-gold/20 text-left w-full"
                >
                  <img 
                    src={concept.image} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={concept.title} 
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${concept.color} via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-1 block">Konsep 0{idx+1}</span>
                    <h3 className="text-3xl font-serif font-bold text-white">{concept.title}</h3>
                  </div>
                </button>

                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => handleBookClick(concept.id)}
                    className="bg-gold text-emerald-950 py-4 px-8 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-gold/10 hover:bg-white hover:scale-105 transition-all duration-300 text-center"
                  >
                    {currentUser && currentUser.role !== 'user' ? 'Manage Sessions' : 'Tempah Sekarang'}
                  </button>
                  
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center space-y-1">
                    <div className="text-gold font-serif text-2xl font-bold">
                      RM {concept.price}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/60">
                      {concept.promoTag}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#fdfcf0] relative z-30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
            <div ref={addToReveals} className="reveal text-center mb-16 space-y-4">
                <h2 className="text-4xl font-serif font-bold text-emerald-900">Kenapa Memilih Kami?</h2>
                <div className="w-16 h-1 bg-gold mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {[
                    { title: 'Kualiti Threesixty', desc: 'Sentuhan kreatif yang memastikan setiap gambar nampak seperti karya seni.', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
                    { title: 'Selesa & Peribadi', desc: 'Ruang studio yang selesa untuk seisi keluarga tanpa gangguan luar.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                    { title: 'Pantas & Efisien', desc: 'Proses pemilihan foto yang mudah dan galeri digital dalam 48 jam.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                ].map((item, i) => (
                    <div key={i} ref={addToReveals} className="reveal group cursor-default" style={{ transitionDelay: `${i * 0.2}s` }}>
                        <div className="w-16 h-16 bg-gold/5 text-gold rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-emerald-900 mb-2">{item.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto font-medium">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
