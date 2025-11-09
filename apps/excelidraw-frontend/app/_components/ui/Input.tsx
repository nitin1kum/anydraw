import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputId: string;
}

const Input: React.FC<InputProps> = ({ label, inputId, ...props }) => (
  <div className="w-full">
    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={inputId}
      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      {...props}
    />
  </div>
);

export default Input;
