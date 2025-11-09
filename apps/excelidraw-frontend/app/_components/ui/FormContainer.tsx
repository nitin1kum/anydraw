import React, { FormEvent, ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const FormContainer: React.FC<FormContainerProps> = ({ title, subtitle, children, onSubmit }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">{subtitle}</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                {children}
            </form>
        </div>
    </div>
);

export default FormContainer;
