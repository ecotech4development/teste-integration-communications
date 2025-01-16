/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'

interface ProfileTabProps {
  userInfo: any
  userId: string
  accessToken: string
}

export function ProfileTab({ userInfo, userId, accessToken }: ProfileTabProps) {
  const formatToken = (token: string) => {
    return `${token.substring(0, 20)}...${token.substring(token.length - 5)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Token copied to clipboard!')
    }, (err) => {
      alert('Failed to copy text: ' + err)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Username</p>
            <p>{userInfo?.username}</p>
          </div>
          <div>
            <p className="font-semibold">Media Count</p>
            <p>{userInfo?.media_count}</p>
          </div>
          <div>
            <p className="font-semibold">Account Type</p>
            <p>{userInfo?.account_type}</p>
          </div>
          <div>
            <p className="font-semibold">User ID</p>
            <p>{userId}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Access Token</p>
          <div className="flex items-center space-x-2">
            <Input value={formatToken(accessToken)} readOnly />
            <Button onClick={() => copyToClipboard(accessToken)} variant="outline" size="icon">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

