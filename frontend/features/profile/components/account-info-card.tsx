import { Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useAuth } from "@/contexts/auth-context"

export function AccountInfoCard() {
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Member Since</span>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {user?.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Account Type</span>
          <Badge variant="secondary">Model</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email Verification</span>
          <Badge
            className={
              user?.emailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }
          >
            {user?.emailVerified ? "Verified" : "Not Verified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
