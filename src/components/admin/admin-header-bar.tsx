"use client";

import { useState } from "react";
import { Search, Bell, X, Check, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchAdmin, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead, deleteAllNotifications } from "@/actions/admin-actions";

export function AdminHeaderBar({ notifications: initialNotifications }: { notifications: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const { events } = await searchAdmin(query);
      setSearchResults(events);
    } else {
      setSearchResults([]);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="flex items-center gap-4 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Rechercher..." 
          className="pl-10 w-64" 
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border shadow-lg rounded-md z-50 p-2">
            {searchResults.map((result) => (
              <div key={result.id} className="p-2 hover:bg-gray-100 cursor-pointer">{result.title}</div>
            ))}
          </div>
        )}
      </div>
      
      <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 relative">
        <Bell size={20} className="text-lifac-navy-900" />
        {notifications.filter(n => !n.isRead).length > 0 && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full" />
        )}
      </button>

      {isNotifOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border shadow-lg rounded-md z-50 p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Notifications</h3>
            <div className="space-x-1">
                <Button size="sm" variant="ghost" onClick={markAllNotificationsAsRead}>Tout lu</Button>
                <Button size="sm" variant="ghost" onClick={deleteAllNotifications}>Tout supprimer</Button>
            </div>
          </div>
          {notifications.map(n => (
            <div key={n.id} className={`p-2 border-b flex justify-between items-center ${n.isRead ? 'opacity-50' : ''}`}>
              <div>
                <p className="font-bold">{n.title}</p>
                <p className="text-sm">{n.message}</p>
              </div>
              <div className="flex gap-1">
                {!n.isRead && <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(n.id)}><Check size={14} /></Button>}
                <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
