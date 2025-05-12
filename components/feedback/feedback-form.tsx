"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export function FeedbackForm() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedbackType, setFeedbackType] = useState("feedback")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      })

      // Reset form
      setName("")
      setEmail("")
      setFeedbackType("feedback")
      setMessage("")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
          <CardDescription>
            We'd love to hear your thoughts on DayTask. Your feedback helps us improve!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">General Feedback</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your feedback, bug report, or feature request..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
