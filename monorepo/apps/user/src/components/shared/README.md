# Responsive Design System

This directory contains a comprehensive responsive design system that provides distinct views for desktop and mobile devices while ensuring they don't interfere with each other.

## 🎯 Key Benefits

- **Complete Separation**: Mobile and desktop views are completely independent
- **Performance Optimized**: Only renders what's needed for each screen size
- **Easy Maintenance**: Update mobile or desktop independently
- **Testing Friendly**: Test each view separately
- **User Experience**: Optimized experience for each device type

## 📱 Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1023px
  desktop: 1280,  // 1024px - 1279px
  largeDesktop: 1536, // >= 1280px
};
```

## 🛠️ Core Components

### 1. useResponsive Hook

The main hook that provides device detection and screen information.

```typescript
import { useResponsive } from '../../hooks/use-responsive';

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    screenWidth, 
    screenHeight, 
    orientation 
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### 2. ResponsiveWrapper

Conditionally renders different content based on screen size.

```typescript
import { ResponsiveWrapper } from './ResponsiveWrapper';

function MyComponent() {
  return (
    <ResponsiveWrapper
      mobile={<MobileContent />}
      desktop={<DesktopContent />}
      tablet={<TabletContent />} // Optional
      className="my-custom-class"
    />
  );
}
```

### 3. Specialized Wrappers

```typescript
import { MobileOnly, DesktopOnly, TabletAndUp } from './ResponsiveWrapper';

// Only show on mobile
<MobileOnly>
  <MobileSpecificFeature />
</MobileOnly>

// Only show on desktop
<DesktopOnly>
  <DesktopSpecificFeature />
</DesktopOnly>

// Show on tablet and larger screens
<TabletAndUp>
  <TabletAndUpFeature />
</TabletAndUp>
```

### 4. ResponsiveLayout

Handles the overall page structure with appropriate navigation placement.

```typescript
import { ResponsiveLayout } from './ResponsiveLayout';

function MyPage() {
  return (
    <ResponsiveLayout showNavigation={true}>
      <h1>My Page Content</h1>
      {/* Your content here */}
    </ResponsiveLayout>
  );
}
```

### 5. ResponsiveDataDisplay

Shows data in cards on mobile and tables on desktop.

```typescript
import { ResponsiveDataDisplay } from './ResponsiveDataDisplay';

const data = [
  {
    id: '1',
    title: 'Route Name',
    description: 'Route description',
    status: 'active',
    date: '2024-01-15',
    price: 'K250'
  }
];

function MyDataPage() {
  return (
    <ResponsiveDataDisplay 
      data={data}
      title="My Routes"
      onItemClick={(item) => console.log('Clicked:', item)}
    />
  );
}
```

## 🎨 Usage Patterns

### Pattern 1: Conditional Rendering

```typescript
function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <div>
      {isMobile ? (
        <div className="space-y-4">
          {/* Mobile layout */}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Desktop layout */}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Responsive Classes

```typescript
function MyComponent() {
  return (
    <div className="
      w-full p-4          // Mobile first
      md:w-1/2 md:p-6     // Tablet
      lg:w-1/3 lg:p-8     // Desktop
      xl:w-1/4 xl:p-10    // Large desktop
    ">
      <h1 className="
        text-lg font-bold
        md:text-xl
        lg:text-2xl
        xl:text-3xl
      ">
        Responsive Title
      </h1>
    </div>
  );
}
```

### Pattern 3: Responsive Forms

```typescript
function MyForm() {
  const { isMobile } = useResponsive();
  
  return (
    <form className={`
      ${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'}
    `}>
      <div className={isMobile ? '' : 'col-span-2'}>
        <label>Full Name</label>
        <input type="text" className="w-full px-3 py-2 border rounded-md" />
      </div>
      
      <div>
        <label>Email</label>
        <input type="email" className="w-full px-3 py-2 border rounded-md" />
      </div>
      
      <div>
        <label>Phone</label>
        <input type="tel" className="w-full px-3 py-2 border rounded-md" />
      </div>
    </form>
  );
}
```

## 🧪 Testing

### Testing Different Screen Sizes

```typescript
// utils/responsive-testing.ts
export const testResponsiveBreakpoints = () => {
  const breakpoints = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1024, height: 768, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Large Desktop' },
  ];

  return breakpoints;
};
```

### Browser DevTools Testing

1. Open DevTools (F12)
2. Click the device toggle button
3. Test different device sizes
4. Check both portrait and landscape orientations

## 📋 Best Practices

### 1. Mobile-First Approach
- Start with mobile design
- Add complexity for larger screens
- Use progressive enhancement

### 2. Performance
- Use lazy loading for device-specific components
- Minimize bundle size with conditional imports
- Optimize images for different screen densities

### 3. Accessibility
- Ensure touch targets are at least 44px on mobile
- Maintain keyboard navigation on desktop
- Test with screen readers on both layouts

### 4. Content Strategy
- Prioritize content for mobile
- Use appropriate text sizes for each device
- Consider loading times on mobile networks

## 🚀 Implementation Checklist

- [ ] Set up `useResponsive` hook
- [ ] Create `ResponsiveWrapper` components
- [ ] Implement `ResponsiveLayout`
- [ ] Add `ResponsiveDataDisplay` for data-heavy pages
- [ ] Test on multiple devices and orientations
- [ ] Optimize performance with lazy loading
- [ ] Ensure accessibility compliance
- [ ] Document component usage

## 🔧 Customization

### Custom Breakpoints

```typescript
// hooks/use-responsive.ts
const CUSTOM_BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
  largeDesktop: 1920,
};
```

### Custom Responsive Components

```typescript
// components/shared/CustomResponsiveComponent.tsx
export function CustomResponsiveComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <ResponsiveWrapper
      mobile={<CustomMobileView />}
      desktop={<CustomDesktopView />}
    />
  );
}
```

## 📱 Demo

Visit `/responsive-demo` to see all responsive patterns in action!

## 🤝 Contributing

When adding new responsive components:

1. Follow the existing patterns
2. Test on multiple screen sizes
3. Ensure mobile and desktop views are independent
4. Add appropriate TypeScript types
5. Update this README if needed 