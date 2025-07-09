import { useState } from "react"

import { HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SupportDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="mr-2 h-4 w-4" />
          Tech Support
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Technical Support</DialogTitle>
          <DialogDescription>
            Get help with technical issues and platform support.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">Contact Information</h3>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> support@clixxx.me
            </p>
            <p>
              <strong>Response Time:</strong> 24-48 hours
            </p>
            <p>
              <strong>Available:</strong> Monday - Friday, 9 AM - 6 PM EST
            </p>
          </div>

          <h3 className="font-semibold">Common Issues</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Account Login Problems</h4>
              <p>
                If you're having trouble logging in, try resetting your password or clearing your
                browser cache.
              </p>
            </div>

            <div>
              <h4 className="font-medium">Payment Issues</h4>
              <p>
                For payment-related problems, please contact our billing department with your
                transaction details.
              </p>
            </div>

            <div>
              <h4 className="font-medium">Upload Problems</h4>
              <p>
                Ensure your files meet our format requirements and size limits. Check your internet
                connection for upload issues.
              </p>
            </div>

            <div>
              <h4 className="font-medium">Profile Verification</h4>
              <p>
                Verification typically takes 2-3 business days. Make sure all required documents are
                clearly visible and valid.
              </p>
            </div>
          </div>

          <h3 className="font-semibold">Before Contacting Support</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>Check our FAQ section</li>
            <li>Try refreshing the page or clearing your browser cache</li>
            <li>Ensure you're using a supported browser</li>
            <li>Check your internet connection</li>
          </ul>

          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-sky-800">
              <strong>Emergency Issues:</strong> For urgent technical problems affecting your
              account security, please email us immediately at emergency@clixxx.me
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
