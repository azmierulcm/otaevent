/**
 * Demo seed script — populates 10 vendors, 10 customers, events, bids,
 * registries, RSVPs, editorial stories, native ads, and one owner account
 * for investor/demo purposes.
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *      (Project Settings → API → service_role secret key)
 *   2. npx tsx scripts/seed-demo.ts
 *
 * Safe to re-run: skips users whose email already exists and avoids
 * duplicate events, bids, registry items, RSVPs, articles, and ads.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEMO_PASSWORD = "DemoOtaevent2026!";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────

type DemoRole = "customer" | "vendor" | "owner";

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=82`;
}

async function createUser(
  email: string,
  fullName: string,
  role: DemoRole,
): Promise<string | null> {
  // Check if already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    console.log(`  ⏭  ${email} already exists, skipping`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    user_metadata: { full_name: fullName, role },
    email_confirm: true,
  });

  if (error) {
    console.error(`  ✗ Failed to create ${email}:`, error.message);
    return null;
  }

  console.log(`  ✓ Created ${role}: ${fullName} <${email}>`);
  return data.user.id;
}

// ── Owner data ────────────────────────────────────────────────────────────

const OWNER = {
  email: "owner@otaevent-demo.com",
  fullName: "Azmierul Chemat",
};

// ── Vendor data ───────────────────────────────────────────────────────────

const VENDORS = [
  {
    email: "ahmad.zamani@otaevent-demo.com",
    fullName: "Ahmad Zamani",
    profile: {
      business_name: "Ahmad Zamani Photography",
      tagline: "Candid moments, timeless memories",
      bio: "Specialising in intimate wedding and engagement photography across Klang Valley. Over 8 years capturing Malay, Chinese, and Indian ceremonies with a warm, documentary style. Every couple deserves a gallery they will keep forever.",
      base_location: "Kuala Lumpur",
      service_categories: ["Photography"],
      cover_image_path: img("1519741497674-611481863552"),
      gallery_image_paths: [
        img("1606800052052-a08af7148866"),
        img("1511285560929-80b456fea0bc"),
        img("1532712938310-34cb3982ef74"),
      ],
      price_floor: 2800,
      is_verified: true,
    },
  },
  {
    email: "bungabunga@otaevent-demo.com",
    fullName: "Syahirah Izzati",
    profile: {
      business_name: "Bungabunga Florals & Décor",
      tagline: "Lush tropical florals for intimate celebrations",
      bio: "We design floral arrangements for Malay weddings, engagement ceremonies, and private dinners throughout Klang Valley. Specialising in tropical blooms, garden-style tablescapes, and soft romantic palettes.",
      base_location: "Petaling Jaya",
      service_categories: ["Florals", "Decor"],
      cover_image_path: img("1487070183336-b863922373d4"),
      gallery_image_paths: [
        img("1526047932273-341f2a7631f9"),
        img("1487530811176-3780de880c2d"),
        img("1523438885200-e635ba2c371e"),
      ],
      price_floor: 1200,
      is_verified: true,
    },
  },
  {
    email: "selera.warisan@otaevent-demo.com",
    fullName: "Chef Razif Hashim",
    profile: {
      business_name: "Selera Warisan Catering",
      tagline: "Authentic Malaysian flavours, beautifully plated",
      bio: "From nasi minyak to full chef's table experiences, we bring the best of Malaysian cuisine to your private events. Halal certified, serving from 30 to 300 pax across Selangor and Kuala Lumpur.",
      base_location: "Shah Alam",
      service_categories: ["Catering"],
      cover_image_path: img("1555244162-803834f70033"),
      gallery_image_paths: [
        img("1567620905732-2d1ec7ab7445"),
        img("1504674900247-0877df9cc836"),
        img("1540189549336-e6e99c3679fe"),
      ],
      price_floor: 3200,
      is_verified: true,
    },
  },
  {
    email: "dewan.merbok@otaevent-demo.com",
    fullName: "Nadia Sofea",
    profile: {
      business_name: "Dewan Merbok Events",
      tagline: "Elegant private spaces in the heart of KL",
      bio: "A boutique event space accommodating up to 80 guests. Featuring floor-to-ceiling windows, a private terrace garden, and in-house catering. Perfect for intimate receptions, corporate dinners, and engagement ceremonies.",
      base_location: "Kuala Lumpur",
      service_categories: ["Venue"],
      cover_image_path: img("1519167758481-83f550bb49b3"),
      gallery_image_paths: [
        img("1464366400600-7168b8af9bc3"),
        img("1478146896981-b80fe463b330"),
        img("1531058020387-3be344556be6"),
      ],
      price_floor: 4500,
      is_verified: true,
    },
  },
  {
    email: "sweet.moments@otaevent-demo.com",
    fullName: "Nurul Ain Bakri",
    profile: {
      business_name: "Sweet Moments Patisserie",
      tagline: "Artisan cakes and dessert tables made in Bangsar",
      bio: "Custom wedding cakes, dessert bars, and kuih platters for intimate Malaysian celebrations. Each creation is handcrafted with premium local ingredients and can be personalised to match your event theme.",
      base_location: "Bangsar",
      service_categories: ["Dessert"],
      cover_image_path: img("1551024506-0bccd828d307"),
      gallery_image_paths: [
        img("1563729784474-d77dbb933a9e"),
        img("1568702846914-96b305d2aaeb"),
        img("1578985545062-69928b1d9587"),
      ],
      price_floor: 850,
      is_verified: false,
    },
  },
  {
    email: "dayang.decor@otaevent-demo.com",
    fullName: "Dayang Mariam",
    profile: {
      business_name: "Dayang Décor Studio",
      tagline: "Elegant event styling with a Malaysian touch",
      bio: "Full-service event décor for nikah ceremonies, garden dinners, and corporate events. We handle backdrops, centrepieces, fairy lights, and florals — from concept to pack-down.",
      base_location: "Subang Jaya",
      service_categories: ["Decor", "Planning"],
      cover_image_path: img("1527529482837-4698179dc6ce"),
      gallery_image_paths: [
        img("1533090161767-e6ffed986c88"),
        img("1510076857177-7470076d4098"),
        img("1478146059778-26b7a7f5e87b"),
      ],
      price_floor: 2200,
      is_verified: true,
    },
  },
  {
    email: "harmoni.live@otaevent-demo.com",
    fullName: "Hazwan Muzafar",
    profile: {
      business_name: "Harmoni Live Entertainment",
      tagline: "Live music that sets the perfect tone",
      bio: "Acoustic duo, jazz quartet, or full band — we perform at Malay weddings, corporate dinners, and private events across KL. Our repertoire spans local favourites, P. Ramlee classics, and international standards.",
      base_location: "Kuala Lumpur",
      service_categories: ["Music"],
      cover_image_path: img("1493225457124-a3eb161ffa5f"),
      gallery_image_paths: [
        img("1470019693664-1d202d2c0907"),
        img("1429962714451-bb934ecdc4ec"),
        img("1468164016595-6a24d7f0e07f"),
      ],
      price_floor: 1800,
      is_verified: false,
    },
  },
  {
    email: "kisah.photobooth@otaevent-demo.com",
    fullName: "Irfan Haiqal",
    profile: {
      business_name: "Kisah Photo Booth",
      tagline: "Instax prints and digital booths for every celebration",
      bio: "Modern photo booths with props and custom-printed Instax for weddings, birthdays, and kenduri. Setup takes under an hour and includes a dedicated attendant for the full duration of your event.",
      base_location: "Petaling Jaya",
      service_categories: ["Photography"],
      cover_image_path: img("1516035069371-29a1b244cc32"),
      gallery_image_paths: [
        img("1502920917128-1aa500764cbd"),
        img("1495745966610-2a67f2297e5e"),
        img("1510127034890-ba27558773bc"),
      ],
      price_floor: 1100,
      is_verified: false,
    },
  },
  {
    email: "seri.mayang@otaevent-demo.com",
    fullName: "Puan Seri Wati",
    profile: {
      business_name: "Seri Mayang Event Solutions",
      tagline: "End-to-end event management, stress-free",
      bio: "Full-service event planning from vendor sourcing to on-day coordination. We specialise in Malay weddings, engagement ceremonies, and corporate gatherings across Selangor and Kuala Lumpur.",
      base_location: "Putrajaya",
      service_categories: ["Planning"],
      cover_image_path: img("1469371670807-013ccf25f16a"),
      gallery_image_paths: [
        img("1505236858219-8359eb29e329"),
        img("1488646953014-85cb44e25828"),
        img("1419242902214-272b3f66ee7a"),
      ],
      price_floor: 3500,
      is_verified: true,
    },
  },
  {
    email: "casa.verde@otaevent-demo.com",
    fullName: "Fatin Nasuha",
    profile: {
      business_name: "Casa Verde Florals",
      tagline: "Tropical greenery and soft-palette floral design",
      bio: "Statement floral installations and intimate table arrangements for garden parties, rooftop dinners, and engagement receptions. Serving Mont Kiara, Bangsar, and KLCC with signature tropical-modern arrangements.",
      base_location: "Mont Kiara",
      service_categories: ["Florals", "Decor"],
      cover_image_path: img("1462275646964-a0e3386b89fa"),
      gallery_image_paths: [
        img("1464820453369-31d2c0b651af"),
        img("1507290439931-a861b5a38200"),
        img("1490750967868-88df5691cc97"),
      ],
      price_floor: 1500,
      is_verified: true,
    },
  },
];

// ── Customer + event data ─────────────────────────────────────────────────

const CUSTOMERS = [
  {
    email: "aisyah.razali@otaevent-demo.com",
    fullName: "Nur Aisyah Razali",
    events: [
      {
        name: "Majlis Persandingan Amirul & Aisyah",
        budget: 15000,
        services: ["Catering", "Florals", "Photography"],
        event_date: "2026-09-20",
        details:
          "A traditional Malay bersanding ceremony for 80 guests at a garden venue in KL. We need a full catering team, romantic floral décor, and documentary photography throughout the day.",
        capacity: 80,
        location: "Kuala Lumpur",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "majlis-persandingan-amirul-aisyah",
      },
    ],
  },
  {
    email: "rashidah.johari@otaevent-demo.com",
    fullName: "Rashidah binti Johari",
    events: [
      {
        name: "Kejutan Hari Jadi Datin Rashidah",
        budget: 8500,
        services: ["Venue", "Dessert", "Decor"],
        event_date: "2026-08-15",
        details:
          "Intimate surprise birthday dinner for 35 guests at a private venue in Penang. Looking for a stylish venue with dessert table and elegant décor that suits a classy yet fun atmosphere.",
        capacity: 35,
        location: "Penang",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "kejutan-hari-jadi-rashidah",
      },
    ],
  },
  {
    email: "haziq.ikhwan@otaevent-demo.com",
    fullName: "Haziq Ikhwan",
    events: [
      {
        name: "Majlis Pertunangan Haziq & Amira",
        budget: 6000,
        services: ["Florals", "Photography", "Decor"],
        event_date: "2026-08-30",
        details:
          "A garden engagement ceremony for 60 guests in Shah Alam. We want soft florals with white and blush tones, tasteful backdrop décor, and a photographer who can capture candid family moments.",
        capacity: 60,
        location: "Shah Alam",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "pertunangan-haziq-amira",
      },
    ],
  },
  {
    email: "farah.syamimi@otaevent-demo.com",
    fullName: "Farah Syamimi",
    events: [
      {
        name: "Rooftop Baby Shower — Baby Ilham",
        budget: 4500,
        services: ["Decor", "Dessert", "Planning"],
        event_date: "2026-07-27",
        details:
          "A cute rooftop baby shower in KLCC for 30 close friends and family. Looking for pastel décor with a sky-blue and cloud theme, a custom dessert table, and someone to handle the event flow.",
        capacity: 30,
        location: "KLCC, Kuala Lumpur",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "baby-shower-ilham",
      },
    ],
  },
  {
    email: "zulkifli.ahmad@otaevent-demo.com",
    fullName: "Encik Zulkifli Ahmad",
    events: [
      {
        name: "Malam Gala Nexus Capital 2026",
        budget: 28000,
        services: ["Venue", "Catering", "Music"],
        event_date: "2026-10-10",
        details:
          "Annual corporate gala dinner for 90 staff and clients at a premium KLCC venue. Full catering required — 3-course sit-down dinner, live entertainment, and AV setup included.",
        capacity: 90,
        location: "KLCC, Kuala Lumpur",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "nexus-capital-gala-2026",
      },
    ],
  },
  {
    email: "lim.weishen@otaevent-demo.com",
    fullName: "Lim Wei Shen",
    events: [
      {
        name: "George Town Product Launch Night",
        budget: 12000,
        services: ["Photography", "Venue", "Decor"],
        event_date: "2026-09-05",
        details:
          "A boutique product launch for 70 guests in George Town. We need a stylish venue, clean modern styling, and strong photography for social content and press kits.",
        capacity: 70,
        location: "George Town, Penang",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "george-town-product-launch",
      },
    ],
  },
  {
    email: "priya.nair@otaevent-demo.com",
    fullName: "Priya Nair",
    events: [
      {
        name: "Deepavali Open House in Bangsar",
        budget: 9000,
        services: ["Catering", "Decor", "Music"],
        event_date: "2026-10-31",
        details:
          "A warm Deepavali open house for 55 guests. Looking for Malaysian-Indian catering, tasteful festive decor, and light live music for a relaxed family atmosphere.",
        capacity: 55,
        location: "Bangsar, Kuala Lumpur",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "deepavali-open-house-bangsar",
      },
    ],
  },
  {
    email: "siti.khadijah@otaevent-demo.com",
    fullName: "Siti Khadijah Mohd Noor",
    events: [
      {
        name: "Majlis Aqiqah & Doa Selamat",
        budget: 7000,
        services: ["Catering", "Dessert", "Decor"],
        event_date: "2026-08-08",
        details:
          "A family aqiqah and doa selamat for 65 guests in Kajang. We want a halal buffet, a small dessert corner, and simple pastel styling suitable for a home compound.",
        capacity: 65,
        location: "Kajang, Selangor",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "aqiqah-doa-selamat-kajang",
      },
    ],
  },
  {
    email: "daniel.tan@otaevent-demo.com",
    fullName: "Daniel Tan",
    events: [
      {
        name: "Rooftop Proposal Dinner",
        budget: 6500,
        services: ["Venue", "Florals", "Photography"],
        event_date: "2026-07-18",
        details:
          "A private rooftop proposal dinner for 18 guests in Mont Kiara. Need a beautiful intimate venue, elegant florals, and a discreet photographer for the surprise moment.",
        capacity: 18,
        location: "Mont Kiara, Kuala Lumpur",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "rooftop-proposal-mont-kiara",
      },
    ],
  },
  {
    email: "nur.iman@otaevent-demo.com",
    fullName: "Nur Iman Hakim",
    events: [
      {
        name: "Johor Bahru Family Reunion",
        budget: 11000,
        services: ["Venue", "Catering", "Music"],
        event_date: "2026-12-12",
        details:
          "A year-end family reunion for 85 relatives in Johor Bahru. We need a comfortable private hall, Malaysian buffet catering, and light acoustic music for dinner.",
        capacity: 85,
        location: "Johor Bahru, Johor",
        status: "open" as const,
        visibility: "shared" as const,
        share_slug: "jb-family-reunion",
      },
    ],
  },
];

// ── Bid data (vendor index → event customer email) ────────────────────────

const BIDS = [
  // Ahmad Zamani Photography → Aisyah's wedding + Haziq's engagement
  {
    vendorEmail: "ahmad.zamani@otaevent-demo.com",
    customerEmail: "aisyah.razali@otaevent-demo.com",
    amount: 3200,
    message:
      "Assalamualaikum. We would be honoured to capture your bersanding ceremony. Our package includes a lead photographer, one assistant, full-day coverage, and a 300-image edited gallery delivered within 3 weeks.",
  },
  {
    vendorEmail: "ahmad.zamani@otaevent-demo.com",
    customerEmail: "haziq.ikhwan@otaevent-demo.com",
    amount: 2800,
    message:
      "Congratulations on your engagement. Our half-day package covers the ceremony proper, family formals, and candid moments — delivered as a private online gallery with print rights.",
  },

  // Bungabunga Florals → Aisyah's wedding + Haziq's engagement
  {
    vendorEmail: "bungabunga@otaevent-demo.com",
    customerEmail: "aisyah.razali@otaevent-demo.com",
    amount: 2500,
    message:
      "We propose a full bersanding floral package: pelamin backdrop with fresh roses and greenery, 8 table centrepieces, bunga telur station, and complimentary petals for the procession.",
  },
  {
    vendorEmail: "bungabunga@otaevent-demo.com",
    customerEmail: "haziq.ikhwan@otaevent-demo.com",
    amount: 1400,
    message:
      "For your garden engagement, we suggest a blush and white palette with tropical greens. Our proposal includes a floral arch, 6 table arrangements, and a small hantaran display.",
  },

  // Selera Warisan → Aisyah's wedding + Zulkifli's corporate
  {
    vendorEmail: "selera.warisan@otaevent-demo.com",
    customerEmail: "aisyah.razali@otaevent-demo.com",
    amount: 4800,
    message:
      "For 80 pax, our bersanding package includes nasi minyak, ayam masak merah, dalca, pelbagai lauk, buah-buahan, and full serving staff. Halal certified and experienced in traditional Malay ceremonies.",
  },
  {
    vendorEmail: "selera.warisan@otaevent-demo.com",
    customerEmail: "zulkifli.ahmad@otaevent-demo.com",
    amount: 9500,
    message:
      "For your gala dinner, we propose a 3-course menu with a western-Asian fusion approach. Includes butler service, full tableware, and a dedicated event chef. We have catered for Fortune 500 events across KLCC.",
  },

  // Dewan Merbok → Rashidah's birthday + Zulkifli's corporate
  {
    vendorEmail: "dewan.merbok@otaevent-demo.com",
    customerEmail: "rashidah.johari@otaevent-demo.com",
    amount: 5500,
    message:
      "Our venue fits your 35-guest intimate dinner perfectly. We offer exclusive access to the terrace garden, full in-house catering coordination, and flexible styling — ideal for a private birthday celebration.",
  },

  // Sweet Moments → Rashidah's birthday + Farah's baby shower
  {
    vendorEmail: "sweet.moments@otaevent-demo.com",
    customerEmail: "rashidah.johari@otaevent-demo.com",
    amount: 1200,
    message:
      "We propose a 3-tier birthday cake with fresh flowers, plus a compact dessert table with macarons, mini tarts, and gold-trimmed chocolate bark. Fully customisable to your theme.",
  },
  {
    vendorEmail: "sweet.moments@otaevent-demo.com",
    customerEmail: "farah.syamimi@otaevent-demo.com",
    amount: 950,
    message:
      "For Baby Ilham's shower, we will create a sky-blue cloud dessert table with character cake, cake pops, cloud meringues, and personalised sugar cookies. Adorable and delicious.",
  },

  // Dayang Décor → Farah's baby shower + Haziq's engagement
  {
    vendorEmail: "dayang.decor@otaevent-demo.com",
    customerEmail: "farah.syamimi@otaevent-demo.com",
    amount: 1800,
    message:
      "Our baby shower package includes a full balloon cloud ceiling, welcome backdrop, table styling, and prop hire for the day. We love pastel blue and cloud themes — right up our alley.",
  },
  {
    vendorEmail: "dayang.decor@otaevent-demo.com",
    customerEmail: "haziq.ikhwan@otaevent-demo.com",
    amount: 2400,
    message:
      "For your garden engagement, we propose a garden arch backdrop, fairy-light canopy over the seating area, and gold-white centrepieces. Full setup and teardown included.",
  },

  // Harmoni Live → Zulkifli's corporate
  {
    vendorEmail: "harmoni.live@otaevent-demo.com",
    customerEmail: "zulkifli.ahmad@otaevent-demo.com",
    amount: 3200,
    message:
      "For your gala, we recommend our 5-piece jazz ensemble for the cocktail hour, transitioning to a full live band with vocalist for dinner and awards ceremony. Setlist includes P. Ramlee, local classics, and contemporary hits.",
  },

  // Kisah Photo Booth → Aisyah's wedding
  {
    vendorEmail: "kisah.photobooth@otaevent-demo.com",
    customerEmail: "aisyah.razali@otaevent-demo.com",
    amount: 1300,
    message:
      "Add a Kisah booth to your bersanding and your guests will love it. We provide 4 hours of unlimited Instax prints, custom frame design with your names, themed props, and a digital gallery link for all photos.",
  },

  // Seri Mayang → Zulkifli's corporate + Farah's baby shower
  {
    vendorEmail: "seri.mayang@otaevent-demo.com",
    customerEmail: "zulkifli.ahmad@otaevent-demo.com",
    amount: 4500,
    message:
      "We will manage your gala end-to-end: vendor briefing, runsheet, AV liaison, emcee coordination, and on-day operations. Our team has delivered gala events for Petronas and TM in the past 3 years.",
  },
  {
    vendorEmail: "seri.mayang@otaevent-demo.com",
    customerEmail: "farah.syamimi@otaevent-demo.com",
    amount: 1600,
    message:
      "Half-day coordination for your baby shower: vendor confirmation, setup supervision, event flow management, and a dedicated coordinator on-site from setup to teardown.",
  },

  // Casa Verde → Aisyah's wedding + Farah's baby shower
  {
    vendorEmail: "casa.verde@otaevent-demo.com",
    customerEmail: "aisyah.razali@otaevent-demo.com",
    amount: 2200,
    message:
      "Our bersanding floral proposal features a lush tropical-modern pelamin with monstera, white anthuriums, and palm fronds. We also include table greenery runners and a fresh floral welcome arch at the entrance.",
  },
  {
    vendorEmail: "casa.verde@otaevent-demo.com",
    customerEmail: "farah.syamimi@otaevent-demo.com",
    amount: 1100,
    message:
      "We will style your rooftop with a cloud-white balloon installation framed by tropical greenery — perfect for photos. Includes a small floral table centrepiece and personalised welcome sign.",
  },
  {
    vendorEmail: "ahmad.zamani@otaevent-demo.com",
    customerEmail: "lim.weishen@otaevent-demo.com",
    amount: 3600,
    message:
      "For the George Town launch, we can cover arrival shots, keynote/product moments, candid networking, and 40 same-night highlight images for social media. Full gallery delivered within 5 working days.",
  },
  {
    vendorEmail: "dayang.decor@otaevent-demo.com",
    customerEmail: "lim.weishen@otaevent-demo.com",
    amount: 3100,
    message:
      "We suggest a clean editorial setup with branded plinths, warm lighting, and a compact media wall. The look will feel premium but still practical for a product showcase.",
  },
  {
    vendorEmail: "selera.warisan@otaevent-demo.com",
    customerEmail: "priya.nair@otaevent-demo.com",
    amount: 4200,
    message:
      "We can prepare a Deepavali-friendly Malaysian spread with biryani, vegetarian sides, dhal, kuih, and tea service. Halal-certified kitchen, with clear vegetarian labelling for guests.",
  },
  {
    vendorEmail: "harmoni.live@otaevent-demo.com",
    customerEmail: "priya.nair@otaevent-demo.com",
    amount: 1900,
    message:
      "Our acoustic trio can keep the open house warm and conversational, mixing festive instrumentals, local favourites, and light contemporary songs without overpowering the room.",
  },
  {
    vendorEmail: "sweet.moments@otaevent-demo.com",
    customerEmail: "siti.khadijah@otaevent-demo.com",
    amount: 780,
    message:
      "For the aqiqah, we can prepare a pastel dessert corner with mini cupcakes, onde-onde cups, brownies, and a simple baby-themed cake. Setup and collection included.",
  },
  {
    vendorEmail: "selera.warisan@otaevent-demo.com",
    customerEmail: "siti.khadijah@otaevent-demo.com",
    amount: 5100,
    message:
      "Our aqiqah package includes nasi beriani, kambing, ayam masak merah, dalca, drinks, disposable tableware, and buffet service for 65 pax. Suitable for home compound setup.",
  },
  {
    vendorEmail: "dewan.merbok@otaevent-demo.com",
    customerEmail: "daniel.tan@otaevent-demo.com",
    amount: 4600,
    message:
      "Our terrace can be arranged for a private proposal dinner with skyline views, candlelit dining, and staff support. We can coordinate a surprise entrance and post-proposal dessert service.",
  },
  {
    vendorEmail: "casa.verde@otaevent-demo.com",
    customerEmail: "daniel.tan@otaevent-demo.com",
    amount: 1300,
    message:
      "We can create a compact proposal floral setup with white roses, tropical greenery, aisle petals, and a small table arrangement that photographs beautifully at sunset.",
  },
  {
    vendorEmail: "dewan.merbok@otaevent-demo.com",
    customerEmail: "nur.iman@otaevent-demo.com",
    amount: 6200,
    message:
      "For the family reunion, our private hall layout can fit 85 guests comfortably with buffet flow, kids' corner, and a small stage for speeches or performances.",
  },
  {
    vendorEmail: "harmoni.live@otaevent-demo.com",
    customerEmail: "nur.iman@otaevent-demo.com",
    amount: 2400,
    message:
      "We propose an acoustic Malay classics set during dinner, followed by singalong favourites after speeches. Family-friendly, warm, and not too loud for older guests.",
  },
];

// ── Visual/demo extras ────────────────────────────────────────────────────

const RSVP_NAMES = [
  ["Aida Rahman", "aida.rahman@example.com", "yes", 2, "Halal meal preferred"],
  ["Ben Tan", "ben.tan@example.com", "yes", 1, "Looking forward to it"],
  ["Meera Krishnan", "meera.krishnan@example.com", "maybe", 1, "Will confirm closer to the date"],
  ["Hakim Salleh", "hakim.salleh@example.com", "yes", 3, "Bringing family"],
] as const;

const REGISTRY_POOL = [
  {
    title: "Dessert table contribution",
    description: "Help the host add a few extra sweets for guests.",
    target_quantity: 4,
    claimed_quantity: 1,
    external_url: "https://www.google.com/search?q=malaysia+dessert+table",
  },
  {
    title: "Fresh flower arrangement",
    description: "Contribute toward table florals and entrance styling.",
    target_quantity: 5,
    claimed_quantity: 2,
    external_url: "https://www.google.com/search?q=malaysia+event+flowers",
  },
  {
    title: "Photo print fund",
    description: "A small contribution toward printed memories after the event.",
    target_quantity: 6,
    claimed_quantity: 0,
    external_url: "https://www.google.com/search?q=photo+printing+malaysia",
  },
  {
    title: "Door gift budget",
    description: "Support simple Malaysian-style door gifts for invited guests.",
    target_quantity: 8,
    claimed_quantity: 3,
    external_url: "https://www.google.com/search?q=malaysia+door+gift",
  },
];

const ARTICLES = [
  {
    title: "How Malaysian hosts plan intimate events under RM10k",
    slug: "malaysian-events-under-10k",
    excerpt:
      "A practical guide for planners balancing venue, catering, decor, and photography budgets.",
    body_md:
      "Malaysian hosts often want celebrations that feel warm, polished, and personal without turning into a full-scale hotel ballroom production.\n\nStart with the guest count, then choose the two categories that matter most: food, venue, decor, photography, entertainment, or coordination. Otaevent helps planners post one request and compare vendor bids side by side.",
    hero_image_path: img("1511795409834-ef04bbd61622"),
    status: "published" as const,
  },
  {
    title: "Why vendors need better visibility beyond social media",
    slug: "vendor-visibility-malaysia",
    excerpt:
      "A marketplace view of how small event vendors can convert portfolios into qualified leads.",
    body_md:
      "Many Malaysian vendors rely on Instagram, WhatsApp, and referrals. That works, but it makes pricing, availability, and comparison difficult for planners.\n\nOtaevent gives vendors a structured profile, visual portfolio, bid workflow, and access to live customer requests across Malaysia.",
    hero_image_path: img("1527529482837-4698179dc6ce"),
    status: "published" as const,
  },
];

const AD_BLOCKS = [
  {
    title: "Featured vendor: Selera Warisan Catering",
    placement: "home_grid",
    image_path: img("1555244162-803834f70033"),
    destination_url: "/#discover",
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
  {
    title: "Registry partner: Malaysian door gifts",
    placement: "registry_sidebar",
    image_path: img("1540189549336-e6e99c3679fe"),
    destination_url: "/events/garden-engagement",
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
  {
    title: "Editorial sponsor: Casa Verde Florals",
    placement: "article_inline",
    image_path: img("1487070183336-b863922373d4"),
    destination_url: "/#discover",
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
];

async function seedRegistryAndRsvps(eventId: string, eventName: string) {
  const { data: registry, error: registryError } = await supabase
    .from("registry")
    .upsert(
      {
        event_id: eventId,
        title: `${eventName} registry`,
        note: "A few thoughtful ways guests can support the host.",
      },
      { onConflict: "event_id" },
    )
    .select("id")
    .single();

  if (registryError || !registry) {
    console.error(`  ✗ Registry upsert failed: ${registryError?.message}`);
    return;
  }

  for (const item of REGISTRY_POOL.slice(0, 3)) {
    const { data: existing } = await supabase
      .from("registry_items")
      .select("id")
      .eq("registry_id", registry.id)
      .eq("title", item.title)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("registry_items").insert({
      registry_id: registry.id,
      title: item.title,
      description: item.description,
      image_path: null,
      target_quantity: item.target_quantity,
      claimed_quantity: item.claimed_quantity,
      claimed_by_name: null,
      claimed_by_email: null,
      external_url: item.external_url,
    });

    if (error) console.error(`  ✗ Registry item failed: ${error.message}`);
  }

  for (const [guestName, guestEmail, status, partySize, note] of RSVP_NAMES) {
    const { error } = await supabase.from("rsvps").upsert(
      {
        event_id: eventId,
        guest_name: guestName,
        guest_email: guestEmail,
        status,
        party_size: partySize,
        note,
      },
      { onConflict: "event_id,guest_email" },
    );

    if (error) console.error(`  ✗ RSVP failed: ${error.message}`);
  }
}

async function seedOwnerContent(ownerId: string) {
  console.log("\n── Editorial & Ads ──────────");

  for (const article of ARTICLES) {
    const { error } = await supabase.from("articles").upsert(
      {
        author_id: ownerId,
        ...article,
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );

    if (error) console.error(`  ✗ Article failed: ${error.message}`);
    else console.log(`  ✓ Article: ${article.title}`);
  }

  for (const ad of AD_BLOCKS) {
    const { data: existing } = await supabase
      .from("ad_blocks")
      .select("id")
      .eq("title", ad.title)
      .eq("placement", ad.placement)
      .maybeSingle();

    if (existing) {
      console.log(`  ⏭  Ad already exists: ${ad.title}`);
      continue;
    }

    const { error } = await supabase.from("ad_blocks").insert(ad);
    if (error) console.error(`  ✗ Ad failed: ${error.message}`);
    else console.log(`  ✓ Ad: ${ad.title}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Otaevent demo data…\n");

  // 0. Create owner account
  console.log("── Owner ────────────────────");
  const ownerId = await createUser(OWNER.email, OWNER.fullName, "owner");

  // 1. Create vendor users + profiles
  console.log("── Vendors ──────────────────");
  const vendorIds: Record<string, string> = {};

  for (const v of VENDORS) {
    const userId = await createUser(v.email, v.fullName, "vendor");
    if (!userId) continue;
    vendorIds[v.email] = userId;

    // Upsert vendor profile
    const { error } = await supabase.from("vendor_profiles").upsert(
      { user_id: userId, ...v.profile },
      { onConflict: "user_id" },
    );
    if (error) console.error(`  ✗ Profile upsert failed: ${error.message}`);
    else console.log(`  ✓ Profile: ${v.profile.business_name}`);
  }

  // 2. Create customer users + events
  console.log("\n── Customers & Events ───────");
  const eventIds: Record<string, string> = {}; // customerEmail → first event id

  for (const c of CUSTOMERS) {
    const userId = await createUser(c.email, c.fullName, "customer");
    if (!userId) continue;

    for (const ev of c.events) {
      // Check if event already exists
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("customer_id", userId)
        .eq("name", ev.name)
        .maybeSingle();

      if (existing) {
        console.log(`  ⏭  Event "${ev.name}" already exists`);
        const { error: updateError } = await supabase
          .from("events")
          .update(ev)
          .eq("id", existing.id);
        if (updateError) console.error(`  ✗ Event update failed: ${updateError.message}`);
        eventIds[c.email] = existing.id;
        await seedRegistryAndRsvps(existing.id, ev.name);
        continue;
      }

      const { data: inserted, error } = await supabase
        .from("events")
        .insert({ customer_id: userId, ...ev })
        .select("id")
        .single();

      if (error) console.error(`  ✗ Event insert failed: ${error.message}`);
      else {
        eventIds[c.email] = inserted.id;
        console.log(`  ✓ Event: ${ev.name}`);
        await seedRegistryAndRsvps(inserted.id, ev.name);
      }
    }
  }

  // 3. Create bids
  console.log("\n── Bids ─────────────────────");

  for (const bid of BIDS) {
    const vendorId = vendorIds[bid.vendorEmail];
    const eventId = eventIds[bid.customerEmail];

    if (!vendorId || !eventId) {
      console.log(
        `  ⏭  Skipping bid (missing vendor or event for ${bid.vendorEmail} → ${bid.customerEmail})`,
      );
      continue;
    }

    // Check if bid already exists
    const { data: existing } = await supabase
      .from("bids")
      .select("id")
      .eq("vendor_id", vendorId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) {
      console.log(`  ⏭  Bid already exists`);
      continue;
    }

    const { error } = await supabase.from("bids").insert({
      vendor_id: vendorId,
      event_id: eventId,
      amount: bid.amount,
      message: bid.message,
      status: "pending",
    });

    if (error) console.error(`  ✗ Bid insert failed: ${error.message}`);
    else console.log(`  ✓ Bid: ${bid.vendorEmail} → ${bid.customerEmail} (RM ${bid.amount})`);
  }

  if (ownerId) {
    await seedOwnerContent(ownerId);
  }

  console.log("\n✅ Seed complete.");
  console.log(`\n📋 Demo login credentials (all users):`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`\n   Owner:`);
  console.log(`   ${OWNER.email}`);
  console.log(`\n   Vendors:`);
  VENDORS.forEach((v) => console.log(`   ${v.email}`));
  console.log(`\n   Customers:`);
  CUSTOMERS.forEach((c) => console.log(`   ${c.email}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
