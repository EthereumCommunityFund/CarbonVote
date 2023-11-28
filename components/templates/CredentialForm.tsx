import { Label } from "@radix-ui/react-label"
import ToggleSwitchButton from "../ui/buttons/ToggleSwitchButton"

export const CredentialForm = () => {
  return (
    <div className="flex flex-col gap-8 py-2.5">
      {/* ZuPass Credentials*/}
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton />
          <Label className="text-lg">Add ZuPass Credentials</Label>
        </div>
        <Label className="text-sm text-black/60">This is the ZuPass Credentials</Label>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Credentials</Label>
        <select
          className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="ZuPass Credentials"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
            ZuConnect Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="everyday">
            ZuConnect Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="weekly">
            ZuConnect Resident
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-5 gap-2">
          <ToggleSwitchButton />
          <Label className="text-lg">Add GitCoin Passport Credentials</Label>
        </div>
        <Label className="text-sm text-black/60">This is the GitCoin Passport Credentials</Label>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Credentials</Label>
        <select
          className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="GitCoin Credentials"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
            GitCoin Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="everyday">
            GitCoin Resident
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="weekly">
            GitCoin Resident
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-2xl font-semibold">Select Other Signals</Label>
        <select
          className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="Other Signals"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="once">
            Protocol Guild Member
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="everyday">
            Protocol Guild Member
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="weekly">
            Protocol Guild Member
          </option>
        </select>
      </div>
    </div>
  )
}