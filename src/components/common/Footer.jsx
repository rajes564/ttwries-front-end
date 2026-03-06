import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #0f4a1e, #1a6b2e)' }} className="text-white mt-6">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-white/10">
        <div>
          <h4 className="text-yellow-400 font-black uppercase tracking-wide text-sm mb-3 pb-2 border-b border-yellow-400/30">About TTWREIS</h4>
          <p className="text-white/75 text-xs leading-relaxed font-medium">
            Telangana Tribal Welfare Residential Educational Institutions Society (TTWREIS) provides quality residential education to tribal students across Telangana under the Government of Telangana, Tribal Welfare Department.
          </p>
        </div>
        <div>
          <h4 className="text-yellow-400 font-black uppercase tracking-wide text-sm mb-3 pb-2 border-b border-yellow-400/30">Important Links</h4>
          <ul className="space-y-1.5">
            {['Admission Notification', 'Application Guidelines', 'Reservation Policy', 'Exam Center List', 'Fee Structure', 'FAQ', 'RTI'].map(l => (
              <li key={l}>
                <a href="#" className="text-white/75 text-xs font-semibold hover:text-yellow-300 transition-colors flex items-center gap-1">
                  <span className="text-saffron-400">›</span> {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-yellow-400 font-black uppercase tracking-wide text-sm mb-3 pb-2 border-b border-yellow-400/30">Contact Us</h4>
          <div className="text-white/75 text-xs leading-relaxed font-medium space-y-1">
            <p className="text-yellow-300 font-bold">TTWREIS Head Office</p>
            <p>Masab Tank, Hyderabad – 500028</p>
            <p>Telangana, India</p>
            <p className="mt-2">📞 040-23450678</p>
            <p>📧 admissions@ttwreis.telangana.gov.in</p>
            <p>🌐 www.ttwreis.telangana.gov.in</p>
            <p className="mt-2 text-yellow-300">Helpdesk: Mon–Sat, 9AM–6PM</p>
          </div>
        </div>
      </div>
      <div className="text-center py-3 bg-black/25 text-white/50 text-xs font-medium">
        © 2025 <strong className="text-yellow-400">TTWREIS – Government of Telangana</strong>. All Rights Reserved. |
        Designed & Developed by TTWREIS IT Cell |
        Best viewed in Chrome / Firefox / Edge
      </div>
    </footer>
  );
}
