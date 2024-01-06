import { useState } from "react"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import TextEditor from "./ui/TextEditor"
import ToggleSwitchButton from "./ui/buttons/ToggleSwitchButton"

export const PollForm = () => {
  const [pollDescription, setPollDescription] = useState<string>('');
  const [votingMethod, setVotingMethod] = useState<'EthHolding' | 'HeadCount'>('EthHolding');
  const [headCountVotingMethod, setHeadCountVotingMethod] = useState<'Ethereum event attendees only' | 'Gitcoin passport holders only' | 'Protocol Guild Member and Gitcoin and RPGF'>('Ethereum event attendees only');
  const [isZuPassRquired, setIsZuPassRequired] = useState<boolean>(false);
  const [isGitCoinPassRquired, setIsGitCoinPassRequired] = useState<boolean>(false);

  const handlePollDescriptionChange = (value: string) => {
    setPollDescription(value);
  };

  const handleVotingMethodSelect = (e: any) => {
    setVotingMethod(e.target.value);
  }

  const handleHeadCountVotingMethodSelect = (e: any) => {
    setHeadCountVotingMethod(e.target.value);
  }

  const handleIsZuPassRequired = () => {
    setIsZuPassRequired((prev) => !prev);
  };

  const handleIsGitCoinPassRequired = () => {
    setIsGitCoinPassRequired((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-5 text-white">
      <div className="px-5">
        <Label className="text-2xl font-bold">Create Poll</Label>
      </div>
      <div className="py-2.5 px-5 gap-5 text-white/60">
        <div className="flex flex-col gap-3.5">
          <Label className="text-lg">Motion Title</Label>
          <Input placeholder="Motion Title"></Input>
        </div>
        <div className="py-2.5 gap-5">
          <div className="flex flex-col gap-3.5">
            <Label className="text-lg">Motion Description</Label>
            <TextEditor
              value={pollDescription}
              onChange={handlePollDescriptionChange}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 px-5 text-white/80">
        <Label className="text-xl">Voting Method</Label>
        <select
          onChange={handleVotingMethodSelect}
          value={votingMethod}
          className="flex w-full text-white outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
          title="Voting"
        >
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="EthHolding">
            EthHolding
          </option>
          <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="HeadCount">
            HeadCount
          </option>
        </select>
      </div>
      {votingMethod === 'HeadCount' ?
        <div className="flex flex-col gap-3.5 px-5 text-white/80">
          <Label className="text-xl">HeadCount Method</Label>
          <select
            onChange={handleHeadCountVotingMethodSelect}
            value={headCountVotingMethod}
            className="flex w-full text-white outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
            title="HeadCountVoting"
          >
            <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="Ethereum event attendees only">
              {`Ethereum event attendees only`}
            </option>
            <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="Gitcoin passport holders only">
              {`Gitcoin passport holders only`}
            </option>
            <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="Protocol Guild Member and Gitcoin and RPGF">
              {`Protocol Guild Member and Gitcoin and RPGF`}
            </option>
          </select>
        </div> :
        <></>
      }
      <div className="flex flex-col gap-3.5 px-5 text-white/80">
        <Label className="text-xl font-bold">Access Rules</Label>
        <div className="flex gap-8 items-center">
          <ToggleSwitchButton checked={isZuPassRquired} onClick={handleIsZuPassRequired} />
          <Label className="text-lg">Require ZuPass</Label>
          {
            isZuPassRquired ?
              <></> :
              <></>
          }
        </div>
        <div className="flex gap-8 items-center">
          <ToggleSwitchButton checked={isGitCoinPassRquired} onClick={handleIsGitCoinPassRequired} />
          <Label className="text-lg">Require Gitcoin Passport</Label>
        </div>
      </div>
      <hr className="bg-grayBackground" />
      <div className="flex flex-col gap-3.5 px-5 text-white/80">
        <div>
          <Label className="text-xl">On-Chain Signals</Label>
          <div className="flex gap-8 items-center">
            <ToggleSwitchButton checked={isGitCoinPassRquired} onClick={handleIsGitCoinPassRequired} />
            <Label className="text-lg">Require Gitcoin Passport</Label>
          </div>
        </div>
      </div>
    </div>
  )
}