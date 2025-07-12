import * as React from 'react';
import { useState } from 'react';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Mail, Phone, Clock, HelpCircle, Send } from 'lucide-react';

const faqData = [
  {
    question: "How do I add a new route?",
    answer: "Navigate to the Routes page and click the 'Add New Route' button. Fill in the required information including departure and arrival points, schedule, and pricing."
  },
  {
    question: "How can I manage my tickets?",
    answer: "You can view and manage all tickets in the Tickets section. Here you can check ticket status, issue refunds, and view booking history."
  },
  {
    question: "What payment methods are supported?",
    answer: "We currently support bank transfers, mobile money, and cash payments. You can configure your preferred payment methods in the Settings page."
  },
  {
    question: "How do I update my company profile?",
    answer: "Go to the Profile section to update your company information, contact details, and other relevant information."
  }
];

const supportCategories = [
  "Account Issues",
  "Route Management",
  "Ticket Management",
  "Payment Issues",
  "Technical Support",
  "Other"
];

export default function Support() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the ticket to your backend
    toast({
      title: "Support Ticket Created",
      description: "Your support ticket has been submitted successfully. We'll get back to you soon.",
    });
    setTicketForm({
      subject: "",
      description: "",
      category: "",
      priority: "medium"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2 mb-2">
          <HelpCircle className="h-7 w-7 text-indigo-500" /> Support Center
        </h1>
        <p className="text-muted-foreground">Get help with your account, routes, tickets, and more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <Card className="glass shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Mail className="h-5 w-5 text-indigo-400" /> Contact Information
            </CardTitle>
            <CardDescription>Reach out to our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-muted-foreground">support@tiyende.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-muted-foreground">+260 97 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-muted-foreground">Saturday: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Ticket Form */}
        <Card className="glass shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Send className="h-5 w-5 text-indigo-400" /> Submit a Support Ticket
            </CardTitle>
            <CardDescription>Fill out the form below to get help</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                >
                  <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportCategories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Please provide detailed information about your issue"
                  rows={4}
                  className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                >
                  <SelectTrigger className="bg-white/80 border-indigo-200 focus:ring-2 focus:ring-indigo-400">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-indigo-600 hover:to-blue-600">Submit Ticket</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="glass shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <HelpCircle className="h-5 w-5 text-indigo-400" /> Frequently Asked Questions
          </CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {faqData.map((faq, index) => (
            <div key={index} className="space-y-2 p-4 rounded-lg bg-indigo-50/60">
              <h3 className="font-medium text-indigo-900 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-400" /> {faq.question}
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 