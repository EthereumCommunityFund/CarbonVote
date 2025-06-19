import { Z_INDEX_MAP } from '@/styles/styleConstants';
import { HeaderComponent } from './Header';
import { NavigationBar } from './NavigationBar';
export const HomePageProvider = ({
  children,
  props,
}: {
  children: React.ReactNode;
  props: any;
}) => {
  return (
    <div
      className="fixed w-full bg-[#F7F7F7]"
      style={{ zIndex: Z_INDEX_MAP.homePageProvider }}
    >
      <HeaderComponent />
      <div className="relative overflow-y-auto" id="main-scroll-container">
        <div className="h-[calc(100vh-64px)] mx-auto relative">{children}</div>
      </div>
    </div>
  );
};
