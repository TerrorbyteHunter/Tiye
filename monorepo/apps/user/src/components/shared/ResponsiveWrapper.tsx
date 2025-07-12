import React from 'react';
import { useResponsive } from '../../hooks/use-responsive';

interface ResponsiveWrapperProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  tablet?: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export function ResponsiveWrapper({ 
  mobile, 
  desktop, 
  tablet, 
  className = '',
  fallback
}: ResponsiveWrapperProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Show loading state while determining screen size
  if (!isMobile && !isTablet && !isDesktop) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  if (isMobile) {
    return <div className={className}>{mobile}</div>;
  }
  
  if (isTablet && tablet) {
    return <div className={className}>{tablet}</div>;
  }
  
  return <div className={className}>{desktop}</div>;
}

// Specialized wrappers for common patterns
export function MobileOnly({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isMobile } = useResponsive();
  return isMobile ? <div className={className}>{children}</div> : null;
}

export function DesktopOnly({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isDesktop } = useResponsive();
  return isDesktop ? <div className={className}>{children}</div> : null;
}

export function TabletAndUp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isTablet, isDesktop } = useResponsive();
  return (isTablet || isDesktop) ? <div className={className}>{children}</div> : null;
} 