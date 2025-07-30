'use client';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PWAInstall from './PWAInstall';

// Mock the CSS module
jest.mock('./PWAInstall.module.css', () => ({
  installButton: 'mock-install-button'
}));

// Mock console methods to avoid noise in test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

// Mock service worker registration
const mockServiceWorkerRegister = jest.fn();
const mockServiceWorker = {
  register: mockServiceWorkerRegister
};

// Mock window.matchMedia
const mockMatchMedia = jest.fn();

// Mock BeforeInstallPromptEvent
class MockBeforeInstallPromptEvent extends Event {
  platforms: string[] = ['web'];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
  private mockUserChoice: 'accepted' | 'dismissed' = 'accepted';

  constructor(type: string, userChoice: 'accepted' | 'dismissed' = 'accepted') {
    super(type);
    this.mockUserChoice = userChoice;
    this.userChoice = Promise.resolve({
      outcome: userChoice,
      platform: 'web'
    });
  }

  prompt = jest.fn().mockResolvedValue(undefined);
}

describe('PWAInstall Component', () => {
  let mockAddEventListener: jest.SpyInstance;
  let mockRemoveEventListener: jest.SpyInstance;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock window methods
    mockAddEventListener = jest.spyOn(window, 'addEventListener').mockImplementation();
    mockRemoveEventListener = jest.spyOn(window, 'removeEventListener').mockImplementation();
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: mockServiceWorker
    });

    // Default matchMedia behavior (not in standalone mode)
    mockMatchMedia.mockReturnValue({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn()
    });

    // Default service worker registration success
    mockServiceWorkerRegister.mockResolvedValue({
      scope: '/',
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Render Conditions', () => {
    it('should not render when app is already installed (standalone mode)', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn()
      });

      const { container } = render(<PWAInstall />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when app is not installable', () => {
      const { container } = render(<PWAInstall />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle initial standalone mode detection', () => {
      const mockMatchMediaStandalone = jest.fn().mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn()
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMediaStandalone
      });

      const { container } = render(<PWAInstall />);
      
      expect(mockMatchMediaStandalone).toHaveBeenCalledWith('(display-mode: standalone)');
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Event Listeners Setup', () => {
    it('should add event listeners on mount', () => {
      render(<PWAInstall />);

      expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledTimes(2);
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = render(<PWAInstall />);
      
      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });

    it('should use the same function references for add and remove event listeners', () => {
      const { unmount } = render(<PWAInstall />);
      
      const addCalls = mockAddEventListener.mock.calls;
      
      unmount();
      
      const removeCalls = mockRemoveEventListener.mock.calls;
      
      // Check that the same handler functions are used for both add and remove
      expect(addCalls[0][1]).toBe(removeCalls[0][1]); // beforeinstallprompt handler
      expect(addCalls[1][1]).toBe(removeCalls[1][1]); // appinstalled handler
    });

    it('should not add event listeners when already installed', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn()
      });

      render(<PWAInstall />);

      // Should not add event listeners if already installed
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Service Worker Registration', () => {
    it('should register service worker when supported', async () => {
      render(<PWAInstall />);

      await waitFor(() => {
        expect(mockServiceWorkerRegister).toHaveBeenCalledWith('/sw.js');
      });
    });

    it('should log success when service worker registration succeeds', async () => {
      const mockRegistration = { 
        scope: '/',
        installing: null,
        waiting: null,
        active: { state: 'activated' }
      };
      mockServiceWorkerRegister.mockResolvedValue(mockRegistration);

      render(<PWAInstall />);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('SW registered: ', mockRegistration);
      });
    });

    it('should log error when service worker registration fails', async () => {
      const mockError = new Error('Registration failed');
      mockServiceWorkerRegister.mockRejectedValue(mockError);

      render(<PWAInstall />);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('SW registration failed: ', mockError);
      });
    });

    it('should not attempt to register service worker when not supported', () => {
      // Remove serviceWorker from navigator
      Object.defineProperty(navigator, 'serviceWorker', {
        writable: true,
        value: undefined
      });

      render(<PWAInstall />);

      expect(mockServiceWorkerRegister).not.toHaveBeenCalled();
    });

    it('should handle service worker registration with complex response', async () => {
      const mockRegistration = {
        scope: '/',
        installing: { state: 'installing' },
        waiting: null,
        active: { state: 'activated' },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        update: jest.fn(),
        unregister: jest.fn()
      };
      mockServiceWorkerRegister.mockResolvedValue(mockRegistration);

      render(<PWAInstall />);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('SW registered: ', mockRegistration);
      });
    });

    it('should not register service worker when app is already installed', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addListener: jest.fn(),
        removeListener: jest.fn()
      });

      render(<PWAInstall />);

      expect(mockServiceWorkerRegister).not.toHaveBeenCalled();
    });
  });

  describe('beforeinstallprompt Event Handling', () => {
    it('should handle beforeinstallprompt event correctly and show install button', async () => {
      const { rerender } = render(<PWAInstall />);
      
      // Simulate beforeinstallprompt event
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      // Trigger the event
      if (handler) {
        handler(mockEvent);
      }
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      
      // Force re-render to see the button
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should store deferred prompt correctly', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('mock-install-button');
      });
    });

    it('should handle multiple beforeinstallprompt events', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        // Trigger first event
        const firstEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        handler(firstEvent);
        
        // Trigger second event
        const secondEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        handler(secondEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should update state correctly when beforeinstallprompt is triggered', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('mock-install-button');
      });
    });
  });

  describe('appinstalled Event Handling', () => {
    it('should handle appinstalled event correctly and hide install button', async () => {
      const { rerender } = render(<PWAInstall />);
      
      // First make it installable
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      
      if (beforeInstallHandler) {
        const beforeInstallEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        beforeInstallHandler(beforeInstallEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // Then trigger appinstalled
      if (appInstalledHandler) {
        appInstalledHandler();
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });

    it('should clear deferred prompt when app is installed', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      
      if (beforeInstallHandler) {
        const event = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        beforeInstallHandler(event);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // Then install
      if (appInstalledHandler) {
        appInstalledHandler();
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });

    it('should reset all install-related state when app is installed', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      
      // Make installable
      if (beforeInstallHandler) {
        const event = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        beforeInstallHandler(event);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // Install the app
      if (appInstalledHandler) {
        appInstalledHandler();
      }
      
      rerender(<PWAInstall />);
      
      // Should hide the component completely
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Install Button Functionality', () => {
    const setupInstallableComponent = async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      return { mockEvent, rerender };
    };

    it('should call prompt when install button is clicked', async () => {
      const { mockEvent } = await setupInstallableComponent();
      
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockEvent.prompt).toHaveBeenCalled();
      });
    });

    it('should log success message when user accepts install', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEventAccepted = new MockBeforeInstallPromptEvent('beforeinstallprompt', 'accepted');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEventAccepted);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('User accepted the install prompt');
      });
    });

    it('should log dismissal message when user dismisses install', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEventDismissed = new MockBeforeInstallPromptEvent('beforeinstallprompt', 'dismissed');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEventDismissed);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('User dismissed the install prompt');
      });
    });

    it('should reset state after install attempt', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockEvent.prompt).toHaveBeenCalled();
      });

      rerender(<PWAInstall />);
      
      // Should hide button after install attempt
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle prompt errors gracefully', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      mockEvent.prompt = jest.fn().mockRejectedValue(new Error('Prompt failed'));
      
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      
      // Should not crash when prompt fails
      expect(() => fireEvent.click(installButton)).not.toThrow();
    });

    it('should handle userChoice promise rejection gracefully', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      mockEvent.userChoice = Promise.reject(new Error('UserChoice failed'));
      
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      
      // Should handle userChoice rejection gracefully
      expect(() => fireEvent.click(installButton)).not.toThrow();
    });

    it('should handle case when deferredPrompt is null', async () => {
      const { rerender } = render(<PWAInstall />);
      
      // First make it installable
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // Clear the prompt by triggering appinstalled
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      if (appInstalledHandler) {
        appInstalledHandler();
      }
      
      rerender(<PWAInstall />);
      
      // Component should be hidden when deferredPrompt is cleared
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    const setupWithClassName = async (className?: string) => {
      const { rerender } = render(<PWAInstall className={className} />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall className={className} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      return screen.getByRole('button');
    };

    it('should apply custom className prop', async () => {
      const button = await setupWithClassName('custom-class');
      expect(button).toHaveClass('mock-install-button', 'custom-class');
    });

    it('should work with empty className prop', async () => {
      const button = await setupWithClassName('');
      expect(button).toHaveClass('mock-install-button');
      expect(button.className).toContain('mock-install-button ');
    });

    it('should work without className prop', async () => {
      const button = await setupWithClassName(undefined);
      expect(button).toHaveClass('mock-install-button');
    });

    it('should handle multiple CSS classes', async () => {
      const button = await setupWithClassName('class1 class2 class3');
      expect(button).toHaveClass('mock-install-button', 'class1', 'class2', 'class3');
    });

    it('should use default empty string when className is undefined', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('mock-install-button');
        // Should not have undefined or null in className
        expect(button.className).not.toContain('undefined');
        expect(button.className).not.toContain('null');
      });
    });
  });

  describe('Button Content and Accessibility', () => {
    const setupInstallableButton = async () => {
      const { rerender } = render(<PWAInstall />);
      
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      const handler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      
      if (handler) {
        handler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      return screen.getByRole('button');
    };

    it('should render button with correct title attribute', async () => {
      const button = await setupInstallableButton();
      expect(button).toHaveAttribute('title', 'Install Old School Game');
    });

    it('should render button with install icon (SVG)', async () => {
      await setupInstallableButton();
      
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should render button with install text', async () => {
      await setupInstallableButton();
      expect(screen.getByText('Install App')).toBeInTheDocument();
    });

    it('should have proper SVG attributes for accessibility', async () => {
      await setupInstallableButton();
      
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('strokeWidth', '2');
      expect(svg).toHaveAttribute('strokeLinecap', 'round');
      expect(svg).toHaveAttribute('strokeLinejoin', 'round');
    });

    it('should have correct SVG paths for download icon', async () => {
      await setupInstallableButton();
      
      const svg = screen.getByRole('button').querySelector('svg');
      const paths = svg?.querySelectorAll('path, polyline, line');
      expect(paths).toHaveLength(3); // path, polyline, line elements
      
      const path = svg?.querySelector('path');
      expect(path).toHaveAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
      
      const polyline = svg?.querySelector('polyline');
      expect(polyline).toHaveAttribute('points', '7,10 12,15 17,10');
      
      const line = svg?.querySelector('line');
      expect(line).toHaveAttribute('x1', '12');
      expect(line).toHaveAttribute('y1', '15');
      expect(line).toHaveAttribute('x2', '12');
      expect(line).toHaveAttribute('y2', '3');
    });

    it('should be keyboard accessible', async () => {
      const button = await setupInstallableButton();
      
      // Button should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Button should respond to Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      // Should trigger the install process (no exception thrown)
    });

    it('should have proper button semantics', async () => {
      const button = await setupInstallableButton();
      
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button'); // Default button type
    });
  });

  describe('State Management and Edge Cases', () => {
    it('should maintain correct state flow: not installable -> installable -> installed', async () => {
      const { rerender, container } = render(<PWAInstall />);
      
      // Initially not installable
      expect(container.firstChild).toBeNull();
      
      // Becomes installable
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      
      if (beforeInstallHandler) {
        const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // Becomes installed
      if (appInstalledHandler) {
        appInstalledHandler();
      }
      
      rerender(<PWAInstall />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle rapid state changes correctly', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const appInstalledHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'appinstalled')?.[1];
      
      if (beforeInstallHandler && appInstalledHandler) {
        // Rapid fire events
        const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
        beforeInstallHandler(mockEvent);
        appInstalledHandler();
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      // Should end up in installable state
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should handle window.matchMedia variations', () => {
      // Test different matchMedia return values
      const matchMediaResults = [
        { matches: true, addListener: jest.fn(), removeListener: jest.fn() },
        { matches: false, addListener: jest.fn(), removeListener: jest.fn() },
        { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }
      ];

      matchMediaResults.forEach((result) => {
        // Reset mocks for each iteration
        jest.clearAllMocks();
        mockMatchMedia.mockReturnValue(result);
        
        const { container, unmount } = render(<PWAInstall />);
        
        if (result.matches) {
          expect(container.firstChild).toBeNull();
        } else {
          // Should add event listeners when not in standalone mode
          expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
        }
        
        unmount();
      });
    });

    it('should handle missing service worker support gracefully', () => {
      // Test when serviceWorker is completely missing
      delete (navigator as any).serviceWorker;
      
      render(<PWAInstall />);
      
      // Should not crash and should still add event listeners
      expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
      expect(mockServiceWorkerRegister).not.toHaveBeenCalled();
    });

    it('should handle service worker registration edge cases', async () => {
      // Test registration returning null/undefined
      mockServiceWorkerRegister.mockResolvedValue(null);
      
      render(<PWAInstall />);
      
      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('SW registered: ', null);
      });
      
      // Test registration throwing synchronously
      mockServiceWorkerRegister.mockImplementation(() => {
        throw new Error('Sync error');
      });
      
      // Should not crash the component
      expect(() => render(<PWAInstall />)).not.toThrow();
    });

    it('should handle matchMedia not supported', () => {
      // Test when matchMedia is not available
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined
      });
      
      // Should not crash
      expect(() => render(<PWAInstall />)).toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with event listeners', () => {
      const { unmount } = render(<PWAInstall />);
      
      // Verify listeners are added
      expect(mockAddEventListener).toHaveBeenCalledTimes(2);
      
      unmount();
      
      // Verify listeners are removed
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
      
      // Verify same function references
      const addCalls = mockAddEventListener.mock.calls;
      const removeCalls = mockRemoveEventListener.mock.calls;
      
      expect(addCalls[0][1]).toBe(removeCalls[0][1]);
      expect(addCalls[1][1]).toBe(removeCalls[1][1]);
    });

    it('should handle multiple mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<PWAInstall />);
        unmount();
      }
      
      // Should have added and removed listeners 5 times each
      expect(mockAddEventListener).toHaveBeenCalledTimes(10); // 2 listeners × 5 mounts
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(10); // 2 listeners × 5 unmounts
    });

    it('should handle component re-renders efficiently', () => {
      const TestComponent = ({ count }: { count: number }) => (
        <div>
          <PWAInstall />
          <span>Render count: {count}</span>
        </div>
      );

      const { rerender } = render(<TestComponent count={1} />);
      
      const initialAddCalls = mockAddEventListener.mock.calls.length;
      
      // Re-render multiple times
      for (let i = 2; i <= 5; i++) {
        rerender(<TestComponent count={i} />);
      }
      
      // Event listeners should only be added once (in useEffect)
      expect(mockAddEventListener.mock.calls.length).toBe(initialAddCalls);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full PWA install flow simulation', async () => {
      const { rerender } = render(<PWAInstall />);
      
      // 1. App starts in non-installable state
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      
      // 2. Browser determines app is installable
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt', 'accepted');
      
      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      // 3. Install button appears
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      // 4. User clicks install
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);
      
      // 5. Install process completes
      await waitFor(() => {
        expect(mockEvent.prompt).toHaveBeenCalled();
        expect(mockConsoleLog).toHaveBeenCalledWith('User accepted the install prompt');
      });
      
      // 6. Button disappears after install attempt
      rerender(<PWAInstall />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle PWA install rejection flow', async () => {
      const { rerender } = render(<PWAInstall />);
      
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt', 'dismissed');
      
      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      
      const installButton = screen.getByRole('button');
      fireEvent.click(installButton);
      
      await waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith('User dismissed the install prompt');
      });
      
      rerender(<PWAInstall />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle service worker registration in parallel with PWA prompt', async () => {
      const mockRegistration = { scope: '/', active: { state: 'activated' } };
      mockServiceWorkerRegister.mockResolvedValue(mockRegistration);
      
      const { rerender } = render(<PWAInstall />);
      
      // Service worker should register regardless of PWA install state
      await waitFor(() => {
        expect(mockServiceWorkerRegister).toHaveBeenCalledWith('/sw.js');
        expect(mockConsoleLog).toHaveBeenCalledWith('SW registered: ', mockRegistration);
      });
      
      // PWA install should still work independently
      const beforeInstallHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'beforeinstallprompt')?.[1];
      const mockEvent = new MockBeforeInstallPromptEvent('beforeinstallprompt');
      
      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }
      
      rerender(<PWAInstall />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });
});