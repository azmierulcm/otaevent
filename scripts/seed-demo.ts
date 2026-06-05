/**
 * Demo seed script — populates 10 vendors, 5 customers, events, and bids
 * for investor/demo purposes.
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *      (Project Settings → API → service_role secret key)
 *   2. npx tsx scripts/seed-demo.ts
 *
 * Safe to re-run: skips users whose email already exists.
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

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=82`;
}

async function createUser(
  email: string,
  fullName: string,
  role: "customer" | "vendor",
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
];

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Otaevent demo data…\n");

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
        eventIds[c.email] = existing.id;
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

  console.log("\n✅ Seed complete.");
  console.log(`\n📋 Demo login credentials (all users):`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`\n   Vendors:`);
  VENDORS.forEach((v) => console.log(`   ${v.email}`));
  console.log(`\n   Customers:`);
  CUSTOMERS.forEach((c) => console.log(`   ${c.email}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
