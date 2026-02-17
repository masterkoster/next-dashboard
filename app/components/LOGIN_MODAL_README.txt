/**
 * =====================================================
 * LOGIN/SIGNUP MODAL SYSTEM - EXPLANATION
 * =====================================================
 * 
 * This system replaces the old "/login" page redirects with a dynamic modal
 * that appears inline on any page. Users can sign in or create an account
 * without leaving the page they're on.
 * 
 * ---------------------------------------------------
 * HOW IT WORKS:
 * ---------------------------------------------------
 * 
 * 1. AuthModalContext (app/components/AuthModalContext.tsx)
 *    - A React Context that manages global state for the login modal
 *    - Provides: isOpen, openLoginModal(), openSignupModal(), closeModal()
 *    - Wrap any component with useAuthModal() to trigger the modal from anywhere
 * 
 * 2. LoginModal (app/components/LoginModal.tsx)
 *    - The actual modal UI with:
 *      - Toggle between Sign In / Sign Up tabs
 *      - Email/password fields
 *      - Form validation
 *      - Error handling display
 *      - "Continue as Guest" option
 *    - Uses NextAuth's signIn() with redirect:false for AJAX login
 *    - Auto-redirects after successful login if redirectTo param provided
 * 
 * 3. ClientLayout (app/components/client-layout.tsx)
 *    - Wraps the entire app with:
 *      - SessionProvider (NextAuth)
 *      - AuthModalProvider (our custom context)
 *    - Renders LoginModal at the app level (hidden by default)
 * 
 * ---------------------------------------------------
 * HOW TO USE:
 * ---------------------------------------------------
 * 
 * In any component that needs to trigger login:
 * 
 *   import { useAuthModal } from '@/app/components/AuthModalContext';
 *   
 *   function MyComponent() {
 *     const { openLoginModal } = useAuthModal();
 *     
 *     return (
 *       <button onClick={() => openLoginModal()}>
 *         Sign In
 *       </button>
 *     );
 *   }
 * 
 * Optional: Pass a redirect URL:
 *   openLoginModal('/dashboard');  // Will redirect here after login
 * 
 * ---------------------------------------------------
 * BENEFITS:
 * ---------------------------------------------------
 * - Users stay on the same page while signing in
 * - Better UX - no jarring page transitions
 * - Works globally - trigger from header, footer, or anywhere
 * - Handles both login AND signup in one modal
 * - "Continue as Guest" option still available
 * 
 * ---------------------------------------------------
 * PAGES UPDATED TO USE MODAL:
 * ---------------------------------------------------
 * - Landing page (app/page.tsx)
 * - Navigation (app/components/navigation.tsx)
 * - Settings page (app/settings/page.tsx)
 * - Trips page (app/trips/page.tsx)
 * 
 * The old /login page still exists for direct links/bookmarks.
 */
