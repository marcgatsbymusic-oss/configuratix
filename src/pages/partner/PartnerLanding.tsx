import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function PartnerLanding() {
  const { partnerId } = useParams();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const btn = e.currentTarget;
    btn.textContent = '¡Solicitud enviada! Te llamamos pronto.';
    btn.style.background = '#eab676';
    btn.style.color = '#000';
    btn.setAttribute('disabled', 'true');
  };

  return (
    <div className="partner-landing">
      <style>{`
        .partner-landing {
          --green-deep:   #000000;
          --green-mid:    #111111;
          --green-light:  #222222;
          --green-pale:   #1a1a1a;
          --cream:        #111111;
          --cream-dark:   #222222;
          --amber:        #eab676;
          --amber-light:  #d9a05b;
          --amber-pale:   rgba(234, 182, 118, 0.1);
          --text-dark:    #ffffff;
          --text-mid:     #cccccc;
          --text-light:   #999999;
          --white:        #0a0a0a;
          --radius-sm:    6px;
          --radius-md:    12px;
          --radius-lg:    20px;

          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-dark);
          background: var(--white);
          overflow-x: hidden;
        }
        
        .partner-landing *, .partner-landing *::before, .partner-landing *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .partner-landing .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .partner-landing .reveal.visible { opacity: 1; transform: translateY(0); }

        /* ── NAV ── */
        .partner-landing nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 5%;
          background: rgba(10, 10, 10, 0.97);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .partner-landing .nav-phone {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500;
          color: #000;
          text-decoration: none;
          background: var(--amber);
          padding: 9px 20px;
          border-radius: 50px;
          transition: background 0.2s;
        }
        .partner-landing .nav-phone:hover { background: var(--amber-light); }
        .partner-landing .nav-phone svg { width: 15px; height: 15px; }

        /* ── HERO ── */
        .partner-landing .hero {
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 120px 5% 80px;
          position: relative;
          overflow: hidden;
        }
        .partner-landing .hero-video {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover;
          z-index: -2;
        }
        .partner-landing .hero-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(160deg, rgba(0,0,0,0.88) 0%, rgba(10,10,10,0.80) 55%, rgba(17,17,17,0.70) 100%);
          z-index: -1;
        }
        .partner-landing .hero::after {
          content: '';
          position: absolute; bottom: -2px; left: 0; right: 0; height: 80px;
          background: var(--white);
          clip-path: ellipse(55% 100% at 50% 100%);
        }
        .partner-landing .hero-content {
          max-width: 640px;
          animation: fadeUp 1s ease both;
        }
        .partner-landing .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--amber-light);
          margin-bottom: 20px;
        }
        .partner-landing .hero-eyebrow::before {
          content: ''; display: block;
          width: 28px; height: 1.5px;
          background: var(--amber-light);
        }
        .partner-landing .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 68px);
          font-weight: 600;
          line-height: 1.08;
          color: var(--text-dark);
          margin-bottom: 24px;
        }
        .partner-landing .hero h1 em {
          font-style: italic;
          color: var(--amber-light);
        }
        .partner-landing .hero p {
          font-size: 17px; font-weight: 300;
          color: var(--text-mid);
          max-width: 500px;
          margin-bottom: 40px;
          line-height: 1.65;
        }
        .partner-landing .hero-ctas {
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .partner-landing .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--amber);
          color: #000;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500;
          padding: 14px 28px;
          border-radius: 50px;
          text-decoration: none;
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .partner-landing .btn-primary:hover { background: var(--amber-light); transform: translateY(-1px); }
        .partner-landing .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: var(--text-dark);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 400;
          padding: 13px 26px;
          border-radius: 50px;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.45);
          transition: border-color 0.2s, background 0.2s;
        }
        .partner-landing .btn-secondary:hover { border-color: var(--text-dark); background: rgba(255,255,255,0.08); }
        .partner-landing .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12);
          color: var(--text-dark);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 400;
          padding: 13px 24px;
          border-radius: 50px;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(4px);
          transition: background 0.2s;
        }
        .partner-landing .btn-ghost:hover { background: rgba(255,255,255,0.2); }

        /* ── TRUST BAR ── */
        .partner-landing .trust-bar {
          background: var(--green-deep);
          padding: 36px 5%;
        }
        .partner-landing .trust-bar-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }
        .partner-landing .trust-item {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 24px;
          background: rgba(255,255,255,0.06);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .partner-landing .trust-icon {
          width: 44px; height: 44px; flex-shrink: 0;
          background: var(--amber);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .partner-landing .trust-icon svg { width: 20px; height: 20px; color: #000; }
        .partner-landing .trust-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600;
          color: var(--text-dark);
          line-height: 1;
        }
        .partner-landing .trust-label {
          font-size: 12px; font-weight: 400;
          color: var(--text-light);
          margin-top: 2px;
        }

        /* ── SECTION COMMONS ── */
        .partner-landing section { padding: 90px 5%; }
        .partner-landing .section-inner { max-width: 1100px; margin: 0 auto; }
        .partner-landing .section-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 14px;
        }
        .partner-landing .section-tag::before {
          content: ''; display: block;
          width: 22px; height: 1.5px;
          background: var(--amber);
        }
        .partner-landing .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 600;
          line-height: 1.12;
          color: var(--text-dark);
          margin-bottom: 16px;
        }
        .partner-landing .section-subtitle {
          font-size: 16px; font-weight: 300;
          color: var(--text-mid);
          max-width: 520px;
          line-height: 1.7;
        }
        .partner-landing .section-header { margin-bottom: 56px; }

        /* ── PRODUCTS ── */
        .partner-landing .products { background: var(--cream); }
        .partner-landing .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .partner-landing .product-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--cream-dark);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .partner-landing .product-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .partner-landing .product-img {
          height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .partner-landing .product-img-pvc { background-image: url('/assets/iglo-edge-profile-photo.png'); }
        .partner-landing .product-img-alu { background-image: url('/assets/neo_md_okno_profil.png'); }
        .partner-landing .product-img-wood { background-image: url('/assets/hero-door.png'); }
        .partner-landing .product-badge {
          position: absolute; top: 16px; left: 16px;
          background: var(--green-light);
          color: var(--text-dark);
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          padding: 5px 14px;
          border-radius: 50px;
        }
        .partner-landing .product-body { padding: 28px; }
        .partner-landing .product-body h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 10px;
        }
        .partner-landing .product-body p {
          font-size: 14px; color: var(--text-mid);
          margin-bottom: 20px;
          line-height: 1.65;
        }
        .partner-landing .product-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .partner-landing .product-tag {
          font-size: 12px; font-weight: 400;
          background: var(--green-pale);
          color: var(--text-mid);
          padding: 4px 12px;
          border-radius: 50px;
          border: 1px solid var(--cream-dark);
        }

        /* ── WHY US ── */
        .partner-landing .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 28px;
        }
        .partner-landing .why-item {
          padding: 36px 32px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--cream-dark);
          transition: border-color 0.2s, background 0.2s;
        }
        .partner-landing .why-item:hover { border-color: var(--amber); background: var(--cream); }
        .partner-landing .why-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 400;
          color: var(--amber);
          line-height: 1;
          margin-bottom: 16px;
        }
        .partner-landing .why-item h4 {
          font-size: 17px; font-weight: 500;
          color: var(--text-dark);
          margin-bottom: 10px;
        }
        .partner-landing .why-item p {
          font-size: 14px; color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── CUSTOMIZE CTA ── */
        .partner-landing .customize {
          background: var(--green-deep);
          position: relative;
          overflow: hidden;
        }
        .partner-landing .customize::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: var(--amber-pale);
          pointer-events: none;
        }
        .partner-landing .customize-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
        }
        .partner-landing .customize-options {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .partner-landing .customize-opt {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius-md);
          padding: 20px 18px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .partner-landing .customize-opt:hover { background: rgba(255,255,255,0.13); border-color: var(--amber-light); }
        .partner-landing .customize-opt-icon { font-size: 22px; margin-bottom: 8px; }
        .partner-landing .customize-opt h5 {
          font-size: 14px; font-weight: 500;
          color: var(--text-dark);
          margin-bottom: 4px;
        }
        .partner-landing .customize-opt p { font-size: 12px; color: var(--text-light); line-height: 1.4; }
        .partner-landing .customize-cta { margin-top: 28px; }

        /* ── TESTIMONIALS ── */
        .partner-landing .testimonials { background: var(--cream); }
        .partner-landing .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .partner-landing .testimonial-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 36px 32px;
          border: 1px solid var(--cream-dark);
          position: relative;
        }
        .partner-landing .testimonial-card::before {
          content: '\\201C';
          font-family: 'Cormorant Garamond', serif;
          font-size: 100px; font-weight: 600;
          color: var(--green-pale);
          position: absolute;
          top: 8px; left: 24px;
          line-height: 1;
          pointer-events: none;
        }
        .partner-landing .testimonial-stars { color: var(--amber); font-size: 16px; margin-bottom: 16px; }
        .partner-landing .testimonial-text {
          font-size: 15px; color: var(--text-mid);
          line-height: 1.7;
          margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .partner-landing .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .partner-landing .testimonial-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: var(--green-pale);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-weight: 600;
          color: var(--text-dark);
          flex-shrink: 0;
          border: 1px solid var(--cream-dark);
        }
        .partner-landing .testimonial-name { font-size: 14px; font-weight: 500; color: var(--text-dark); }
        .partner-landing .testimonial-location { font-size: 12px; color: var(--text-light); }

        /* ── CONTACT ── */
        .partner-landing .contact { background: var(--white); }
        .partner-landing .contact-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 72px; align-items: start;
        }
        .partner-landing .contact-item {
          display: flex; align-items: flex-start; gap: 16px;
          margin-bottom: 28px;
        }
        .partner-landing .contact-icon-wrap {
          width: 46px; height: 46px; flex-shrink: 0;
          background: var(--green-pale);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--cream-dark);
        }
        .partner-landing .contact-icon-wrap svg { width: 20px; height: 20px; color: var(--amber); }
        .partner-landing .contact-item-label { font-size: 12px; color: var(--text-light); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.08em; }
        .partner-landing .contact-item-value { font-size: 16px; font-weight: 500; color: var(--text-dark); text-decoration: none; }
        .partner-landing .contact-item-value:hover { color: var(--amber); }

        /* Quote form */
        .partner-landing .quote-form {
          background: var(--cream);
          border-radius: var(--radius-lg);
          padding: 40px 36px;
          border: 1px solid var(--cream-dark);
        }
        .partner-landing .quote-form h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 24px;
        }
        .partner-landing .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .partner-landing .form-group { margin-bottom: 16px; }
        .partner-landing .form-group label {
          display: block; font-size: 12px; font-weight: 500;
          color: var(--text-mid); text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 6px;
        }
        .partner-landing .form-group input,
        .partner-landing .form-group select,
        .partner-landing .form-group textarea {
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          color: var(--text-dark);
          background: var(--white);
          border: 1px solid var(--cream-dark);
          border-radius: var(--radius-sm);
          padding: 11px 14px;
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }
        .partner-landing .form-group input:focus,
        .partner-landing .form-group select:focus,
        .partner-landing .form-group textarea:focus { border-color: var(--amber); }
        .partner-landing .form-group textarea { resize: vertical; min-height: 80px; }
        .partner-landing .form-submit {
          width: 100%;
          background: var(--amber);
          color: #000;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 500;
          padding: 15px;
          border-radius: 50px;
          border: none; cursor: pointer;
          transition: background 0.2s;
          margin-top: 8px;
        }
        .partner-landing .form-submit:hover { background: var(--amber-light); }
        .partner-landing .form-note { font-size: 11px; color: var(--text-light); text-align: center; margin-top: 10px; }

        /* ── FOOTER ── */
        .partner-landing footer {
          background: var(--green-deep);
          padding: 48px 5% 32px;
          color: var(--text-light);
          border-top: 1px solid var(--cream-dark);
        }
        .partner-landing .footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; flex-wrap: wrap;
          justify-content: space-between; align-items: center;
          gap: 24px;
        }
        .partner-landing .footer-links { display: flex; gap: 28px; flex-wrap: wrap; }
        .partner-landing .footer-links a { font-size: 13px; color: var(--text-mid); text-decoration: none; }
        .partner-landing .footer-links a:hover { color: var(--text-dark); }
        .partner-landing .footer-bottom {
          max-width: 1100px; margin: 32px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 12px; color: var(--text-light);
          text-align: center;
        }

        /* ── FLOATING PHONE ── */
        .partner-landing .float-phone {
          position: fixed; bottom: 28px; right: 28px; z-index: 200;
          display: flex; align-items: center; gap: 10px;
          background: var(--amber);
          color: #000;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          padding: 13px 24px 13px 18px;
          border-radius: 50px;
          text-decoration: none;
          box-shadow: 0 8px 28px rgba(234,182,118,0.25);
          animation: fadeIn 1.5s ease both;
          transition: transform 0.2s;
        }
        .partner-landing .float-phone:hover { transform: scale(1.04); }
        .partner-landing .float-phone svg { width: 18px; height: 18px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .partner-landing .customize-inner { grid-template-columns: 1fr; gap: 40px; }
          .partner-landing .customize-options { grid-template-columns: 1fr 1fr; }
          .partner-landing .contact-inner { grid-template-columns: 1fr; gap: 48px; }
          .partner-landing .form-row { grid-template-columns: 1fr; }
          .partner-landing nav .nav-phone span { display: none; }
          .partner-landing .hero p { font-size: 15px; }
        }
        @media (max-width: 480px) {
          .partner-landing section { padding: 64px 5%; }
          .partner-landing .customize-options { grid-template-columns: 1fr; }
          .partner-landing .hero-ctas { flex-direction: column; }
          .partner-landing .btn-primary, .partner-landing .btn-secondary, .partner-landing .btn-ghost { justify-content: center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="#" className="flex items-center gap-3 decoration-transparent">
          <div className="text-xl font-bold tracking-[0.2em] text-[#eab676] font-['Montserrat'] flex items-center">MAMMUT<span className="text-white text-[15px] font-normal ml-2 tracking-normal">Drutex</span></div>
        </a>
        <a href="tel:+34XXXXXXXXX" className="nav-phone">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"/>
          </svg>
          <span>Llamar ahora</span>
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/assets/iglo-edge-header-cover.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">Mammut Drutex · Recomendado por Ferretería 88 · Cercedilla</div>
          <h1>Ventanas y puertas <em>a medida</em> para tu hogar</h1>
          <p>Mammut Drutex trae a Cercedilla lo mejor en ventanas y puertas de PVC, aluminio y madera. Más de 20 años de experiencia, instalación incluida y presupuesto sin compromiso.</p>
          <div className="hero-ctas">
            <a href="tel:+34XXXXXXXXX" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"/>
              </svg>
              Llámanos gratis
            </a>
            <a href="#presupuesto" className="btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Pedir presupuesto
            </a>
            <a href="#personaliza" className="btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              Personaliza tu ventana
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER BADGE */}
      <section style={{ padding: 0 }}>
        <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)', padding: '16px 5%' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Distribuidor oficial en Cercedilla a través de</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--cream-dark)', borderRadius: '50px', padding: '7px 18px' }}>
              <img src="/partners/cadena88-logo-grande.png" alt="Ferretería 88" style={{ height: '16px' }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dark)' }}>Ferretería 88 · Cercedilla</span>
              <span style={{ fontSize: '11px', background: 'var(--green-pale)', color: 'var(--amber)', padding: '2px 10px', borderRadius: '50px', fontWeight: 500, border: '1px solid var(--cream-dark)' }}>Partner oficial</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 0 }}>
        <div className="trust-bar">
          <div className="trust-bar-inner">
            <div className="trust-item reveal">
              <div className="trust-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <div className="trust-num">+20 años</div>
                <div className="trust-label">de experiencia local</div>
              </div>
            </div>
            <div className="trust-item reveal">
              <div className="trust-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div>
                <div className="trust-num">+500</div>
                <div className="trust-label">instalaciones realizadas</div>
              </div>
            </div>
            <div className="trust-item reveal">
              <div className="trust-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <div className="trust-num">Garantía</div>
                <div className="trust-label">en todos nuestros trabajos</div>
              </div>
            </div>
            <div className="trust-item reveal">
              <div className="trust-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="trust-num">Local</div>
                <div className="trust-label">Cercedilla y alrededores</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="section-tag">Nuestros materiales</div>
            <h2 className="section-title">Elige el material<br/>que mejor se adapta a ti</h2>
            <p className="section-subtitle">Trabajamos con los tres materiales más demandados del mercado, garantizando calidad y durabilidad en cada instalación.</p>
          </div>
          <div className="products-grid">
            <div className="product-card reveal">
              <div className="product-img product-img-pvc">
                <span className="product-badge">Más vendido</span>
              </div>
              <div className="product-body">
                <h3>PVC / uPVC</h3>
                <p>La opción más popular para el hogar. Excelente aislamiento térmico y acústico, bajo mantenimiento y una durabilidad excepcional para el clima de la Sierra.</p>
                <div className="product-tags">
                  <span className="product-tag">Gran aislamiento</span>
                  <span className="product-tag">Sin mantenimiento</span>
                  <span className="product-tag">Económico</span>
                </div>
              </div>
            </div>
            <div className="product-card reveal">
              <div className="product-img product-img-alu">
                <span className="product-badge">Diseño moderno</span>
              </div>
              <div className="product-body">
                <h3>Aluminio</h3>
                <p>Elegancia, resistencia y versatilidad. Perfiles estrechos para maximizar la entrada de luz. Ideal para viviendas de diseño contemporáneo y grandes ventanales.</p>
                <div className="product-tags">
                  <span className="product-tag">Perfiles finos</span>
                  <span className="product-tag">Alta resistencia</span>
                  <span className="product-tag">Personalizable</span>
                </div>
              </div>
            </div>
            <div className="product-card reveal">
              <div className="product-img product-img-wood">
                <span className="product-badge">Calidez natural</span>
              </div>
              <div className="product-body">
                <h3>Madera</h3>
                <p>La calidez y la tradición de un material natural que encaja perfectamente con la arquitectura serrana. Tratada para resistir la humedad y los cambios de temperatura.</p>
                <div className="product-tags">
                  <span className="product-tag">Aspecto natural</span>
                  <span className="product-tag">Aislante</span>
                  <span className="product-tag">Restaurable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section>
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="section-tag">Por qué elegirnos</div>
            <h2 className="section-title">Calidad Mammut Drutex,<br/>instalada en tu Sierra</h2>
          </div>
          <div className="why-grid">
            <div className="why-item reveal">
              <div className="why-num">01</div>
              <h4>Presupuesto sin compromiso</h4>
              <p>Te visitamos, medimos y te presentamos un presupuesto detallado y sin sorpresas. Completamente gratis y sin ninguna obligación.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-num">02</div>
              <h4>Instalación rápida y limpia</h4>
              <p>Nuestro equipo instala sin obras mayores. Recogemos todo y dejamos tu casa impecable el mismo día de la instalación.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-num">03</div>
              <h4>Ahorro en calefacción</h4>
              <p>Las ventanas adecuadas pueden reducir tu factura de calefacción hasta un 30%. En la Sierra, eso marca una gran diferencia.</p>
            </div>
            <div className="why-item reveal">
              <div className="why-num">04</div>
              <h4>Punto de venta local</h4>
              <p>Puedes vernos, tocarnos y consultarnos en Ferretería 88 en Cercedilla. Un partner local de confianza que respalda cada venta que hacemos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMIZE CTA */}
      <section className="customize" id="personaliza">
        <div className="customize-inner">
          <div className="customize-text reveal">
            <div className="section-tag">Diseño a tu medida</div>
            <h2 className="section-title">Diseña tu ventana<br/>ideal</h2>
            <p className="section-subtitle" style={{ color: 'var(--text-light)', maxWidth: 420 }}>Elige el material, el color, el tipo de apertura y los acabados. Te mostramos cómo quedaría antes de fabricarla.</p>
            <div className="customize-cta">
              <a href="/configurator" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
                Empezar a personalizar
              </a>
            </div>
          </div>
          <div className="customize-options reveal">
            <div className="customize-opt">
              <div className="customize-opt-icon">🪟</div>
              <h5>Tipo de apertura</h5>
              <p>Abatible, corredera, oscilobatiente, fija...</p>
            </div>
            <div className="customize-opt">
              <div className="customize-opt-icon">🎨</div>
              <h5>Color y acabado</h5>
              <p>Más de 200 colores disponibles en RAL y madera.</p>
            </div>
            <div className="customize-opt">
              <div className="customize-opt-icon">🌡️</div>
              <h5>Vidrio y aislamiento</h5>
              <p>Doble o triple acristalamiento con cámara.</p>
            </div>
            <div className="customize-opt">
              <div className="customize-opt-icon">🔒</div>
              <h5>Seguridad</h5>
              <p>Persianas integradas, anti-robo, cierre multipunto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-inner">
          <div className="section-header reveal">
            <div className="section-tag">Opiniones</div>
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
            <p className="section-subtitle">Más de 500 familias en la Sierra ya confían en nosotros.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Cambiamos todas las ventanas del chalet y la diferencia en temperatura fue inmediata. La instalación fue rapidísima y dejaron la casa perfecta. Muy recomendables.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MG</div>
                <div>
                  <div className="testimonial-name">María García</div>
                  <div className="testimonial-location">Cercedilla</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Trabajo impecable, instalación rápida y el presupuesto fue exactamente lo que nos dijeron. Sin sorpresas. Un lujo tener un servicio así tan cerca de casa.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">CR</div>
                <div>
                  <div className="testimonial-name">Carlos Ruiz</div>
                  <div className="testimonial-location">Los Molinos</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Pedí presupuesto por la tarde y al día siguiente ya tenían a alguien midiendo. En menos de dos semanas teníamos todas las ventanas nuevas. Eficiencia total.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AF</div>
                <div>
                  <div className="testimonial-name">Ana Fernández</div>
                  <div className="testimonial-location">Guadarrama</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="presupuesto">
        <div className="contact-inner">
          <div className="contact-left reveal">
            <div className="section-tag">Contacto</div>
            <h2 className="section-title">Habla con nosotros<br/>hoy mismo</h2>
            <p className="section-subtitle" style={{ marginBottom: 40 }}>Puedes llamarnos directamente, pedir presupuesto online o visitar a nuestro partner <strong>Ferretería 88</strong> en Cercedilla para ver muestras en persona.</p>

            <div className="contact-item">
              <div className="contact-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"/>
                </svg>
              </div>
              <div>
                <div className="contact-item-label">Teléfono</div>
                <a href="tel:+34XXXXXXXXX" className="contact-item-value">+34 XXX XXX XXX</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="contact-item-label">Dónde estamos</div>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="contact-item-value">Ferretería 88 · Cercedilla, Madrid (ver muestras)</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <div className="contact-item-label">Horario</div>
                <span className="contact-item-value" style={{ cursor: 'default' }}>Lun–Vie: 9:00–19:00 · Sáb: 9:00–14:00</span>
              </div>
            </div>
          </div>

          <div className="quote-form reveal">
            <h3>Pide tu presupuesto<br/>sin compromiso</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" placeholder="Tu nombre" id="form-name" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" placeholder="Tu teléfono" />
              </div>
            </div>
            <div className="form-group">
              <label>Material preferido</label>
              <select>
                <option value="">— Selecciona —</option>
                <option>PVC / uPVC</option>
                <option>Aluminio</option>
                <option>Madera</option>
                <option>No lo sé todavía</option>
              </select>
            </div>
            <div className="form-group">
              <label>¿Cuántas ventanas o puertas?</label>
              <select>
                <option value="">— Selecciona —</option>
                <option>1–3 unidades</option>
                <option>4–8 unidades</option>
                <option>9 o más</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mensaje (opcional)</label>
              <textarea placeholder="Cuéntanos más sobre tu proyecto..."></textarea>
            </div>
            <button className="form-submit" onClick={handleSubmit}>Solicitar presupuesto gratis →</button>
            <p className="form-note">Sin compromiso. Te respondemos en menos de 24 horas.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="text-xl font-bold tracking-[0.2em] text-[#eab676] font-['Montserrat'] flex items-center">MAMMUT<span className="text-white text-[15px] font-normal ml-2 tracking-normal">Drutex</span></div>
            <div className="text-[13px] mt-2 text-gray-400">Ventanas y puertas · Distribuidor oficial en Cercedilla vía Ferretería 88</div>
          </div>
          <div className="footer-links">
            <a href="#presupuesto">Presupuesto</a>
            <a href="#personaliza">Personalizar</a>
            <a href="tel:+34XXXXXXXXX">Teléfono</a>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer">Cómo llegar</a>
          </div>
        </div>
        <div className="footer-bottom">© 2025 Mammut Drutex · Distribuidor oficial en Cercedilla, Madrid · Partner: Ferretería 88 · Todos los derechos reservados</div>
      </footer>

      {/* FLOATING PHONE BUTTON */}
      <a href="tel:+34XXXXXXXXX" className="float-phone">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"/>
        </svg>
        Llamar ahora
      </a>
    </div>
  );
}
