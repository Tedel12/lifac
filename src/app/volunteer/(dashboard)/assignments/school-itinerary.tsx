"use client";

import { useState } from "react";
import { Navigation, LocateFixed, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haversineDistanceMeters, googleMapsDirectionsUrl } from "@/lib/utils";

const PRESENCE_THRESHOLD_METERS = 100;

interface Props {
  latitude: number | null;
  longitude: number | null;
}

type LocateState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string }
  | { status: "done"; distanceMeters: number };

export function SchoolItinerary({ latitude, longitude }: Props) {
  const [state, setState] = useState<LocateState>({ status: "idle" });

  if (latitude == null || longitude == null) {
    return <p className="text-xs text-gray-400 italic">Coordonnées GPS non renseignées pour cette école.</p>;
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Géolocalisation non disponible sur cet appareil." });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = haversineDistanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          latitude,
          longitude
        );
        setState({ status: "done", distanceMeters: distance });
      },
      () => setState({ status: "error", message: "Impossible d'accéder à votre position. Vérifiez les autorisations." }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-2">
        <a href={googleMapsDirectionsUrl(latitude, longitude)} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Itinéraire
          </Button>
        </a>
        <Button variant="ghost" size="sm" onClick={locate} disabled={state.status === "locating"}>
          <LocateFixed className="h-3.5 w-3.5 mr-1.5" />
          {state.status === "locating" ? "..." : "Je suis arrivé"}
        </Button>
      </div>

      {state.status === "error" && (
        <p className="text-xs text-red-600 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {state.message}
        </p>
      )}
      {state.status === "done" && state.distanceMeters <= PRESENCE_THRESHOLD_METERS && (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Présence validée — vous êtes sur place ({Math.round(state.distanceMeters)} m).
        </p>
      )}
      {state.status === "done" && state.distanceMeters > PRESENCE_THRESHOLD_METERS && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Vous êtes à {formatDistance(state.distanceMeters)} de l&apos;école.
        </p>
      )}
    </div>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
