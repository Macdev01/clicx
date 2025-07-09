import { useState } from "react"

import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TermsDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Terms and Conditions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>Please read our terms and conditions carefully.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing and using Clixxx.me, you accept and agree to be bound by the terms and
            provision of this agreement.
          </p>

          <h3 className="font-semibold">2. User Accounts</h3>
          <p>
            Users are responsible for maintaining the confidentiality of their account information
            and for all activities that occur under their account.
          </p>

          <h3 className="font-semibold">3. Content Guidelines</h3>
          <p>
            All content uploaded to the platform must comply with our community guidelines. Users
            are prohibited from uploading illegal, harmful, or inappropriate content.
          </p>

          <h3 className="font-semibold">4. Payment and Billing</h3>
          <p>
            All payments are processed securely. Users agree to provide accurate billing information
            and authorize charges for services used.
          </p>

          <h3 className="font-semibold">5. Privacy Policy</h3>
          <p>
            We respect your privacy and are committed to protecting your personal information.
            Please review our Privacy Policy for details on how we collect and use your data.
          </p>

          <h3 className="font-semibold">6. Termination</h3>
          <p>
            We reserve the right to terminate or suspend accounts that violate these terms or engage
            in prohibited activities.
          </p>

          <p className="mt-4 text-xs text-muted-foreground">Last updated: January 2024</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
