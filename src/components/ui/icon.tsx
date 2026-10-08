import {
  Anchor, Award, BadgeCheck, Boxes, Building2, Check, Circle, ClipboardCheck, Cog, Container, Cpu, Droplets,
  Factory, FileCheck2, FileSignature, Fingerprint, FlaskConical, Globe, Handshake, Headset, Layers, Leaf,
  ListChecks, MapPinCheck, MessageSquare, Microscope, Package, PackageCheck, RefreshCw, Ruler, Scale, ScanEye,
  ShieldCheck, Ship, Sparkles, Truck, Users, Warehouse, Wind, type LucideIcon,
} from "lucide-react";

/** Icons selectable from the admin panel (by name). */
export const ICONS: Record<string, LucideIcon> = {
  anchor: Anchor, award: Award, "badge-check": BadgeCheck, boxes: Boxes, building: Building2, check: Check,
  circle: Circle, "clipboard-check": ClipboardCheck, cog: Cog, container: Container, cpu: Cpu, droplets: Droplets,
  factory: Factory, "file-check": FileCheck2, "file-signature": FileSignature, fingerprint: Fingerprint,
  "flask-conical": FlaskConical, globe: Globe, handshake: Handshake, headset: Headset, layers: Layers, leaf: Leaf,
  "list-checks": ListChecks, "map-pin-check": MapPinCheck, "message-square": MessageSquare, microscope: Microscope,
  package: Package, "package-check": PackageCheck, "refresh-cw": RefreshCw, ruler: Ruler, scale: Scale,
  "scan-eye": ScanEye, "shield-check": ShieldCheck, ship: Ship, sparkles: Sparkles, truck: Truck, users: Users,
  warehouse: Warehouse, wind: Wind,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className, strokeWidth = 1.4 }: { name: string; className?: string; strokeWidth?: number }) {
  const Cmp = ICONS[name] ?? Circle;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
