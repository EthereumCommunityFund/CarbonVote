import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { HiOutlineMenuAlt1 } from 'react-icons/hi';

import { navBarRoutes } from '@/constant/routes';

export const NavigationBar = () => {
  const router = useRouter();
  const [navBarOpen, setNavBarOpen] = useState<boolean>(false);
  const routes = navBarRoutes;

  const handleNavBarShow = () => {
    setNavBarOpen(!navBarOpen);
  };
  return (
    <>
      {/* Mobile menu button */}
      <div className="z-50 top-4 left-3 fixed">
        <button
          onClick={handleNavBarShow}
          className="block md:hidden "
          aria-label="Open Dashboard Menu"
        >
          <HiOutlineMenuAlt1 size={28} />
        </button>
      </div>
      {/* Overlay that can close the dashboard menu */}
      <div
        className={`fixed inset-0 bg-black/10 z-10 ${
          navBarOpen ? 'block' : 'hidden'
        }`}
        onClick={handleNavBarShow}
      ></div>
      <nav
        className={`dashboard-menu min-w-[260px] fixed flex flex-col h-screen bg-grayBackground py-10 px-6 transition-transform duration-300 ${
          navBarOpen && 'open'
        }`}
      >
        <div className="flex-1 flex flex-col">
          <div className="mt-12 flex-1">
            <ul className="space-y-3 text-white">
              {routes.map((route, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm transition duration-200 space-x-2 py-2 font-semibold px-3 hover:bg-white/20 rounded-3xl ${
                    router.pathname === route.path
                      ? 'bg-white/20'
                      : 'opacity-60'
                  }`}
                >
                  <Link href={route.path} className="w-full ">
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
