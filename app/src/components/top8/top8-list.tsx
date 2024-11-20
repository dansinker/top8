// src/components/top8/top8-list.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import Link from "next/link"

interface Friend {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export function Top8List({ did }: { did?: string }) {
  const { accessJwt } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implement fetching top 8 friends
    // This will need to be implemented with the actual API
    setLoading(false)
  }, [did, accessJwt])

  if (loading) {
    return <div>Loading top 8...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top 8 Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {friends.map((friend) => (
            <Link
              key={friend.did}
              href={`/profile/${friend.did}`}
              className="flex flex-col items-center space-y-2"
            >
              <Avatar
                src={friend.avatar}
                alt={friend.displayName || friend.handle}
                className="h-20 w-20"
              />
              <span className="text-sm font-medium">
                {friend.displayName || friend.handle}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}