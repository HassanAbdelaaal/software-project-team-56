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
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Investors
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
                  Safety Information
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Cancellation Options
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  COVID-19 Response
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-icon">❯</span>
                  Give Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <div className="footer-divider"></div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>123 Event Plaza, Cairo, Egypt</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+20 123 456 7890</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>info@eventticket.com</span>
              </div>
              <div className="social-links">
                <a href="#" className="social-link facebook">f</a>
                <a href="#" className="social-link twitter">t</a>
                <a href="#" className="social-link instagram">📷</a>
                <a href="#" className="social-link linkedin">in</a>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section">
            <h3 className="footer-title">Newsletter</h3>
            <div className="footer-divider"></div>
            <p className="newsletter-text">
              Subscribe for the latest events and special offers.
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
              <a href="#" className="bottom-link">Terms of Service</a>
              <a href="#" className="bottom-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;