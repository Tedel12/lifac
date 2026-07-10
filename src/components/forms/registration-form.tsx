"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, RadioGroup, RadioGroupItem, Checkbox } from "@/components/ui/input";
import { registerForEvent } from "@/actions/community";

interface RegistrationFormProps {
  eventId: string;
  isFireCamp?: boolean;
}

const LIFAC_EVENTS = [
  "La Nuit de l'Espoir",
  "Croisade d'Évangélisation",
  "Youth Crusade",
  "Jésus au Marché",
  "Pop-Up Crusade",
  "Formation en Évangélisation",
  "Action Humanitaire",
];

const PARTICIPATION_MODES = [
  "Simple participant",
  "Bénévole",
  "Évangéliste",
  "Intercesseurs",
  "Chorale / Louange",
  "Équipe d'accueil",
  "Sécurité",
  "Média (Photo / Vidéo)",
  "Sonorisation",
  "Protocole",
  "Logistique",
  "Assistance humanitaire",
  "Personnel médical",
  "Enseignant (pour les formations)",
  "Traducteur",
  "Autre",
];

const DISPONIBILITES = ["Toute la durée", "Matin", "Après-midi", "Soir", "Week-end uniquement"];

const LANGUES = ["Français", "Anglais", "Fon", "Yoruba", "Goun", "Bariba", "Dendi", "Mina", "Autre"];

const LIEUX = ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Natitingou", "Autre"];

const DOMAINES_COMPETENCE = [
  "Médecin",
  "Infirmier",
  "Sage-femme",
  "Pharmacien",
  "Laborantin",
  "Psychologue",
  "Travailleur social",
  "Autre",
];

const TAILLES_TEESHIRT = ["XS", "S", "M", "L", "XL", "XXL"];

const STATUTS_MINISTERE = [
  "Pasteur",
  "Évangéliste",
  "Missionnaire",
  "Prophète",
  "Apôtre",
  "Enseignant",
  "Ancien",
  "Diacre",
  "Responsable de département",
  "Leader de jeunesse",
  "Ouvrier",
  "Responsable d'évangélisation",
  "Autre",
];

const EXPERIENCES_EVANGELISATION = [
  "Croisades d'évangélisation",
  "Évangélisation de rue",
  "Évangélisation de maison en maison",
  "Évangélisation dans les écoles",
  "Implantation d'Église",
  "Mission en milieu rural",
  "Suivi des nouveaux convertis",
  "Formation d'évangélistes",
  "Aucune",
];

