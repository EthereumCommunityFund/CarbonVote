'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FiArrowLeft, FiX, FiPlus, FiArrowDown } from 'react-icons/fi';

import CheckBox from '@/components/ui/CheckBox';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import StyledSwitch from '@/components/switch';
import {
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from 'react-hook-form';
import { useCreatePoll, FormData } from './useCreatePoll';
import { MarkdownLogo, PlusCircle } from '@phosphor-icons/react';
import { FieldArrayWithId } from 'react-hook-form';
import EditorPro from '@/components/editorPro';
import { getCurrentTimeZone, getTimezoneAbbreviation } from '@/utils/time';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import POAPEvents from '../POAPEvents';
import { POLL_CATEGORIES } from './constant';
import SelectTag from '../ selectTag';
import TagInput from '../inputTag';
import { IS_PROD } from '@/src/constants';

interface ZupassOptionType {
  value: string;
  label: string;
}
const Options: ZupassOptionType[] = [
  { value: 'Zuzalu', label: 'Zuzalu Resident' },
  { value: 'Zuconnect', label: 'ZuConnect Resident' },
  { value: 'Devconnect', label: 'DevConnect Attendee' },
];

export const allZupassOptions = Options.map((cred) => cred.value);

const renderErrorMessage = (
  error:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | Merge<FieldError, (FieldError | undefined)[]>
    | undefined
) => {
  if (error && typeof (error as any).message === 'string') {
    return (
      <p className="text-red-500 text-xs italic mt-[1px]">
        {(error as any).message}
      </p>
    );
  }
  if (error && typeof error.message === 'string') {
    return (
      <p className="text-red-500 text-xs italic mt-[1px]">{error.message}</p>
    );
  }
  return null;
};

export const CreatePollForm: React.FC = () => {
  const timeZone: string = getCurrentTimeZone();
  const timeZoneAbbr = getTimezoneAbbreviation();

  const {
    control,
    handleSubmit,
    getValues,
    fields,
    errors,
    ethHolding,
    poapsEnabled,
    zupassEnabled,
    // protocolGuildMemberEnabled,
    gitcoinPassport,
    // ethSoloStaker,
    whitelistedAddressesEnabled,
    selectedEthHoldingOption,
    // selectedProtocolGuildOption,
    addOption,
    removeOption,
    toggleAll,
    onSubmit,
    handleBack,
    isLoading,
  } = useCreatePoll(allZupassOptions);

  const selectedNumber = useMemo(() => {
    return [
      ethHolding,
      poapsEnabled,
      zupassEnabled,
      // protocolGuildMemberEnabled,
      gitcoinPassport,
      // ethSoloStaker,
      whitelistedAddressesEnabled,
    ].filter(Boolean).length;
  }, [
    ethHolding,
    poapsEnabled,
    zupassEnabled,
    // protocolGuildMemberEnabled,
    gitcoinPassport,
    // ethSoloStaker,
    whitelistedAddressesEnabled,
  ]);

  const showNestedInfoDiv = useMemo(
    () => selectedNumber >= 2,
    [selectedNumber]
  );

  return (
    <div>
      <div className="w-full">
        <Button
          className="rounded-full mb-[10px] sm:mb-[10px] md:mb-[20px]"
          leftIcon={<FiArrowLeft />}
          onClick={handleBack}
        >
          Back
        </Button>
      </div>

      {/* Create Poll */}
      <div className="bg-white rounded-[10px] flex flex-col items-start self-stretch w-full border border-black/10">
        <div className="p-[20px_20px_10px] sm:p-[20px_20px_10px] md:p-[20px] w-full">
          <Label className="text-[20px] sm:text-[20px] md:text-[25px] text-black font-bold font-['Inter'] leading-[30px] opacity-50 w-full text-left">
            Create Poll
          </Label>
        </div>
        <div className="w-full flex flex-col gap-[30px] p-[10px] sm:p-[10px] md:p-[20px]">
          <div className="flex flex-col items-start gap-[14px] w-full">
            <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[18px]">
              Motion Title
            </Label>
            <Controller
              name="motionTitle"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    placeholder={'Motion Title'}
                    className="w-full flex px-[12px] py-[10px] items-center h-[44px]"
                    hasError={!!error}
                  />
                  {renderErrorMessage(errors.motionTitle)}
                </>
              )}
            />
          </div>

          <div className="flex flex-col items-start gap-[6px] sm:gap-[6px] md:gap-[14px] w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[18px]">
                Select a Category
              </Label>
              <span className="text-black text-[14px] font-['Inter'] font-normal leading-[18px] opacity-70">
                Max: 3
              </span>
            </div>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <>
                  <SelectTag
                    value={field.value}
                    onChange={field.onChange}
                    selectOptions={POLL_CATEGORIES}
                    placeholder="Choose a category"
                    maxSelect={3}
                  />
                  {renderErrorMessage(errors.categories)}
                </>
              )}
            />
          </div>
          {/* tags */}
          <div className="flex flex-col items-start gap-[8px] w-full">
            <div className="flex flex-col gap-[10px] w-full">
              <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[18px]">
                Create Tags
              </Label>
              <span className="text-black text-[14px] font-['Inter'] font-normal leading-[18px] opacity-70">
                Max: 5
              </span>
            </div>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="type a tag"
                    fullWidth
                    maxTags={5}
                    maxDisplayItems={5}
                  />
                  {renderErrorMessage(errors.tags)}
                </>
              )}
            />
          </div>

          <div className="flex flex-col items-start gap-[10px] w-full">
            <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[21.6px]">
              Motion Description
            </Label>
            <Controller
              name="motionDescription"
              control={control}
              render={({ field }) => (
                <EditorPro
                  value={field.value}
                  onChange={field.onChange}
                  className={{
                    base: 'min-h-[190px] rounded-[10px] border border-black/10 bg-[#F9F9F9]',
                  }}
                  placeholder="Type a description for this poll"
                />
              )}
            />
            <div className="flex items-center gap-[6px]">
              <MarkdownLogo size={20} weight="fill" />
              <div className="text-[13px] font-['Inter'] font-normal leading-[15.6px] opacity-70">
                Markdown Available
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col items-start gap-[10px] w-full">
              <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[21.6px]">
                Options
              </Label>
              <span className="text-black text-[13px] font-['Inter'] font-normal leading-[15.6px] opacity-80">
                Minimum of 2 options
              </span>
            </div>
            {renderErrorMessage(errors.options as FieldError | undefined)}
            {(fields as FieldArrayWithId<FormData, 'options', 'id'>[]).map(
              (field, index: number) => (
                <div
                  key={field.id}
                  className="flex w-full space-x-2 items-center"
                >
                  <Controller
                    name={`options.${index}.name`}
                    control={control}
                    render={({
                      field: controllerField,
                      fieldState: { error },
                    }) => (
                      <div
                        className={`flex-grow ${error ? 'border border-red-500 rounded' : ''}`}
                      >
                        <CheckerButton
                          option={getValues(`options.${index}`)}
                          idx={index}
                          onInputChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            controllerField.onChange(e.target.value);
                          }}
                          onDelete={
                            index > 1 ? () => removeOption(index) : undefined
                          }
                        />
                        {renderErrorMessage(errors.options?.[index]?.name)}
                      </div>
                    )}
                  />
                </div>
              )
            )}

            {fields.length < 5 && (
              <div className="flex justify-center sm:justify-center md:justify-end">
                <Button
                  type="button"
                  className="flex items-center justify-center px-[18px] py-[10px] bg-[#F5F5F5] rounded-[20px] text-black font-['Inter'] font-medium text-[14px] gap-[5px] w-full sm:w-full md:w-auto"
                  onClick={addOption}
                >
                  <FiPlus size={16} />
                  <span className="text-[14px] font-medium">Add an Option</span>
                </Button>
              </div>
            )}
            {fields.length > 4 && (
              <div className="flex justify-left">
                <span className="text-sm text-gray-500">
                  Note: If you want to post frame link on farcaster, it will
                  only show 4 top options
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-[10px] w-full">
            <Label className="text-black text-[16px] font-['Inter'] font-semibold leading-[18px]">
              End Date/Time
            </Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="endDateTime"
                control={control}
                render={({ field }) => (
                  <>
                    <DateTimePicker
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      className="w-full font-['Inter'] text-[15px] font-normal leading-[1.21em] text-black bg-[#F9F9F9] border border-black/10 rounded-[6px] py-[10px] px-[10px]"
                    />
                    {renderErrorMessage(errors.endDateTime)}
                  </>
                )}
              />
            </LocalizationProvider>
            <div className="flex items-center gap-[10px] text-[13px] font-['Inter'] font-normal w-full mb-[10px] opacity-50">
              <span>Your timezone:</span>
              <span>
                {timeZone} {timeZoneAbbr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Methods */}
      <div className="bg-white rounded-[10px] flex flex-col items-start self-stretch px-[10px] sm:px-[10px] md:px-[20px] py-[20px] pb-[20px] mt-[20px] w-full border border-black/10">
        <div className="flex flex-col gap-[10px] sm:gap-[10px] md:gap-[30px] mb-[20px] sm:mb-[20px] md:mb-[40px] w-full">
          <div>
            <Label className="text-[20px] sm:text-[20px] md:text-[25px] text-black font-['Inter'] font-bold leading-[30px] opacity-50 w-full text-left">
              Voting Methods
            </Label>
          </div>
          <div className="">
            <Label className="w-full text-left text-black text-[14px] sm:text-[14px] md:text-[18px] font-['Inter'] font-semibold">
              Select Credentials
            </Label>
            {renderErrorMessage(errors.ethHolding)}
          </div>
        </div>

        <div className="flex flex-col items-start w-full">
          <button
            type="button"
            className="text-black text-[14px] font-['Inter'] font-bold leading-[16.8px] bg-[#F5F5F5] rounded-[20px] px-[18px] py-[10px] opacity-70 mb-[20px] w-full sm:w-full md:w-auto text-center sm:text-center md:text-left"
            onClick={toggleAll}
          >
            Select All
          </button>
          <div className="flex flex-col gap-[10px] w-full">
            {/* Ether Holding */}
            <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[14px] sm:px-[14px] md:px-[20px] py-[14px] sm:py-[14px] md:py-[20px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="ethHolding"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[10px] text-[14px] sm:text-[14px] md:text-[16px] font-['Inter'] font-semibold">
                  <img
                    src="images/eth_logo.svg"
                    alt="Ethereum Logo"
                    className="w-[20px] h-[20px]"
                  />
                  <span>Ether Holding</span>
                </div>
              </div>
              {ethHolding ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[14px] sm:text-[14px] md:text-[16px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    The real-time quantity of ETH held in the address that
                    participates in the voting are counted as votes.
                  </p>
                  <div className="flex flex-col gap-[20px]">
                    <div className="flex flex-row gap-[20px] w-full">
                      <Controller
                        name="selectedEthHoldingOption"
                        control={control}
                        render={({ field }) => (
                          <CheckBox
                            checked={field.value.includes('on-chain')}
                            onChange={() => {
                              const value = 'on-chain';
                              const currentValues = field.value || [];
                              const updatedValues = currentValues.includes(
                                value
                              )
                                ? currentValues.filter(
                                    (option: string) => option !== value
                                  )
                                : [...currentValues, value];
                              field.onChange(updatedValues);
                            }}
                          />
                        )}
                      />
                      <div className="flex flex-col gap-[20px] sm:gap-[20px] md:gap-[10px]">
                        <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-start md:items-center gap-[5px] sm:gap-[5px] md:gap-[10px]">
                          <span className="text-black font-['Inter'] text-[16px] font-semibold opacity-80">
                            Ether Holding v1
                          </span>
                          <span className="text-black font-['Inter'] text-[11px] sm:text-[11px] md:text-[13px] font-medium uppercase opacity-50">
                            {`(implements smart contract for On-Chain voting)`}
                          </span>
                        </div>
                        <div className="flex items-start gap-[10px] text-[13px] font-['Inter']">
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span className="opacity-80">
                            Poll creators and voters will need to pay for
                            transaction fees for deployment of contract and
                            voting.{' '}
                            <span className="font-bold">
                              (Contract is under auditing)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-[10px] text-[13px] font-['Inter']">
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span className="opacity-80">
                            The poll results will dynamically show vote changes
                            according to the state of blockchain until the end
                            of the poll. Voters can send transaction from
                            wallets off-site.
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-[20px] w-full">
                      <Controller
                        name="selectedEthHoldingOption"
                        control={control}
                        render={({ field }) => (
                          <CheckBox
                            checked={field.value.includes('off-chain')}
                            onChange={() => {
                              const value = 'off-chain';
                              const currentValues = field.value || [];
                              const updatedValues = currentValues.includes(
                                value
                              )
                                ? currentValues.filter(
                                    (option: string) => option !== value
                                  )
                                : [...currentValues, value];
                              field.onChange(updatedValues);
                            }}
                            disabled={false} // Set to true to see disabled state
                          />
                        )}
                      />
                      <div className="flex flex-col gap-[20px] md:gap-[10px] sm:gap-[20px]">
                        <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-start md:items-center gap-[5px] sm:gap-[5px] md:gap-[10px]">
                          <span className="text-black font-['Inter'] text-[16px] font-semibold opacity-80">
                            Ether Holding v2
                          </span>
                          <span className="text-black font-['Inter'] text-[11px] sm:text-[11px] md:text-[13px] font-medium uppercase opacity-50">
                            {`(Off-chain voting via Ceramic Network/IPFS)`}
                          </span>
                        </div>
                        <div className="flex items-start gap-[10px] text-[13px] font-['Inter']">
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span className="opacity-80">
                            Verification is ensured through IPFS/Ceramic.
                            (Recommmend)
                          </span>
                        </div>
                        <div className="flex items-start gap-[10px] text-[13px] font-['Inter']">
                          <img
                            src="/images/farcaster.png"
                            alt="Info"
                            className="opacity-20 w-[20px] h-[20px]"
                          />
                          <span className="opacity-80">
                            This method is supported in Farcaster Frames.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderErrorMessage(errors.selectedEthHoldingOption)}
                </div>
              ) : null}
            </div>
            {/* POAPs Credentials */}
            <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] md:px-[20px] sm:px-[14px] py-[20px] md:py-[20px] sm:py-[14px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="poapsEnabled"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-semibold">
                  <img src="images/poaps.svg" alt="POAPs Logo" />
                  <span>POAPs Credentials</span>
                </div>
              </div>
              {poapsEnabled ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    POAP (Proof of Attendance Protocol) voters are individuals
                    who possess special non-fungible tokens (NFTs) known as
                    POAPs (link to poap.xyz).
                  </p>
                  <div className="flex items-start gap-[10px] text-[14px] font-['Inter']">
                    <img
                      src="/images/farcaster.png"
                      alt="Info"
                      className="opacity-20 w-[20px] h-[20px]"
                    />
                    <span>This method is supported in Farcaster Frames.</span>
                  </div>
                  <div className="flex flex-col gap-[20px] mt-[20px]">
                    <div className="flex flex-col gap-[2px]">
                      <POAPEvents />
                    </div>

                    <div className="flex flex-col items-start gap-[14px] w-full">
                      <Label className="text-black text-[13px] font-['Inter'] font-medium leading-[15.6px] opacity-70">
                        Minimum amount of POAPs required to vote
                      </Label>
                      <Controller
                        name="POAPNumber"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Input
                              {...field}
                              type="number"
                              step={1}
                              min={0}
                              placeholder={'5'}
                              className="w-full flex items-center h-[44px]"
                              hasError={!!error}
                            />
                            {renderErrorMessage(errors.POAPNumber)}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Zupass Credentials */}
            <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] md:px-[20px] sm:px-[14px] py-[20px] md:py-[20px] sm:py-[14px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="zupassEnabled"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-semibold">
                  <img src="images/zupass.svg" alt="Zupass Logo" />
                  <span>Zupass Credentials</span>
                </div>
              </div>

              {zupassEnabled ? (
                <div className="flex flex-col w-full">
                  {renderErrorMessage(errors.zupassCredential)}
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    Choose the eligible events (Zupass Ticket) for the poll. One
                    event ticket one vote. The votes are counted separately
                    according to each event.
                  </p>
                  <div className="flex flex-col gap-[20px]">
                    <div className="flex flex-col gap-[10px]">
                      <Controller
                        name="zupassCredential"
                        control={control}
                        render={({ field }) => (
                          <SelectTag
                            value={field.value}
                            onChange={field.onChange}
                            selectOptions={Options}
                            placeholder="Select Credentials"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Protocol Guild Member Credential */}
            {/* <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] py-[20px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="protocolGuildMemberEnabled"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] font-['Inter'] font-semibold">
                  <img src="images/guild.png" alt="Protocol Guild Logo" />
                  <span>Protocol Guild Member Credential</span>
                </div>
              </div>
              {protocolGuildMemberEnabled ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    Description: Voters are individuals who owns recognized
                    membership Protocol Guild. Each address (person) counts as
                    one vote.
                  </p>
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    <a
                      href="https://app.splits.org/accounts/0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 uppercase"
                    >
                      Source link
                    </a>
                    {'    '}Updated: 02/2024{' '}
                  </p>
                  <div className="flex flex-col gap-[20px]">
                    <label className="flex items-start gap-[10px] mt-[20px]">
                      <Controller
                        name="selectedProtocolGuildOption"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="radio"
                            value="on-chain"
                            checked={field.value === 'on-chain'}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="hidden"
                          />
                        )}
                      />
                      <div className="flex flex-col gap-[10px] -mt-[5px]">
                        <p className="font-['Inter']">
                          <b>Classic Carvonvote</b>: Select this option to
                          implement a smart contract for the vote tallying
                          process.{' '}
                        </p>
                        <div className="flex items-start gap-[10px] text-[14px] font-['Inter']">
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Poll creators and voters will need to pay for
                            transaction fees for deployment of contract and
                            voting. Voters can send transaction from wallets
                            off-site. (SC is under auditing)
                          </span>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-[10px] mt-[20px]">
                      <Controller
                        name="selectedProtocolGuildOption"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="radio"
                            value="off-chain"
                            checked={field.value === 'off-chain'}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="hidden"
                          />
                        )}
                      />
                      <div className="flex flex-col gap-[10px] -mt-[5px]">
                        <p className="font-['Inter']">
                          <b>Carbonvote V2</b>: Zero Transaction Costs for Poll
                          Creators and Voters: The voting process is conducted
                          off-chain.{' '}
                        </p>
                        <div className="flex items-start gap-[10px] text-[14px] font-['Inter']">
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Requires voters to sign in with Protocol Guild
                            recognised address. Verification is ensured through
                            IPFS/Ceramic.
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ) : null}
            </div> */}
            {/* Gitcoin Passport Credential */}
            <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] md:px-[20px] sm:px-[14px] py-[20px] md:py-[20px] sm:py-[14px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="gitcoinPassport"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-semibold">
                  <img src="images/gitcoin.svg" alt="Gitcoin Logo" />
                  <span>Gitcoin Passport</span>
                </div>
              </div>
              {gitcoinPassport ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    Voters are users of Gitcoin Passport indicating
                    participation or contribution within the Gitcoin ecosystem.
                    Determine the minimum score required for eligibility among
                    voters.
                  </p>
                  <div className="flex items-start gap-[10px] text-[14px] font-['Inter']">
                    <img
                      src="/images/farcaster.png"
                      alt="Info"
                      className="opacity-20 w-[20px] h-[20px]"
                    />
                    <span>This method is supported in Farcaster Frames.</span>
                  </div>
                  <div className="flex flex-col gap-[10px] mt-[20px]">
                    <div className="flex flex-col items-start gap-[14px] w-full">
                      <Label className="text-black text-[13px] font-['Inter'] font-medium leading-[15.6px]">
                        Minimum score required to vote
                      </Label>
                      <Controller
                        name="gitcoinScore"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              placeholder={'10'}
                              className="w-full flex items-center h-[44px]"
                              hasError={!!error}
                            />
                            {renderErrorMessage(errors.gitcoinScore)}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Ether Solo Staker Credential */}
            {/* <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] py-[20px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[20px]">
                <Controller
                  name="ethSoloStaker"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] font-['Inter'] font-semibold">
                  <img src="images/solo_staker.svg" alt="Solo Staker Logo" />
                  <span>Ether Solo Staker</span>
                </div>
              </div>
              {ethSoloStaker ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    Description: Ether Solo Staker voters are individuals who
                    stake their Ethereum (ETH) independently, without relying on
                    a staking pool or service. (Smart contract version will come
                    soon)
                  </p>
                  <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    <a
                      href="https://github.com/starknet-io/provisions-data/tree/main/eth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 uppercase"
                    >
                      Source link
                    </a>
                    {'    '}Updated: 03/2024{' '}
                  </p>
                  <div className="flex items-start gap-[10px] text-[14px] font-['Inter']">
                    <img src="/images/farcaster.png" alt="Info" className="opacity-20 w-[20px] h-[20px]" />
                    <span>This method is supported in Farcaster Frames.</span>
                  </div>
                  <div className="flex flex-col gap-[20px]"></div>
                </div>
              ) : null}
            </div> */}
            {/* Whitelisted Addresses */}
            <div className="rounded-[10px] border border-black/10 bg-black/[0.02] px-[20px] md:px-[20px] sm:px-[14px] py-[20px] md:py-[20px] sm:py-[14px] flex flex-col items-start gap-[20px] w-full">
              <div className="flex items-center gap-[17px]">
                <Controller
                  name="whitelistedAddressesEnabled"
                  control={control}
                  render={({ field }) => (
                    <StyledSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <div className="flex items-center gap-[20px] text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-semibold">
                  <img src="/images/address_book.svg" alt="Address Book" />
                  <span>Whitelisted Addresses</span>
                </div>
              </div>
              {whitelistedAddressesEnabled ? (
                <div className="flex flex-col w-full">
                  <p className="text-black font-['Inter'] text-[16px] md:text-[16px] sm:text-[14px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                    Input a select list of EVM addresses to vote
                  </p>

                  <div className="flex flex-col gap-[10px] w-full">
                    <div className="flex flex-row items-center rounded-[6px] bg-[#EFEFEF] border border-black/10 w-full px-[12px] py-[10px] gap-[10px]">
                      <Label className="text-black/50 text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-medium">
                        Your Network:{' '}
                      </Label>
                      <span className="text-black/70 text-[16px] md:text-[16px] sm:text-[14px] font-['Inter'] font-medium">
                        {IS_PROD ? 'Ethereum Mainnet' : 'Sepolia'}
                      </span>
                    </div>

                    <Label className="text-black opacity-70 text-[15px] font-['Inter'] font-medium leading-[1.4em] tracking-[1%] mt-[2px]">
                      {`Input addresses here (use the comma ',' to separate
                      addresses)`}
                    </Label>

                    <Controller
                      name="whitelistedAddresses"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <div className="flex flex-col w-full">
                            <Input
                              {...field}
                              type="textarea"
                              placeholder="0x000"
                              className="w-full flex px-[12px] py-[10px] items-center min-h-[100px]"
                              hasError={!!error}
                            />
                            {renderErrorMessage(errors.whitelistedAddresses)}
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showNestedInfoDiv && (
          <div className="flex flex-col items-center gap-[20px] w-full">
            <div className="flex items-center justify-center font-['Inter'] font-semibold bg-[#f0f0f0] rounded-[10px] text-black px-[8px] py-[6px] gap-[10px] mt-[10px]">
              <span className="opacity-50">
                You Selected Multiple Credentials
              </span>
              <FiArrowDown size={16} className="opacity-50" />
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row items-center gap-[20px] bg-[#f0f0f0] rounded-[10px] px-[20px] py-[20px] w-full">
              <img
                src="/images/nes.svg"
                alt="Nested Info"
                className="opacity-50"
              />
              {selectedNumber === 2 &&
              ethHolding &&
              selectedEthHoldingOption.includes('on-chain') &&
              selectedEthHoldingOption.length === 1 ? (
                // protocolGuildMemberEnabled &&
                // selectedProtocolGuildOption === 'on-chain' ? (
                <div>
                  <p className="font-['Inter'] text-[16px] md:text-[16px] sm:text-[14px] font-semibold">
                    <strong>
                      You are creating two smart contract polls. Please note
                      that smart contract poll are currently not supported in
                      Farcaster frames, Support coming soon.
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  <p className="font-['Inter'] text-[16px] md:text-[16px] sm:text-[14px] font-semibold">
                    <strong>You are creating a nested poll.</strong> (One
                    credential = One vote)
                  </p>
                  <span className="block text-[14px] font-['Inter']">
                    This allows a user to vote separately with each available
                    credential in a poll.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="w-full flex flex-col sm:flex-col md:flex-row items-center gap-[10px] box-border px-[10px] sm:px-[10px] md:px-[20px] py-[10px] sm:py-[10px] md:py-[20px] mt-[20px]">
        <Button
          type="button"
          className="bg-black/10 rounded-[20px] py-[10px] w-full flex items-center gap-[10px] justify-center font-['Inter'] font-semibold text-[16px] opacity-70"
          leftIcon={<FiX />}
          onClick={handleBack}
        >
          Discard
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          className="bg-black/10 rounded-[20px] py-[10px] w-full flex items-center gap-[10px] justify-center font-['Inter'] font-semibold text-[16px] opacity-70"
          leftIcon={<PlusCircle />}
          isLoading={isLoading}
        >
          Create Poll
        </Button>
      </div>
    </div>
  );
};

export default CreatePollForm;
