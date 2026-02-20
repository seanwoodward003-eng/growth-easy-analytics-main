// shopify-app-bridge.d.ts
// Type declarations for Shopify App Bridge Web Components (2025+ style)
// Used in embedded apps with <s-app-nav>, <s-link>, etc.

import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Navigation container for Shopify Admin sidebar
      's-app-nav': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        // Optional known attributes (most are not required)
        ['disable-scroll']?: boolean;
        ['enable-scroll']?: boolean;
      };

      // Individual navigation link/item
      's-link': React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        href: string;
        rel?: 'home' | 'external' | string;
        target?: '_blank' | '_self' | string;
        ['external-link']?: boolean;
        ['is-active']?: boolean;
        ['is-disabled']?: boolean;
        ['badge-count']?: number | string;
        ['badge-tone']?: 'attention' | 'info' | 'success' | 'warning' | 'critical';
      };

      // Common Polaris web components often used together
      's-page': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ['full-width']?: boolean;
      };

      's-card': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ['sectioned']?: boolean;
        ['padding']?: 'none' | 'small' | 'medium' | 'large';
      };

      's-button': React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'plain' | 'monochrome';
        tone?: 'success' | 'critical' | 'attention' | 'info';
        size?: 'micro' | 'small' | 'medium' | 'large';
        ['is-loading']?: boolean;
        ['is-disabled']?: boolean;
        ['icon-only']?: boolean;
      };

      's-badge': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        tone?: 'info' | 'success' | 'attention' | 'critical' | 'new' | 'warning';
        size?: 'small' | 'medium';
        ['is-pill']?: boolean;
      };

      // Add more as needed (e.g. s-modal, s-resource-list, s-text, etc.)
      // 's-modal': any;
      // 's-resource-item': any;
    }
  }
}

// Optional: If you're using the <script> tag approach and want global window.ShopifyAppBridge
interface Window {
  ShopifyAppBridge?: {
    // Very minimal – expand only if you use it in code
    createApp?: (config: any) => any;
  };
}

export {};