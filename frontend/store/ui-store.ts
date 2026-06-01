import { create } from 'zustand';

interface UIStore {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCheckoutOpen: boolean;
  isNotificationOpen: boolean;
  isDiagramDrawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openNotification: () => void;
  closeNotification: () => void;
  toggleNotification: () => void;
  openDiagramDrawer: () => void;
  closeDiagramDrawer: () => void;
  toggleDiagramDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCheckoutOpen: false,
  isNotificationOpen: false,
  isDiagramDrawerOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  openNotification: () => set({ isNotificationOpen: true }),
  closeNotification: () => set({ isNotificationOpen: false }),
  toggleNotification: () => set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
  openDiagramDrawer: () => set({ isDiagramDrawerOpen: true }),
  closeDiagramDrawer: () => set({ isDiagramDrawerOpen: false }),
  toggleDiagramDrawer: () => set((state) => ({ isDiagramDrawerOpen: !state.isDiagramDrawerOpen })),
}));