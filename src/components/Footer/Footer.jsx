import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} CodeAnimation. All rights reserved.</p>
    </footer>
  );
};

export default Footer;