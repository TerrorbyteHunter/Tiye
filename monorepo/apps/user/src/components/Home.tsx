import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './shared/LoadingSpinner';
import NotificationsPanel from './NotificationsPanel';
import { notifications as notificationsApi } from '../lib/api';
import { FaBus, FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaUser, FaBell, FaBars, FaCheckSquare, FaCog, FaInfoCircle } from 'react-icons/fa';
import { LogOut, Menu } from 'lucide-react';
import { useResponsive, useIsDesktop } from '../hooks/use-responsive';
import { User2, Ticket, Bell } from 'lucide-react';

const zambiaCities = [
  'Lusaka',
  'Ndola',
  'Kitwe',
  'Kabwe',
  'Chingola',
  'Mufulira',
  'Livingstone',
  'Kasama',
  'Chipata',
  'Solwezi',
  'Mongu',
  'Kafue',
  'Choma',
  'Kapiri Mposhi',
  'Mazabuka'
].sort();

// Helper to format time as HH:mm
const formatTime = (time: string | null | undefined) => {
  if (!time) return '';
  const date = new Date(time);
  return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [minDate, setMinDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const { isMobile } = useResponsive();
  console.log('HOME DEBUG:', { isMobile, isDesktop });

  // Get user info from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const userName = user.name || user.fullName || 'User';

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const response = await notificationsApi.getAll();
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleFromCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromCity(value);
    if (value.length > 0) {
      const filtered = Array.isArray(zambiaCities) ? zambiaCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ) : [];
      setFromSuggestions(filtered);
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions(zambiaCities);
      setShowFromSuggestions(true);
    }
  };

  const handleToCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToCity(value);
    if (value.length > 0) {
      const filtered = Array.isArray(zambiaCities) ? zambiaCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ) : [];
      setToSuggestions(filtered);
      setShowToSuggestions(true);
    } else {
      setToSuggestions(zambiaCities);
      setShowToSuggestions(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Format the date for the URL
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
    navigate(`/search?from=${fromCity}&to=${toCity}&date=${formattedDate}`);
  };

  // Initialize suggestions with all cities
  useEffect(() => {
    setFromSuggestions(zambiaCities);
    setToSuggestions(zambiaCities);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.city-input-container')) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Refresh notifications when the panel is opened (but don't mark all as read automatically)
  useEffect(() => {
    if (showNotifications) {
      (async () => {
        try {
          const response = await notificationsApi.getAll();
          setNotifications(response.data);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      })();
    }
  }, [showNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinDate(new Date().toLocaleDateString('en-CA'));
    }, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Handler to refresh notifications after marking one as read
  const handleNotificationClick = async (notification: any) => {
    console.log('Home: Notification clicked:', notification);
    try {
      await notificationsApi.markAsRead(notification.id);
      console.log('Home: Successfully marked notification as read');
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Desktop-only top-right buttons
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => n.status !== 'read').length : 0;
  const TopRightButtons = () => (
    <div className="hidden lg:flex fixed top-8 right-8 z-30 gap-3">
      <button
        className="bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 text-base"
        onClick={() => navigate('/profile')}
      >
        <User2 className="w-5 h-5" /> Profile
      </button>
      <button
        className="bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-green-100 text-green-700 font-semibold flex items-center gap-2 text-base"
        onClick={() => navigate('/my-bookings')}
      >
        <Ticket className="w-5 h-5" /> My Bookings
      </button>
      <button
        className="bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-2 text-base relative"
        onClick={() => setShowNotifications(true)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" /> Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unreadCount}</span>
        )}
      </button>
      <button
        className="bg-white bg-opacity-80 rounded-full px-4 py-2 shadow hover:bg-red-100 text-red-600 font-semibold flex items-center gap-2 text-base"
        onClick={() => { localStorage.clear(); navigate('/login'); }}
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );

  // Desktop view
  if (isDesktop) {
    console.log('Rendering DESKTOP branch');
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center" style={{
        backgroundImage: 'url(/images/victoria-falls.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <TopRightButtons />
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Search for a Bus</h2>
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-base">From</label>
                <input type="text" className="form-input w-full" placeholder="Departure city" value={fromCity} onChange={handleFromCityChange} onFocus={() => setShowFromSuggestions(true)} autoComplete="off" />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <div className="absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto">
                    {fromSuggestions.map(city => (
                      <div key={city} className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700" onClick={() => { setFromCity(city); setShowFromSuggestions(false); }}>{city}</div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-base">To</label>
                <input type="text" className="form-input w-full" placeholder="Destination city" value={toCity} onChange={handleToCityChange} onFocus={() => setShowToSuggestions(true)} autoComplete="off" />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <div className="absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto">
                    {toSuggestions.map(city => (
                      <div key={city} className="px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700" onClick={() => { setToCity(city); setShowToSuggestions(false); }}>{city}</div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 text-base">Date</label>
                <input type="date" className="date-input w-full" value={date} min={minDate} onChange={e => setDate(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg font-bold shadow transition-colors text-lg py-2" disabled={isLoading || !fromCity || !toCity || !date}>
                {isLoading ? <LoadingSpinner size="small" /> : 'Search Buses'}
              </button>
            </form>
          </div>
          {/* Promo Banner and Social Share (added for desktop) */}
          <div className="mt-8 w-full max-w-md flex flex-col items-center">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white w-full shadow-md mb-6">
              <div className="font-bold text-lg">Unlock 20% Off Your Next Trip</div>
              <div className="mb-2">Adventure calls. You save.</div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold">Book now</button>
            </div>
            <span className="text-gray-100 text-sm mb-2">Share Tiyende with friends:</span>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/sharer/sharer.php?u=https://tiyende.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-semibold" aria-label="Share on Facebook">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                Facebook
              </a>
              <a href="https://wa.me/?text=Check%20out%20Tiyende%20for%20bus%20booking!%20https://tiyende.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition text-base font-semibold" aria-label="Share on WhatsApp">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 012.1 12.045C2.073 6.504 6.659 1.908 12.199 1.908c2.637 0 5.112 1.027 6.988 2.893a9.825 9.825 0 012.893 6.977c.024 5.542-4.561 10.138-10.029 10.221zm8.413-18.294A11.815 11.815 0 0012.2 0C5.452 0 .066 5.385.001 12.077c-.032 2.13.552 4.21 1.7 6.077L0 24l6.063-1.616a11.89 11.89 0 005.969 1.523h.005c6.748 0 12.234-5.385 12.299-12.077a11.82 11.82 0 00-3.48-8.322z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <NotificationsPanel
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onNotificationsUpdate={() => {}}
        />
      </div>
    );
  }

  // Mobile/Tablet view
  console.log('Rendering MOBILE/TABLET branch');
  return (
    <div className="min-h-screen flex flex-col justify-end bg-gradient-to-br from-blue-50 via-purple-50 to-white pb-20 sm:pb-0 relative">
      {/* Scenic Image at the Top, flush under header */}
      <div className="w-full" style={{height: '240px', marginTop: 0, paddingTop: 0}}>
        <img src="/images/victoria-falls.jpg" alt="Victoria Falls" className="w-full h-full object-cover object-center" style={{maxHeight: '240px', marginTop: 0, paddingTop: 0}} />
      </div>
      {/* Main Content at the Bottom, Overlapping the Image */}
      <div className="relative z-10 flex flex-col items-center w-full -mt-12">
        <div className="mx-2 bg-white rounded-2xl shadow-xl p-4 max-w-md w-full self-center border border-gray-100" style={{marginTop: 0}}>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center">Your next adventure is just a search away</h2>
          {/* From/To dropdowns and date */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">From</label>
              <input type="text" className="form-input w-full" placeholder="Departure city" value={fromCity} onChange={handleFromCityChange} onFocus={() => setShowFromSuggestions(true)} autoComplete="off" />
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto">
                  {fromSuggestions.map(city => (
                    <div key={city} className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700" onClick={() => { setFromCity(city); setShowFromSuggestions(false); }}>{city}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">To</label>
              <input type="text" className="form-input w-full" placeholder="Destination city" value={toCity} onChange={handleToCityChange} onFocus={() => setShowToSuggestions(true)} autoComplete="off" />
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-white rounded shadow border border-gray-200 z-20 max-h-40 overflow-y-auto">
                  {toSuggestions.map(city => (
                    <div key={city} className="px-4 py-2 cursor-pointer hover:bg-green-50 text-gray-700" onClick={() => { setToCity(city); setShowToSuggestions(false); }}>{city}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 text-sm">Date</label>
              <input type="date" className="date-input w-full" value={date} min={minDate} onChange={e => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors text-lg py-2" disabled={isLoading || !fromCity || !toCity || !date}>
              {isLoading ? <LoadingSpinner /> : 'Continue'}
            </button>
          </form>
        </div>
        {/* Promo Banner */}
        <div className="mx-2 mt-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white max-w-md w-full self-center shadow-md">
          <div className="font-bold text-lg">Unlock 20% Off Your Next Trip</div>
          <div className="mb-2">Adventure calls. You save.</div>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold">Book now</button>
        </div>
        {/* Social Buttons */}
        <div className="mt-6 flex flex-col items-center max-w-md w-full self-center">
          <span className="text-gray-500 text-sm mb-2">Share Tiyende with friends:</span>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://tiyende.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-semibold" aria-label="Share on Facebook">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              Facebook
            </a>
            <a href="https://wa.me/?text=Check%20out%20Tiyende%20for%20bus%20booking!%20https://tiyende.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition text-base font-semibold" aria-label="Share on WhatsApp">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 012.1 12.045C2.073 6.504 6.659 1.908 12.199 1.908c2.637 0 5.112 1.027 6.988 2.893a9.825 9.825 0 012.893 6.977c.024 5.542-4.561 10.138-10.029 10.221zm8.413-18.294A11.815 11.815 0 0012.2 0C5.452 0 .066 5.385.001 12.077c-.032 2.13.552 4.21 1.7 6.077L0 24l6.063-1.616a11.89 11.89 0 005.969 1.523h.005c6.748 0 12.234-5.385 12.299-12.077a11.82 11.82 0 00-3.48-8.322z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
        {/* Spacer for bottom nav */}
        <div className="flex-1" />
      </div>
    </div>
  );
}; 