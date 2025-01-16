/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
//@ts-nocheck

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Key, Building2, Send } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import * as whatsappApi from "@/api/whatsappApi";
import { useToast } from "@/hooks/use-toast";

interface Component {
  type: 'HEADER' | 'BODY' | 'FOOTER';
  text: string;
}

interface TemplateDetails {
  name: string;
  status: string;
  language: string;
  category: string;
  components: Component[];
}


export default function WhatsAppSection() {
  const [accessToken, setAccessToken] = useState("EAAHkgH1YPZAsBO0oe4azDGMZCv8ohZB0Bebup4q5kXZCg7TPh009jGMx5ZCAzVWVcRdhj8K2xTHOp2iKXZCmLNfbP2Pzeh0QqF4ws28Sl6Ktds3EwXeal5dAgu3S9W46WGPxpa4M0ng7phX3guIedph7WPy5TN6mNbLz4jVZCJ0NHN62jjJNdubBZBEQtEMYXW23rzL4gi1p0FhDz2DJlNTjCz0ORHJZCTFesZA4HAbcvApTeiQrDdG9AZD");
  const [whatsAppBusinessAccountId, setWhatsAppBusinessAccountId] = useState("526335580563581");
  const [businessPhones, setBusinessPhones] = useState([]);
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState<TemplateDetails | null>(null);

  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [previewUrl, setPreviewUrl] = useState(false);
  const { toast } = useToast()

  const subscribeApp = async () => {
    try {
      const data = await whatsappApi.subscribeApp(whatsAppBusinessAccountId, accessToken);
      if (data.success) {
        console.log("Subscription successful:", data);
        fetchBusinessPhones();
        fetchMessageTemplates();
        toast({
          title: "Success",
          description: "App subscribed successfully!",
          variant: "default",
        });
      } else {
        console.error("Subscription failed:", data);
        toast({
          title: "Error",
          description: "Failed to subscribe app. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error subscribing app:", error);
      toast({
        title: "Error",
        description: "An error occurred while subscribing the app.",
        variant: "destructive",
      });
    }
  };

  const fetchBusinessPhones = async () => {
    try {
      const data = await whatsappApi.fetchBusinessPhones(whatsAppBusinessAccountId, accessToken);
      if (data.data) {
        setBusinessPhones(data.data);
      } else {
        console.error("Failed to fetch phone numbers:", data);
        toast({
          title: "Error",
          description: "Failed to fetch business phone numbers.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching business phone numbers:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching business phone numbers.",
        variant: "destructive",
      });
    }
  };

  const fetchMessageTemplates = async () => {
    try {
      const data = await whatsappApi.fetchMessageTemplates(whatsAppBusinessAccountId, accessToken);
      if (data.data) {
        setMessageTemplates(data.data);
        toast({
          title: "Success",
          description: "Message templates fetched successfully!",
          variant: "default",
        });
      } else {
        console.error("Failed to fetch message templates:", data);
        toast({
          title: "Error",
          description: "Failed to fetch message templates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching message templates:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching message templates.",
        variant: "destructive",
      });
    }
  };

  const sendNormalMessage = async () => {
    if (!selectedPhone || !recipientNumber || !messageBody) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await whatsappApi.sendNormalMessage(selectedPhone, accessToken, recipientNumber, messageBody, previewUrl);
      if (data.messages && data.messages[0].id) {
        toast({
          title: "Success",
          description: "Message sent successfully!",
          variant: "default",
        });
        setRecipientNumber("");
        setMessageBody("");
      } else {
        console.error("Failed to send message:", data);
        toast({
          title: "Error",
          description: `Failed to send message: ${data.error?.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the message.",
        variant: "destructive",
      });
    }
  };

  const fetchTemplateDetails = async (templateName: string) => {
    try {
      const data = await whatsappApi.fetchTemplateDetails(whatsAppBusinessAccountId, accessToken, templateName);
      if (data.data && data.data.length > 0) {
        setSelectedTemplateDetails(data.data[0]);
      } else {
        setSelectedTemplateDetails(null);
      }
    } catch (error) {
      console.error("Error fetching template details:", error);
      setSelectedTemplateDetails(null);
    }
  };

  const sendTemplateMessage = async () => {
    if (!recipientPhone || !selectedTemplate || !selectedPhone) {
      toast({
        title: "Error",
        description: "All fields are required: recipient's phone number, selected template, and selected phone.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await whatsappApi.sendTemplateMessage(selectedPhone, accessToken, recipientPhone, selectedTemplate);
      if (data.messages && data.messages[0].id) {
        toast({
          title: "Success",
          description: "Template message sent successfully!",
          variant: "default",
        });
        setRecipientPhone("");
      } else {
        console.error("Error in sending template message:", data);
        toast({
          title: "Error",
          description: `Failed to send template message: ${data.error?.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending template message:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending the template message.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelection = (templateName: string) => {
    setSelectedTemplate(templateName);
    fetchTemplateDetails(templateName);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configure WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="accessToken" className="text-sm font-medium text-gray-700">Access Token</label>
              <div className="relative">
                <Key className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="Enter Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="businessAccountId" className="text-sm font-medium text-gray-700">WhatsApp Business Account ID</label>
              <div className="relative">
                <Building2 className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="businessAccountId"
                  type="text"
                  placeholder="Enter Business Account ID"
                  value={whatsAppBusinessAccountId}
                  onChange={(e) => setWhatsAppBusinessAccountId(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={subscribeApp} className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Subscribe to WhatsApp</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {businessPhones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Business Phones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedPhone} value={selectedPhone}>
              <SelectTrigger>
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {businessPhones.map((phone:any)=> (
                  <SelectItem key={phone.id} value={phone.id}>
                    {phone.display_phone_number} - {phone.verified_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {businessPhones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Send Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="template" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Template Messages</TabsTrigger>
                <TabsTrigger value="normal">Normal Messages</TabsTrigger>
              </TabsList>
              <TabsContent value="template">
                <div className="space-y-4">
                  {messageTemplates.length > 0 && (
                    <div>
                      <Label htmlFor="templateSelect">Select Template</Label>
                      <Select onValueChange={handleTemplateSelection} value={selectedTemplate}>
                        <SelectTrigger id="templateSelect">
                          <SelectValue placeholder="Select a message template" />
                        </SelectTrigger>
                        <SelectContent>
                          {messageTemplates.map((template:any) => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.name} - {template.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedTemplateDetails && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedTemplateDetails.name}</Badge>
                        <Badge variant="outline">{selectedTemplateDetails.status}</Badge>
                        <Badge variant="outline">{selectedTemplateDetails.language}</Badge>
                        <Badge variant="outline">{selectedTemplateDetails.category}</Badge>
                      </div>
                      <div className="bg-[#E5DDD5] p-4 rounded-lg max-w-sm">
                        {selectedTemplateDetails?.components.map((component:any, index:any) => (
                          <div
                            key={index}
                            className={`mb-2 p-2 rounded-lg ${
                              component.type === 'HEADER'
                                ? 'bg-[#DCF8C6] text-black font-semibold'
                                : 'bg-white text-black'
                            }`}
                          >
                            {component.type === 'HEADER' && (
                              <div className="text-xs text-gray-500 mb-1">Header</div>
                            )}
                            {component.type === 'BODY' && (
                              <div className="text-xs text-gray-500 mb-1">Message</div>
                            )}
                            {component.type === 'FOOTER' && (
                              <div className="text-xs text-gray-500 mb-1">Footer</div>
                            )}
                            <div className="whitespace-pre-wrap">{component.text}</div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipientPhone">Recipient&apos;s Phone Number</Label>
                        <Input
                          id="recipientPhone"
                          type="text"
                          placeholder="Enter recipient's phone number"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                        />
                      </div>
                      <Button onClick={sendTemplateMessage} className="w-full">
                        Send Template Message
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="normal">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientNumber">Recipient&apos;s WhatsApp ID</Label>
                    <Input
                      id="recipientNumber"
                      type="text"
                      placeholder="Enter recipient's WhatsApp ID"
                      value={recipientNumber}
                      onChange={(e) => setRecipientNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messageBody">Message</Label>
                    <Textarea
                      id="messageBody"
                      placeholder="Type your message here"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="previewUrl"
                      checked={previewUrl}
                      onCheckedChange={setPreviewUrl}
                    />
                    <Label htmlFor="previewUrl">Enable URL preview</Label>
                  </div>
                  <Button onClick={sendNormalMessage} className="w-full">Send Normal Message</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

