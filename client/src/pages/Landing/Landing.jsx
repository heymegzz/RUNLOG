import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Zap, Shield, Globe, Clock } from 'lucide-react';
import './landing.css';

/* ═══════════════════════════════════════════════════════════
   DATA & CONFIG
   ═══════════════════════════════════════════════════════════ */
const LOGS = [
  { name: 'send-digest', status: 'ok', dur: '142ms' },
  { name: 'sync-inventory', status: 'ok', dur: '89ms' },
  { name: 'process-payments', status: 'retry', dur: 'timeout' },
  { name: 'process-payments', status: 'ok', dur: '312ms' },
  { name: 'purge-cache', status: 'ok', dur: '44ms' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const HeroWidget = () => {
  const [logs, setLogs] = useState([]);
  const idx = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      const nextLog = { ...LOGS[idx.current % LOGS.length], id: Date.now() };
      setLogs(prev => [nextLog, ...prev].slice(0, 5));
      idx.current++;
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div 
      className="ln-hero-widget-wrapper"
      initial={{ rotateX: 20, y: 100, opacity: 0 }}
      animate={{ rotateX: 0, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.2 }}
    >
      <div className="ln-widget-mac">
        <div className="ln-widget-mac-header">
          <div className="ln-widget-mac-dot r" />
          <div className="ln-widget-mac-dot y" />
          <div className="ln-widget-mac-dot g" />
          <div className="ln-widget-mac-title">runlog-dashboard — bash — 80x24</div>
        </div>
        <div className="ln-widget-mac-body">
          <div className="ln-widget-sidebar">
            <div className="ln-widget-nav">
              <div className="ln-widget-nav-item active"><Activity size={16} /> Overview</div>
              <div className="ln-widget-nav-item"><Terminal size={16} /> Executions</div>
              <div className="ln-widget-nav-item"><Zap size={16} /> Triggers</div>
            </div>
          </div>
          <div className="ln-widget-main">
            <div className="ln-widget-stats">
              <div className="ln-widget-stat-box">
                <div className="ln-widget-stat-val">12,492</div>
                <div className="ln-widget-stat-label">Runs Today</div>
              </div>
              <div className="ln-widget-stat-box">
                <div className="ln-widget-stat-val accent">99.8%</div>
                <div className="ln-widget-stat-label">Success Rate</div>
              </div>
              <div className="ln-widget-stat-box">
                <div className="ln-widget-stat-val">143ms</div>
                <div className="ln-widget-stat-label">Avg Duration</div>
              </div>
            </div>
            
            <table className="ln-widget-table">
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(0,229,89,0.1)' }}
                      animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,229,89,0)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <td>
                        <div className="ln-job-name">
                          <span className={`ln-job-dot ${log.status === 'ok' ? 'g' : 'o'}`} />
                          {log.name}
                        </div>
                      </td>
                      <td><span className={`ln-badge ${log.status}`}>{log.status === 'ok' ? '200 OK' : 'RETRYING'}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.dur}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="landing-page">
      <div className="ln-noise" />

      {/* NAVBAR */}
      <nav className="ln-nav">
        <Link to="/" className="ln-nav-logo">
          <div className="ln-nav-logo-mark" />
          <span className="ln-nav-logo-text">runlog</span>
        </Link>
        <div className="ln-nav-links">
          <a href="#features" className="ln-nav-link">Features</a>
          <a href="#pricing" className="ln-nav-link">Pricing</a>
          <Link to="/login" className="ln-nav-link">Login</Link>
          <Link to="/register" className="ln-btn primary">Start Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="ln-hero">
        <div className="ln-hero-container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="ln-hero-badge"
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10100f' }} />
            System Operational
          </motion.div>
          
          <motion.h1 
            className="ln-hero-headline"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Who's watching your <br />
            <span className="highlight">background jobs?</span>
          </motion.h1>
          
          <motion.p 
            className="ln-hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Runlog is the ops dashboard for everything your backend does automatically. 
            Schedule jobs, handle retries, and get real-time alerts. Stop reading log files at 2am.
          </motion.p>
          
          <motion.div 
            className="ln-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/register" className="ln-btn primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Deploy your first job</Link>
            <a href="#features" className="ln-btn" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>See how it works</a>
          </motion.div>
        </div>

        <HeroWidget />
      </section>

      {/* MARQUEE */}
      <div className="ln-marquee">
        <div className="ln-marquee-inner">
          {Array(8).fill("Built for Engineers").map((text, i) => (
            <div key={i} className="ln-marquee-item">{text}</div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="ln-section">
        <div className="ln-section-label">Features</div>
        <h2 className="ln-section-title">Everything a production <br/>scheduler needs.</h2>
        <p className="ln-section-p">
          We built Runlog because we were tired of patching together Redis queues, 
          cron syntax, and Slack webhooks just to run a daily database backup.
        </p>

        <div className="ln-feature-grid">
          {[
            { icon: <Clock size={28} />, title: "Retry Engine", desc: "Exponential backoff with configurable attempts. Failures recover themselves automatically." },
            { icon: <Activity size={28} />, title: "Live Feed", desc: "WebSocket-powered dashboard. Every job result hits your screen in under 200ms." },
            { icon: <Zap size={28} />, title: "Failure Alerts", desc: "Native Slack, PagerDuty, and Email webhooks on final failure. Know before your users do." },
            { icon: <Shield size={28} />, title: "Team RBAC", desc: "Owner, Admin, and Developer roles. One workspace, exact access for every teammate.", v: true },
            { icon: <Terminal size={28} />, title: "API Key Auth", desc: "Trigger jobs programmatically. Wire Runlog directly into your CI pipelines and custom scripts." },
            { icon: <Globe size={28} />, title: "Full History", desc: "Every execution logged. Paginate, filter by status, and search by name. Stored securely." }
          ].map((f, i) => (
            <motion.div 
              key={i}
              className={`ln-fcard ${f.v ? 'v' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="ln-fcard-icon">{f.icon}</div>
              <div className="ln-fcard-title">{f.title}</div>
              <div className="ln-fcard-desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="ln-proof">
        <motion.h2 
          className="ln-proof-title"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trusted by teams who <br/>ship fast.
        </motion.h2>
        <div className="ln-testimonial-grid">
          {[
            { quote: "We had 14 different cron setups across 4 services. Runlog unified them in a weekend. Now one dashboard shows us everything.", author: "Staff Engineer · Series B Fintech" },
            { quote: "The retry logic alone caught 3 incidents before they hit production. The Slack alerts are the first thing we open in the morning.", author: "Backend Lead · DevTools Startup" },
            { quote: "We wire every background task through Runlog now. It's the ops layer we always wished someone would just build.", author: "CTO · 12-person SaaS" }
          ].map((t, i) => (
            <motion.div 
              key={i} className="ln-testi"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="ln-testi-text">"{t.quote}"</div>
              <div className="ln-testi-author">{t.author}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BIG FINAL CTA */}
      <section className="ln-cta-section">
        <motion.h2 
          className="ln-cta-title"
          style={{ y }}
        >
          Ship your <span className="skew">first job</span><br/> in 5 minutes.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/register" className="ln-btn primary" style={{ fontSize: '1.25rem', padding: '1.2rem 3rem' }}>Get Started Free</Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-footer-left">
            <div className="ln-nav-logo-mark" style={{ width: 20, height: 20 }} />
            <span className="ln-footer-brand">runlog</span>
          </div>
          <div className="ln-footer-links">
            <a href="#">Product</a>
            <a href="#">Documentation</a>
            <a href="#">Pricing</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
