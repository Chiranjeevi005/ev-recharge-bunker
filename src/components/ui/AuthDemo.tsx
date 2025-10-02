"use client";

import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useLoader } from "@/lib/LoaderContext"; // Added import

export function AuthDemo() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader(); // Added loader context

  if (loading) {
    showLoader("Loading authentication..."); // Show loader
    return null; // Return null since we're using the global loader
  }

  const handleLogin = () => {
    showLoader("Redirecting to login..."); // Show loader
    router.push("/login");
  };

  const handleLogout = () => {
    showLoader("Logging out..."); // Show loader
    logout();
    hideLoader(); // Hide loader
  };

  return (
    <div className="p-5 sm:p-6 bg-[#1E293B] border border-[#475569] rounded-xl sm:rounded-2xl backdrop-blur-xl">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#F1F5F9]">Authentication Demo</h2>
      
      {user ? (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-[#CBD5E1] text-sm sm:text-base">Welcome, {user.name || user.email}!</p>
          <p className="text-[#94A3B8] text-sm sm:text-base">Role: <span className="text-[#10B981]">{user.role}</span></p>
          <Button 
            onClick={handleLogout} 
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-[#94A3B8] text-sm sm:text-base">You are not logged in.</p>
          <Button 
            onClick={handleLogin}
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
          >
            Login
          </Button>
        </div>
      )}
    </div>
  );
}