import React from 'react';

interface AlertProps {
  text: string;
}

const Alert: React.FC<AlertProps> = ({ text }) => (
  <div className="fixed top-5 font-semibold right-5 bg-white text-blue-600 py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
    {text}
  </div>
);

export default Alert;
