// src/components/profile/profile-content.tsx
"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Top8List } from "@/components/top8/top8-list"
import { UserPosts } from "@/components/posts/user-posts"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ThemePicker } from "@/components/theme/theme-picker"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProfileContent() {
  const { isAuthenticated, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!profile) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="space-y-6">
        <ProfileHeader profile={profile} />
        <ThemePicker />
      </div>
      <div className="md:col-span-2 space-y-6">
        <Top8List />
        <UserPosts did={profile.did} />
      </div>
    </div>
  )
}

// src/components/profile/profile-header.tsx
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/auth-context"

interface ProfileHeaderProps {
  profile: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { logout } = useAuth()

  return (
    <Card>
      <CardHeader className="space-y-4">
        <Avatar 
          src={profile.avatar}
          alt={profile.displayName || profile.handle}
          className="h-24 w-24"
        />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{profile.displayName || profile.handle}</h2>
          <p className="text-sm text-muted-foreground">@{profile.handle}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={logout} variant="outline" className="w-full">
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}

// src/components/profile/user-profile.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Top8List } from "@/components/top8/top8-list"
import { UserPosts } from "@/components/posts/user-posts"
import { ProfileHeader } from "@/components/profile/profile-header"

interface Profile {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

export function UserProfile({ did }: { did: string }) {
  const { accessJwt } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${did}`,
          {
            headers: accessJwt ? {
              Authorization: `Bearer ${accessJwt}`
            } : undefined
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setProfile({
          did: data.did,
          handle: data.handle,
          displayName: data.displayName,
          avatar: data.avatar
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      }
    }

    fetchProfile()
  }, [did, accessJwt])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div>
        <ProfileHeader profile={profile} />
      </div>
      <div className="md:col-span-2 space-y-6">
        <Top8List did={profile.did} />
        <UserPosts did={profile.did} />
      </div>
    </div>
  )
}
