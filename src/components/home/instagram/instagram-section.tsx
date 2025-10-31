/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, LogOut } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Cookie from 'js-cookie'
import { authenticateInstagram, fetchAccessToken, fetchLongLivedAccessToken, fetchUserInfo, fetchInstagramPosts, postImageToInstagram } from "@/api/instagramApi"
import { PostsTab } from "./PostsTab"
import { MessagesTab } from "./MessagesTab"
import { ProfileTab } from "./ProfileTab"


export default function InstagramSection() {
  const [accessToken, setAccessToken] = useState("")
  const [userId, setUserId] = useState("")
  const [userInfo, setUserInfo] = useState(null)
  const [instagramPosts, setInstagramPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [caption, setCaption] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    const token = Cookie.get('instagram_access_token')
    const idUser = Cookie.get('instagram_user_id')

    if (token !== undefined) {
      setAccessToken(token)
      //@ts-expect-error
      setUserId(idUser)
      //@ts-expect-error
      fetchUserInfo(token).then(setUserInfo)
    } else {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      const code = params.get('code')
      if (code) {
        handleCodeExchange(code)
      }
    }
  }, [])

  useEffect(() => {
    if (accessToken) {
      loadPosts()
    }
  }, [accessToken])

  const handleCodeExchange = async (code: string) => {
    const data = await fetchAccessToken(code)
    setAccessToken(data.access_token)
    setUserId(data.user_id)
    const longLivedToken = await fetchLongLivedAccessToken(data.access_token)
    setAccessToken(longLivedToken.access_token)
    const userInfo = await fetchUserInfo(longLivedToken.access_token)
      //@ts-expect-error
    setUserInfo(userInfo)
  }

  const loadPosts = async () => {
    setLoadingPosts(true)
    try {
      const posts = await fetchInstagramPosts(accessToken)
      //@ts-expect-error
      setInstagramPosts(posts)
    } catch (error) {
      console.error("Error fetching Instagram posts:", error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setPreviewOpen(true)
    }
  }

  const handlePostImage = async () => {
    if (!selectedFile) return
    try {
      await postImageToInstagram(selectedFile, caption, accessToken, userId)
      alert('Image posted successfully!')
      loadPosts()
      setPreviewOpen(false)
      setSelectedFile(null)
      setCaption("")
    } catch (error) {
      console.error('Error posting image:', error)
      alert('Failed to post image.')
    }
  }

  const logout = () => {
    Cookie.remove('instagram_access_token')
    setAccessToken('')
    setUserInfo(null)
    setInstagramPosts([])
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {(!accessToken) ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Button onClick={authenticateInstagram} className="flex items-center space-x-2">
              <Instagram className="w-5 h-5" />
              <span>Connect to Instagram</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Instagram Integration</h1>
            <Button onClick={logout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileTab userInfo={userInfo} userId={userId} accessToken={accessToken} />
            </TabsContent>
            <TabsContent value="posts">
              <PostsTab
                handleFileSelect={handleFileSelect}
                loadPosts={loadPosts}
                loadingPosts={loadingPosts}
                instagramPosts={instagramPosts}
              />
            </TabsContent>
            <TabsContent value="messages">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </>
      )}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Image</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-auto max-h-96 object-contain" />
          </div>
          <Textarea
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-4"
          />
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handlePostImage}>Post Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

