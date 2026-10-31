import {
  Plane, PlaneTakeoff, Car, TrainFront, Ship, Rocket, Droplets, CableCar, Atom, Flame, Star, Lock, Check, Map, Gamepad2,
  Puzzle, Wrench, Trophy, Compass, Lightbulb, Brain, Search, Zap, Timer, Heart, Gift, Calendar, Medal, Award, Telescope,
  Backpack, Satellite, Orbit, Mountain, Anchor, LifeBuoy, TowerControl, Siren, Bus, Cog, Bot, BatteryCharging, CircleHelp,
  Volume2, VolumeX, Music, Hammer, Pencil, Share2, Download, Smartphone, Play, ArrowRight, ArrowLeft, RotateCcw, Eye,
  Users, Snowflake, Wind, Flag, MapPin, Factory, Globe, ShieldCheck, TriangleAlert, Route, BookOpen, Hand, Ticket, Radio,
  Binoculars, Hourglass, Sparkles, SkipForward, Square, MessageCircle, X, ThumbsUp, Target, PackageOpen, FlaskConical,
  House, Megaphone, Cross, Ambulance, TrafficCone, Milestone, Split, Building2, User, PiggyBank, Cylinder, Gauge, Pill,
  PartyPopper, Cat, Bird, Gem, Skull, Smile, CircleCheck, CircleX, Ban, Lamp, Navigation, Sun, Layers, Crown, Bell,
  Plus, Pause, Shuffle, Palette, Footprints, Sprout, ChevronRight, ChevronLeft, IdCard, Dog, Fish, Rabbit, Swords, Mic,
} from 'lucide-react'

// One consistent line-icon set for the whole app (replaces emoji in the interface).
const icons = {
  plane: Plane, takeoff: PlaneTakeoff, car: Car, train: TrainFront, ship: Ship, rocket: Rocket, droplets: Droplets,
  cablecar: CableCar, atom: Atom, flame: Flame, star: Star, lock: Lock, check: Check, map: Map, gamepad: Gamepad2,
  puzzle: Puzzle, wrench: Wrench, trophy: Trophy, compass: Compass, lightbulb: Lightbulb, brain: Brain, search: Search,
  zap: Zap, timer: Timer, heart: Heart, gift: Gift, calendar: Calendar, medal: Medal, award: Award, telescope: Telescope,
  backpack: Backpack, satellite: Satellite, orbit: Orbit, mountain: Mountain, anchor: Anchor, lifebuoy: LifeBuoy,
  tower: TowerControl, siren: Siren, bus: Bus, cog: Cog, bot: Bot, battery: BatteryCharging, help: CircleHelp,
  volume: Volume2, mute: VolumeX, music: Music, hammer: Hammer, pencil: Pencil, share: Share2, download: Download,
  phone: Smartphone, play: Play, next: ArrowRight, back: ArrowLeft, retry: RotateCcw, eye: Eye, users: Users,
  snowflake: Snowflake, wind: Wind, flag: Flag, pin: MapPin, factory: Factory, globe: Globe, shield: ShieldCheck,
  alert: TriangleAlert, route: Route, book: BookOpen, hand: Hand, ticket: Ticket, radio: Radio, binoculars: Binoculars,
  hourglass: Hourglass, sparkles: Sparkles, skip: SkipForward, stop: Square, chat: MessageCircle, close: X,
  thumbs: ThumbsUp, target: Target, unbox: PackageOpen, flask: FlaskConical, home: House, megaphone: Megaphone,
  cross: Cross, ambulance: Ambulance, cone: TrafficCone, milestone: Milestone, split: Split, building: Building2,
  user: User, piggy: PiggyBank, cylinder: Cylinder, gauge: Gauge, pill: Pill, party: PartyPopper, cat: Cat, bird: Bird,
  gem: Gem, skull: Skull, smile: Smile, ok: CircleCheck, no: CircleX, ban: Ban, lamp: Lamp, navigation: Navigation,
  sun: Sun, layers: Layers, crown: Crown, bell: Bell, plus: Plus, mic: Mic, pause: Pause, shuffle: Shuffle, palette: Palette,
  footprints: Footprints, sprout: Sprout, right: ChevronRight, left: ChevronLeft, id: IdCard, dog: Dog, fish: Fish,
  rabbit: Rabbit, swords: Swords,
}

export const hasIcon = (name) => name in icons

export default function Icon({ name, className = 'h-[1.1em] w-[1.1em]', strokeWidth = 2.25, style, fill = 'none' }) {
  const Cmp = icons[name] || CircleHelp
  return <Cmp className={`inline-block shrink-0 align-[-0.15em] ${className}`} strokeWidth={strokeWidth} style={style} fill={fill} aria-hidden="true" />
}

// Division glyphs: one clear symbol per transport division.
export const divisionIcons = { air: 'plane', road: 'car', rail: 'train', water: 'ship', space: 'rocket', pipeline: 'droplets', cable: 'cablecar', future: 'atom' }

export function DivisionIcon({ slug, className, style }) {
  return <Icon name={divisionIcons[slug] || 'route'} className={className} style={style} />
}

// A coloured tile with the division glyph, used wherever a division needs a face.
export function DivisionBadge({ slug, accent = '#1D9BF0', className = 'h-12 w-12', iconClass = 'h-1/2 w-1/2' }) {
  return (
    <span className={`flex items-center justify-center rounded-2xl text-white shadow ${className}`} style={{ background: `linear-gradient(145deg, ${accent}, #102A43)` }} aria-hidden="true">
      <DivisionIcon slug={slug} className={iconClass} />
    </span>
  )
}

// Filled and empty stars for results. Announced once as "N out of 3 stars".
export function Stars({ count, total = 3, className = 'h-10 w-10' }) {
  return (
    <span className="inline-flex gap-1" role="img" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => (
        <Icon key={i} name="star" className={className} fill={i < count ? '#F59E0B' : 'none'} style={{ color: i < count ? '#F59E0B' : '#94a3b8' }} />
      ))}
    </span>
  )
}

const avatarColours = { rocket: '#F28C28', cat: '#D64045', bird: '#1D9BF0', fish: '#008C95', dog: '#7057D9', bot: '#24875D', rabbit: '#E97828', sprout: '#4246A3' }

// The child's chosen explorer face: an icon on a coloured disc.
export function Avatar({ name, className = 'h-10 w-10', iconClass = 'h-1/2 w-1/2' }) {
  return (
    <span className={`flex items-center justify-center rounded-full text-white shadow ${className}`} style={{ background: avatarColours[name] || '#1D9BF0' }} aria-hidden="true">
      <Icon name={name} className={iconClass} />
    </span>
  )
}
