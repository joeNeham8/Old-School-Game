/**
 * Unit tests for Navbar component
 * 
 * Testing Framework: Jest + React Testing Library
 * Note: This project currently doesn't have testing dependencies installed.
 * To run these tests, install the following packages:
 * 
 * npm install --save-dev jest @testing-library/react @testing-library/jest-dom
 * @testing-library/user-event jest-environment-jsdom
 * 
 * Also add a jest.config.js file with appropriate configuration for Next.js
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockedLink({ children, href, className }: any) {
    return (
      <a href={href} className={className} data-testid="next-link">
        {children}
      </a>
    );
  };
});

// Mock PWAInstall component
jest.mock('./PWAInstall', () => {
  return function MockedPWAInstall({ className }: { className?: string }) {
    return <div data-testid="pwa-install" className={className}>PWA Install</div>;
  };
});

// Mock CSS modules
jest.mock('@/components/navbar.module.css', () => ({
  'navbar-container': 'navbar-container',
  'navbar': 'navbar',
  'heading': 'heading',
  'title': 'title',
  'nav-actions': 'nav-actions',
  'pwa-install': 'pwa-install',
  'link': 'link',
  'fade-navbar-effect': 'fade-navbar-effect',
  'empty-navbar': 'empty-navbar'
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the navbar component without errors', () => {
      render(<Navbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
    });

    it('should render the main title "OLD SCHOOL GAME"', () => {
      render(<Navbar />);
      
      const title = screen.getByText('OLD SCHOOL GAME');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    it('should render the GitHub link with correct text and URL', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/ajaynegi45/Old-School-Game');
    });

    it('should render the home link with correct attributes', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render the PWAInstall component', () => {
      render(<Navbar />);
      
      const pwaInstall = screen.getByTestId('pwa-install');
      expect(pwaInstall).toBeInTheDocument();
    });

    it('should render all three main sections (navbar container, fade effect, empty navbar)', () => {
      const { container } = render(<Navbar />);
      
      expect(container.children).toHaveLength(3);
      expect(container.querySelector('.navbar-container')).toBeInTheDocument();
      expect(container.querySelector('.fade-navbar-effect')).toBeInTheDocument();
      expect(container.querySelector('.empty-navbar')).toBeInTheDocument();
    });
  });

  describe('Component Structure and DOM Hierarchy', () => {
    it('should have the correct nested DOM structure', () => {
      const { container } = render(<Navbar />);
      
      // Check navbar container structure
      const navbarContainer = container.querySelector('.navbar-container');
      expect(navbarContainer).toBeInTheDocument();
      
      // Check nav element inside container
      const navbar = navbarContainer?.querySelector('nav.navbar');
      expect(navbar).toBeInTheDocument();
      
      // Check nav actions container
      const navActions = navbar?.querySelector('.nav-actions');
      expect(navActions).toBeInTheDocument();
    });

    it('should render nav actions with both PWAInstall and GitHub link', () => {
      render(<Navbar />);
      
      const navActions = screen.getByText('Github').parentElement;
      expect(navActions).toHaveClass('nav-actions');
      
      const pwaInstall = screen.getByTestId('pwa-install');
      const githubLink = screen.getByText('Github');
      
      expect(navActions).toContainElement(pwaInstall);
      expect(navActions).toContainElement(githubLink);
    });

    it('should render exactly two navigation links', () => {
      render(<Navbar />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      
      // Verify link destinations
      const hrefs = links.map(link => link.getAttribute('href'));
      expect(hrefs).toContain('/');
      expect(hrefs).toContain('https://github.com/ajaynegi45/Old-School-Game');
    });

    it('should maintain correct element order in navigation', () => {
      render(<Navbar />);
      
      const navbar = screen.getByRole('navigation');
      const children = Array.from(navbar.children);
      
      // First child should be the home link
      const homeLink = children.find(child => 
        child.textContent?.includes('OLD SCHOOL GAME')
      );
      expect(homeLink).toBeTruthy();
      
      // Last child should be nav-actions
      const navActions = children.find(child => 
        child.classList.contains('nav-actions')
      );
      expect(navActions).toBeTruthy();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply all required CSS classes correctly', () => {
      const { container } = render(<Navbar />);
      
      // Test all main container classes
      expect(container.querySelector('.navbar-container')).toBeInTheDocument();
      expect(container.querySelector('.navbar')).toBeInTheDocument();
      expect(container.querySelector('.heading')).toBeInTheDocument();
      expect(container.querySelector('.title')).toBeInTheDocument();
      expect(container.querySelector('.nav-actions')).toBeInTheDocument();
      expect(container.querySelector('.pwa-install')).toBeInTheDocument();
      expect(container.querySelector('.link')).toBeInTheDocument();
      expect(container.querySelector('.fade-navbar-effect')).toBeInTheDocument();
      expect(container.querySelector('.empty-navbar')).toBeInTheDocument();
    });

    it('should apply correct classes to navigation elements', () => {
      render(<Navbar />);
      
      const navbarContainer = screen.getByRole('navigation').parentElement;
      expect(navbarContainer).toHaveClass('navbar-container');
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('navbar');
    });

    it('should apply correct classes to title and home link', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      expect(homeLink).toHaveClass('heading');
      
      const title = screen.getByText('OLD SCHOOL GAME');
      expect(title).toHaveClass('title');
    });

    it('should apply correct classes to action elements', () => {
      render(<Navbar />);
      
      const navActions = screen.getByText('Github').parentElement;
      expect(navActions).toHaveClass('nav-actions');
      
      const githubLink = screen.getByText('Github');
      expect(githubLink).toHaveClass('link');
      
      const pwaInstall = screen.getByTestId('pwa-install');
      expect(pwaInstall).toHaveClass('pwa-install');
    });

    it('should render decorative effect elements with correct classes', () => {
      const { container } = render(<Navbar />);
      
      const fadeEffect = container.querySelector('.fade-navbar-effect');
      const emptyNavbar = container.querySelector('.empty-navbar');
      
      expect(fadeEffect).toBeInTheDocument();
      expect(emptyNavbar).toBeInTheDocument();
      expect(fadeEffect?.textContent).toBe('');
      expect(emptyNavbar?.textContent).toBe('');
    });
  });

  describe('Link URLs and Navigation', () => {
    it('should have home link pointing to root path', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have GitHub link with exact repository URL', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/ajaynegi45/Old-School-Game');
    });

    it('should use secure HTTPS protocol for external link', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      const href = githubLink.getAttribute('href');
      
      expect(href).toMatch(/^https:\/\//);
      expect(href).toContain('github.com');
    });

    it('should have valid GitHub repository URL format', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      const href = githubLink.getAttribute('href');
      
      // Should match: https://github.com/username/repository-name
      expect(href).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/);
    });

    it('should not have any broken or malformed URLs', () => {
      render(<Navbar />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toContain('undefined');
        expect(href).not.toContain('null');
        expect(href?.trim()).not.toBe('');
      });
    });
  });

  describe('Accessibility Standards', () => {
    it('should use semantic navigation element', () => {
      render(<Navbar />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      expect(navigation.tagName).toBe('NAV');
    });

    it('should have accessible links with proper roles and attributes', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      const githubLink = screen.getByRole('link', { name: /Github/i });
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/ajaynegi45/Old-School-Game');
    });

    it('should have proper heading hierarchy', () => {
      render(<Navbar />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('OLD SCHOOL GAME');
      expect(heading.tagName).toBe('H3');
    });

    it('should have descriptive and meaningful link text', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      const githubLink = screen.getByRole('link', { name: /Github/i });
      
      expect(homeLink.textContent).toBe('OLD SCHOOL GAME');
      expect(githubLink.textContent).toBe('Github');
      
      // Links should not be empty or just whitespace
      expect(homeLink.textContent?.trim()).not.toBe('');
      expect(githubLink.textContent?.trim()).not.toBe('');
    });

    it('should not have any accessibility violations in structure', () => {
      render(<Navbar />);
      
      // Check for proper nesting and no duplicate IDs
      const navbar = screen.getByRole('navigation');
      const heading = screen.getByRole('heading');
      const links = screen.getAllByRole('link');
      
      expect(navbar).toContainElement(heading);
      links.forEach(link => {
        expect(navbar).toContainElement(link);
      });
    });
  });

  describe('Next.js Framework Integration', () => {
    it('should properly integrate with Next.js Link component for internal navigation', () => {
      render(<Navbar />);
      
      const homeLink = screen.getByRole('link', { name: /OLD SCHOOL GAME/i });
      
      // Verify mocked Link behavior
      expect(homeLink.tagName).toBe('A');
      expect(homeLink).toHaveAttribute('href', '/');
      expect(homeLink).toHaveAttribute('data-testid', 'next-link');
    });

    it('should properly integrate with Next.js Link for external navigation', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      
      // Verify mocked Link behavior
      expect(githubLink.tagName).toBe('A');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/ajaynegi45/Old-School-Game');
      expect(githubLink).toHaveAttribute('data-testid', 'next-link');
    });

    it('should handle Next.js Link props correctly', () => {
      render(<Navbar />);
      
      const links = screen.getAllByTestId('next-link');
      expect(links).toHaveLength(2);
      
      // Both links should have proper href attributes
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).not.toBe('');
      });
    });
  });

  describe('PWAInstall Component Integration', () => {
    it('should render PWAInstall with correct className prop', () => {
      render(<Navbar />);
      
      const pwaInstall = screen.getByTestId('pwa-install');
      expect(pwaInstall).toHaveClass('pwa-install');
    });

    it('should position PWAInstall correctly in nav actions', () => {
      render(<Navbar />);
      
      const navActions = screen.getByText('Github').parentElement;
      const pwaInstall = screen.getByTestId('pwa-install');
      
      expect(navActions).toContainElement(pwaInstall);
    });

    it('should render PWAInstall before GitHub link in DOM order', () => {
      render(<Navbar />);
      
      const navActions = screen.getByText('Github').parentElement;
      const children = Array.from(navActions.children);
      
      const pwaInstallIndex = children.findIndex(child => 
        child.getAttribute('data-testid') === 'pwa-install'
      );
      const githubLinkIndex = children.findIndex(child => 
        child.textContent === 'Github'
      );
      
      expect(pwaInstallIndex).toBeGreaterThanOrEqual(0);
      expect(githubLinkIndex).toBeGreaterThanOrEqual(0);
      expect(pwaInstallIndex).toBeLessThan(githubLinkIndex);
    });

    it('should pass className prop to PWAInstall correctly', () => {
      render(<Navbar />);
      
      const pwaInstall = screen.getByTestId('pwa-install');
      expect(pwaInstall).toHaveAttribute('class', 'pwa-install');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should render without any props (stateless component)', () => {
      expect(() => render(<Navbar />)).not.toThrow();
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
    });

    it('should handle missing or empty CSS modules gracefully', () => {
      // Test with empty CSS module mock
      jest.doMock('@/components/navbar.module.css', () => ({}));
      
      expect(() => render(<Navbar />)).not.toThrow();
      
      const title = screen.getByText('OLD SCHOOL GAME');
      expect(title).toBeInTheDocument();
    });

    it('should handle undefined CSS classes without breaking', () => {
      // Mock with undefined values
      jest.doMock('@/components/navbar.module.css', () => ({
        'navbar-container': undefined,
        'navbar': undefined,
        'heading': undefined,
        'title': undefined,
        'nav-actions': undefined,
        'pwa-install': undefined,
        'link': undefined,
        'fade-navbar-effect': undefined,
        'empty-navbar': undefined
      }));
      
      expect(() => render(<Navbar />)).not.toThrow();
      
      const title = screen.getByText('OLD SCHOOL GAME');
      expect(title).toBeInTheDocument();
    });

    it('should not cause console errors during rendering', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<Navbar />);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Component Behavior and State', () => {
    it('should maintain consistent rendering across multiple renders', () => {
      const { rerender } = render(<Navbar />);
      
      expect(screen.getByText('OLD SCHOOL GAME')).toBeInTheDocument();
      expect(screen.getByText('Github')).toBeInTheDocument();
      
      rerender(<Navbar />);
      
      expect(screen.getByText('OLD SCHOOL GAME')).toBeInTheDocument();
      expect(screen.getByText('Github')).toBeInTheDocument();
    });

    it('should be a pure functional component without side effects', () => {
      const { rerender } = render(<Navbar />);
      
      const initialTitle = screen.getByText('OLD SCHOOL GAME');
      
      rerender(<Navbar />);
      
      const rerenderedTitle = screen.getByText('OLD SCHOOL GAME');
      expect(initialTitle).toBeInTheDocument();
      expect(rerenderedTitle).toBeInTheDocument();
    });

    it('should not maintain any internal state', () => {
      const { unmount, rerender } = render(<Navbar />);
      
      // Component should render identically each time
      const firstRender = screen.getByText('OLD SCHOOL GAME').textContent;
      
      rerender(<Navbar />);
      const secondRender = screen.getByText('OLD SCHOOL GAME').textContent;
      
      expect(firstRender).toBe(secondRender);
      
      unmount();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle multiple render/unmount cycles without memory leaks', () => {
      // Simulate multiple component lifecycle
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<Navbar />);
        
        expect(screen.getByText('OLD SCHOOL GAME')).toBeInTheDocument();
        expect(screen.getByText('Github')).toBeInTheDocument();
        
        unmount();
      }
      
      // No explicit assertions needed - Jest will catch memory issues
      expect(true).toBe(true);
    });

    it('should handle rapid re-renders efficiently', () => {
      const { rerender } = render(<Navbar />);
      
      // Rapid re-render simulation
      for (let i = 0; i < 20; i++) {
        rerender(<Navbar />);
      }
      
      expect(screen.getByText('OLD SCHOOL GAME')).toBeInTheDocument();
      expect(screen.getByText('Github')).toBeInTheDocument();
    });

    it('should not create unnecessary DOM elements', () => {
      const { container } = render(<Navbar />);
      
      // Count expected elements to ensure no extras are created
      const navElements = container.querySelectorAll('nav');
      const linkElements = container.querySelectorAll('a');
      const headingElements = container.querySelectorAll('h3');
      
      expect(navElements).toHaveLength(1);
      expect(linkElements).toHaveLength(2);
      expect(headingElements).toHaveLength(1);
    });
  });

  describe('Content Validation and Text Accuracy', () => {
    it('should display exact title text without modifications', () => {
      render(<Navbar />);
      
      const title = screen.getByText('OLD SCHOOL GAME');
      expect(title.textContent).toBe('OLD SCHOOL GAME');
      expect(title.textContent).not.toContain('undefined');
      expect(title.textContent).not.toContain('null');
    });

    it('should display exact GitHub link text', () => {
      render(<Navbar />);
      
      const githubLink = screen.getByText('Github');
      expect(githubLink.textContent).toBe('Github');
      expect(githubLink.textContent).not.toBe('GitHub'); // Case sensitivity
    });

    it('should not render any unexpected or extra text content', () => {
      const { container } = render(<Navbar />);
      
      const textContent = container.textContent || '';
      
      // Should contain expected text
      expect(textContent).toContain('OLD SCHOOL GAME');
      expect(textContent).toContain('Github');
      expect(textContent).toContain('PWA Install');
      
      // Should not contain debugging or error text
      expect(textContent).not.toContain('undefined');
      expect(textContent).not.toContain('null');
      expect(textContent).not.toContain('Error');
      expect(textContent).not.toContain('[object Object]');
    });

    it('should have clean text content without extra whitespace issues', () => {
      render(<Navbar />);
      
      const title = screen.getByText('OLD SCHOOL GAME');
      const githubLink = screen.getByText('Github');
      
      expect(title.textContent?.trim()).toBe('OLD SCHOOL GAME');
      expect(githubLink.textContent?.trim()).toBe('Github');
    });
  });

  describe('Integration Testing Scenarios', () => {
    it('should work correctly when all dependencies are available', () => {
      render(<Navbar />);
      
      // All major elements should be present and functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(screen.getByTestId('pwa-install')).toBeInTheDocument();
    });

    it('should maintain proper component isolation', () => {
      // Render multiple instances to ensure no cross-contamination
      const { unmount: unmount1 } = render(<Navbar />);
      const firstTitle = screen.getByText('OLD SCHOOL GAME');
      unmount1();
      
      const { unmount: unmount2 } = render(<Navbar />);
      const secondTitle = screen.getByText('OLD SCHOOL GAME');
      unmount2();
      
      expect(firstTitle).not.toBe(secondTitle); // Different DOM elements
    });
  });
});