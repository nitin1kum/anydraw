'use client';

import { useState, Fragment } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Transition, Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomCreated: () => void; // Callback to notify parent of creation
}

export const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) => {
    const router = useRouter();
    const [roomName, setRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use environment variable for API URL for better maintainability
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim()) {
            setError("Room name cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("Authentication error. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            const response=await axios.post(
                `${API_BASE_URL}/room`,
                { name: roomName.trim() },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            const roomId=response.data.roomId;
            console.log("Room created with ID:", roomId);
            onRoomCreated();
            onClose(); // Close the modal on success
            // Redirect the user to the newly created room
            router.push(`/canvas/${roomId}`);
        } catch (err) {
            console.error("Error creating room:", err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 411) {
                    setError("A room with this name already exists.");
                } else if (err.response?.status === 403) {
                    setError("Authentication failed. Your session may have expired. Please log in again.");
                } else {
                    setError("Failed to create room. Please try again later.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // This function ensures the modal's state is reset when it's closed
    const handleClose = () => {
        setRoomName('');
        setError(null);
        setIsLoading(false);
        onClose();
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Modal backdrop */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>
                
                {/* Modal content panel */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-blue-50 border border-blue-700 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-blue-700 flex justify-between items-center">
                                    Create a New Room
                                    <button onClick={handleClose} className="p-1 rounded-full text-blue-700 hover:bg-blue-200 transition-colors">
                                        <X size={20} />
                                    </button>
                                </Dialog.Title>
                                <div className="mt-4">
                                    <form onSubmit={handleSubmit}>
                                        <p className="text-sm text-blue-600 mb-4">Give your new collaborative space a name. This will be its unique URL.</p>
                                        <input 
                                            type="text" 
                                            value={roomName} 
                                            onChange={(e) => setRoomName(e.target.value)} 
                                            placeholder="e.g., q4-project-kickoff" 
                                            className="w-full p-3 bg-white border border-blue-600 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            autoFocus 
                                        />
                                        
                                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                                        <div className="mt-6 flex justify-end gap-4">
                                            <button type="button" onClick={handleClose} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 font-semibold transition-colors">Cancel</button>
                                            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
                                                {isLoading ? 'Creating...' : 'Create & Join'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};