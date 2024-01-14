import { Label } from '@/components/ui/Label';

const VotingMethodSelect = ({ votingMethod, onChange }: any) => {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-2xl">Voting Method</Label>
            <div className="flex flex-col gap-1">
                <Label className="text-base">Select a Method</Label>
                <select
                    onChange={onChange}
                    value={votingMethod}
                    className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
                    title="Voting Method"
                >
                    <option
                        className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        value="ethholding"
                    >
                        EthHolding
                    </option>
                    <option
                        className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        value="headcount"
                    >
                        HeadCount
                    </option>
                </select>
            </div>
        </div>
    );
};

export default VotingMethodSelect;
