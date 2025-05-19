// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
      <p>&copy; {currentYear} SkinCare Admin Dashboard. All rights reserved.</p>
    </footer>
  );
};

export default Footer;