import { useUserPassportContext } from "@/context/PassportContext"
import Button from "./ui/Button"

export const HeaderComponent = () => {
  const { signIn } = useUserPassportContext();
  return (
    <div className='bg-grayBackground w-full h-20 z-30'>
      <Button className="outline-none" onClick={signIn}>Zupass Connect</Button>
    </div>
  )
}