import { HeaderComponent } from "./Header";
import { NavigationBar } from "./NavigationBar";
export const HomePageProvider = ({ children, props }: { children: React.ReactNode; props: any }) => {
  return (
    <div className='bg-pagePrimary relative'>
      <HeaderComponent />
      <div className="relative">
        <div className="h-[90vh] mx-auto relative ">
          {children}
        </div>
      </div>
    </div>
  )
}