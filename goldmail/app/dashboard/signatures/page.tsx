"use client";

import { useEffect, useState } from "react";
import { getSignatures } from "@/lib/db/signatures";
import { getProfile } from "@/lib/db/profile";
import SignaturesClient from "./SignaturesClient";
import type { Signature, Profile } from "@/types/database";

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [sigs, prof] = await Promise.all([getSignatures(), getProfile()]);
    setSignatures(sigs);
    setProfile(prof);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Mes signatures</h1>
        <p className="text-sm text-base-content/50 mt-1">
          Créez et gérez vos signatures professionnelles. Stockées localement.
        </p>
      </div>

      <div className="divider-gold" />

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" style={{ color: "oklch(72% 0.15 85)" }} />
        </div>
      ) : (
        <SignaturesClient
          key={signatures.map((signature) => signature.id).join(",")}
          signatures={signatures}
          profile={profile}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
