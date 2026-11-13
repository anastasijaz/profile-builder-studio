import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  LogOut,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { TextInput } from "@/components/FormBits";
import { signOut, useUser } from "@/lib/auth";
import { errorMessage } from "@/lib/api/profiles";
import {
  deleteMyAccount,
  downloadMyData,
  unblockUser,
  useInvalidateSocial,
  useMyBlocks,
} from "@/lib/api/safety";

function Row({
  icon,
  children,
  onClick,
  to,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  to?: "/profile/edit" | "/privacy" | "/terms";
  danger?: boolean;
  disabled?: boolean;
}) {
  const cls = `flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm active:bg-ink/5 disabled:opacity-50 ${
    danger ? "text-red-700" : "text-ink"
  }`;
  const inner = (
    <>
      <span className="flex h-8 w-8 items-center justify-center">{icon}</span>
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-4 w-4 opacity-40" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

export function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [view, setView] = useState<"main" | "blocked">("main");
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const onExport = async () => {
    setExporting(true);
    try {
      await downloadMyData();
      toast.success("Your data was downloaded.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) setView("main");
        }}
      >
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-page">
          {view === "main" ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl italic">Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-2 space-y-1 pb-[env(safe-area-inset-bottom)]">
                <Row icon={<Pencil className="h-4 w-4" />} to="/profile/edit">
                  Edit profile
                </Row>
                <Row icon={<Ban className="h-4 w-4" />} onClick={() => setView("blocked")}>
                  Blocked people
                </Row>
                <Row
                  icon={<Download className="h-4 w-4" />}
                  onClick={onExport}
                  disabled={exporting}
                >
                  {exporting ? "Preparing download…" : "Download my data"}
                </Row>
                <Row icon={<Shield className="h-4 w-4" />} to="/privacy">
                  Privacy Policy
                </Row>
                <Row icon={<FileText className="h-4 w-4" />} to="/terms">
                  Terms of Use
                </Row>
                <Row icon={<LogOut className="h-4 w-4" />} onClick={() => signOut()}>
                  Sign out
                </Row>
                <div className="my-2 h-px bg-ink/10" />
                <Row
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setDeleteOpen(true)}
                  danger
                >
                  Delete account
                </Row>
              </div>
            </>
          ) : (
            <BlockedList onBack={() => setView("main")} />
          )}
        </SheetContent>
      </Sheet>
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function BlockedList({ onBack }: { onBack: () => void }) {
  const user = useUser();
  const blocks = useMyBlocks();
  const invalidate = useInvalidateSocial();
  const [busy, setBusy] = useState<string>();

  const unblock = async (id: string, name: string) => {
    setBusy(id);
    try {
      await unblockUser(user.id, id);
      await invalidate();
      toast.success(`${name} is unblocked.`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <>
      <SheetHeader className="flex-row items-center gap-2 space-y-0">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <SheetTitle className="font-serif text-2xl italic">Blocked people</SheetTitle>
      </SheetHeader>
      <ul className="mt-2 space-y-1 pb-[env(safe-area-inset-bottom)]">
        {blocks.isPending && <li className="px-3 py-2 text-sm text-ink/60">Loading…</li>}
        {blocks.data?.length === 0 && (
          <li className="px-3 py-2 text-sm text-ink/60">You haven't blocked anyone.</li>
        )}
        {blocks.data?.map((b) => (
          <li key={b.blocked} className="flex min-h-12 items-center justify-between px-3">
            <span className="text-sm">{b.display_name}</span>
            <button
              onClick={() => unblock(b.blocked, b.display_name)}
              disabled={busy === b.blocked}
              className="h-9 rounded-full border border-ink/10 bg-surface px-4 text-xs font-semibold disabled:opacity-50"
            >
              Unblock
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useUser();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteMyAccount(user.id);
      toast.success("Your account and data were deleted.");
      navigate({ to: "/welcome", replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl bg-page">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl italic">
            Delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your profile, photos, likes, matches and messages. It can't be
            undone. Consider downloading your data first. Reports you filed are kept without your
            name so our moderators can finish reviewing them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <label className="block text-sm">
          Type <strong>DELETE</strong> to confirm
          <TextInput
            value={confirmText}
            onChange={setConfirmText}
            autoCapitalize="characters"
            className="mt-2"
          />
        </label>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={confirmText.trim() !== "DELETE" || busy}
            className="rounded-full bg-red-700 text-surface hover:bg-red-800"
          >
            {busy ? "Deleting…" : "Delete forever"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
