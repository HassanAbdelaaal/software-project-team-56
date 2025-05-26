import React, { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Us Section */}
          <div className="footer-section">
            <h3 className="footer-title">About Us</h3>
            <div className="footer-divider"></div>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  About
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <div className="footer-divider"></div>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section">
            <h3 className="footer-title">Newsletter</h3>
            <div className="footer-divider"></div>
            <p className="newsletter-text">
              Subscribe for the latest events and offers.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe ✈️
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Event Ticketing System. All rights reserved.
            </p>
            <div className="bottom-links">
              <a href="#" className="bottom-link">Terms</a>
              <a href="#" className="bottom-link">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;