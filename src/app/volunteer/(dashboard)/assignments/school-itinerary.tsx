"use client";

import { useState } from "react";
import { Navigation, LocateFixed, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haversineDistanceMeters, googleMapsDirectionsUrl } from "@/lib/utils";
import { startSchoolVisit, arriveAtSchool } from "@/actions/volunteer-school-actions";

const PRESENCE_THRESHOLD_METERS = 100;

interface Props {
  schoolId: string;
  latitude: number | null;
  longitude: number | null;
}

type VisitState =
  | { status: "idle" }
  | { status: "enRoute"; visitId: string; departedAt: string }
  | { status: "locating"; visitId: string; departedAt: string }
  | { status: "error"; message: string; visitId?: string; departedAt?: string }
  | { status: "arrived"; departedAt: string; arrivedAt: string; distanceMeters: number };

export function SchoolItinerary({ schoolId, latitude, longitude }: Props) {
  const [state, setState] = useState<VisitState>({ status: "idle" });

  if (latitude == null || longitude == null) {
    return <p className="text-xs text-gray-400 italic">Coordonnées GPS non renseignées pour cette école.</p>;
  }

  // "M'y rendre" : on enregistre l'heure de départ puis on passe la main à Google Maps.
  const handleDepart = async () => {
    try {
      const visit = await startSchoolVisit(schoolId);
      setState({ status: "enRoute", visitId: visit.id, departedAt: visit.departedAt });
    } catch {
      setState({ status: "error", message: "Impossible d'enregistrer le départ." });
    }
    window.open(googleMapsDirectionsUrl(latitude, longitude), "_blank", "noopener,noreferrer");
  };

  // "Je suis arrivé" : on relève la position réelle et on l'enregistre avec l'heure d'arrivée.
  const handleArrive = () => {
    if (state.status !== "enRoute" && state.status !== "error") return;
    const visitId = state.status === "enRoute" ? state.visitId : state.visitId;
    const departedAt = state.status === "enRoute" ? state.departedAt : state.departedAt;
    if (!visitId || !departedAt) return;

    if (!navigator.geolocation) {
      setState({ status: "error", message: "Géolocalisation non disponible sur cet appareil.", visitId, departedAt });
      return;
    }

    setState({ status: "locating", visitId, departedAt });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const distance = haversineDistanceMeters(pos.coords.latitude, pos.coords.longitude, latitude, longitude);
        try {
          const result = await arriveAtSchool(visitId, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            distanceMeters: distance,
          });
          setState({
            status: "arrived",
            departedAt: result.departedAt,
            arrivedAt: result.arrivedAt,
            distanceMeters: distance,
          });
        } catch {
          setState({ status: "error", message: "Impossible d'enregistrer l'arrivée.", visitId, departedAt });
        }
      },
      () =>
        setState({
          status: "error",
          message: "Impossible d'accéder à votre position. Vérifiez les autorisations.",
          visitId,
          departedAt,
        }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2 pt-1">
      {state.status === "idle" && (
        <Button variant="outline" size="sm" className="w-full" onClick={handleDepart}>
          <Navigation className="h-3.5 w-3.5 mr-1.5" />
          M&apos;y rendre
        </Button>
      )}

      {(state.status === "enRoute" || state.status === "locating") && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            Départ à {formatTime(state.departedAt)}
          </p>
          <Button size="sm" className="w-full" onClick={handleArrive} disabled={state.status === "locating"}>
            <LocateFixed className="h-3.5 w-3.5 mr-1.5" />
            {state.status === "locating" ? "Localisation..." : "Je suis arrivé"}
          </Button>
        </div>
      )}

      {state.status === "arrived" && (
        <div className="space-y-1 rounded-lg bg-emerald-50 p-2.5">
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {state.distanceMeters <= PRESENCE_THRESHOLD_METERS
              ? "Arrivée confirmée sur place"
              : `Arrivée enregistrée (${formatDistance(state.distanceMeters)} de l'école)`}
          </p>
          <p className="text-[11px] text-emerald-600">
            Départ {formatTime(state.departedAt)} → Arrivée {formatTime(state.arrivedAt)} ({formatDuration(state.departedAt, state.arrivedAt)})
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="space-y-1.5">
          <p className="text-xs text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {state.message}
          </p>
          {state.visitId && (
            <Button size="sm" variant="outline" className="w-full" onClick={handleArrive}>
              <LocateFixed className="h-3.5 w-3.5 mr-1.5" />
              Réessayer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(fromIso: string, toIso: string): string {
  const minutes = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
