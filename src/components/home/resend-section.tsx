'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ResendEmailSender() {
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [fromPrefix, setFromPrefix] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [authorization, setAuthorization] = useState('');
  const [html, setHtml] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidFromEmail, setIsValidFromEmail] = useState(true);

  const validateEmail = (prefix: string, domain: string): boolean => {
    if (!prefix || !domain) return true; // No validation if either field is empty
    const emailRegex = new RegExp(`^[a-zA-Z0-9._%+-]+@${domain.replace(/\./g, '\\.')}$`);
    return emailRegex.test(`${prefix}@${domain}`);
  };

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('/api/get-domains', {
          headers: {
            Authorization: `Bearer ${authorization}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.data) {
          setDomains(data.data.map((domain: { name: string }) => domain.name));
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
        setMessage({
          type: 'error',
          text: 'Failed to fetch domains. Please check your authorization token.',
        });
      }
    };

    if (authorization) {
      fetchDomains();
    }
  }, [authorization]);

  useEffect(() => {
    setIsValidFromEmail(validateEmail(fromPrefix, selectedDomain));
  }, [fromPrefix, selectedDomain]);

  const sendEmail = async () => {
    if (!isValidFromEmail) {
      setMessage({ type: 'error', text: 'Please use a valid email address for the selected domain.' });
      return;
    }

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorization}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromPrefix}@${selectedDomain}`,
          to: [to],
          subject,
          html: `<body>${html}</body>`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: `Failed to send email: ${data.message}` });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage({ type: 'error', text: 'An error occurred while sending the email.' });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Send Email with Resend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Authorization Token"
          value={authorization}
          onChange={(e) => setAuthorization(e.target.value)}
          type="password"
        />
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Input
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="flex space-x-2">
          <Input
            placeholder="From (prefix)"
            value={fromPrefix}
            onChange={(e) => setFromPrefix(e.target.value)}
            className={!isValidFromEmail ? 'border-red-500' : ''}
          />
          <Select onValueChange={setSelectedDomain} value={selectedDomain}>
            <SelectTrigger className={`w-[180px] ${!isValidFromEmail ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!isValidFromEmail && (
          <p className="text-red-500 text-sm mt-1">
            The email domain must match the selected domain.
          </p>
        )}
        <Textarea
          placeholder="HTML Content"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={6}
        />
        <Button onClick={sendEmail} disabled={!isValidFromEmail || !authorization || !to || !subject || !html}>
          Send Email
        </Button>
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
