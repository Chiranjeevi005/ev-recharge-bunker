import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default async function ClientDashboard() {
  const session = await auth();
  
  // If not authenticated or not a client, redirect to login
  if (!session || session.user?.role !== "client") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#1E293B] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Client Dashboard</h1>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              Logout
            </Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gray-800 rounded-lg p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Find Stations</h2>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Locate nearby charging stations
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Search Stations
            </Button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Book Charging</h2>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Reserve a charging slot at your preferred station
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Book Now
            </Button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Payment History</h2>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              View your past transactions and payments
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              View History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
