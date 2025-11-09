'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinRoomModal = ({ isOpen, onClose }: JoinRoomModalProps) => {
  const router = useRouter();
  const [roomSlug, setRoomSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomSlug.trim()) {
      setError("Please enter a room name.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    try {
      // --- STEP 1: VALIDATE ROOM EXISTENCE ---
      // We use your existing GET /room/:slug endpoint for this check.
      const response=await axios.get(`http://localhost:3001/room/${roomSlug.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomId=response.data.room.id;
      console.log("Room found with ID:", roomId);
      // --- STEP 2: REDIRECT TO THE ROOM IF IT EXISTS ---
      // If the room exists, navigate to it.
      router.push(`/canvas/${roomId}`);
      onClose(); // Close the modal

    } catch (err) {
      // --- STEP 3: SHOW ERROR DIRECTLY IN THE MODAL ---
      // The backend will likely return a 404 if the room doesn't exist
      if (axios.isAxiosError(err) && err.response?.status === 404 || 204) {
          setError("Room not found. Please check the name and try again.");
      } else {
          setError("An unexpected error occurred. Please try again.");
      }
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-blue-50 border border-slate-700 rounded-lg p-6 w-full max-w-md shadow-xl text-blue-900">
        <h2 className="text-2xl font-bold mb-4">Join an Existing Room</h2>
        <p className="text-blue-700 mb-6">Enter the exact name (slug) of the room you want to join.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomSlug}
            onChange={(e) => {
              setRoomSlug(e.target.value);
              setError(null);
            }}
            placeholder="e.g., marketing-brainstorm"
            className="w-full p-3 bg-white border border-blue-600 rounded-md mb-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-500 font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-500 font-semibold transition-colors disabled:bg-blue-400/50">
              {isLoading ? 'Verifying...' : 'Go to Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

