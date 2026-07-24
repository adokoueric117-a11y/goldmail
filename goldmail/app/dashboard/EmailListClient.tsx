"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmailCard from "@/components/dashboard/EmailCard";
import { deleteEmail } from "@/lib/db/emails";
import type { Email } from "@/types/database";

export default function DashboardEmailList({ emails: initial }: { emails: Email[] }) {
  const [emails, setEmails] = useState<Email[]>(initial);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    startTransition(async () => {
      const { error } = await deleteEmail(id);
      if (error) {
        setEmails(initial);
        console.error("Delete failed:", error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {emails.map((email) => (
          <EmailCard key={email.id} email={email} onDelete={handleDelete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
