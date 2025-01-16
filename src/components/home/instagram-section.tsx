/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, LogOut, Copy, Upload, RefreshCw } from 'lucide-react'
//@ts-ignore
import Cookie from 'js-cookie'

const CLIENT_ID = '546357825037011'
const CLIENT_SECRET = 'e022de7d587386dfb9132b95879e4284'
const REDIRECT_URI = 'https://magpie-kind-earwig.ngrok-free.app/'

export default function InstagramSection() {
//@ts-ignore
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [accessToken, setAccessToken] = useState("")
  const [userId, setUserId] = useState("")
  const [userInfo, setUserInfo] = useState<any>(null)
  const [instagramPosts, setInstagramPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  console.log('====================================');
  console.log(selectedFile);
  console.log('====================================');

  useEffect(() => {
    const token = Cookie.get('instagram_access_token')
    if (token) {
      setAccessToken(token)
      fetchUserInfo(token)
    } else {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      const code = params.get('code')
      if (code) {
        fetchAccessToken(code)
      }
    }
  }, [])

  const authenticateInstagram = () => {
    window.location.href = `https://www.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`
  }
  //

  const fetchAccessToken = async (code: string) => {
    const formData = new URLSearchParams()
    formData.append("client_id", CLIENT_ID)
    formData.append("client_secret", CLIENT_SECRET)
    formData.append("grant_type", "authorization_code")
    formData.append("redirect_uri", REDIRECT_URI)
    formData.append("code", code)

    const response = await fetch('/api/getToken', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    setAccessToken(data.access_token)
    setUserId(data.user_id)
    Cookie.set('instagram_access_token', data.access_token, { expires: 60 })
    fetchLongLivedAccessToken(data.access_token)
  }

  const fetchLongLivedAccessToken = async (shortLivedToken: string) => {
    const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${shortLivedToken}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setAccessToken(data.access_token)
      fetchUserInfo(data.access_token)
    } catch (error) {
      console.error("Error fetching long-lived token:", error)
    }
  }

  const fetchUserInfo = async (token: string) => {
    const url = `https://graph.instagram.com/me?fields=id,username,media_count,account_type&access_token=${token}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setUserInfo(data)
      fetchInstagramPosts(token)
    } catch (error) {
      console.error("Error fetching user info:", error)
    }
  }

  const fetchInstagramPosts = async (token: string) => {
    setLoadingPosts(true)
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp&limit=10&access_token=${token}`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setInstagramPosts(data.data)
      setLoadingPosts(false)
    } catch (error) {
      console.error("Error fetching Instagram posts:", error)
      setLoadingPosts(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const postImageToInstagram = async () => {
    const postMediaBody = {
      image_url: 'https://3.bp.blogspot.com/--30xHwg25co/WYCspt8h6QI/AAAAAAAAG08/PhMrvJuaqrEYDiEUaR4r7EKvIKuz2yBGwCLcBGAs/s1600/unir%2Bcentro.jpg',
      caption: 'lindao 22',
      access_token: accessToken
    }

    try {
      const mediaResponse = await fetch(`/api/createImage/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postMediaBody)
      })
      const mediaData = await mediaResponse.json()
      console.log('Media creation response:', mediaData)

      if (!mediaData.id) {
        console.error('Failed to create media object:', mediaData)
        alert('Failed to create media object.')
        return
      }

      const publishResponse = await fetch(`/api/mediaPublish/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: accessToken
        })
      })
      const publishData = await publishResponse.json()
      console.log('Publish response:', publishData)

      if (publishResponse.ok) {
        alert('Image posted successfully!')
        fetchInstagramPosts(accessToken)
      } else {
        console.error('Failed to publish media:', publishData)
        alert('Failed to publish image.')
      }
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

  function formatToken(token: string) {
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
    <div className="container mx-auto p-4 space-y-6">
      {!accessToken ? (
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
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
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
            </TabsContent>
            <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <CardTitle>Instagram Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPosts ? (
                    <div className="flex justify-center items-center h-40">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : instagramPosts?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {instagramPosts?.map((post: any) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <img src={post.media_url || "/placeholder.svg"} alt="Instagram Post" className="w-full h-48 object-cover rounded-md mb-2" />
                            <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(post.timestamp).toLocaleString()}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p>No posts found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Post New Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="file" onChange={handleFileSelect} />
                  <Button onClick={postImageToInstagram} className="w-full flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Post Image</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

