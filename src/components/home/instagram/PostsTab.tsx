/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'

interface PostsTabProps {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  loadPosts: () => void
  loadingPosts: boolean
  instagramPosts: any[]
}

export function PostsTab({ handleFileSelect, loadPosts, loadingPosts, instagramPosts }: PostsTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Post New Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" onChange={handleFileSelect} />
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Instagram Posts</span>
            <Button onClick={loadPosts} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
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
    </>
  )
}

