import { useUserPassportContext } from "@/context/PassportContext"
import Button from "./ui/Button"

export const HeaderComponent = () => {
  const { signIn } = useUserPassportContext();
  return (
    <div className='bg-grayBackground flex w-full h-20 justify-end items-center p-5'>
      <Button className="outline-none h-10 items-center rounded-md" onClick={signIn}>Zupass Connect</Button>
    </div>
  )
}