export function RegistrationForm({ eventId, isFireCamp = false }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Record<string, any>>({
    participationMode: "Simple participant",
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: string, value: string) => {
    setFormData((prev) => {
      const current: string[] = prev[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const updateFile = (key: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    console.log("[RegistrationForm] Submitting formData:", formData);

    if (isFireCamp) {
      if (!formData.engagementExact || !formData.engagementReglement || !formData.engagementSessions) {
        setError("Veuillez confirmer les trois engagements avant de soumettre.");
        console.warn("[RegistrationForm] Engagement check failed.");
        return;
      }
      if (formData.reconnuParEglise === "Non" && !formData.lettreRecommandation) {
        setError("La lettre de recommandation signée est obligatoire si vous n'êtes pas reconnu par votre Église.");
        console.warn("[RegistrationForm] Recommandation check failed.");
        return;
      }
    } else {
      if (!formData.certifieExact || !formData.accepteUtilisationDonnees) {
        setError("Veuillez cocher les cases d'engagement avant de soumettre.");
        console.warn("[RegistrationForm] Engagement check failed.");
        return;
      }
      if (!formData.evenement) {
        setError("Veuillez choisir un événement.");
        console.warn("[RegistrationForm] Event check failed.");
        return;
      }
    }

    startTransition(async () => {
      const payload = {
        eventId: eventId, // Assurez-vous que eventId est bien ici
        fullName: `${formData.nom || ""} ${formData.prenoms || ""}`.trim(),
        phone: formData.telephone,
        email: formData.email,
        isFireCamp: isFireCamp,
        participationMode: formData.participationMode,
        formData: formData,
      };
      console.log("[RegistrationForm] Payload to be sent:", JSON.stringify(payload, null, 2));

      const result = await registerForEvent(payload as any);
      
      console.log("[RegistrationForm] Action result:", result);
      
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Inscription réussie !");
    });
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <p className="text-lg font-semibold">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isFireCamp ? <FireCampForm formData={formData} updateFormData={updateFormData} toggleArrayValue={toggleArrayValue} updateFile={updateFile} /> : (
        <LiFACGeneralForm formData={formData} updateFormData={updateFormData} toggleArrayValue={toggleArrayValue} />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'INSCRIRE"}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Petits composants utilitaires                                       */
/* ------------------------------------------------------------------ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-bold border-b pb-2">{title}</h3>
      {children}
    </section>
  );
}

function OuiNonRadio({
  name,
  value,
  onChange,
  required = false,
}: {
  name: string;
  value: string | undefined;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={name}
          value="Oui"
          checked={value === "Oui"}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        Oui
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={name}
          value="Non"
          checked={value === "Non"}
          onChange={(e) => onChange(e.target.value)}
        />
        Non
      </label>
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected?.includes(opt) || false}
            onChange={() => onToggle(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function FileField({
  label,
  required = false,
  accept,
  onChange,
}: {
  label: string;
  required?: boolean;
  accept?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>
        {label} {required && "*"}
      </Label>
      <label className="flex items-center gap-2 border rounded p-2 cursor-pointer text-sm text-muted-foreground hover:bg-muted/50">
        <Upload className="h-4 w-4" />
        <span>Choisir un fichier</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          required={required}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire général LiFAC (événements standards)                     */
/* ------------------------------------------------------------------ */

function LiFACGeneralForm({
  formData,
  updateFormData,
  toggleArrayValue,
}: {
  formData: Record<string, any>;
  updateFormData: (key: string, value: any) => void;
  toggleArrayValue: (key: string, value: string) => void;
}) {
  const evenement = formData.evenement;
  const participationMode = formData.participationMode;

  return (
    <>
      {/* 1. Informations personnelles */}
      <Section title="Informations personnelles">
        <Input placeholder="Nom *" onChange={(e) => updateFormData("nom", e.target.value)} required />
        <Input placeholder="Prénoms *" onChange={(e) => updateFormData("prenoms", e.target.value)} required />

        <div className="space-y-1">
          <Label>Sexe *</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" name="sexe" value="Homme" onChange={(e) => updateFormData("sexe", e.target.value)} required /> Homme
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="sexe" value="Femme" onChange={(e) => updateFormData("sexe", e.target.value)} /> Femme
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Date de naissance</Label>
          <Input type="date" onChange={(e) => updateFormData("dateNaissance", e.target.value)} />
        </div>

        <Input placeholder="Téléphone / WhatsApp *" onChange={(e) => updateFormData("telephone", e.target.value)} required />
        <Input placeholder="Adresse e-mail" type="email" onChange={(e) => updateFormData("email", e.target.value)} />

        <div className="space-y-1">
          <Label>Pays *</Label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => updateFormData("pays", e.target.value)}
            required
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un pays
            </option>
            <option>Bénin</option>
            <option>Togo</option>
            <option>Ghana</option>
            <option>Nigeria</option>
            <option>Côte d'Ivoire</option>
            <option>France</option>
            <option>Autre</option>
          </select>
          {formData.pays === "Autre" && (
            <Input placeholder="Précisez votre pays" onChange={(e) => updateFormData("paysAutre", e.target.value)} />
          )}
        </div>

        <Input placeholder="Ville" onChange={(e) => updateFormData("ville", e.target.value)} />
        <Input placeholder="Église ou ministère" onChange={(e) => updateFormData("eglise", e.target.value)} />
        <Input placeholder="Profession" onChange={(e) => updateFormData("profession", e.target.value)} />
      </Section>

      {/* 2. Événement */}
      <Section title="Détails de participation">
        <div className="space-y-1">
          <Label>À quel événement souhaitez-vous participer ? *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LIFAC_EVENTS.map((ev) => (
              <label key={ev} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="evenement"
                  value={ev}
                  checked={evenement === ev}
                  onChange={(e) => updateFormData("evenement", e.target.value)}
                  required
                />
                {ev}
              </label>
            ))}
          </div>
        </div>

        <Input placeholder="Session concernée" onChange={(e) => updateFormData("session", e.target.value)} />

        <div className="space-y-1">
          <Label>Lieu de l'événement</Label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => updateFormData("lieu", e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un lieu
            </option>
            {LIEUX.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          {formData.lieu === "Autre" && (
            <Input placeholder="Précisez le lieu" onChange={(e) => updateFormData("lieuAutre", e.target.value)} />
          )}
        </div>

        <div className="space-y-1">
          <Label>Date de participation</Label>
          <Input type="date" onChange={(e) => updateFormData("dateParticipation", e.target.value)} />
        </div>

        <div className="space-y-1">
          <Label>Comment souhaitez-vous participer ?</Label>
          <select
            className="w-full border p-2 rounded"
            value={participationMode}
            onChange={(e) => updateFormData("participationMode", e.target.value)}
          >
            {PARTICIPATION_MODES.map((mode) => (
              <option key={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label>Vos disponibilités</Label>
          <CheckboxGroup
            options={DISPONIBILITES}
            selected={formData.disponibilites || []}
            onToggle={(v) => toggleArrayValue("disponibilites", v)}
          />
        </div>
      </Section>

      {/* Champs conditionnels selon l'événement choisi */}
      {evenement === "Formation en Évangélisation" && (
        <Section title="Formation en Évangélisation">
          <Input placeholder="Niveau d'études" onChange={(e) => updateFormData("niveauEtudes", e.target.value)} />
          <Input placeholder="Fonction dans l'Église" onChange={(e) => updateFormData("fonctionEglise", e.target.value)} />
          <Input placeholder="Années de conversion" type="number" onChange={(e) => updateFormData("anneesConversion", e.target.value)} />
          <Input placeholder="Années de ministère" type="number" onChange={(e) => updateFormData("anneesMinistere", e.target.value)} />
          <Textarea placeholder="Motivation pour suivre la formation" onChange={(e) => updateFormData("motivationFormation", e.target.value)} />
        </Section>
      )}

      {evenement === "Action Humanitaire" && (
        <Section title="Action Humanitaire">
          <div className="space-y-1">
            <Label>Domaine de compétence</Label>
            <CheckboxGroup
              options={DOMAINES_COMPETENCE}
              selected={formData.domainesCompetence || []}
              onToggle={(v) => toggleArrayValue("domainesCompetence", v)}
            />
            {formData.domainesCompetence?.includes("Autre") && (
              <Input placeholder="Précisez le domaine" onChange={(e) => updateFormData("domaineCompetenceAutre", e.target.value)} />
            )}
          </div>
        </Section>
      )}

      {evenement === "Youth Crusade" && (
        <Section title="Youth Crusade">
          <Input placeholder="Établissement scolaire" onChange={(e) => updateFormData("etablissementScolaire", e.target.value)} />
          <Input placeholder="Classe ou niveau d'étude" onChange={(e) => updateFormData("classeNiveau", e.target.value)} />
          <Input placeholder="Université" onChange={(e) => updateFormData("universite", e.target.value)} />
          <Input placeholder="Centre de formation" onChange={(e) => updateFormData("centreFormation", e.target.value)} />
        </Section>
      )}

      {/* Champs conditionnels si Bénévole */}
      {participationMode === "Bénévole" && (
        <Section title="Bénévolat">
          <div className="space-y-1">
            <Label>Taille de tee-shirt</Label>
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => updateFormData("tailleTeeShirt", e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Choisissez une taille
              </option>
              {TAILLES_TEESHIRT.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input placeholder="Moyen de transport" onChange={(e) => updateFormData("moyenTransport", e.target.value)} />

          <div className="space-y-1">
            <Label>Peut-il se déplacer hors de sa ville ?</Label>
            <OuiNonRadio name="deplacementHorsVille" value={formData.deplacementHorsVille} onChange={(v) => updateFormData("deplacementHorsVille", v)} />
          </div>
          <div className="space-y-1">
            <Label>Possède-t-il un permis de conduire ?</Label>
            <OuiNonRadio name="permisConduire" value={formData.permisConduire} onChange={(v) => updateFormData("permisConduire", v)} />
          </div>
          <div className="space-y-1">
            <Label>Dispose-t-il d'un véhicule ?</Label>
            <OuiNonRadio name="vehicule" value={formData.vehicule} onChange={(v) => updateFormData("vehicule", v)} />
          </div>
        </Section>
      )}

      {/* 3. Expérience */}
      <Section title="Expérience">
        <div className="space-y-1">
          <Label>Avez-vous déjà participé à un événement LiFAC ?</Label>
          <OuiNonRadio name="dejaParticipe" value={formData.dejaParticipe} onChange={(v) => updateFormData("dejaParticipe", v)} />
        </div>
        {formData.dejaParticipe === "Oui" && (
          <Input placeholder="Lequel ?" onChange={(e) => updateFormData("dejaParticipeLequel", e.target.value)} />
        )}

        <Textarea
          placeholder="Possédez-vous une expérience dans ce domaine ?"
          onChange={(e) => updateFormData("experienceDomaine", e.target.value)}
        />

        <div className="space-y-1">
          <Label>Avez-vous reçu une formation en évangélisation ?</Label>
          <OuiNonRadio name="formationEvangelisation" value={formData.formationEvangelisation} onChange={(v) => updateFormData("formationEvangelisation", v)} />
        </div>
        {formData.formationEvangelisation === "Oui" && (
          <Input placeholder="Où ?" onChange={(e) => updateFormData("formationEvangelisationOu", e.target.value)} />
        )}

        <div className="space-y-1">
          <Label>Langues parlées</Label>
          <CheckboxGroup
            options={LANGUES}
            selected={formData.langues || []}
            onToggle={(v) => toggleArrayValue("langues", v)}
          />
          {formData.langues?.includes("Autre") && (
            <Input placeholder="Précisez la langue" onChange={(e) => updateFormData("langueAutre", e.target.value)} />
          )}
        </div>
      </Section>

      {/* 4. Champs spécifiques (besoins et message) */}
      <Section title="Besoins particuliers et message">
        <Textarea
          placeholder="Besoins particuliers (Handicap, Régime alimentaire, Assistance particulière...)"
          onChange={(e) => updateFormData("besoinsParticuliers", e.target.value)}
        />
        <Textarea placeholder="Message" onChange={(e) => updateFormData("message", e.target.value)} />
      </Section>

      {/* 5. Engagement */}
      <Section title="Engagement">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={formData.certifieExact || false}
            onChange={(e) => updateFormData("certifieExact", e.target.checked)}
            required
          />
          Je certifie que les informations fournies sont exactes.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={formData.accepteUtilisationDonnees || false}
            onChange={(e) => updateFormData("accepteUtilisationDonnees", e.target.checked)}
            required
          />
          J'accepte que LiFAC utilise mes informations uniquement dans le cadre de l'organisation de cet événement.
        </label>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire spécifique FIRECAMP                                       */
/* ------------------------------------------------------------------ */

function FireCampForm({
  formData,
  updateFormData,
  toggleArrayValue,
  updateFile,
}: {
  formData: Record<string, any>;
  updateFormData: (key: string, value: any) => void;
  toggleArrayValue: (key: string, value: string) => void;
  updateFile: (key: string, file: File | null) => void;
}) {
  return (
    <>
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-xl font-bold">FIRECAMP</h2>
        <p className="text-sm text-muted-foreground">Formation Intensive en Évangélisation</p>
        <p className="text-xs text-muted-foreground italic">
          Organisée par LiFAC (Light For All Center) — « Équiper les ouvriers pour la moisson. »
        </p>
      </div>

      {/* I. Informations personnelles */}
      <Section title="I. Informations personnelles">
        <Input placeholder="Nom *" onChange={(e) => updateFormData("nom", e.target.value)} required />
        <Input placeholder="Prénoms *" onChange={(e) => updateFormData("prenoms", e.target.value)} required />
        <FileField label="Photo d'identité récente" required accept="image/*" onChange={(f) => updateFile("photoIdentite", f)} />

        <div className="space-y-1">
          <Label>Sexe</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input type="radio" name="sexe" value="Homme" onChange={(e) => updateFormData("sexe", e.target.value)} /> Homme
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="sexe" value="Femme" onChange={(e) => updateFormData("sexe", e.target.value)} /> Femme
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Date de naissance</Label>
          <Input type="date" onChange={(e) => updateFormData("dateNaissance", e.target.value)} />
        </div>

        <Input placeholder="Nationalité" onChange={(e) => updateFormData("nationalite", e.target.value)} />
        <Input placeholder="Pays de résidence" onChange={(e) => updateFormData("paysResidence", e.target.value)} />
        <Input placeholder="Ville" onChange={(e) => updateFormData("ville", e.target.value)} />
        <Input placeholder="Adresse complète" onChange={(e) => updateFormData("adresseComplete", e.target.value)} />
        <Input placeholder="Téléphone (WhatsApp) *" onChange={(e) => updateFormData("telephone", e.target.value)} required />
        <Input placeholder="Adresse e-mail" type="email" onChange={(e) => updateFormData("email", e.target.value)} />
      </Section>

      {/* II. Situation spirituelle */}
      <Section title="II. Situation spirituelle">
        <div className="space-y-1">
          <Label>Êtes-vous né(e) de nouveau ? *</Label>
          <OuiNonRadio name="neDeNouveau" value={formData.neDeNouveau} onChange={(v) => updateFormData("neDeNouveau", v)} required />
        </div>
        <Input
          placeholder="Depuis combien d'années êtes-vous converti(e) ?"
          type="number"
          onChange={(e) => updateFormData("anneesConversion", e.target.value)}
        />
        <div className="space-y-1">
          <Label>Êtes-vous baptisé(e) par immersion ?</Label>
          <OuiNonRadio name="baptemeImmersion" value={formData.baptemeImmersion} onChange={(v) => updateFormData("baptemeImmersion", v)} />
        </div>
        <div className="space-y-1">
          <Label>Avez-vous reçu le baptême du Saint-Esprit ?</Label>
          <OuiNonRadio name="baptemeSaintEsprit" value={formData.baptemeSaintEsprit} onChange={(v) => updateFormData("baptemeSaintEsprit", v)} />
        </div>
        <div className="space-y-1">
          <Label>Parlez-vous en langues ?</Label>
          <OuiNonRadio name="parleEnLangues" value={formData.parleEnLangues} onChange={(v) => updateFormData("parleEnLangues", v)} />
        </div>
      </Section>

      {/* III. Ministère */}
      <Section title="III. Ministère">
        <div className="space-y-1">
          <Label>Quel est votre statut ? *</Label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => updateFormData("statutMinistere", e.target.value)}
            required
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un statut
            </option>
            {STATUTS_MINISTERE.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {formData.statutMinistere === "Autre" && (
            <Input placeholder="Précisez votre statut" onChange={(e) => updateFormData("statutMinistereAutre", e.target.value)} />
          )}
        </div>

        <Input placeholder="Nom de votre Église ou Ministère" onChange={(e) => updateFormData("nomEglise", e.target.value)} />
        <Input placeholder="Dénomination" onChange={(e) => updateFormData("denomination", e.target.value)} />
        <Input placeholder="Ville" onChange={(e) => updateFormData("villeEglise", e.target.value)} />
        <Input
          placeholder="Depuis combien d'années servez-vous dans ce ministère ?"
          type="number"
          onChange={(e) => updateFormData("anneesMinistere", e.target.value)}
        />
        <Textarea
          placeholder="Décrivez brièvement votre ministère ou votre responsabilité"
          onChange={(e) => updateFormData("descriptionMinistere", e.target.value)}
        />
      </Section>

      {/* IV. Recommandation pastorale */}
      <Section title="IV. Recommandation pastorale">
        <div className="space-y-1">
          <Label>Êtes-vous un serviteur de Dieu officiellement reconnu par votre Église ?</Label>
          <OuiNonRadio name="reconnuParEglise" value={formData.reconnuParEglise} onChange={(v) => updateFormData("reconnuParEglise", v)} />
        </div>

        {formData.reconnuParEglise === "Non" && (
          <div className="space-y-4 border-l-2 pl-4">
            <p className="text-sm text-muted-foreground">
              Les informations suivantes sont obligatoires.
            </p>
            <Input placeholder="Nom et prénom du Pasteur" onChange={(e) => updateFormData("pasteurNom", e.target.value)} required />
            <Input placeholder="Fonction" onChange={(e) => updateFormData("pasteurFonction", e.target.value)} />
            <Input placeholder="Nom de l'Église" onChange={(e) => updateFormData("pasteurEglise", e.target.value)} />
            <Input placeholder="Téléphone du Pasteur" onChange={(e) => updateFormData("pasteurTelephone", e.target.value)} required />
            <Input placeholder="Adresse e-mail" type="email" onChange={(e) => updateFormData("pasteurEmail", e.target.value)} />
            <div className="space-y-1">
              <Label>Le Pasteur recommande-t-il votre participation au FIRECAMP ?</Label>
              <OuiNonRadio name="pasteurRecommande" value={formData.pasteurRecommande} onChange={(v) => updateFormData("pasteurRecommande", v)} />
            </div>
            <FileField
              label="Lettre de recommandation signée"
              required
              accept=".pdf,image/*"
              onChange={(f) => updateFile("lettreRecommandation", f)}
            />
            <p className="text-xs text-muted-foreground italic">
              Toute candidature d'un participant qui n'est pas serviteur de Dieu devra être accompagnée d'une recommandation de son pasteur.
            </p>
          </div>
        )}
      </Section>

      {/* V. Expérience en évangélisation */}
      <Section title="V. Expérience en évangélisation">
        <Label>Avez-vous déjà participé à :</Label>
        <CheckboxGroup
          options={EXPERIENCES_EVANGELISATION}
          selected={formData.experiencesEvangelisation || []}
          onToggle={(v) => toggleArrayValue("experiencesEvangelisation", v)}
        />
      </Section>

      {/* VI. Motivation */}
      <Section title="VI. Pourquoi souhaitez-vous participer au FIRECAMP ?">
        <Textarea onChange={(e) => updateFormData("motivationFireCamp", e.target.value)} />
      </Section>

      {/* VII. Objectifs */}
      <Section title="VII. Quels sont vos objectifs après cette formation ?">
        <Textarea onChange={(e) => updateFormData("objectifsFireCamp", e.target.value)} />
      </Section>

      {/* VIII. Disponibilité */}
      <Section title="VIII. Disponibilité">
        <Label>Je confirme être disponible pour suivre l'intégralité de la formation.</Label>
        <OuiNonRadio name="disponibiliteComplete" value={formData.disponibiliteComplete} onChange={(v) => updateFormData("disponibiliteComplete", v)} />
      </Section>

      {/* IX. Hébergement */}
      <Section title="IX. Hébergement">
        <Label>Aurez-vous besoin d'un hébergement ?</Label>
        <OuiNonRadio name="hebergement" value={formData.hebergement} onChange={(v) => updateFormData("hebergement", v)} />
      </Section>

      {/* X. Santé */}
      <Section title="X. Santé">
        <div className="space-y-1">
          <Label>Avez-vous un problème de santé nécessitant une attention particulière ?</Label>
          <OuiNonRadio name="problemeSante" value={formData.problemeSante} onChange={(v) => updateFormData("problemeSante", v)} />
        </div>
        {formData.problemeSante === "Oui" && (
          <Input placeholder="Précisez" onChange={(e) => updateFormData("problemeSantePrecision", e.target.value)} />
        )}
      </Section>

      {/* XI. Personne à contacter en cas d'urgence */}
      <Section title="XI. Personne à contacter en cas d'urgence">
        <Input placeholder="Nom" onChange={(e) => updateFormData("urgenceNom", e.target.value)} />
        <Input placeholder="Lien de parenté" onChange={(e) => updateFormData("urgenceLienParente", e.target.value)} />
        <Input placeholder="Téléphone" onChange={(e) => updateFormData("urgenceTelephone", e.target.value)} />
      </Section>

      {/* XII. Engagement */}
      <Section title="XII. Engagement">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={formData.engagementExact || false}
            onChange={(e) => updateFormData("engagementExact", e.target.checked)}
            required
          />
          Je certifie que les informations fournies sont exactes.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={formData.engagementReglement || false}
            onChange={(e) => updateFormData("engagementReglement", e.target.checked)}
            required
          />
          Je m'engage à respecter le règlement intérieur du FIRECAMP.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={formData.engagementSessions || false}
            onChange={(e) => updateFormData("engagementSessions", e.target.checked)}
            required
          />
          Je m'engage à participer à toutes les sessions de formation.
        </label>

        <Input placeholder="Signature électronique (tapez votre nom complet)" onChange={(e) => updateFormData("signatureElectronique", e.target.value)} />
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" onChange={(e) => updateFormData("dateSignature", e.target.value)} />
        </div>
      </Section>

      {/* Documents à joindre */}
      <Section title="Documents à joindre">
        <FileField label="Photo d'identité récente" required accept="image/*" onChange={(f) => updateFile("photoIdentiteDoc", f)} />
        <FileField label="Pièce d'identité (facultatif)" accept="image/*,.pdf" onChange={(f) => updateFile("pieceIdentite", f)} />
        <FileField
          label="Lettre de recommandation du pasteur (obligatoire si non serviteur de Dieu reconnu)"
          accept=".pdf,image/*"
          required={formData.reconnuParEglise === "Non"}
          onChange={(f) => updateFile("lettreRecommandationDoc", f)}
        />
        <FileField label="Curriculum Vitae ministériel (facultatif)" accept=".pdf,.doc,.docx" onChange={(f) => updateFile("cvMinisteriel", f)} />
      </Section>
    </>
  );
}