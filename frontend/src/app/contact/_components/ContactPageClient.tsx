"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "../_schemas/contact.schema";
import { submitContactMessage } from "../_actions/submit-contact";
import { Send, CheckCircle, AlertTriangle, Phone, Mail, MapPin, Clock } from "lucide-react";

interface CompanyProfile {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  workingHours?: string | null;
  googleMapsEmbedUrl?: string | null;
}

const DEFAULT_MAP = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3498.4891107577535!2d77.16854127622998!3d28.71985397571866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d01867c4ec2a5%3A0xe543efb1c97a5530!2sAzadpur%2C%20Delhi!5e0!3m2!1sen!2sin!4v1719827000000!5m2!1sen!2sin";

export default function ContactPageClient({ company }: { company: CompanyProfile | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const phone = company?.phone ?? "+91 98765 43210";
  const email = company?.email ?? "connect@socialties.in";
  const address = company?.address ?? "Azadpur, New Delhi, India";
  const workingHours = company?.workingHours ?? "Mon - Sat: 10:00 AM - 7:00 PM";
  const mapUrl = company?.googleMapsEmbedUrl ?? DEFAULT_MAP;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await submitContactMessage(data);
      if (res.success) { setSuccess(true); reset(); }
      else setErrorMsg(res.error || "Failed to submit message");
    } catch {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto space-y-16">
      {/* Page Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <h1 className="text-sm font-semibold tracking-wider text-brand-lime uppercase">Contact Us</h1>
        <p className="text-4xl sm:text-5xl font-display font-black tracking-tight">Let's Start Something Big</p>
        <p className="text-sm text-fg-muted leading-relaxed">
          Have questions about campaigns, representation, or operations? Reach out directly or send a general inquiry below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info & Map */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">Get In Touch</h2>
            <div className="bg-bg-elevated border border-border p-6 rounded-2xl space-y-5">
              {address && (
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin size={18} className="text-brand-lime shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Office Address</p>
                    <p className="text-fg-muted">{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone size={18} className="text-brand-lime shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-fg-muted hover:text-brand-lime transition-colors">{phone}</a>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-center space-x-3 text-sm">
                  <Mail size={18} className="text-brand-lime shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Email</p>
                    <a href={`mailto:${email}`} className="text-fg-muted hover:text-brand-lime transition-colors">{email}</a>
                  </div>
                </div>
              )}
              {workingHours && (
                <div className="flex items-center space-x-3 text-sm">
                  <Clock size={18} className="text-brand-lime shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Working Hours</p>
                    <p className="text-fg-muted">{workingHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">Delhi Office</h2>
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden border border-border">
              <iframe
                title="Office Location Map"
                src={mapUrl}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">General Inquiry</h2>

          {success ? (
            <div className="bg-brand-lime/10 border border-brand-lime/30 rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-lime rounded-full flex items-center justify-center text-black mx-auto">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-foreground">Message Transmitted!</h3>
              <p className="text-sm text-fg-muted max-w-sm mx-auto">Thanks for reaching out! We'll respond to your email shortly.</p>
              <button onClick={() => setSuccess(false)} className="px-6 py-2.5 bg-background border border-border text-foreground hover:bg-bg-elevated transition-colors text-xs font-semibold uppercase tracking-wider rounded-xl">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-bg-elevated border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center space-x-2 text-sm">
                  <AlertTriangle size={18} /><span>{errorMsg}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Name *</label>
                  <input type="text" {...register("name")} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  {errors.name && <p className="text-xs text-red-500">{String(errors.name.message)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Email Address *</label>
                  <input type="email" {...register("email")} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  {errors.email && <p className="text-xs text-red-500">{String(errors.email.message)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Phone Number</label>
                  <input type="tel" {...register("phone")} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  {errors.phone && <p className="text-xs text-red-500">{String(errors.phone.message)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Subject</label>
                  <input type="text" {...register("subject")} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  {errors.subject && <p className="text-xs text-red-500">{String(errors.subject.message)}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Message *</label>
                <textarea rows={5} {...register("message")} placeholder="How can we help your brand or content channels..." className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                {errors.message && <p className="text-xs text-red-500">{String(errors.message.message)}</p>}
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-lime/10 disabled:opacity-50">
                  {isSubmitting ? <span>Sending...</span> : <><span>Transmit Message</span><Send size={16} /></>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
