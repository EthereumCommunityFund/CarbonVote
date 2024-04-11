import { HeaderComponent } from "./Header";
import { NavigationBar } from "./NavigationBar";
export const HomePageProvider = ({ children, props }: { children: React.ReactNode; props: any }) => {
  return (
    <div className='fixed w-full z-50'>
      <HeaderComponent />
      <div className="relative overflow-y-auto bg-[#F7F7F7]">
        <div className="h-[calc(100vh-64px)] mx-auto relative">
          {children}
        </div>
      </div>
    </div>
  )
}