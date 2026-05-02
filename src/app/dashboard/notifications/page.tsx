import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[70vh] items-center justify-center text-center p-8 bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-blue-900/5 rounded-3xl">
      <div className="relative w-20 h-20 bg-red-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Bell className="w-10 h-10 text-red-500" />
        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">3</div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
      <p className="text-gray-500 max-w-md leading-relaxed text-lg">
        When a department updates your complaint or a warden requests information, it will appear here. The notification feed is being built.
      </p>
    </div>
  );
}
