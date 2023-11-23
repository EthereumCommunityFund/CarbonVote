import { HeaderComponent } from "./Header";
import { NavigationBar } from "./NavigationBar";
export const HomePageProvider = ({ children, props }: { children: React.ReactNode; props: any }) => {
  return (
    <div className='bg-pagePrimary relative'>
      <NavigationBar />
      <HeaderComponent />
      <div className="relative lg:left-[260px] lg:w-[calc(100%-260px)]">
        <div className="h-[90vh] mx-auto relative ">
          {children}
        </div>
      </div>
    </div>
  )
}