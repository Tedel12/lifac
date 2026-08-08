import { ActivityType } from "@prisma/client";
import {
  Flame,
  Users,
  Zap,
  ShoppingBag,
  MessageCircle,
  Moon,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ActivityTypeMeta = {
  type: ActivityType;
  slug: string;
  image: string;
  icon: LucideIcon;
  labelKey: string;
};

// Ordre demandé par le client, réutilisé partout (grille, formulaires, select).
export const ACTIVITY_TYPES_ORDER: ActivityType[] = [
  ActivityType.CRUSADE,
  ActivityType.YOUTH_CRUSADE,
  ActivityType.POP_UP_CRUSADE,
  ActivityType.MARKET_OUTREACH,
  ActivityType.ONE_ON_ONE,
  ActivityType.NIGHT_OF_HOPE,
  ActivityType.HUMANITARIAN,
  ActivityType.TRAINING,
  ActivityType.OTHER,
];

export const ACTIVITY_TYPE_META: Record<ActivityType, ActivityTypeMeta> = {
  CRUSADE: {
    type: ActivityType.CRUSADE,
    slug: "croisade-evangelisation",
    image: "/activities/crusade.jpg",
    icon: Flame,
    labelKey: "crusade",
  },
  YOUTH_CRUSADE: {
    type: ActivityType.YOUTH_CRUSADE,
    slug: "youth-crusade",
    image: "/activities/youth-crusade.jpg",
    icon: Users,
    labelKey: "youthCrusade",
  },
  POP_UP_CRUSADE: {
    type: ActivityType.POP_UP_CRUSADE,
    slug: "pop-up-crusade",
    image: "/activities/pop-up-crusade.jpg",
    icon: Zap,
    labelKey: "popUpCrusade",
  },
  MARKET_OUTREACH: {
    type: ActivityType.MARKET_OUTREACH,
    slug: "evangelisation-marche",
    image: "/activities/market.jpg",
    icon: ShoppingBag,
    labelKey: "marketOutreach",
  },
  ONE_ON_ONE: {
    type: ActivityType.ONE_ON_ONE,
    slug: "evangelisation-personnelle",
    image: "/activities/personal-evangelism.jpg",
    icon: MessageCircle,
    labelKey: "oneOnOne",
  },
  NIGHT_OF_HOPE: {
    type: ActivityType.NIGHT_OF_HOPE,
    slug: "nuit-de-lespoir",
    image: "/activities/night-of-hope.jpg",
    icon: Moon,
    labelKey: "nightOfHope",
  },
  HUMANITARIAN: {
    type: ActivityType.HUMANITARIAN,
    slug: "actions-humanitaires",
    image: "/activities/humanitarian-action.jpg",
    icon: HeartHandshake,
    labelKey: "humanitarian",
  },
  TRAINING: {
    type: ActivityType.TRAINING,
    slug: "formation-evangelisation",
    image: "/activities/evangelism-training.jpg",
    icon: GraduationCap,
    labelKey: "training",
  },
  OTHER: {
    type: ActivityType.OTHER,
    slug: "autre",
    image: "/activities/crusade.jpg",
    icon: Sparkles,
    labelKey: "other",
  },
};

export function getActivityTypeMetaBySlug(slug: string): ActivityTypeMeta | undefined {
  return Object.values(ACTIVITY_TYPE_META).find((meta) => meta.slug === slug);
}