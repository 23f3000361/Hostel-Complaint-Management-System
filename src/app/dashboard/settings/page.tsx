import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[70vh] items-center justify-center text-center p-8 bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-blue-900/5 rounded-3xl">
      <div className="w-20 h-20 bg-gray-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Settings className="w-10 h-10 text-gray-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
      <p className="text-gray-500 max-w-md leading-relaxed text-lg">
        Manage your profile, change your password, and adjust notification preferences. This module will be enabled in the next update.
      </p>
    </div>
  );
}
