import React from 'react';
import { ResponsiveWrapper } from './ResponsiveWrapper';
import { ResponsiveNavigation } from './ResponsiveNavigation';
import { useResponsive } from '../../hooks/use-responsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  showNavigation = true,
  className = '' 
}: ResponsiveLayoutProps) {
  const { isMobile } = useResponsive();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Top Navigation for Desktop */}
      {showNavigation && !isMobile && (
        <ResponsiveNavigation />
      )}
      
      {/* Main Content */}
      <main className={`
        ${isMobile ? 'pb-20' : 'pt-16'} // Add bottom padding for mobile nav, top padding for desktop nav
        px-4 sm:px-6 lg:px-8
        py-4 sm:py-6 lg:py-8
      `}>
        {children}
      </main>
      
      {/* Bottom Navigation for Mobile */}
      {showNavigation && isMobile && (
        <ResponsiveNavigation />
      )}
    </div>
  );
}

// Specialized layout components
export function MobileLayout({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isMobile } = useResponsive();
  
  if (!isMobile) return null;
  
  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${className}`}>
      <main className="px-4 py-4">
        {children}
      </main>
      <ResponsiveNavigation />
    </div>
  );
}

export function DesktopLayout({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isDesktop } = useResponsive();
  
  if (!isDesktop) return null;
  
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <ResponsiveNavigation />
      <main className="pt-16 px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
} 