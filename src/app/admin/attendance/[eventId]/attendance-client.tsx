"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Plus, CircleCheck, CircleAlert, TriangleAlert, Search } from "lucide-react";
import {
    createAttendanceSession,
    recordScan,
    recordManualAttendance,
    searchRegistrationsForManualAttendance,
    getAttendanceStats,
    getRecentAttendances,
    type ScanResult,
} from "@/actions/attendance";

interface AttendanceSessionData {
    id: string;
    label: string;
    dayNumber: number | null;
}

interface StatsData {
    totalRegistrations: number;
    sessions: { id: string; label: string; present: number; absent: number; rate: number }[];
}

export default function AttendanceClient({
    event,
    initialSessions,
    initialStats,
}: {
    event: { id: string; title: string };
    initialSessions: AttendanceSessionData[];
    initialStats: StatsData;
}) {
    const [sessions, setSessions] = useState<AttendanceSessionData[]>(initialSessions);
    const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessions[0]?.id ?? "");
    const [stats, setStats] = useState<StatsData>(initialStats);
    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [scanning, setScanning] = useState(false);

    const [newSessionLabel, setNewSessionLabel] = useState("");
    const [showNewSession, setShowNewSession] = useState(sessions.length === 0);

    const [manualQuery, setManualQuery] = useState("");
    const [manualResults, setManualResults] = useState<
        { id: string; fullName: string; phone: string; participantNumber: string | null }[]
    >([]);

    const [recentScans, setRecentScans] = useState<
        { id: string; scannedAt: string | Date; registration: { fullName: string; participantNumber: string | null } }[]
    >([]);

    const scannerRef = useRef<any>(null);
    const readerElementId = "qr-reader-zone";

    const currentSessionStats = stats.sessions.find((s) => s.id === selectedSessionId);

    // Rafraîchit stats + historique récent après chaque scan / pointage manuel
    const refreshStatsAndHistory = async () => {
        const [freshStats, history] = await Promise.all([
            getAttendanceStats(event.id),
            selectedSessionId ? getRecentAttendances(selectedSessionId) : Promise.resolve([]),
        ]);
        setStats(freshStats);
        setRecentScans(history);
    };

    useEffect(() => {
        if (selectedSessionId) refreshStatsAndHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSessionId]);

    // Polling léger toutes les 8s pour voir les scans d'autres agents en quasi temps réel
    useEffect(() => {
        if (!selectedSessionId) return;
        const id = setInterval(refreshStatsAndHistory, 8000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSessionId]);

    const handleCreateSession = async () => {
        if (!newSessionLabel.trim()) return;
        const result = await createAttendanceSession({ eventId: event.id, label: newSessionLabel.trim() });
        if (result.success) {
            const updated = await getAttendanceStats(event.id);
            setStats(updated);
            setSessions((prev) => [...prev, { id: result.data.id, label: newSessionLabel.trim(), dayNumber: null }]);
            setSelectedSessionId(result.data.id);
            setNewSessionLabel("");
            setShowNewSession(false);
        } else {
            alert(result.error);
        }
    };

    const startScanning = async () => {
        if (!selectedSessionId) {
            alert("Choisis d'abord une session");
            return;
        }
        setScanning(true);

        // Import dynamique : cette lib touche à la caméra, elle ne doit tourner que côté navigateur.
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        let lastDecoded = "";
        let lastDecodedAt = 0;

        try {
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                async (decodedText: string) => {
                    const now = Date.now();
                    // Anti-rebond : évite de renvoyer 10x le même QR pendant qu'il reste sous la caméra
                    if (decodedText === lastDecoded && now - lastDecodedAt < 3000) return;
                    lastDecoded = decodedText;
                    lastDecodedAt = now;

                    const result = await recordScan({ qrToken: decodedText, sessionId: selectedSessionId });
                    setLastResult(result);
                    if (result.success) {
                        refreshStatsAndHistory();
                    }
                },
                () => {
                    // erreurs de décodage image par image : normal, on ignore (pas de QR dans le cadre)
                }
            );
        } catch (e) {
            console.error("[AttendanceClient] Erreur démarrage caméra :", e);
            alert("Impossible d'accéder à la caméra. Vérifie les autorisations du navigateur.");
            setScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            } catch {
                // scanner déjà arrêté, rien à faire
            }
        }
        setScanning(false);
    };

    useEffect(() => {
        return () => {
            // Coupe la caméra si on quitte la page pendant un scan
            scannerRef.current?.stop().catch(() => { });
        };
    }, []);

    const handleManualSearch = async (query: string) => {
        setManualQuery(query);
        if (query.trim().length < 2) {
            setManualResults([]);
            return;
        }
        const results = await searchRegistrationsForManualAttendance(event.id, query);
        setManualResults(results);
    };

    const handleManualMark = async (registrationId: string) => {
        if (!selectedSessionId) {
            alert("Choisis d'abord une session");
            return;
        }
        const result = await recordManualAttendance({ registrationId, sessionId: selectedSessionId });
        setLastResult(result);
        if (result.success) {
            setManualQuery("");
            setManualResults([]);
            refreshStatsAndHistory();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-lifac-navy-900">{event.title}</h1>
                <p className="text-gray-500 text-sm">Scan et suivi de présence</p>
            </div>

            {/* Sélecteur de session */}
            <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Session :</span>
                    <select
                        className="border rounded-md px-3 py-2 text-sm"
                        value={selectedSessionId}
                        onChange={(e) => {
                            stopScanning();
                            setSelectedSessionId(e.target.value);
                            setLastResult(null);
                        }}
                    >
                        <option value="">— Choisir une session —</option>
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={() => setShowNewSession((v) => !v)}>
                        <Plus size={14} className="mr-1" /> Nouvelle session
                    </Button>

                    {showNewSession && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                placeholder="Ex: Jour 1 - Matin"
                                value={newSessionLabel}
                                onChange={(e) => setNewSessionLabel(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                                className="max-w-xs"
                            />
                            <Button size="sm" onClick={handleCreateSession}>
                                Créer
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Scanner + résultat */}
            {selectedSessionId && (
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lifac-navy-900 flex items-center gap-2">
                                <QrCode size={18} /> Scanner
                            </h2>
                            {!scanning ? (
                                <Button onClick={startScanning} size="sm">
                                    Démarrer le scan
                                </Button>
                            ) : (
                                <Button onClick={stopScanning} size="sm" variant="outline">
                                    Arrêter
                                </Button>
                            )}
                        </div>

                        <div id={readerElementId} className={scanning ? "max-w-sm mx-auto" : "hidden"} />

                        {lastResult && (
                            <div
                                className={`rounded-lg p-4 flex items-start gap-3 ${!lastResult.success
                                        ? "bg-red-50 text-red-700"
                                        : lastResult.alreadyScanned
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-emerald-50 text-emerald-700"
                                    }`}
                            >
                                {!lastResult.success ? (
                                    <CircleAlert size={20} className="mt-0.5 shrink-0" />
                                ) : lastResult.alreadyScanned ? (
                                    <TriangleAlert size={20} className="mt-0.5 shrink-0" />
                                ) : (
                                    <CircleCheck size={20} className="mt-0.5 shrink-0" />
                                )}
                                <div>
                                    {!lastResult.success ? (
                                        <p className="font-medium">{lastResult.error}</p>
                                    ) : (
                                        <>
                                            <p className="font-bold">
                                                {lastResult.alreadyScanned ? "Déjà enregistré" : "Présence enregistrée"}
                                            </p>
                                            <p>{lastResult.participant?.fullName}</p>
                                            <p className="text-xs opacity-80">
                                                {lastResult.participant?.participantNumber} —{" "}
                                                {new Date(lastResult.participant?.scannedAt ?? "").toLocaleTimeString("fr-FR")}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pointage manuel */}
                        <div className="border-t pt-4">
                            <h3 className="font-medium text-sm text-gray-600 mb-2">
                                Pointage manuel (participant sans carte)
                            </h3>
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Nom, téléphone ou numéro..."
                                    className="pl-9"
                                    value={manualQuery}
                                    onChange={(e) => handleManualSearch(e.target.value)}
                                />
                            </div>
                            {manualResults.length > 0 && (
                                <div className="mt-2 border rounded-md divide-y max-w-sm">
                                    {manualResults.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                            <div>
                                                <div className="font-medium">{r.fullName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {r.participantNumber ?? "—"} · {r.phone}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleManualMark(r.id)}>
                                                Marquer présent
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats live */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-lifac-navy-900">Statistiques ({stats.totalRegistrations} inscrits)</h2>
                        <div className="flex gap-2">
                            <a href={`/api/admin/attendance/${event.id}/export?format=csv`} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm">
                                    Exporter CSV
                                </Button>
                            </a>
                            <a href={`/api/admin/attendance/${event.id}/export?format=pdf`} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm">
                                    Exporter PDF
                                </Button>
                            </a>
                        </div>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="py-2">Session</th>
                                <th className="py-2">Présents</th>
                                <th className="py-2">Absents</th>
                                <th className="py-2">Taux</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stats.sessions.map((s) => (
                                <tr key={s.id} className={s.id === selectedSessionId ? "bg-lifac-red-50" : ""}>
                                    <td className="py-2">{s.label}</td>
                                    <td className="py-2 text-emerald-600 font-medium">{s.present}</td>
                                    <td className="py-2 text-red-500">{s.absent}</td>
                                    <td className="py-2">{s.rate}%</td>
                                </tr>
                            ))}
                            {stats.sessions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-400">
                                        Aucune session créée pour cet événement
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Historique récent de la session sélectionnée */}
            {selectedSessionId && (
                <Card>
                    <CardContent className="p-4">
                        <h2 className="font-bold text-lifac-navy-900 mb-3">
                            Derniers pointages — {currentSessionStats?.label}
                        </h2>
                        <ul className="divide-y text-sm">
                            {recentScans.map((a) => (
                                <li key={a.id} className="py-2 flex justify-between">
                                    <span>
                                        {a.registration.fullName}{" "}
                                        <span className="text-gray-400">({a.registration.participantNumber ?? "—"})</span>
                                    </span>
                                    <span className="text-gray-500">
                                        {new Date(a.scannedAt).toLocaleTimeString("fr-FR")}
                                    </span>
                                </li>
                            ))}
                            {recentScans.length === 0 && <li className="py-4 text-center text-gray-400">Aucun pointage pour l'instant</li>}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
