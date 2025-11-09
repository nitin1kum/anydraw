"use client";
import { Loader2, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { JoinRoomModal } from "@/components/joinroomModel";
import Image from "next/image";

interface Room {
  id: number;
  slug: string;
  adminId: string;
  createdAt: string;
}
interface Userdata {
  id: string;
  email: string;
  name: string;
}
const HTTP_BACKEND_URL =
  process.env.NEXT_PUBLIC_HTTP_BACKEND_URL || "http://localhost:3001";

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userdata, setUserdata] = useState<Userdata | null>(null);
  const [error, setError] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isProfileOpen, setisProfileOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const router = useRouter();
  const loading = loadingRooms || loadingUser;

  useEffect(() => {
    const controller = new AbortController();
    const fetchRooms = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/signin");
        return;
      }
      try {
        const response = await axios.get(`${HTTP_BACKEND_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        // debug
        console.log("Rooms response:", response.data);
        setRooms(response.data.rooms ?? []);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError("Failed to fetch rooms. Please try again.");
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/signin");
        setLoadingUser(false);
        return;
      }
      try {
        const response = await axios.get(`${HTTP_BACKEND_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        // **Use backend's `user` key** (not `userdata`)
        console.log("User response:", response.data);
        setUserdata(response.data.user ?? null);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError("Failed to fetch userdata. Please try again.");
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    return () => controller.abort();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-300 via-blue-100 to-blue-400 text-black">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-blue-100 to-blue-400 p-8 text-slate-700">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 text-white">
          <nav className="p-0">
            <Image src="/logo.svg" alt="App Logo" width={240} height={80} priority />
          </nav>

          <button
            onClick={() => setisProfileOpen((prev) => !prev)}
            className="hover:bg-blue-600 flex items-center gap-2 bg-white text-blue-700 hover:text-white font-bold py-2 px-4 rounded-full transition-colors"
          >
            <UserIcon className="w-5 h-5" /> Profile
          </button>
        </div>

        <div className="flex justify-between items-center mb-10 text-white">
          <h1 className="text-4xl font-bold text-blue-900">Dashboard</h1>
        </div>

        {error && (
          <p className="text-red-600 p-3 rounded-md mb-6">
            {error}
          </p>
        )}

        {/* Create & Join Buttons */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-600 text-white hover:bg-blue-600/90 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-4">Create a New Room</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-blue-50 hover:bg-white text-blue-600 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Open Create Room Modal
            </button>
          </div>

          <div className="bg-blue-600 text-white hover:bg-blue-600/90 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-4">Join an Existing Room</h2>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full bg-blue-50 hover:bg-white text-blue-600 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Open Join Room Modal
            </button>
          </div>
        </div>

        {/* Room List */}
        <div>
          <h2 className="text-3xl font-semibold mb-6 text-blue-900">Your Rooms</h2>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-200 hover:bg-gray-300/90 text-color9  p-6 rounded-lg shadow-lg flex flex-col justify-between"
                >
                  <div className="mb-4">
                    <span className="text-xl font-medium block">Room: {room.slug}</span>
                    <span className="text-sm block">AdminId: {room.adminId}</span>
                    <span className="text-sm block">Room id: {room.id}</span>
                    <span className="text-sm block">Created at: {new Date(room.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push(`/canvas/${room.id}`)}
                      className="bg-blue-50 hover:bg-white text-blue-600 font-bold py-2 px-5 rounded-lg transition-colors"
                    >
                      Enter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">You haven't joined or created any rooms yet.</p>
          )}
        </div>
      </div>

      {/* Profile Sidebar + Overlay */}
      {isProfileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setisProfileOpen(false)}
            aria-hidden="true"
          />
          <aside
              className={`fixed right-0 top-0 h-full w-80 z-50 rounded-sm transform bg-white p-6 text-slate-700 shadow-xl transition-transform duration-300 ${
                isProfileOpen ? "translate-x-0" : "translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <button
                    onClick={() => setisProfileOpen(false)}
                    className="p-1 w-8 h-8 rounded-full hover:bg-slate-300"
                    aria-label="Close profile"
                  >
                    ✕
                  </button>
                </div>

                {/* Profile content */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {userdata ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{userdata.name}</div>
                          <div className="text-xs text-slate-500">{userdata.email}</div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs text-slate-700">User ID</p>
                        <p className="text-sm text-slate-800 break-all">{userdata.id}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading user...</span>
                    </div>
                  )}
                </div>

                {/* Logout button fixed at bottom */}
                <div className="pt-4 mt-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 rounded-full hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </aside>

        </>
      )}

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={() => {
          window.location.reload();
        }}
      />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
