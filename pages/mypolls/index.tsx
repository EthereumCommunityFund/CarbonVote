import { PollForm } from "@/components/PollForm";
import Button from "@/components/ui/buttons/Button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";


export default function MyPollsPage() {
  return (
    <div className="p-40">
      <div className="px-40">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full justify-center rounded-3xl">Create a Poll</Button>
          </DialogTrigger>
          <DialogContent className="h-2/3 overflow-y-auto">
            <DialogHeader>
              <DialogDescription className="text-white">
                <PollForm />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}