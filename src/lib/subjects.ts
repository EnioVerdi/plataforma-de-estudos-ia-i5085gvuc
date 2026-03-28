import {
  BookA,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Hourglass,
  Globe2,
  Brain,
  Users,
  Languages,
  BookOpen,
  Palette,
  Dumbbell,
  Layers,
  LucideIcon,
} from 'lucide-react'

export interface SubjectConfig {
  icon: LucideIcon
  color: string
}

export const SUBJECTS_CONFIG: Record<string, SubjectConfig> = {
  Português: { icon: BookA, color: '#3b82f6' }, // blue
  Matemática: { icon: Calculator, color: '#ef4444' }, // red
  Física: { icon: Atom, color: '#f59e0b' }, // amber
  Química: { icon: FlaskConical, color: '#10b981' }, // emerald
  Biologia: { icon: Dna, color: '#84cc16' }, // lime
  História: { icon: Hourglass, color: '#eab308' }, // yellow
  Geografia: { icon: Globe2, color: '#0ea5e9' }, // sky
  Filosofia: { icon: Brain, color: '#8b5cf6' }, // violet
  Sociologia: { icon: Users, color: '#ec4899' }, // pink
  Inglês: { icon: Languages, color: '#6366f1' }, // indigo
  Literatura: { icon: BookOpen, color: '#d946ef' }, // fuchsia
  Artes: { icon: Palette, color: '#f43f5e' }, // rose
  'Educação Física': { icon: Dumbbell, color: '#f97316' }, // orange
}

export const getSubjectConfig = (name: string): SubjectConfig => {
  const config = SUBJECTS_CONFIG[name]
  return config || { icon: Layers, color: '#64748b' } // Default generic icon
}
