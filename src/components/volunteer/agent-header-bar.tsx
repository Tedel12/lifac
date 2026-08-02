"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Inbox } from "lucide-react";
import { markMyNotificationAsRead, deleteMyNotification, markAllMyNotificationsAsRead } from "@/actions/volunteer-actions";

const TYPE_DOT: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function AgentHeaderBar({ notifications: initialNotifications }: { notifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markMyNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleDelete = async (id: string) => {
    await deleteMyNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await markAllMyNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 relative transition-colors"
      >
        <Bell size={20} className="text-lifac-navy-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-lifac-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-lifac-red-600" />
              <h3 className="font-bold text-sm text-lifac-navy-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-lifac-red-100 text-lifac-red-700">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Tout marquer comme lu"
                className="p-1.5 rounded-lg text-gray-400 hover:text-lifac-navy-900 hover:bg-gray-100 transition-colors"
              >
                <CheckCheck size={15} />
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors ${!n.isRead ? "bg-lifac-red-50/30" : ""}`}
                >
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[n.type] ?? "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? "font-bold text-lifac-navy-900" : "font-medium text-lifac-navy-700"}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button onClick={() => handleMarkAsRead(n.id)} title="Marquer comme lu" className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Check size={13} className="text-gray-400" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 size={13} className="text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
