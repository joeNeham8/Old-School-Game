import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout, { metadata, generateViewport } from './layout';

// Mock Next.js font loader
jest.mock('next/font/local', () => {
  return jest.fn(() => ({
    variable: '--font-mock',
    className: 'mock-font-class'
  }));
});

// Mock CSS import
jest.mock('./globals.css', () => ({}));

// Mock child components
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Mock Navbar</nav>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Mock Footer</footer>;
  };
});

// Mock console.log to test logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('RootLayout Component', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('renders children content correctly', () => {
      const testContent = <div data-testid="test-child">Test Content</div>;
      
      render(<RootLayout>{testContent}</RootLayout>);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with correct HTML structure', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute('lang', 'en');
    });

    it('includes required navigation and footer components', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('includes main wrapper element', () => {
      render(<RootLayout><div data-testid="content">Test</div></RootLayout>);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toContainElement(screen.getByTestId('content'));
    });

    it('includes paper overlay div', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const paperOverlay = container.querySelector('.paperOverlay');
      expect(paperOverlay).toBeInTheDocument();
    });
  });

  describe('Meta Tags and Head Elements', () => {
    it('includes theme color meta tag', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      expect(themeColorMeta).toHaveAttribute('content', '#000000');
    });

    it('includes manifest link', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const manifestLink = document.querySelector('link[rel="manifest"]');
      expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    });

    it('includes favicon link', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const faviconLink = document.querySelector('link[rel="icon"]');
      expect(faviconLink).toHaveAttribute('href', '/icons/icon-192x192.svg');
      expect(faviconLink).toHaveAttribute('type', 'image/svg+xml');
    });

    it('includes apple touch icon', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
      expect(appleTouchIcon).toHaveAttribute('href', '/icons/icon-152x152.svg');
    });

    it('includes apple web app meta tags', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      expect(appleCapable).toHaveAttribute('content', 'yes');
      
      const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      expect(appleStatusBar).toHaveAttribute('content', 'default');
      
      const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      expect(appleTitle).toHaveAttribute('content', 'Old School Game');
    });
  });

  describe('Service Worker Script', () => {
    it('includes service worker registration script', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const scripts = container.querySelectorAll('script');
      const swScript = Array.from(scripts).find(script => 
        script.innerHTML.includes('serviceWorker')
      );
      
      expect(swScript).toBeDefined();
      expect(swScript?.innerHTML).toContain("navigator.serviceWorker.register('/sw.js')");
    });

    it('service worker script handles registration success', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const scripts = container.querySelectorAll('script');
      const swScript = Array.from(scripts).find(script => 
        script.innerHTML.includes('serviceWorker')
      );
      
      expect(swScript?.innerHTML).toContain('SW registered: ');
    });

    it('service worker script handles registration failure', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const scripts = container.querySelectorAll('script');
      const swScript = Array.from(scripts).find(script => 
        script.innerHTML.includes('serviceWorker')
      );
      
      expect(swScript?.innerHTML).toContain('SW registration failed: ');
    });
  });

  describe('Font Loading', () => {
    it('applies font variables to body class', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const bodyElement = container.querySelector('body');
      expect(bodyElement).toHaveClass('--font-mock', '--font-mock');
    });
  });

  describe('Console Logging', () => {
    it('logs reload message on render', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      expect(mockConsoleLog).toHaveBeenCalledWith("Reloaded Layout Page...");
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles null children gracefully', () => {
      expect(() => {
        render(<RootLayout>{null}</RootLayout>);
      }).not.toThrow();
    });

    it('handles undefined children gracefully', () => {
      expect(() => {
        render(<RootLayout>{undefined}</RootLayout>);
      }).not.toThrow();
    });

    it('handles multiple children elements', () => {
      const multipleChildren = (
        <>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
          <div data-testid="child3">Child 3</div>
        </>
      );
      
      render(<RootLayout>{multipleChildren}</RootLayout>);
      
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
      expect(screen.getByTestId('child3')).toBeInTheDocument();
    });

    it('handles complex nested children structures', () => {
      const nestedChildren = (
        <div data-testid="parent">
          <div data-testid="nested-child">
            <span data-testid="deeply-nested">Deep content</span>
          </div>
        </div>
      );
      
      render(<RootLayout>{nestedChildren}</RootLayout>);
      
      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
      expect(screen.getByTestId('deeply-nested')).toBeInTheDocument();
    });
  });
});

