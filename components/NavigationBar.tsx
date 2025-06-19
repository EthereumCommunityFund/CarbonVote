import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { navBarRoutes } from '@/constant/routes';

export const NavigationBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleRouteChange = () => closeMenu();
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-lg md:hidden text-xl"
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mt-16 md:mt-8">
            <nav>
              <ul className="space-y-2">
                {navBarRoutes.map((route) => {
                  const isActive = router.pathname === route.path;
                  return (
                    <li key={route.path}>
                      <Link
                        href={route.path}
                        className={`
                          block px-4 py-3 rounded-lg transition-all duration-200
                          text-sm font-medium
                          ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                        onClick={closeMenu}
                      >
                        {route.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
