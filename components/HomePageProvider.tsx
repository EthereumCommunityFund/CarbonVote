import { HeaderComponent } from "./Header";
import { NavigationBar } from "./NavigationBar";
export const HomePageProvider = ({ children, props }: { children: React.ReactNode; props: any }) => {
  return (
    <div className='fixed overflow-y-hidden w-full'>
      <HeaderComponent />
      <div className="relative">
        <div className="h-[100vh] mx-auto relative bg-blue-50">
          {children}
        </div>
      </div>
    </div>
  )
}