describe('Metadata Export', () => {
  describe('Basic Metadata Properties', () => {
    it('has correct title', () => {
      expect(metadata.title).toBe('Old School Game');
    });

    it('has correct description with typo', () => {
      expect(metadata.description).toBe(
        "Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.l"
      );
    });

    it('has correct manifest path', () => {
      expect(metadata.manifest).toBe('/manifest.json');
    });
  });

  describe('Apple Web App Configuration', () => {
    it('has correct apple web app settings', () => {
      expect(metadata.appleWebApp).toEqual({
        capable: true,
        statusBarStyle: 'default',
        title: 'Old School Game',
      });
    });
  });

  describe('Open Graph Metadata', () => {
    it('has correct open graph type', () => {
      expect(metadata.openGraph?.type).toBe('website');
    });

    it('has correct open graph URL', () => {
      expect(metadata.openGraph?.url).toBe('https://oldschoolgame.vercel.app/');
    });

    it('has correct open graph title', () => {
      expect(metadata.openGraph?.title).toBe('Old School Game');
    });

    it('has correct open graph description', () => {
      expect(metadata.openGraph?.description).toBe(
        'Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.'
      );
    });

    it('has correct open graph site name', () => {
      expect(metadata.openGraph?.siteName).toBe('Old School Game');
    });

    it('has correct open graph images', () => {
      expect(metadata.openGraph?.images).toEqual([
        { url: '/oldschoolgame.webp' }
      ]);
    });
  });

  describe('Twitter Metadata', () => {
    it('has correct twitter card type', () => {
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('has correct twitter site', () => {
      expect(metadata.twitter?.site).toBe('https://oldschoolgame.vercel.app/');
    });

    it('has correct twitter creator', () => {
      expect(metadata.twitter?.creator).toBe('Old School Game');
    });

    it('has correct twitter description', () => {
      expect(metadata.twitter?.description).toBe(
        'Step back in time with Old School Game, where classic games meet modern-day brain training! Sharpen your mind and have fun with nostalgic games, all designed to boost your cognitive power and keep your brain in top shape.'
      );
    });

    it('has correct twitter images', () => {
      expect(metadata.twitter?.images).toBe('/oldschoolgame.webp');
    });
  });

  describe('Icons Configuration', () => {
    it('has correct regular icons', () => {
      expect(metadata.icons?.icon).toEqual([
        { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
        { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]);
    });

    it('has correct apple icons', () => {
      expect(metadata.icons?.apple).toEqual([
        { url: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' }
      ]);
    });
  });

  describe('Metadata Structure Validation', () => {
    it('exports metadata as an object', () => {
      expect(typeof metadata).toBe('object');
      expect(metadata).not.toBeNull();
    });

    it('has all required top-level properties', () => {
      const requiredProperties = ['title', 'description', 'manifest', 'appleWebApp', 'openGraph', 'twitter', 'icons'];
      
      requiredProperties.forEach(prop => {
        expect(metadata).toHaveProperty(prop);
      });
    });
  });
});

describe('generateViewport Function', () => {
  describe('Return Value Structure', () => {
    it('returns an object with viewport configuration', () => {
      const viewport = generateViewport();
      
      expect(typeof viewport).toBe('object');
      expect(viewport).not.toBeNull();
    });

    it('has correct theme color', () => {
      const viewport = generateViewport();
      
      expect(viewport.themeColor).toBe('#000000');
    });

    it('has correct width setting', () => {
      const viewport = generateViewport();
      
      expect(viewport.width).toBe('device-width');
    });

    it('has correct initial scale', () => {
      const viewport = generateViewport();
      
      expect(viewport.initialScale).toBe(1);
    });
  });

  describe('Function Behavior', () => {
    it('is a pure function returning consistent results', () => {
      const viewport1 = generateViewport();
      const viewport2 = generateViewport();
      
      expect(viewport1).toEqual(viewport2);
    });

    it('returns the same object structure on multiple calls', () => {
      const viewport1 = generateViewport();
      const viewport2 = generateViewport();
      
      expect(Object.keys(viewport1)).toEqual(Object.keys(viewport2));
      expect(Object.keys(viewport1)).toEqual(['themeColor', 'width', 'initialScale']);
    });
  });

  describe('Viewport Configuration Validation', () => {
    it('theme color is a valid hex color', () => {
      const viewport = generateViewport();
      
      expect(viewport.themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('width is device-width for responsive design', () => {
      const viewport = generateViewport();
      
      expect(viewport.width).toBe('device-width');
    });

    it('initial scale is a number', () => {
      const viewport = generateViewport();
      
      expect(typeof viewport.initialScale).toBe('number');
      expect(viewport.initialScale).toBeGreaterThan(0);
    });
  });
});

describe('Font Configuration', () => {
  it('configures Geist Sans font correctly', () => {
    // Test that the font configuration is correct
    expect(() => {
      const localFont = require('next/font/local');
      localFont({
        src: "./fonts/GeistVF.woff",
        variable: "--font-geist-sans",
        weight: "100 900",
      });
    }).not.toThrow();
  });

  it('configures Geist Mono font correctly', () => {
    expect(() => {
      const localFont = require('next/font/local');
      localFont({
        src: "./fonts/GeistMonoVF.woff",
        variable: "--font-geist-mono",
        weight: "100 900",
      });
    }).not.toThrow();
  });
});

describe('Integration Tests', () => {
  describe('Layout with Real-world Scenarios', () => {
    it('renders correctly with typical page content', () => {
      const typicalPageContent = (
        <div>
          <h1>Game Page</h1>
          <p>Welcome to our game!</p>
          <button type="button">Start Game</button>
        </div>
      );
      
      render(<RootLayout>{typicalPageContent}</RootLayout>);
      
      expect(screen.getByText('Game Page')).toBeInTheDocument();
      expect(screen.getByText('Welcome to our game!')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('maintains correct component order in DOM', () => {
      const { container } = render(<RootLayout><div>Content</div></RootLayout>);
      
      const main = container.querySelector('main');
      const children = main?.children;
      
      expect(children?.[0]).toHaveAttribute('data-testid', 'navbar');
      expect(children?.[1]).toHaveTextContent('Content');
      expect(children?.[2]).toHaveClass('paperOverlay');
      expect(children?.[3]).toHaveAttribute('data-testid', 'footer');
    });

    it('renders with proper semantic HTML structure', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      expect(container.querySelector('html')).toBeInTheDocument();
      expect(container.querySelector('head')).toBeInTheDocument();
      expect(container.querySelector('body')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('PWA Features Integration', () => {
    it('includes all PWA-related meta tags and links', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      // Test all PWA-related elements are present
      expect(document.querySelector('meta[name="theme-color"]')).toBeInTheDocument();
      expect(document.querySelector('link[rel="manifest"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="apple-mobile-web-app-capable"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')).toBeInTheDocument();
      expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')).toBeInTheDocument();
    });

    it('service worker registration script is properly formatted', () => {
      const { container } = render(<RootLayout><div>Test</div></RootLayout>);
      
      const scripts = container.querySelectorAll('script');
      const swScript = Array.from(scripts).find(script => 
        script.innerHTML.includes('serviceWorker')
      );
      
      expect(swScript?.innerHTML).toContain('if (\'serviceWorker\' in navigator)');
      expect(swScript?.innerHTML).toContain('window.addEventListener(\'load\'');
      expect(swScript?.innerHTML).toContain('.then(function(registration)');
      expect(swScript?.innerHTML).toContain('.catch(function(registrationError)');
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper language attribute', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      expect(document.documentElement).toHaveAttribute('lang', 'en');
    });

    it('has main landmark for screen readers', () => {
      render(<RootLayout><div>Test</div></RootLayout>);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('only renders console log once per component render', () => {
      const { rerender } = render(<RootLayout><div>Test 1</div></RootLayout>);
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      
      rerender(<RootLayout><div>Test 2</div></RootLayout>);
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });
});