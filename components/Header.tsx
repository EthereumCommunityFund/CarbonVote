import { useUserPassportContext } from "@/context/PassportContext"
import Button from "./ui/buttons/Button"
import Image from "next/image";
import { Label } from "./ui/Label";
import { BoltIcon } from "./icons";

export const HeaderComponent = () => {
  const { signIn } = useUserPassportContext();
  return (
    <div className='bg-white flex w-full h-16 justify-between items-center p-5 rounded-3xl'>
      <div className='flex gap-1.5 items-center'>
        <Image src={'/images/carbonvote.png'} width={30} height={30} alt={'Carbonvote'} />
        <Label className='text-red-600 text-lg'>Carbonvote</Label>
      </div>
      <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon} onClick={signIn}>Sign In</Button>
    </div>
  )
}