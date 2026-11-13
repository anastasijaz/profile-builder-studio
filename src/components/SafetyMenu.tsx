import { useState } from "react";
import { Ban, Flag, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckRow, PrimaryButton, TextArea } from "@/components/FormBits";
import { useUser } from "@/lib/auth";
import { errorMessage } from "@/lib/api/profiles";
import {
  blockUser,
  REPORT_REASONS,
  reportUser,
  useInvalidateSocial,
  type ReportReason,
} from "@/lib/api/safety";
import { cn } from "@/lib/utils";

/**
 * "⋯" menu with Report and Block, shown on every profile and chat.
 * `onBlocked` runs after a successful block (e.g. leave the chat).
 */
export function SafetyMenu({
  targetId,
  targetName,
  onBlocked,
  className,
}: {
  targetId: string;
  targetName: string;
  onBlocked?: () => void;
  className?: string;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Safety options for ${targetName}`}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-ink shadow active:scale-95",
            className,
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl">
          <DropdownMenuItem onSelect={() => setReportOpen(true)} className="min-h-11 gap-2">
            <Flag className="h-4 w-4" /> Report {targetName}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setBlockOpen(true)}
            className="min-h-11 gap-2 text-red-700 focus:text-red-700"
          >
            <Ban className="h-4 w-4" /> Block {targetName}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetId={targetId}
        targetName={targetName}
        onBlocked={onBlocked}
      />
      <BlockDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        targetId={targetId}
        targetName={targetName}
        onBlocked={onBlocked}
      />
    </>
  );
}

export function BlockDialog({
  open,
  onOpenChange,
  targetId,
  targetName,
  onBlocked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetId: string;
  targetName: string;
  onBlocked?: () => void;
}) {
  const user = useUser();
  const invalidate = useInvalidateSocial();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await blockUser(user.id, targetId);
      await invalidate();
      toast.success(`${targetName} is blocked.`);
      onOpenChange(false);
      onBlocked?.();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl bg-page">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl italic">
            Block {targetName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You won't see each other anywhere on Melt, and your chat will be hidden. They won't be
            told. You can unblock later in Settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              confirm();
            }}
            disabled={busy}
            className="rounded-full bg-ink text-surface hover:bg-ink/90"
          >
            {busy ? "Blocking…" : "Block"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ReportDialog({
  open,
  onOpenChange,
  targetId,
  targetName,
  messageId,
  messagePreview,
  onBlocked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetId: string;
  targetName: string;
  messageId?: string;
  messagePreview?: string;
  onBlocked?: () => void;
}) {
  const user = useUser();
  const invalidate = useInvalidateSocial();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setBusy(true);
    try {
      await reportUser({ reporter: user.id, reported: targetId, reason, details, messageId });
      if (alsoBlock) {
        await blockUser(user.id, targetId);
        await invalidate();
      }
      toast.success("Thanks. Our team will review your report.");
      onOpenChange(false);
      setReason(null);
      setDetails("");
      if (alsoBlock) onBlocked?.();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl bg-page">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl italic">
            Report {messageId ? "message" : targetName}
          </DialogTitle>
          <DialogDescription>
            Reports are confidential. {targetName} won't know who reported them.
          </DialogDescription>
        </DialogHeader>
        {messagePreview && (
          <p className="rounded-2xl bg-surface px-4 py-2 text-sm text-ink/70">“{messagePreview}”</p>
        )}
        <div role="radiogroup" aria-label="Reason" className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={reason === r.value}
              onClick={() => setReason(r.value)}
              className={cn(
                "flex min-h-11 w-full items-center rounded-2xl border px-4 text-left text-sm",
                reason === r.value
                  ? "border-melt-orange bg-melt-peach/40 font-semibold"
                  : "border-ink/10 bg-surface",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <TextArea
          value={details}
          onChange={setDetails}
          rows={3}
          maxLength={1000}
          placeholder="Anything else we should know? (optional)"
        />
        <CheckRow checked={alsoBlock} onChange={setAlsoBlock}>
          Also block {targetName}
        </CheckRow>
        <PrimaryButton onClick={submit} disabled={!reason || busy}>
          {busy ? "Sending…" : "Send report"}
        </PrimaryButton>
        <p className="text-center text-xs text-ink/50">
          If you're in danger, call the police on 110.
        </p>
      </DialogContent>
    </Dialog>
  );
}
