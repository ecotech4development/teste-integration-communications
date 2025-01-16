const BASE_URL = 'https://graph.facebook.com/v21.0';

export async function subscribeApp(whatsAppBusinessAccountId: string, accessToken: string) {
  const response = await fetch(`${BASE_URL}/${whatsAppBusinessAccountId}/subscribed_apps`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

export async function fetchBusinessPhones(whatsAppBusinessAccountId: string, accessToken: string) {
  const response = await fetch(`${BASE_URL}/${whatsAppBusinessAccountId}/phone_numbers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

export async function fetchMessageTemplates(whatsAppBusinessAccountId: string, accessToken: string) {
  const response = await fetch(`${BASE_URL}/${whatsAppBusinessAccountId}/message_templates?fields=name,status&limit=10`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

export async function sendNormalMessage(selectedPhone: string, accessToken: string, recipientNumber: string, messageBody: string, previewUrl: boolean) {
  const response = await fetch(`${BASE_URL}/${selectedPhone}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      preview_url: previewUrl,
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientNumber,
      type: "text",
      text: {
        body: messageBody
      }
    })
  });
  return await response.json();
}

export async function fetchTemplateDetails(whatsAppBusinessAccountId: string, accessToken: string, templateName: string) {
  const response = await fetch(`${BASE_URL}/${whatsAppBusinessAccountId}/message_templates?name=${templateName}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return await response.json();
}

export async function sendTemplateMessage(selectedPhone: string, accessToken: string, recipientPhone: string, selectedTemplate: string) {
  const response = await fetch(`${BASE_URL}/${selectedPhone}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: {
        name: selectedTemplate,
        language: {
          code: "en_US"
        }
      }
    })
  });
  return await response.json();
}

