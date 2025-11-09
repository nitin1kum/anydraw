"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

// Extend the props with all standard HTML Button attributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "outline" | "secondary";
  size: "lg" | "sm" | "md";
  children: ReactNode;
  // className is already part of ButtonHTMLAttributes
}

export  const Button = ({ size, variant, className, children, ...props }: ButtonProps) => {
  return (
    <button
      // Combine the default classes with any custom classes passed in
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:opacity-50 disabled:pointer-events-none
        ${variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-600/90" : variant === "secondary" ? "bg-gray-200 text-gray-800 hover:bg-gray-200/80" : "border border-input bg-transparent shadow-sm hover:bg-gray-100"}
        ${size === "lg" ? "h-11 px-8" : size === "md" ? "h-10 px-4 py-2" : "h-9 px-3"}
        ${className}
      `}
      // Spread the rest of the props (like type, disabled, onClick) onto the button
      {...props}
    >
      {children}
    </button>
  );
};

