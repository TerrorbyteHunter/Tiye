import React from 'react';
import { notifications as notificationsApi } from '../lib/api';

const typeIcons: Record<string, JSX.Element> = {
  info: <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" title="Info" />,
  reminder: <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2" title="Reminder" />,
  alert: <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" title="Alert" />,
  promo: <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" title="Promo" />,
};

const NotificationsPanel: React.FC<{ 
  open: boolean; 
  onClose: () => void; 
  notifications: any[];
  onNotificationClick?: (notification: any) => void;
  onNotificationsUpdate?: () => void;
}> = ({ open, onClose, notifications, onNotificationClick, onNotificationsUpdate }) => {
  
  const handleNotificationClick = async (notification: any) => {
    console.log('Notification clicked:', notification);
    try {
      // Mark notification as read
      await notificationsApi.markAsRead(notification.id);
      console.log('Successfully marked notification as read');
      
      // Call the callback if provided
      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50" onClick={onClose} />
      )}
      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ maxWidth: 360 }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-bold">Notifications</h2>
          <div className="flex items-center space-x-2">
            {Array.isArray(notifications) && notifications.filter(n => n.status !== 'read').length > 0 && (
              <button 
                onClick={async () => {
                  try {
                    await notificationsApi.markAllAsRead();
                    // Refresh the notifications list in parent
                    if (onNotificationsUpdate) onNotificationsUpdate();
                  } catch (error) {
                    console.error('Failed to mark all notifications as read:', error);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
          {Array.isArray(notifications) && notifications.length === 0 ? (
            <div className="text-gray-500 text-center mt-8">No notifications</div>
          ) : (
            Array.isArray(notifications) && notifications.map((n) => (
              <div 
                key={n.id} 
                className={`rounded-lg p-3 shadow-sm border flex items-start gap-2 cursor-pointer transition-colors ${
                  n.status === 'read' ? 'bg-gray-50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
                onClick={(e) => {
                  console.log('Notification div clicked:', n.id);
                  e.stopPropagation();
                  handleNotificationClick(n);
                }}
              >
                {typeIcons[n.type] || typeIcons.info}
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{n.title}</div>
                  <div className="text-gray-700 text-sm mb-1">{n.message}</div>
                  <div className="text-xs text-gray-400">{new Date(n.timestamp || n.created_at).toLocaleString('en-GB')}</div>
                </div>
                {n.status !== 'read' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel; 