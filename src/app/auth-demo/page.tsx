import { AuthDemo } from "@/components/ui/AuthDemo";

export default function AuthDemoPage() {
  return (
    <div className="min-h-screen bg-[#1E293B] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Demo</h1>
        <AuthDemo />
      </div>
    </div>
  );
}