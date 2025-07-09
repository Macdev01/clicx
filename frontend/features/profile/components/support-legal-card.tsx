import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { SupportDialog } from "./support-dialog"
import { TermsDialog } from "./terms-dialog"

export function SupportLegalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support & Legal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TermsDialog />
        <SupportDialog />
      </CardContent>
    </Card>
  )
}
