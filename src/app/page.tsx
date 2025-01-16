import FacebookSection from "@/components/home/facebook-section"
import GoogleMapsSection from "@/components/home/google-maps-section"
import InstagramSection from "@/components/home/instagram-section"
import ResendEmailSender from "@/components/home/resend-section"
import WhatsAppSection from "@/components/home/whatsapp-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Social Media Integration</h1>
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="googlemaps">Google Maps</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp">
          <WhatsAppSection />
        </TabsContent>
        <TabsContent value="instagram">
          <InstagramSection />
        </TabsContent>
        <TabsContent value="facebook">
          <FacebookSection />
        </TabsContent>
        <TabsContent value="googlemaps">
          <GoogleMapsSection />
        </TabsContent>
        <TabsContent value="email">
          <ResendEmailSender />
        </TabsContent>
      </Tabs>
    </div>
  )
}

