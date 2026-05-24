
        document.addEventListener('DOMContentLoaded', function() {

    // ===== HEADER SCROLL EFFECT =====
    const mainHeader = document.getElementById('main-header');
    function handleHeaderScroll() {
        if (window.scrollY > 60) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // ===== ANIMATED COUNTERS =====
    function animateCounter(el, target, duration) {
        let start = 0;
        const step = target / (duration / 16);
        const tick = () => {
            start += step;
            if (start >= target) {
                el.textContent = target;
                return;
            }
            el.textContent = Math.floor(start);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-number[data-target]');
                counters.forEach(el => {
                    animateCounter(el, parseInt(el.dataset.target), 1400);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

    const burger = document.getElementById('burger-menu');
    const nav = document.getElementById('main-nav');
    
    burger.addEventListener('click', function() {
        this.classList.toggle('open');
        nav.classList.toggle('open');
        // Empêcher le défilement du body quand le menu est ouvert
        document.body.classList.toggle('menu-open');
    });

    // Fermer le menu lors du clic sur un lien
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('open');
            nav.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
});

// Navigation fluide
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
           anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                   target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    }); 
                }
           });
       }); 

        // Gestion des modales
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
            document.body.style.overflow = 'auto';
        }

// ===== CAROUSEL =====
(function() {
    const track    = document.getElementById('carousel-track');
    const dotsWrap = document.getElementById('carousel-dots');
    const prevBtn  = document.getElementById('carousel-prev');
    const nextBtn  = document.getElementById('carousel-next');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    let current = 0;
    let timer;

    // Créer les points indicateurs
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', () => { clearInterval(timer); goTo(i); startAuto(); });
        dotsWrap.appendChild(dot);
    });

    function goTo(index) {
        slides[current].classList.remove('active');
        dotsWrap.children[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dotsWrap.children[current].classList.add('active');
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
    }

    prevBtn.addEventListener('click', () => { clearInterval(timer); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { clearInterval(timer); goTo(current + 1); startAuto(); });

    // Pause au survol
    const carousel = document.getElementById('main-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', startAuto);

    // Support tactile (swipe)
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { clearInterval(timer); goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
    });

    function startAuto() { timer = setInterval(() => goTo(current + 1), 4500); }

    startAuto();
})();

// ===== TRADUCTION i18n =====
let currentLang = localStorage.getItem('guyane_lang') || 'fr';

window.setLanguage = function(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('guyane_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = TRANSLATIONS[lang][key];
        if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const val = TRANSLATIONS[lang][key];
        if (val !== undefined) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = TRANSLATIONS[lang][key];
        if (val !== undefined) el.placeholder = val;
    });

    // Met à jour les chips et leurs questions
    document.querySelectorAll('.suggestion-chip[data-question-key]').forEach(btn => {
        const labelKey = btn.getAttribute('data-i18n');
        const qKey = btn.getAttribute('data-question-key');
        if (labelKey && TRANSLATIONS[lang][labelKey]) btn.textContent = TRANSLATIONS[lang][labelKey];
        btn.onclick = () => {
            const q = TRANSLATIONS[currentLang][qKey] || btn.textContent;
            handleSend(q);
        };
    });

    // Bouton actif
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
};

// ===== CHATBOT IA =====
(function() {

    const knowledgeEN = [
        { keys:['hello','hi','good morning','good evening','hey','greetings'],
          reply:"Hello! Welcome to Guyane Découverte 🌿 I'm your virtual guide to French Guiana. Ask me anything about destinations, history, wildlife, culture, flights, health, budget..." },
        { keys:['destination','visit','see','must-see','recommend','best','top','what to do','itinerary','places'],
          reply:"🗺️ Must-see destinations in Guiana:\n• 🚀 Kourou & Guiana Space Centre\n• 🏝️ Salvation Islands (penal colony & beaches)\n• 🦋 Amazon Park (France's largest national park)\n• 🏙️ Cayenne (market, Fort Cépérou, gastronomy)\n• 🏛️ Saint-Laurent-du-Maroni (river & Bushinengue culture)\n• 🐢 Awala-Yalimapo (leatherback turtles)\n• 🐊 Kaw Marshes (caimans, birds)\n• 🌸 Cacao Village (Hmong, Sunday market)\n\nWhich destination would you like more info on?" },
        { keys:['kourou','space','rocket','ariane','csg','launch','esa','nasa'],
          reply:"🚀 Guiana Space Centre (CSG) in Kourou:\n• Europe's spaceport, operated by ESA, CNES & Arianespace\n• Strategic location: 5°N latitude, ideal for equatorial orbits\n• Rockets: Ariane 5, Ariane 6, Vega\n• Visit: Space Museum (free), guided tour of CSG (booking required)\n• Watch a live launch — unforgettable experience!\n\n📍 50 km from Cayenne (1h drive on RN1)" },
        { keys:['salvation','islands','devil','island','penal','royal','papillon','dreyfus'],
          reply:"🏝️ Salvation Islands:\nArchipelago of 3 islands: Île Royale, Île Saint-Joseph and Devil's Island\n• History: penal colony 1852–1953 — well-preserved ruins\n• Devil's Island: Alfred Dreyfus was imprisoned here (1895–1899)\n• Île Royale: ruins, hotel, free-roaming squirrel monkeys\n• Activities: snorkeling, birdwatching, history trails\n\n⛵ Boat from Kourou port: 45 min. Accommodation available." },
        { keys:['cayenne','capital','market','palmistes','fort','shopping'],
          reply:"🏙️ Cayenne, the Creole capital:\n• Place des Palmistes: heart of the city with royal palms\n• Cayenne Market: exotic fruits, spices, Amazonian fish — open every morning\n• Fort Cépérou: panoramic view over the bay\n• Saint-Sauveur Cathedral\n• Alexandre-Franconie Museum\n• Montjoly Beach (15 min) — leatherback turtle observation at night\n\nIdeal starting point for exploring Guiana." },
        { keys:['amazon','park','national','biodiversity','saül','maripasoula','trek','hike','jungle','forest'],
          reply:"🦋 Amazon Park of Guiana:\n• Created 2007 — France's largest national park (3.4 million ha)\n• Covers 34% of Guiana's territory — UNESCO World Heritage\n• 5,500+ plant species, 700+ bird species, 190+ mammals\n• Main entry points: Saül (hiking) and Maripasoula (river & culture)\n• Activities: hiking, river navigation, wildlife spotting, carbets\n\n⚠️ Guide required for the core zone. Access by plane (Air Guyane) or dugout canoe." },
        { keys:['turtle','leatherback','nesting','awala','yalimapo','montjoly','beach','egg'],
          reply:"🐢 Leatherback Sea Turtles:\n• Guiana hosts one of the world's largest populations\n• World's largest turtle: up to 2m and 900kg!\n• Main beach: Awala-Yalimapo (3h from Cayenne)\n• Also: Montjoly and Rémire-Montjoly beaches (near Cayenne)\n\n🗓️ Calendar:\n• Nesting: April to August (peak May–June)\n• Hatching: July to October\n🌙 Supervised night outings — booking required with Association Kwata\n⚠️ Strict rules: silence, no flash, keep distance" },
        { keys:['flight','plane','paris','get to','arrive','air france','airport','caribbean','brazil','travel'],
          reply:"✈️ Getting to Guiana:\n• Airport: Félix Eboué (Matoury, 15 min from Cayenne)\n• From Paris-Orly: direct flight 8h30 — Air France & Air Caraïbes (2-3/day)\n• From Martinique: ~1h flight, up to 2/day\n• From Guadeloupe: via Fort-de-France, 2/day\n• From Brazil: Belém & Fortaleza — 1 flight/week (Air France)\n\n✅ No visa required — ID card or passport" },
        { keys:['visa','passport','document','entry','customs','border'],
          reply:"📋 Documents for Guiana:\n• French & EU citizens: national ID card is sufficient\n• Guiana is a French department — no visa required from EU\n• To enter Suriname (Saint-Laurent): valid passport required\n• To enter Brazil (Saint-Georges): valid passport required\n• Amazon Park restricted zones: special permit from prefecture required" },
        { keys:['health','vaccine','vaccination','yellow fever','mosquito','malaria','dengue','hospital','medical'],
          reply:"🏥 Health in Guiana:\n💉 Vaccinations:\n• MANDATORY: yellow fever (valid for life since 2016)\n• Recommended: hepatitis A & B, typhoid, rabies (adventurers)\n• See your doctor 4–6 weeks before departure\n\n🦟 Mosquitoes:\n• ESSENTIAL protection: 50% DEET or icaridin repellent\n• Long sleeves and trousers in the evenings\n• Malaria risk in deep forest (prophylaxis recommended)\n• Dengue, chikungunya and Zika present\n\n📞 Emergency: SAMU 15 / Police 17 / Fire 18 / EU emergency 112" },
        { keys:['budget','money','cost','expensive','price','euro','currency','spend'],
          reply:"💰 Budget for Guiana:\n• Currency: Euro (€) — same as metropolitan France\n• Budget: from 50€/day (carbet + local food) to 150€+/day (comfort)\n• Average: 80–120€/day\n• Hotels: 60–120€/night (city) / 15–40€ (forest carbet)\n• Local restaurants: 10–20€ / mid-range: 20–40€\n• Car rental + petrol: more expensive than in mainland France" },
        { keys:['weather','season','when','dry','rain','climate','temperature'],
          reply:"🌡️ Climate of Guiana:\n• ☀️ Main dry season: August to mid-November (best time)\n• 🌦️ Short dry season: mid-February to mid-March\n• 🌧️ Long rainy season: mid-March to end July\n• 🌡️ Temperature: 25–32°C year-round, humidity 80–90%\n• 🐢 Leatherback turtles: April–August (nesting)\n• 🎭 Carnival: January–March (rainy season!)" },
        { keys:['people','indigenous','amerindian','bushinengue','maroon','hmong','culture','tribe','community'],
          reply:"🪶 Peoples of Guiana:\n• Amerindians: Kali'na, Lokono, Teko, Wayampi, Palikur — ancient communities preserving ancestral traditions\n• Bushinengues: Ndjuka, Aluku, Saramaka — descendants of escaped enslaved Africans with remarkable woodcarving and embroidery arts\n• Hmong: Vietnamese War refugees, settled in Cacao & Javouhey, famous for market gardening and embroidery\n• Creoles, metropolitan French, Haitians, Surinamese, Brazilians, Chinese...\n• Over 80 languages spoken — an extraordinary cultural kaleidoscope!" },
        { keys:['carnival','festival','touloulou','costume','music','kaseko','parade','mardi gras'],
          reply:"🎭 Guiana Carnival:\n• France's longest carnival — from December to Ash Wednesday (~2.5 months!)\n• Unique and unlike any other carnival in the world\n\n🌟 Key figures:\n• Touloulous: women in full costume & masks who choose their dance partners\n• Démoniaks: political satire groups dressed in black\n• Nèg'marron: men covered in molasses and leaves\n\n🥁 Music: kaseko, zouk, bèlè\n📅 Soirées Touloulous: Saturday evenings (ballrooms)\n📅 Vidé (street parades): Sunday afternoons — the Mardi Gras Vidé is the peak!" },
        { keys:['food','gastronomy','eat','restaurant','speciality','cuisine','dish','drink','rum'],
          reply:"🍽️ Guianese cuisine — a cultural fusion:\n• Bouillon d'awara: THE traditional Creole dish (palm fruit stew — prepared at Easter)\n• Féroce d'avocat: avocado, salted cod, cassava and hot pepper\n• Matété de crabe: crab and spice rice\n• Colombo: Antillean-style curry\n• Accras: salt cod fritters\n• Fresh tropical fruits: soursop, carambola, sapodilla\n• 🍹 White rum, ti-punch, planter's punch\n\n🛒 Cayenne market is the best place to try everything!" },
        { keys:['wildlife','animal','jaguar','monkey','tapir','caiman','anaconda','bird','eagle','toucan','parrot','piranha','dolphin'],
          reply:"🦁 Exceptional Wildlife of Guiana:\n🦅 Birds (700+ species):\n• Harpy Eagle (largest in the Americas)\n• Scarlet Macaw, Toco Toucan, Amazon Parrots\n• Scarlet Ibis (Kaw Marshes)\n\n🐾 Mammals:\n• Jaguar, puma, ocelot\n• Amazon Tapir, Giant Anteater\n• 8 monkey species (howler, spider, capuchin, squirrel...)\n• Giant River Otter (up to 2m!)\n• Guiana River Dolphin (coast)\n\n🐍 Reptiles: green anaconda, boa, black caiman\n🐟 Fish: arapaima/pirarucu (4m, 250kg!), piranha, stingray" },
        { keys:['thanks','great','perfect','excellent','amazing','wonderful','awesome'],
          reply:"You're welcome! 😊 French Guiana is truly one of the world's most extraordinary destinations. Don't hesitate if you have more questions — happy travels! 🌿🚀🐢" },
        { keys:['water','drink','tap','potable','safe drink','bottle water','purify','thirst','dehydration'],
          reply:"🚰 Drinking water in Guiana:\n• ✅ Tap water is safe in cities: Cayenne, Kourou, Saint-Laurent\n• Rural areas & forest: bottled water or purification required\n• Rivers: NEVER drink without filtering (parasites, mercury contamination)\n• Bring purification tablets or a Sawyer filter for trekking\n• Stay hydrated: tropical heat + 80-90% humidity — drink 2-3L/day minimum" },
        { keys:['credit card','bank card','atm','cash','payment','pay','cash machine','withdraw','money exchange'],
          reply:"💳 Payments & banking in Guiana:\n• Credit/debit cards accepted in most shops in Cayenne, Kourou, Saint-Laurent\n• Markets, carbets, remote villages: cash only!\n• ATMs available in Cayenne (many), Kourou, Saint-Laurent, Saint-Georges\n• French banks: BNP Paribas, Crédit Agricole, Caisse d'Épargne\n⚠️ Deep jungle & isolated villages: NO ATM, no card payment\n💡 Withdraw enough euros before leaving the cities — you'll need it!" },
        { keys:['time zone','time difference','local time','gmt','utc','sunset','sunrise','clock','jet lag'],
          reply:"🕐 Time zone of Guiana:\n• UTC/GMT -3 (French Guiana Time — GFT)\nDifference from Paris:\n• Winter (Oct-Mar): -4h | Summer (Mar-Oct): -5h\n☀️ Equatorial rhythm:\n• Sunrise: ~6am all year | Sunset: ~6pm all year\n• No daylight saving time — clocks never change!" },
        { keys:['beach','swim','swimming','ocean','sea','atlantic','surf','wave','snorkel','diving'],
          reply:"🏖️ Beaches & swimming in Guiana:\n• Montjoly beach (Rémire, 15 min from Cayenne): most popular\n• ⚠️ Water is often brown on the mainland (Amazon sediments) — not Caribbean turquoise!\n• Strong currents — sometimes dangerous for swimming\n🏝️ For crystal-clear water & snorkeling: the Salvation Islands (45 min by boat from Kourou) — absolute paradise!\n🌙 Montjoly beach: leatherback turtle night watching (Apr-Aug)" },
        { keys:['snake','spider','insect','dangerous','venom','bite','sting','jungle danger','dangerous animal','safety jungle'],
          reply:"⚠️ Dangerous wildlife in Guiana:\n🐍 Snakes:\n• Fer-de-Lance (Bothrops atrox): most dangerous — wear high boots in forest!\n• Anaconda: impressive but usually flees\n• Bushmaster (Lachesis): rare, extremely venomous\n🕷️ Spiders: Goliath tarantula looks scary but rarely harmful\n🐜 Insects:\n• Bullet ant (Paraponera): 24h of intense pain after sting!\n→ Check your shoes every morning in the forest\n📞 Snakebite: call SAMU 15 immediately, stay calm, immobilize the limb" },
        { keys:['history','colonial','slavery','abolition','explorer','france history','guiana history','past'],
          reply:"📜 History of French Guiana:\n• 1604: First French settlement (France Équinoxiale)\n• 1637: Foundation of Cayenne\n• 1652–1848: African slave labour on plantations\n• 1794: First abolition of slavery\n• 1802: Slavery restored by Napoleon\n• 1848: Final abolition (Victor Schoelcher)\n• 1763: Kourou Disaster — 14,000 colonists died of disease\n• 1852–1953: Penal colony — 70,000+ convicts transported\n• 1895–1899: Dreyfus Affair (Devil's Island)\n• 1946: Guiana becomes a French département\n• 1968: Guiana Space Centre opens in Kourou" },
        { keys:['zoo','animal park','botanical garden','macouria','wildlife park','captive animals'],
          reply:"🦁 Zoo & nature parks in Guiana:\n• Zoo de Guyane (Macouria, 30 min from Cayenne):\n  - Only zoo in Guiana — Amazon species in natural setting\n  - Jaguar, tapir, caiman, anaconda, monkeys, sloths, turtles\n  - Open Tue-Sun — great for families!\n• Botanical Garden of Cayenne: Tropical flora, medicinal plants\n• Association Kwata: wildlife research & turtle protection (Cayenne)\n\n💡 The zoo is often the best place to see species hard to spot in the wild — even locals love it!" },
        { keys:['guide','tour agency','organise','book tour','operator','guiding','accompaniment','tour guide'],
          reply:"🧭 Guides & tour agencies in Guiana:\n📞 Official resources:\n• Comité du Tourisme de Guyane: tourisme-guyane.com\n• Cayenne Tourist Office\n🏢 Recommended agencies:\n• JAL Voyages (Cayenne) — generalist\n• Takari Tour — forest & river specialist\n• Guyane Discovery — eco-tourism\n• Sêbêkô — rivers, cultures, indigenous communities\n⚠️ MANDATORY guide for:\n• Amazon Park core zone\n• Amerindian villages\n• Night turtle outings (Awala)\n💡 Book 4-6 weeks in advance for forest trips — spaces are limited!" },
        { keys:['hotel','apart hotel','apartment','residence','accommodation','lodging','sleep','stay','hostel','night'],
          reply:"🏨 Accommodation in Guiana:\n\n🏙️ Cayenne:\n• ★★★★ Novotel Cayenne (Rémire-Montjoly) — pool, beach, restaurant ~120-180€/night\n• ★★★★ Hôtel Le Mahury — near airport, modern ~100-150€/night\n• ★★★ Hôtel Amazonia — city center, good value ~70-100€/night\n• Hôtel Mercure Cayenne ~110-160€/night\n\n🏢 Apart-hotels:\n• Eden Suite Hôtel (Rémire) — equipped apartments, pool ~80-130€/night\n• Résidence Caraïbes (Cayenne) — studios ~60-90€/night\n• Also on Airbnb / Booking.com\n\n🚀 Kourou:\n• Hôtel des Roches (sea view) ~80-120€/night\n• Hôtel Mercure Ariatel ~90-130€/night\n\n🌿 Forest & rivers:\n• Traditional carbet with hammock: 15-30€/night\n• Eco-lodge: 80-150€/night\n• Saül village: gîtes & carbets\n\n🏝️ Salvation Islands:\n• Auberge des Îles du Salut — BOOK WELL IN ADVANCE!\n\n📅 Always book ahead — accommodation is scarce outside Cayenne!" },
        { keys:['tourist site','attraction','tourist spot','what to see','monument','visit','sightseeing','top places'],
          reply:"🗺️ Top tourist attractions in Guiana:\n\n🚀 Must-see:\n1. Guiana Space Centre (Kourou) — free museum + guided tours\n2. Salvation Islands — historic penal colony + snorkeling\n3. Kaw Marshes — caimans, night boat trip\n4. Amazon Park (Saül) — forest hikes\n5. Awala-Yalimapo — leatherback turtles (Apr-Aug)\n6. Cayenne market — daily, exotic & vibrant\n7. Fort Cépérou (Cayenne) — panoramic view\n8. Cacao Village — Hmong Sunday market\n9. Petit-Saut dam — 365km² lake, wildlife\n10. Saint-Laurent — Camp de la Transportation historic site\n11. Oyapock Bridge — Franco-Brazilian border\n12. Iracoubo church — extraordinary frescoes (free)\n\n💡 Minimum 10 days to see the highlights." },
        { keys:['family','children','child','baby','kids','toddler','travel family','with children'],
          reply:"👨‍👩‍👧 Family travel in Guiana:\n✅ Great for families:\n• Zoo de Guyane (Macouria) — kids love it!\n• Cacao Village — colorful market, accessible nature\n• Turtle observation (ages 8+, evening guided)\n• Kaw Marshes boat trip (ages 6+)\n• Montjoly beach\n• Space Museum in Kourou (free!)\n⚠️ Important precautions:\n• Mosquito repellent: choose age-appropriate product (no DEET for < 2 years)\n• Yellow fever vaccine: possible from 9 months (consult pediatrician)\n• SPF 50+ sunscreen — tropical sun is intense\n• Deep forest: not recommended for children under 6" },
    ];

    const knowledgeES = [
        { keys:['hola','buenos días','buenas tardes','buenas noches','saludos'],
          reply:"¡Hola! Bienvenido a Guyane Découverte 🌿 Soy tu guía virtual de la Guayana Francesa. Pregúntame sobre destinos, historia, fauna, cultura, vuelos, salud o presupuesto..." },
        { keys:['destino','visitar','ver','imprescindible','recomienda','mejor','qué hacer','itinerario'],
          reply:"🗺️ Destinos imprescindibles de la Guayana:\n• 🚀 Kourou y el Centro Espacial\n• 🏝️ Islas de la Salvación\n• 🦋 Parque Amazónico (mayor parque nacional de Francia)\n• 🏙️ Cayena (mercado, gastronomía)\n• 🏛️ Saint-Laurent-du-Maroni (cultura bushinengue)\n• 🐢 Awala-Yalimapo (tortugas laúd)\n• 🐊 Pantanos de Kaw (caimanes)\n• 🌸 Villa de Cacao (mercado Hmong)\n\n¿Sobre qué destino quieres más información?" },
        { keys:['kourou','espacio','cohete','ariane','csg','lanzamiento','esa'],
          reply:"🚀 Centro Espacial de la Guayana (CSG) en Kourou:\n• Puerto espacial de Europa, gestionado por la ESA\n• Cohetes: Ariane 5, Ariane 6, Vega — más de 300 lanzamientos exitosos\n• Visita el Museo del Espacio (gratis) y la visita guiada (reserva obligatoria)\n• ¡Asistir a un lanzamiento es una experiencia única!\n\n📍 50 km de Cayena (1h en coche)" },
        { keys:['isla','salvación','diablo','presidio','bagne','dreyfus','papillon'],
          reply:"🏝️ Islas de la Salvación:\nArchipiélago de 3 islas: Île Royale, Île Saint-Joseph e Isla del Diablo\n• Historia: presidio 1852-1953 — ruinas bien conservadas\n• Isla del Diablo: Alfred Dreyfus estuvo preso aquí\n• Monos ardilla libres en Île Royale\n• Snorkel, playas de arena blanca, aves tropicales\n\n⛵ Barco desde Kourou: 45 min" },
        { keys:['cayena','capital','mercado','palmistas','fuerte','gastronomía'],
          reply:"🏙️ Cayena, la capital criolla:\n• Place des Palmistes: corazón de la ciudad\n• Mercado de Cayena: frutas exóticas, especias, pescado amazónico\n• Fuerte Cépérou: vista panorámica\n• Catedral Saint-Sauveur\n• Playa de Montjoly (15 min)\n\nPunto de partida ideal para explorar la Guayana." },
        { keys:['parque','amazónico','biodiversidad','saül','maripasoula','senderismo','selva','foresta'],
          reply:"🦋 Parque Amazónico de la Guayana:\n• El mayor parque nacional de Francia (3,4 millones de ha)\n• Patrimonio Mundial UNESCO\n• +5 500 especies vegetales, +700 aves, +190 mamíferos\n• Entradas principales: Saül (senderismo) y Maripasoula (río y cultura)\n\n⚠️ Guía obligatorio en la zona núcleo. Acceso en avión o piragua." },
        { keys:['tortuga','laúd','puesta','awala','yalimapo','montjoly','playa','huevo'],
          reply:"🐢 Tortugas Laúd de la Guayana:\n• La Guayana acoge una de las mayores poblaciones mundiales\n• Hasta 2 m y 900 kg — la tortuga más grande del mundo\n• Playa principal: Awala-Yalimapo (3h de Cayena)\n\n🗓️ Temporada: puesta de abril a agosto, eclosiones de julio a octubre\n🌙 Salidas nocturnas encadrées — reserva obligatoria\n⚠️ Silencio, sin flash, distancia mínima" },
        { keys:['vuelo','avión','llegar','aeropuerto','air france','brasil','caribe','transporte'],
          reply:"✈️ Cómo llegar a la Guayana:\n• Desde París: vuelo directo 8h30 (Air France, Air Caraïbes)\n• Desde Martinica: hasta 2 vuelos/día\n• Desde Guadalupe: vía Fort-de-France\n• Desde Brasil: Belém y Fortaleza (1 vuelo/semana)\n\n✅ Sin visado — la Guayana es un departamento francés" },
        { keys:['salud','vacuna','fiebre amarilla','mosquito','paludismo','dengue','hospital'],
          reply:"🏥 Salud en la Guayana:\n• 💉 OBLIGATORIA: vacuna fiebre amarilla\n• Recomendadas: hepatitis A/B, fiebre tifoidea\n• 🦟 Protección antimosquitos ESENCIAL (DEET 50%)\n• Mangas largas por la noche\n• Riesgo de paludismo en zonas forestales\n\n📞 Urgencias: SAMU 15 / Policía 17 / Bomberos 18 / Emergencias EU 112" },
        { keys:['presupuesto','dinero','caro','precio','euro','moneda','gastar'],
          reply:"💰 Presupuesto para la Guayana:\n• Moneda: Euro (€)\n• Presupuesto medio: 80-120€/día/persona\n• Hotel: 60-120€/noche | Carbet: 15-40€\n• Restaurante local: 10-20€\n• El costo de vida es similar a Francia, pero más caro en transporte y alojamiento" },
        { keys:['tiempo','estación','lluvia','seca','cuándo','clima','temperatura'],
          reply:"🌡️ Clima de la Guayana:\n• ☀️ Mejor época: agosto a noviembre (estación seca)\n• 🌤️ Pequeña estación seca: mediados de febrero a mediados de marzo\n• 🌧️ Estación lluviosa: mediados de marzo a finales de julio\n• 🌡️ Temperatura estable: 25-32°C todo el año\n• 🐢 Tortugas laúd: abril a agosto" },
        { keys:['pueblo','indígena','amerindio','bushinengue','maroon','hmong','cultura','tribu'],
          reply:"🪶 Pueblos de la Guayana:\n• Amerindios: Kali'na, Lokono, Teko, Wayampi, Palikur\n• Bushinengues: Ndjuka, Aluku, Saramaka — arte en madera y bordados únicos\n• Hmong: refugiados de Laos, famosos por la horticultura y bordados\n• Más de 80 lenguas habladas — un mosaico cultural extraordinario!" },
        { keys:['carnaval','festival','toululú','toulourou','disfraz','música','kaseko','desfile'],
          reply:"🎭 Carnaval de la Guayana:\n• El carnaval más largo de Francia (diciembre hasta Miércoles de Ceniza)\n• Touloulous: mujeres completamente enmascaradas que eligen a sus parejas de baile\n• Démoniaks: grupos de sátira política en negro\n• Música: kaseko, zouk, bèlè\n• Soirées touloulous: sábados por la noche\n• Gran Desfile (Vidé): domingos por la tarde" },
        { keys:['animal','fauna','jaguar','mono','tapir','caiman','anaconda','ave','águila','tucán','piranha'],
          reply:"🦁 Fauna excepcional de la Guayana:\n🦅 Aves (700+ especies): Águila Arpía, Guacamayo Rojo, Tucán Toco, Ibis Escarlata\n🐾 Mamíferos: Jaguar, Tapir, Oso Hormiguero, 8 especies de monos, Nutria Gigante (2m!)\n🐍 Reptiles: Anaconda Verde, Caiman Negro\n🐟 Peces: Arapaima/Pirarucu (4m, 250kg!), Piraña" },
        { keys:['gracias','genial','perfecto','excelente','increíble','fantástico'],
          reply:"¡Con mucho gusto! 😊 La Guayana Francesa es un destino verdaderamente extraordinario. ¡No dudes en preguntar más! Buen viaje 🌿🚀🐢" },
        { keys:['agua','beber','grifo','potable','botella','purificar','hidratación','sed'],
          reply:"🚰 Agua en la Guayana:\n• ✅ Agua del grifo potable en ciudades: Cayena, Kourou, Saint-Laurent\n• Zonas rurales y selva: agua embotellada o purificación obligatoria\n• Ríos: NUNCA beber sin filtrar (parásitos, mercurio)\n• Lleva tabletas purificadoras o filtro Sawyer para el trekking\n• Hidratación esencial: bebe 2-3L/día mínimo" },
        { keys:['tarjeta','bancaria','pago','cajero','efectivo','atm','banco','billete','pagar'],
          reply:"💳 Pagos en la Guayana:\n• Tarjeta aceptada en Cayena, Kourou, Saint-Laurent\n• Mercados, carbets, zonas remotas: ¡solo efectivo!\n• Cajeros automáticos en las ciudades principales\n⚠️ En la selva y zonas aisladas: sin cajeros, solo efectivo\n💡 Retira suficiente efectivo antes de salir de las ciudades grandes" },
        { keys:['hora','zona horaria','diferencia horaria','gmt','amanecer','atardecer','reloj'],
          reply:"🕐 Zona horaria de la Guayana:\n• UTC/GMT -3 (Hora de la Guayana Francesa)\nDiferencia con España: -4h (invierno) / -5h (verano)\n☀️ Amanecer ~6h, puesta de sol ~18h todo el año — ¡sin cambio de hora!" },
        { keys:['playa','nadar','mar','océano','atlántico','surf','ola','snorkel'],
          reply:"🏖️ Playas en la Guayana:\n• Playa de Montjoly (15 min de Cayena): la más frecuentada\n• Agua marrón en el continente (sedimentos del Amazonas) — no es Caribe\n🏝️ Para agua turquesa y snorkel: ¡Las Islas de la Salvación! (barco desde Kourou, 45 min)\n🌙 Montjoly: observación de tortugas laúd de noche (abr-ago)" },
        { keys:['serpiente','araña','insecto','veneno','morder','peligroso','selva peligro','picadura','fauna peligrosa'],
          reply:"⚠️ Fauna peligrosa en la Guayana:\n🐍 Serpientes: Mapanare/Barba Amarilla (Bothrops atrox) — ¡la más peligrosa! Usa botas en la selva\n🕷️ Arañas: tarantela goliat impresionante pero poco peligrosa\n🐜 Hormigas bala: ¡24h de dolor intenso después de la picadura!\n→ Revisa los zapatos cada mañana\n📞 Mordedura de serpiente: SAMU 15, mantén la calma" },
        { keys:['historia','colonial','esclavitud','abolición','pasado','bagne','colonia'],
          reply:"📜 Historia de la Guayana:\n• 1637: Fundación de Cayena\n• 1848: Abolición definitiva de la esclavitud\n• 1852–1953: Presidio — más de 70.000 deportados\n• 1895–1899: Caso Dreyfus (Isla del Diablo)\n• 1946: Departamento francés de ultramar\n• 1968: Inauguración del Centro Espacial" },
        { keys:['hotel','apart hotel','apartamento','alojamiento','dormir','hospedaje','residencia','habitación'],
          reply:"🏨 Alojamiento en la Guayana:\n\n🏙️ Cayena:\n• ★★★★ Novotel Cayena (Rémire-Montjoly) — piscina, playa ~120-180€/noche\n• ★★★ Hôtel Amazonia — centro ciudad ~70-100€/noche\n• Hôtel Mercure Cayena ~110-160€/noche\n\n🏢 Apart-hoteles:\n• Eden Suite Hôtel — apartamentos equipados, piscina ~80-130€/noche\n• Residencias en Airbnb / Booking.com\n\n🚀 Kourou:\n• Hôtel des Roches (vista al mar) ~80-120€/noche\n\n🌿 Selva:\n• Carbet tradicional con hamaca: 15-30€/noche\n• Lodge eco-turístico: 80-150€/noche\n\n📅 ¡Reserva siempre con antelación!" },
        { keys:['lugar turístico','atracción','qué ver','monumento','visita','turismo','sitio','punto de interés'],
          reply:"🗺️ Principales lugares turísticos de la Guayana:\n\n1. 🚀 Centro Espacial de Kourou — museo gratuito\n2. 🏝️ Islas de la Salvación — historia + snorkel\n3. 🐊 Pantanos de Kaw — caimanes, paseo nocturno\n4. 🌿 Parque Amazónico (Saül) — senderismo\n5. 🐢 Awala-Yalimapo — tortugas laúd (abr-ago)\n6. 🏙️ Mercado de Cayena — cada mañana\n7. 🏛️ Camp de la Transportation (Saint-Laurent)\n8. 🌸 Village de Cacao — mercado Hmong dominical\n9. ⚡ Barrage de Petit-Saut — lago artificial\n10. 🌉 Pont de l'Oyapock — frontera franco-brasileña\n\n💡 Mínimo 10 días para ver lo esencial." },
    ];

    const knowledgePT = [
        { keys:['olá','bom dia','boa tarde','boa noite','oi','salve'],
          reply:"Olá! Bem-vindo ao Guyane Découverte 🌿 Sou seu guia virtual da Guiana Francesa. Pergunte-me sobre destinos, história, fauna, cultura, voos, saúde ou orçamento..." },
        { keys:['destino','visitar','ver','imperdível','recomenda','melhor','o que fazer','itinerário'],
          reply:"🗺️ Destinos imperdíveis da Guiana:\n• 🚀 Kourou e o Centro Espacial\n• 🏝️ Ilhas da Salvação\n• 🦋 Parque Amazônico (maior parque nacional da França)\n• 🏙️ Caiena (mercado, gastronomia)\n• 🏛️ Saint-Laurent-du-Maroni (cultura bushinengue)\n• 🐢 Awala-Yalimapo (tartarugas de couro)\n• 🐊 Pântanos de Kaw (caimans)\n• 🌸 Aldeia de Cacao (mercado Hmong)\n\nSobre qual destino quer mais informações?" },
        { keys:['kourou','espaço','foguete','ariane','csg','lançamento','esa'],
          reply:"🚀 Centro Espacial da Guiana (CSG) em Kourou:\n• Porto espacial da Europa, gerido pela ESA\n• Foguetes: Ariane 5, Ariane 6, Vega — mais de 300 lançamentos bem-sucedidos\n• Visite o Museu do Espaço (gratuito) e a visita guiada (reserva obrigatória)\n• Assistir a um lançamento é uma experiência única!\n\n📍 50 km de Caiena (1h de carro)" },
        { keys:['ilha','salvação','diabo','presídio','bagne','dreyfus'],
          reply:"🏝️ Ilhas da Salvação:\nArquipélago de 3 ilhas: Île Royale, Île Saint-Joseph e Ilha do Diabo\n• História: presídio 1852-1953 — ruínas bem conservadas\n• Ilha do Diabo: Alfred Dreyfus esteve preso aqui\n• Macacos-esquilo livres na Île Royale\n• Snorkeling, praias de areia branca, aves tropicais\n\n⛵ Barco de Kourou: 45 min" },
        { keys:['caiena','capital','mercado','palmeiras','forte','gastronomia'],
          reply:"🏙️ Caiena, a capital crioula:\n• Place des Palmistes: coração da cidade\n• Mercado de Caiena: frutas exóticas, temperos, peixe amazônico\n• Forte Cépérou: vista panorâmica\n• Catedral Saint-Sauveur\n• Praia de Montjoly (15 min)\n\nPonto de partida ideal para explorar a Guiana." },
        { keys:['parque','amazônico','biodiversidade','saül','maripasoula','trilha','selva','floresta'],
          reply:"🦋 Parque Amazônico da Guiana:\n• O maior parque nacional da França (3,4 milhões de ha)\n• Patrimônio Mundial UNESCO\n• +5 500 espécies vegetais, +700 aves, +190 mamíferos\n• Entradas principais: Saül (trilhas) e Maripasoula (rio e cultura)\n\n⚠️ Guia obrigatório na zona núcleo. Acesso de avião ou canoa." },
        { keys:['tartaruga','couro','desova','awala','yalimapo','montjoly','praia','ovo'],
          reply:"🐢 Tartarugas de Couro da Guiana:\n• A Guiana abriga uma das maiores populações mundiais\n• Até 2 m e 900 kg — a maior tartaruga do mundo\n• Praia principal: Awala-Yalimapo (3h de Caiena)\n\n🗓️ Temporada: desova de abril a agosto, eclosão de julho a outubro\n🌙 Saídas noturnas guiadas — reserva obrigatória\n⚠️ Silêncio, sem flash, distância mínima" },
        { keys:['voo','avião','chegar','aeroporto','air france','brasil','caribe','transporte'],
          reply:"✈️ Como chegar à Guiana:\n• De Paris: voo direto 8h30 (Air France, Air Caraïbes)\n• Da Martinica: até 2 voos/dia\n• Da Guadalupe: via Fort-de-France\n• Do Brasil: Belém e Fortaleza (1 voo/semana)\n\n✅ Sem visto — a Guiana é um departamento francês" },
        { keys:['saúde','vacina','febre amarela','mosquito','malária','dengue','hospital'],
          reply:"🏥 Saúde na Guiana:\n• 💉 OBRIGATÓRIA: vacina febre amarela\n• Recomendadas: hepatites A/B, febre tifoide\n• 🦟 Proteção contra mosquitos ESSENCIAL (DEET 50%)\n• Mangas compridas à noite\n• Risco de malária em zonas florestais\n\n📞 Emergências: SAMU 15 / Polícia 17 / Bombeiros 18" },
        { keys:['orçamento','dinheiro','caro','preço','euro','moeda','gastar'],
          reply:"💰 Orçamento para a Guiana:\n• Moeda: Euro (€)\n• Orçamento médio: 80-120€/dia/pessoa\n• Hotel: 60-120€/noite | Carbet: 15-40€\n• Restaurante local: 10-20€\n• Custo de vida similar à França, mas mais caro em transporte e acomodação" },
        { keys:['tempo','estação','chuva','seca','quando','clima','temperatura'],
          reply:"🌡️ Clima da Guiana:\n• ☀️ Melhor época: agosto a novembro (estação seca)\n• 🌤️ Pequena estação seca: meados de fevereiro a meados de março\n• 🌧️ Estação chuvosa: meados de março a final de julho\n• 🌡️ Temperatura estável: 25-32°C o ano todo\n• 🐢 Tartarugas de couro: abril a agosto" },
        { keys:['povo','indígena','ameríndio','bushinengue','maroon','hmong','cultura','tribo'],
          reply:"🪶 Povos da Guiana:\n• Ameríndios: Kali'na, Lokono, Teko, Wayampi, Palikur\n• Bushinengues: Ndjuka, Aluku, Saramaka — arte em madeira e bordados únicos\n• Hmong: refugiados do Laos, famosos pela horticultura e bordados\n• Mais de 80 línguas faladas — um mosaico cultural extraordinário!" },
        { keys:['carnaval','festival','toulourou','fantasia','música','kaseko','desfile'],
          reply:"🎭 Carnaval da Guiana:\n• O carnaval mais longo da França (dezembro até Quarta-feira de Cinzas)\n• Touloulous: mulheres com traje e máscara completos que escolhem seus parceiros de dança\n• Démoniaks: grupos de sátira política vestidos de preto\n• Música: kaseko, zouk, bèlè\n• Soirées touloulous: sábados à noite\n• Grande Vidé (desfiles de rua): domingos à tarde" },
        { keys:['animal','fauna','jaguar','macaco','tapir','caiman','anaconda','ave','águia','tucano','piranha'],
          reply:"🦁 Fauna excepcional da Guiana:\n🦅 Aves (700+ espécies): Harpia (maior das Américas), Arara-vermelha, Tucano-toco, Íbis-vermelha\n🐾 Mamíferos: Onça-pintada, Tapir, Tamanduá-bandeira, 8 espécies de macacos, Ariranha (2m!)\n🐍 Répteis: Sucuri, Caiman-negro\n🐟 Peixes: Pirarucu/Arapaima (4m, 250kg!), Piranha" },
        { keys:['obrigado','ótimo','perfeito','excelente','incrível','fantástico'],
          reply:"Com prazer! 😊 A Guiana Francesa é um destino verdadeiramente extraordinário. Não hesite em perguntar mais! Boa viagem 🌿🚀🐢" },
        { keys:['água','beber','torneira','potável','garrafa','purificar','sede','hidratação'],
          reply:"🚰 Água na Guiana:\n• ✅ Água da torneira potável nas cidades: Caiena, Kourou, Saint-Laurent\n• Zonas rurais e floresta: água engarrafada ou purificação obrigatória\n• Rios: NUNCA beba sem filtrar (parasitas, mercúrio)\n• Leve comprimidos de purificação ou filtro Sawyer para trilhas\n• Hidratação essencial: beba 2-3L/dia no mínimo" },
        { keys:['cartão','bancário','pagamento','caixa automático','dinheiro','atm','banco','notas','pagar'],
          reply:"💳 Pagamentos na Guiana:\n• Cartão aceito em Caiena, Kourou, Saint-Laurent\n• Mercados, carbets, zonas rurais: apenas dinheiro!\n• Caixas automáticos nas cidades principais\n⚠️ Na floresta e zonas isoladas: sem ATM, apenas dinheiro\n💡 Levante dinheiro suficiente antes de sair das cidades" },
        { keys:['hora','fuso horário','diferença','gmt','nascer sol','pôr sol','relógio'],
          reply:"🕐 Fuso horário da Guiana:\n• UTC/GMT -3 (Hora da Guiana Francesa)\nDiferença com Portugal: -3h (inverno) / -4h (verão)\nDiferença com Brasil (Brasília): sem diferença ou -1h dependendo da época\n☀️ Nascer ~6h, pôr do sol ~18h o ano todo — sem mudança de hora!" },
        { keys:['praia','nadar','mar','oceano','atlântico','surf','onda','snorkel','mergulho'],
          reply:"🏖️ Praias na Guiana:\n• Praia de Montjoly (15 min de Caiena): a mais frequentada\n• Água marrom no continente (sedimentos do Amazonas) — não é Caribe!\n🏝️ Para água transparente e snorkel: Ilhas da Salvação (barco de Kourou, 45 min)\n🌙 Montjoly: observação de tartarugas de couro à noite (abr-ago)" },
        { keys:['cobra','aranha','inseto','venenoso','picada','mordida','perigo selva','fauna perigosa'],
          reply:"⚠️ Fauna perigosa na Guiana:\n🐍 Cobras: Jararaca (Bothrops atrox) — a mais perigosa! Use botas na floresta\n🕷️ Aranhas: caranguejeira gigante impressionante mas pouco perigosa\n🐜 Formiga Bala: dor intensa por 24h após picada!\n→ Verifique os sapatos toda manhã\n📞 Mordida de cobra: ligue SAMU 15, mantenha a calma" },
        { keys:['hotel','apart hotel','apartamento','alojamento','dormir','hospedagem','residência','quarto'],
          reply:"🏨 Alojamento na Guiana:\n\n🏙️ Caiena:\n• ★★★★ Novotel Caiena (Rémire-Montjoly) — piscina, praia ~120-180€/noite\n• ★★★ Hôtel Amazonia — centro cidade ~70-100€/noite\n• Hôtel Mercure Caiena ~110-160€/noite\n\n🏢 Apart-hotéis:\n• Eden Suite Hôtel — apartamentos equipados, piscina ~80-130€/noite\n• Ofertas no Airbnb / Booking.com\n\n🚀 Kourou:\n• Hôtel des Roches (vista ao mar) ~80-120€/noite\n\n🌿 Floresta:\n• Carbet tradicional com rede: 15-30€/noite\n• Lodge eco-turístico: 80-150€/noite\n\n📅 Reserve sempre com antecedência!" },
        { keys:['lugar turístico','atração','o que ver','monumento','visita','turismo','ponto de interesse'],
          reply:"🗺️ Principais locais turísticos da Guiana:\n\n1. 🚀 Centro Espacial de Kourou — museu gratuito\n2. 🏝️ Ilhas da Salvação — história + snorkel\n3. 🐊 Pântanos de Kaw — caimans, passeio noturno\n4. 🌿 Parque Amazônico (Saül) — trilhas\n5. 🐢 Awala-Yalimapo — tartarugas (abr-ago)\n6. 🏙️ Mercado de Caiena — toda manhã\n7. 🏛️ Camp de la Transportation (Saint-Laurent)\n8. 🌸 Aldeia de Cacao — mercado Hmong dominical\n9. ⚡ Barrage de Petit-Saut — lago artificial\n10. 🌉 Pont de l'Oyapock — fronteira franco-brasileira\n\n💡 Mínimo 10 dias para ver o essencial." },
    ];

    const knowledgeNL = [
        { keys:['hallo','goedemorgen','goedemiddag','goedenavond','hey','hoi','dag'],
          reply:"Hallo! Welkom bij Guyane Découverte 🌿 Ik ben uw virtuele gids voor Frans-Guyana. Vraag mij alles over bestemmingen, geschiedenis, fauna, cultuur, vluchten, gezondheid of budget..." },
        { keys:['bestemming','bezoeken','zien','onmisbaar','aanbevelen','beste','wat doen','programma'],
          reply:"🗺️ Onmisbare bestemmingen in Guyana:\n• 🚀 Kourou & Guiana Ruimtecentrum\n• 🏝️ Eilanden van de Verlossing\n• 🦋 Amazoneparken (grootste nationaal park van Frankrijk)\n• 🏙️ Cayenne (markt, gastronomie)\n• 🏛️ Saint-Laurent-du-Maroni (bushinengue-cultuur)\n• 🐢 Awala-Yalimapo (lederschildpadden)\n• 🐊 Kaw Moerassen (kaaiman, vogels)\n• 🌸 Dorp Cacao (Hmong-markt)\n\nOver welke bestemming wilt u meer info?" },
        { keys:['kourou','ruimte','raket','ariane','csg','lancering','esa'],
          reply:"🚀 Guiana Ruimtecentrum (CSG) in Kourou:\n• Europese ruimtehaven, beheerd door ESA\n• Raketten: Ariane 5, Ariane 6, Vega — meer dan 300 succesvolle lanceringen\n• Bezoek het Ruimtemuseum (gratis) en de rondleiding (reservering verplicht)\n• Een lancering bijwonen is een unieke ervaring!\n\n📍 50 km van Cayenne (1 uur rijden)" },
        { keys:['eiland','verlossing','duivel','strafkolonie','bagne','dreyfus'],
          reply:"🏝️ Eilanden van de Verlossing:\nArchipel van 3 eilanden: Île Royale, Île Saint-Joseph en het Duivelseiland\n• Geschiedenis: strafkolonie 1852-1953 — goed bewaard gebleven ruïnes\n• Duivelseiland: Alfred Dreyfus werd hier gevangengezet\n• Vrije eekhoornaapjes op Île Royale\n• Snorkelen, witte zandstranden, tropische vogels\n\n⛵ Boot vanuit Kourou: 45 min" },
        { keys:['cayenne','hoofdstad','markt','palmistas','fort','gastronomie'],
          reply:"🏙️ Cayenne, de Creoolse hoofdstad:\n• Place des Palmistes: hart van de stad\n• Markt van Cayenne: exotisch fruit, kruiden, Amazonevis\n• Fort Cépérou: panoramisch uitzicht\n• Saint-Sauveur Kathedraal\n• Montjoly Strand (15 min)\n\nIdeaal vertrekpunt voor het verkennen van Guyana." },
        { keys:['park','amazone','biodiversiteit','saül','maripasoula','wandelen','jungle','woud'],
          reply:"🦋 Amazoneparken van Guyana:\n• Grootste nationaal park van Frankrijk (3,4 miljoen ha)\n• UNESCO Werelderfgoed\n• +5 500 plantensoorten, +700 vogels, +190 zoogdieren\n• Toegangspunten: Saül (wandelen) en Maripasoula (rivier en cultuur)\n\n⚠️ Gids verplicht in de kernzone. Bereikbaar per vliegtuig of kano." },
        { keys:['schildpad','leder','eileg','awala','yalimapo','montjoly','strand','ei'],
          reply:"🐢 Lederschildpadden van Guyana:\n• Guyana herbergt een van de grootste populaties ter wereld\n• Tot 2 m en 900 kg — de grootste schildpad ter wereld\n• Hoofdstrand: Awala-Yalimapo (3u van Cayenne)\n\n🗓️ Seizoen: eileg april-augustus, uitkomen juli-oktober\n🌙 Begeleide nachtelijke uitstapjes — reservering verplicht\n⚠️ Stilte, geen flits, minimumafstand" },
        { keys:['vlucht','vliegtuig','bereiken','luchthaven','air france','brazilië','caribisch','vervoer'],
          reply:"✈️ Reizen naar Guyana:\n• Vanuit Parijs: directe vlucht 8u30 (Air France, Air Caraïbes)\n• Vanuit Martinique: tot 2 vluchten/dag\n• Vanuit Guadeloupe: via Fort-de-France\n• Vanuit Brazilië: Belém en Fortaleza (1 vlucht/week)\n\n✅ Geen visum nodig — Guyana is een Frans departement" },
        { keys:['gezondheid','vaccin','gele koorts','mug','malaria','dengue','ziekenhuis'],
          reply:"🏥 Gezondheid in Guyana:\n• 💉 VERPLICHT: vaccin gele koorts\n• Aanbevolen: hepatitis A/B, tyfus\n• 🦟 Muggenbescherming ESSENTIEEL (50% DEET)\n• Lange mouwen 's avonds\n• Malaria-risico in diepe bosgebieden\n\n📞 Noodgevallen: SAMU 15 / Politie 17 / Brandweer 18" },
        { keys:['budget','geld','duur','prijs','euro','valuta','uitgeven'],
          reply:"💰 Budget voor Guyana:\n• Valuta: Euro (€)\n• Gemiddeld budget: 80-120€/dag/persoon\n• Hotel: 60-120€/nacht | Carbet: 15-40€\n• Lokaal restaurant: 10-20€\n• Kosten vergelijkbaar met Frans moederland, vervoer en accommodatie duurder" },
        { keys:['weer','seizoen','regen','droog','wanneer','klimaat','temperatuur'],
          reply:"🌡️ Klimaat van Guyana:\n• ☀️ Beste periode: augustus tot november (droog seizoen)\n• 🌤️ Klein droog seizoen: half februari tot half maart\n• 🌧️ Regenseizoen: half maart tot eind juli\n• 🌡️ Stabiele temperatuur: 25-32°C het hele jaar\n• 🐢 Lederschildpadden: april-augustus" },
        { keys:['volk','inheems','amerindiaans','bushinengue','marron','hmong','cultuur','stam'],
          reply:"🪶 Volkeren van Guyana:\n• Amerindianen: Kali'na, Lokono, Teko, Wayampi, Palikur\n• Bushinengues: Ndjuka, Aluku, Saramaka — unieke houtsnijkunst en borduurwerk\n• Hmong: vluchtelingen uit Laos, beroemd om tuinbouw en borduurwerk\n• Meer dan 80 talen — een buitengewone culturele mozaïek!" },
        { keys:['carnaval','festival','touloulou','kostuum','muziek','kaseko','optocht'],
          reply:"🎭 Carnaval van Guyana:\n• Langste carnaval van Frankrijk (december tot Aswoensdag)\n• Touloulous: volledig gemaskerde vrouwen die zelf hun danspartner kiezen\n• Démoniaks: politieke satiriegroepen in het zwart\n• Muziek: kaseko, zouk, bèlè\n• Soirées touloulous: zaterdagavonden\n• Vidé (straatoptochten): zondagmiddagen" },
        { keys:['dier','fauna','jaguar','aap','tapir','kaaiman','anaconda','vogel','arend','toekan','piranha'],
          reply:"🦁 Uitzonderlijke fauna van Guyana:\n🦅 Vogels (700+ soorten): Harpij-arend, Scharlaken Ara, Toco Toekan, Scharlaken Ibis\n🐾 Zoogdieren: Jaguar, Tapir, Reuzenmiereneter, 8 apensoorten, Reuzenotter (2m!)\n🐍 Reptielen: Groene Anaconda, Zwarte Kaaiman\n🐟 Vissen: Arapaima/Pirarucu (4m, 250kg!), Piranha" },
        { keys:['dank','geweldig','perfect','uitstekend','fantastisch','wauw'],
          reply:"Graag gedaan! 😊 Frans-Guyana is een werkelijk buitengewone bestemming. Aarzel niet om meer vragen te stellen — goede reis! 🌿🚀🐢" },
        { keys:['water','drinken','kraan','drinkbaar','fles','zuiveren','hydratatie','dorst'],
          reply:"🚰 Water in Frans-Guyana:\n• ✅ Kraanwater drinkbaar in steden: Cayenne, Kourou, Saint-Laurent\n• Landelijke gebieden en woud: flessenwater of zuivering verplicht\n• Rivieren: NOOIT drinken zonder filtratie (parasieten, kwik)\n• Meenemen: purificatietabletten of Sawyer filter voor trekking\n• Drink minimaal 2-3L/dag — tropische warmte droogt snel uit" },
        { keys:['creditcard','betaling','geldautomaat','contant','atm','bank','geld','cash','betalen'],
          reply:"💳 Betalingen in Frans-Guyana:\n• Creditcard geaccepteerd in Cayenne, Kourou, Saint-Laurent\n• Markten, carbets, afgelegen gebieden: alleen contant!\n• Geldautomaten in de hoofdsteden\n⚠️ In het oerwoud: geen automaten, alleen contant\n💡 Neem genoeg contant geld mee voor landelijke gebieden" },
        { keys:['tijdzone','tijdverschil','lokale tijd','gmt','zonsondergang','zonsopgang','klok'],
          reply:"🕐 Tijdzone van Frans-Guyana:\n• UTC/GMT -3 (Frans-Guyana Tijd)\nVerschil met Nederland: -4u (winter) / -5u (zomer)\n☀️ Zonsopgang ~6u, zonsondergang ~18u het hele jaar — geen zomertijd!" },
        { keys:['strand','zwemmen','zee','oceaan','atlantisch','surfen','golf','snorkelen'],
          reply:"🏖️ Stranden in Frans-Guyana:\n• Montjoly strand (15 min van Cayenne): populairste strand\n• Water is bruin op het vasteland (Amazone-sedimenten) — niet Caribisch!\n🏝️ Voor helder water en snorkelen: de Eilanden van de Verlossing (boot vanuit Kourou, 45 min)\n🌙 Montjoly: lederschildpadden kijken 's nachts (apr-aug)" },
        { keys:['slang','spin','insect','giftig','beten','gevaar','jungle gevaar','steek','bijtende'],
          reply:"⚠️ Gevaarlijke fauna in Frans-Guyana:\n🐍 Slangen: Fer-de-Lance (Bothrops atrox) — meest gevaarlijk! Draag laarzen in het bos\n🕷️ Spinnen: Goliath vogelspinspin is enorm maar nauwelijks gevaarlijk\n🐜 Kogelmier: 24u intense pijn na steek!\n→ Controleer uw schoenen elke ochtend in het bos\n📞 Bij slangenbeet: SAMU 15, blijf kalm" },
    ];

    const knowledgeDE = [
        { keys:['hallo','guten morgen','guten abend','hey','hi','moin','servus','grüß'],
          reply:"Hallo! Willkommen bei Guyane Découverte 🌿 Ich bin Ihr virtueller Reiseführer für Französisch-Guayana. Fragen Sie mich alles: Reiseziele, Geschichte, Tierwelt, Kultur, Flüge, Budget..." },
        { keys:['reiseziel','besuchen','sehen','sehenswürdigkeiten','empfehlen','highlights','was tun','orte','wohin'],
          reply:"🗺️ Unvergessliche Reiseziele in Guayana:\n• 🚀 Kourou & Guianisches Raumfahrtzentrum\n• 🏝️ Inseln des Heils (Strafgefangenenlager & Strände)\n• 🦋 Amazonaspark (Frankreichs größter Nationalpark)\n• 🏙️ Cayenne (Markt, Fort Cépérou, Gastronomie)\n• 🏛️ Saint-Laurent-du-Maroni (Fluss & Bushinengue-Kultur)\n• 🐢 Awala-Yalimapo (Lederschildkröten)\n\nÜber welches Ziel möchten Sie mehr erfahren?" },
        { keys:['kourou','weltraum','rakete','ariane','raumfahrt','start','esa','csg'],
          reply:"🚀 Guianisches Raumfahrtzentrum (CSG) in Kourou:\n• Weltraumbahnhof Europas — ESA, CNES & Arianespace\n• Raketen: Ariane 5, Ariane 6, Vega\n• Besuch: Weltraummuseum (kostenlos), Führung (Reservierung erforderlich)\n• Einen Live-Start beobachten — unvergessliches Erlebnis!\n📍 50 km von Cayenne (1 Std. Fahrt)" },
        { keys:['inseln','teufelsinsel','strafgefangene','dreyfus','bagne','heilsinseln','royal'],
          reply:"🏝️ Inseln des Heils:\n3 Inseln: Île Royale, Île Saint-Joseph, Teufelsinsel\n• Strafgefangenenlager 1852–1953\n• Teufelsinsel: Alfred Dreyfus inhaftiert (1895–1899)\n• Aktivitäten: Schnorcheln, Vogelbeobachtung, Geschichte\n⛵ Boot von Kourou: 45 Min." },
        { keys:['cayenne','hauptstadt','markt','palmistes','fort','einkaufen'],
          reply:"🏙️ Cayenne, die kreolische Hauptstadt:\n• Place des Palmistes mit Königspalmen\n• Markt: exotische Früchte, Gewürze, täglich geöffnet\n• Fort Cépérou: Panoramablick über die Bucht\n• Strand Montjoly (15 Min.) — Schildkröten nachts beobachten" },
        { keys:['park','nationalpark','biodiversität','jungle','wald','wandern','saül','amazonas'],
          reply:"🦋 Amazonaspark von Guayana:\n• Frankreichs größter Nationalpark (3,4 Mio. ha)\n• 34% des Territoriums — UNESCO-Welterbe\n• 5.500+ Pflanzenarten, 700+ Vogelarten\n• Haupteingänge: Saül (Wandern), Maripasoula (Fluss & Kultur)\n⚠️ Führer für Kernzone erforderlich." },
        { keys:['schildkröte','lederschildkröte','awala','yalimapo','ei','strände'],
          reply:"🐢 Lederschildkröten:\n• Weltgrößte Population — bis 2m und 900kg!\n• Hauptstrand: Awala-Yalimapo (3 Std. von Cayenne)\n🗓️ Eiablage: April–August | Schlupf: Juli–Oktober\n🌙 Geführte Nachtausflüge — Buchung erforderlich" },
        { keys:['flug','flugzeug','paris','anreise','air france','flughafen'],
          reply:"✈️ Anreise nach Guayana:\n• Von Paris: Direktflug ~8h30 (Air France, Air Caraïbes)\n• Kein Visum erforderlich (Überseedepartement)\n• Von Martinique/Guadeloupe: tägliche Air-France-Flüge\n• Von Brasilien: wöchentliche Verbindungen" },
        { keys:['budget','kosten','preis','geld','teuer','euro'],
          reply:"💰 Budget für Guayana:\n• Durchschnitt: 80–120€/Tag/Person\n• Günstig: Carbets, lokale Märkte (30–60€/Tag)\n• Hauptausgaben: Transport im Landesinneren, Unterkunft\n💡 Tipp: Im Voraus buchen!" },
        { keys:['gesundheit','impfung','gelbfieber','malaria','mücken'],
          reply:"🏥 Gesundheit:\n• 🔴 Pflichtimpfung: Gelbfieber\n• 🟡 Empfohlen: Hepatitis A/B, Typhus\n• Malaria-Risiko im Landesinneren — Prophylaxe empfohlen\n• Mückenschutz unerlässlich!" },
        { keys:['geschichte','kolonie','bagne','deportation','sklaverei','kreol'],
          reply:"📜 Geschichte Guayanas:\n• 1667: Offiziell Teil Frankreichs\n• 1848: Abschaffung der Sklaverei\n• 1852–1953: Strafgefangenenlager (70.000+ Deportierte)\n• 1946: Überseedepartement\n• 1968: Eröffnung des Raumfahrtzentrums" },
        { keys:['tier','fauna','jaguar','affe','tapir','kaiman','anaconda','vogel','tukan'],
          reply:"🦁 Fauna Guayanas:\n🦅 700+ Vogelarten: Harpyienadler, Scharlachara, Tukan\n🐾 Jaguar, Tapir, Riesenotter (2m!)\n🐍 Grüne Anaconda, Schwarzer Kaiman\n🐟 Arapaima (4m, 250kg!)" },
        { keys:['karneval','touloulous','kaseko','musik','parade','festival'],
          reply:"🎭 Karneval von Guayana:\n• Längster Karneval Frankreichs (Dezember bis Aschermittwoch)\n• Touloulous: maskierte Frauen wählen ihren Tanzpartner\n• Musik: Kaseko, Zouk, Bèlè\n• Straßenumzüge und Soirées jedes Wochenende" },
        { keys:['volk','amérindien','kreol','bushinengue','hmong','kultur','tradition'],
          reply:"🪶 Völker Guayanas:\n• Amérindianer (7 Ethnien): Wayampi, Teko, Kali'na...\n• Bushinengue (6 Ethnien): Ndjuka, Saramaka... — befreite Sklaven-Nachkommen\n• Kreolen: Mehrheitsgruppe\n• Hmong-Laoten: seit 1977 in Cacao" },
        { keys:['danke','super','perfekt','toll','wunderbar'],
          reply:"Gern geschehen! 😊 Französisch-Guayana ist eine wirklich außergewöhnliche Destination. Zögern Sie nicht, weitere Fragen zu stellen — gute Reise! 🌿🚀🐢" },
        { keys:['wasser','trinken','leitungswasser','trinkwasser','flasche','reinigen','durst'],
          reply:"🚰 Trinkwasser in Guayana:\n• ✅ Leitungswasser trinkbar in Städten: Cayenne, Kourou, Saint-Laurent\n• Ländliche Gebiete und Wald: Flaschenwasser oder Aufbereitung erforderlich\n• Flüsse: NIEMALS ohne Filterung trinken (Parasiten, Quecksilber)\n• Empfehlung: Reinigungstabletten oder Sawyer-Filter für Trekking\n• Mindestens 2-3L/Tag trinken — tropische Hitze + Feuchtigkeit" },
        { keys:['kreditkarte','bezahlen','geldautomat','bargeld','atm','bank','ec karte','zahlen'],
          reply:"💳 Zahlungsmittel in Guayana:\n• Kreditkarte in Cayenne, Kourou, Saint-Laurent akzeptiert\n• Märkte, Carbets, abgelegene Gebiete: nur Bargeld!\n• Geldautomaten in den Hauptstädten\n⚠️ Im Dschungel: kein Automat, nur Bargeld\n💡 Genügend Bargeld vor dem Verlassen der Städte abheben" },
        { keys:['zeitzone','zeitunterschied','ortszeit','gmt','sonnenuntergang','sonnenaufgang','uhr'],
          reply:"🕐 Zeitzone Guayanas:\n• UTC/GMT -3 (Französisch-Guayana Zeit — GFT)\nZeitunterschied zu Deutschland: -4h (Winter) / -5h (Sommer)\n☀️ Sonnenaufgang ~6 Uhr, Sonnenuntergang ~18 Uhr das ganze Jahr — keine Zeitumstellung!" },
        { keys:['strand','schwimmen','meer','ozean','atlantik','surfen','welle','schnorcheln','tauchen'],
          reply:"🏖️ Strände in Guayana:\n• Montjoly-Strand (15 Min. von Cayenne): beliebtester Strand\n• Wasser auf dem Festland oft braun (Amazonas-Sedimente) — nicht karibisch!\n🏝️ Für türkisfarbenes Wasser & Schnorcheln: Inseln des Heils (Boot ab Kourou, 45 Min.)\n🌙 Montjoly: Lederschildkröten-Beobachtung nachts (Apr-Aug)" },
        { keys:['schlange','spinne','insekt','giftig','biss','stich','dschungel gefahr','gefährlich','tier gefahr'],
          reply:"⚠️ Gefährliche Tiere in Guayana:\n🐍 Schlangen: Lanzenotter (Bothrops atrox) — gefährlichste! Im Wald unbedingt Stiefel tragen\n🕷️ Spinnen: Goliath-Vogelspinne — beeindruckend aber kaum gefährlich\n🐜 Paraponera-Ameise (Ameisenbulle): 24h starke Schmerzen nach Stich!\n→ Schuhe jeden Morgen im Wald kontrollieren\n📞 Bei Schlangenbiss: SAMU 15 anrufen, ruhig bleiben" },
        { keys:['geschichte','kolonie','sklaverei','abschaffung','bagne','deportation','vergangenheit'],
          reply:"📜 Geschichte Guayanas:\n• 1637: Gründung von Cayenne\n• 1848: Endgültige Abschaffung der Sklaverei\n• 1852–1953: Strafgefangenenlager — über 70.000 Deportierte\n• 1895–1899: Dreyfus-Affäre (Teufelsinsel)\n• 1946: Überseedepartement Frankreichs\n• 1968: Eröffnung des Raumfahrtzentrums Kourou" },
        { keys:['hotel','apart hotel','wohnung','unterkunft','schlafen','aufenthalt','residenz','zimmer'],
          reply:"🏨 Unterkunft in Guayana:\n\n🏙️ Cayenne:\n• ★★★★ Novotel Cayenne (Rémire-Montjoly) — Pool, Strand ~120-180€/Nacht\n• ★★★ Hôtel Amazonia — Stadtzentrum ~70-100€/Nacht\n• Hôtel Mercure Cayenne ~110-160€/Nacht\n\n🏢 Apart-hotels:\n• Eden Suite Hôtel — voll ausgestattete Apartments, Pool ~80-130€/Nacht\n• Angebote auf Airbnb / Booking.com\n\n🚀 Kourou:\n• Hôtel des Roches (Meerblick) ~80-120€/Nacht\n\n🌿 Urwald:\n• Traditionelles Carbet mit Hängematte: 15-30€/Nacht\n• Öko-Lodge: 80-150€/Nacht\n\n📅 Immer im Voraus buchen!" },
        { keys:['sehenswürdigkeit','attraktion','was sehen','denkmal','besuch','tourismus','aussichtspunkt','interessant'],
          reply:"🗺️ Top-Sehenswürdigkeiten in Guayana:\n\n1. 🚀 Raumfahrtzentrum Kourou — kostenloses Museum\n2. 🏝️ Inseln des Heils — Geschichte + Schnorcheln\n3. 🐊 Kaw-Sümpfe — Kaimane, Nachtbootfahrt\n4. 🌿 Amazonaspark (Saül) — Wanderungen\n5. 🐢 Awala-Yalimapo — Lederschildkröten (Apr-Aug)\n6. 🏙️ Cayenne-Markt — jeden Morgen\n7. 🏛️ Camp de la Transportation (Saint-Laurent)\n8. 🌸 Dorf Cacao — Hmong-Sonntagsmarkt\n9. ⚡ Petit-Saut-Stausee — riesiger See\n10. 🌉 Oyapock-Brücke — französisch-brasilianische Grenze\n\n💡 Mindestens 10 Tage für die Highlights." },
    ];

    const knowledgeIT = [
        { keys:['ciao','buongiorno','buonasera','salve','hey','bella'],
          reply:"Ciao! Benvenuto su Guyane Découverte 🌿 Sono la tua guida virtuale della Guiana Francese. Chiedimi qualsiasi cosa su destinazioni, storia, fauna, culture, voli, salute, budget..." },
        { keys:['destinazione','visitare','vedere','imperdibili','consigliare','migliore','cosa fare','luoghi'],
          reply:"🗺️ Destinazioni imperdibili in Guiana:\n• 🚀 Kourou & Centro Spaziale della Guiana\n• 🏝️ Isole della Salvezza (penitenziario & spiagge)\n• 🦋 Parco Amazzonico (il più grande parco nazionale francese)\n• 🏙️ Cayenne (mercato, Fort Cépérou, gastronomia)\n• 🏛️ Saint-Laurent-du-Maroni (fiume & cultura bushinengue)\n• 🐢 Awala-Yalimapo (tartarughe liuto)\n\nDi quale destinazione vuoi sapere di più?" },
        { keys:['kourou','spazio','razzo','ariane','csg','lancio','esa'],
          reply:"🚀 Centro Spaziale della Guiana (CSG) a Kourou:\n• Porto spaziale d'Europa — ESA, CNES & Arianespace\n• Razzi: Ariane 5, Ariane 6, Vega\n• Visita: Museo dello Spazio (gratuito), tour guidato (prenotazione richiesta)\n• Assistere a un lancio dal vivo — esperienza indimenticabile!\n📍 50 km da Cayenne (1h in auto)" },
        { keys:['isole','salvezza','diavolo','penitenziario','dreyfus','royale'],
          reply:"🏝️ Isole della Salvezza:\n3 isole: Île Royale, Île Saint-Joseph e Isola del Diavolo\n• Penitenziario 1852–1953\n• Isola del Diavolo: Alfred Dreyfus (1895–1899)\n• Attività: snorkeling, birdwatching, percorsi storici\n⛵ Barca da Kourou: 45 min." },
        { keys:['cayenne','capitale','mercato','palmistes','fort','shopping'],
          reply:"🏙️ Cayenne, la capitale creola:\n• Place des Palmistes con palme reali\n• Mercato: frutti esotici, spezie, ogni mattina\n• Fort Cépérou: vista panoramica sulla baia\n• Spiaggia Montjoly (15 min) — tartarughe di notte" },
        { keys:['amazzonia','parco','nazionale','biodiversità','giungla','foresta','trekking','saül'],
          reply:"🦋 Parco Amazzonico della Guiana:\n• Il più grande parco nazionale francese (3,4 milioni di ha)\n• 34% del territorio — Patrimonio UNESCO\n• 5.500+ specie vegetali, 700+ specie di uccelli\n• Accessi: Saül (escursionismo), Maripasoula (fiume & cultura)\n⚠️ Guida obbligatoria per la zona centrale." },
        { keys:['tartaruga','liuto','awala','yalimapo','montjoly','spiaggia','uova'],
          reply:"🐢 Tartarughe Liuto:\n• La più grande popolazione mondiale — fino a 2m e 900kg!\n• Spiaggia principale: Awala-Yalimapo (3h da Cayenne)\n🗓️ Nidificazione: aprile–agosto | Schiusa: luglio–ottobre\n🌙 Uscite notturne guidate — prenotazione obbligatoria" },
        { keys:['volo','aereo','parigi','air france','aeroporto','viaggio'],
          reply:"✈️ Come arrivare in Guiana:\n• Da Parigi: volo diretto ~8h30 (Air France, Air Caraïbes)\n• Nessun visto richiesto (dipartimento francese)\n• Da Martinica/Guadalupa: voli Air France giornalieri\n• Dal Brasile: collegamenti settimanali" },
        { keys:['budget','costo','prezzo','soldi','euro','spese'],
          reply:"💰 Budget per la Guiana:\n• Media: 80–120€/giorno/persona\n• Economico: carbets, ristoranti locali (30–60€/giorno)\n• Principali spese: trasporti nell'entroterra, alloggio\n💡 Consiglio: prenotare in anticipo!" },
        { keys:['salute','vaccino','febbre gialla','malaria','zanzare'],
          reply:"🏥 Salute:\n• 🔴 Vaccino obbligatorio: febbre gialla\n• 🟡 Raccomandati: epatite A/B, tifoide\n• Rischio malaria nell'entroterra — profilassi raccomandata\n• Protezione antizanzare indispensabile!" },
        { keys:['storia','colonia','bagne','deportazione','schiavitù','creolo'],
          reply:"📜 Storia della Guiana:\n• 1667: Parte ufficiale della Francia\n• 1848: Abolizione definitiva della schiavitù\n• 1852–1953: Penitenziario (70.000+ deportati)\n• 1946: Dipartimento d'oltremare\n• 1968: Apertura del centro spaziale" },
        { keys:['animale','fauna','giaguaro','scimmia','tapiro','caimano','anaconda','uccello','tucano'],
          reply:"🦁 Fauna della Guiana:\n🦅 700+ specie di uccelli: Aquila Arpia, Ara Scarlatta, Tucano\n🐾 Giaguaro, Tapiro, Lontra Gigante (2m!)\n🐍 Anaconda Verde, Caimano Nero\n🐟 Arapaima (4m, 250kg!)" },
        { keys:['carnevale','touloulous','kaseko','musica','sfilata','festival'],
          reply:"🎭 Carnevale della Guiana:\n• Il carnevale più lungo di Francia (dicembre al Mercoledì delle Ceneri)\n• Touloulous: donne mascherate scelgono il loro partner\n• Musica: Kaseko, Zouk, Bèlè\n• Sfilate e serate ogni fine settimana" },
        { keys:['popolo','amerindiano','creolo','bushinengue','hmong','cultura','tradizione'],
          reply:"🪶 Popoli della Guiana:\n• Amerindi (7 etnie): Wayampi, Teko, Kali'na...\n• Bushinengue (6 etnie): Ndjuka, Saramaka... — discendenti di schiavi liberi\n• Creoli: gruppo maggioritario\n• Hmong-laotiani: a Cacao dal 1977" },
        { keys:['grazie','ottimo','perfetto','fantastico','meraviglioso'],
          reply:"Prego! 😊 La Guiana Francese è una destinazione davvero straordinaria. Non esitare a fare altre domande — buon viaggio! 🌿🚀🐢" },
        { keys:['acqua','bere','rubinetto','potabile','bottiglia','purificare','sete','idratazione'],
          reply:"🚰 Acqua in Guiana:\n• ✅ Acqua del rubinetto potabile nelle città: Cayenne, Kourou, Saint-Laurent\n• Zone rurali e foresta: acqua in bottiglia o purificazione obbligatoria\n• Fiumi: NON bere mai senza filtrare (parassiti, mercurio)\n• Porta compresse purificanti o filtro Sawyer per il trekking\n• Bevi almeno 2-3L al giorno — caldo tropicale + umidità al 90%" },
        { keys:['carta di credito','pagamento','bancomat','contanti','atm','banca','soldi','pagare'],
          reply:"💳 Pagamenti in Guiana:\n• Carta accettata a Cayenne, Kourou, Saint-Laurent\n• Mercati, carbets, zone remote: solo contanti!\n• Bancomat nelle città principali\n⚠️ Nella foresta: nessun bancomat, solo contanti\n💡 Preleva abbastanza contanti prima di lasciare le città" },
        { keys:['fuso orario','differenza oraria','ora locale','gmt','tramonto','alba','orologio'],
          reply:"🕐 Fuso orario della Guiana:\n• UTC/GMT -3 (Ora della Guiana Francese)\nDifferenza con l'Italia: -4h (inverno) / -5h (estate)\n☀️ Alba ~6h, tramonto ~18h tutto l'anno — nessun cambio d'ora!" },
        { keys:['spiaggia','nuotare','mare','oceano','atlantico','surf','onda','snorkeling','immersione'],
          reply:"🏖️ Spiagge in Guiana:\n• Spiaggia di Montjoly (15 min da Cayenne): la più frequentata\n• Acqua marrone sulla terraferma (sedimenti dell'Amazzonia) — non è Caraibi!\n🏝️ Per acqua cristallina e snorkeling: le Isole della Salvezza (barca da Kourou, 45 min)\n🌙 Montjoly: osservazione tartarughe liuto di notte (apr-ago)" },
        { keys:['serpente','ragno','insetto','veleno','morso','puntura','pericolo giungla','pericoloso','fauna pericolosa'],
          reply:"⚠️ Fauna pericolosa in Guiana:\n🐍 Serpenti: Giararaca (Bothrops atrox) — il più pericoloso! Indossa stivali nella foresta\n🕷️ Ragni: ragno uccello gigante: impressionante ma poco pericoloso\n🐜 Formica proiettile: 24h di dolore intenso dopo il morso!\n→ Controlla le scarpe ogni mattina nel bosco\n📞 In caso di morso di serpente: chiama SAMU 15, rimani calmo" },
        { keys:['hotel','apart hotel','appartamento','alloggio','dormire','soggiorno','residenza','camera'],
          reply:"🏨 Alloggio in Guiana:\n\n🏙️ Cayenne:\n• ★★★★ Novotel Cayenne (Rémire-Montjoly) — piscina, spiaggia ~120-180€/notte\n• ★★★ Hôtel Amazonia — centro città ~70-100€/notte\n• Hôtel Mercure Cayenne ~110-160€/notte\n\n🏢 Apart-hotel:\n• Eden Suite Hôtel — appartamenti attrezzati, piscina ~80-130€/notte\n• Offerte su Airbnb / Booking.com\n\n🚀 Kourou:\n• Hôtel des Roches (vista mare) ~80-120€/notte\n\n🌿 Foresta:\n• Carbet tradizionale con amaca: 15-30€/notte\n• Eco-lodge: 80-150€/notte\n\n📅 Prenota sempre in anticipo!" },
        { keys:['luogo turistico','attrazione','cosa vedere','monumento','visita','turismo','punto di interesse'],
          reply:"🗺️ Principali attrazioni turistiche della Guiana:\n\n1. 🚀 Centro Spaziale di Kourou — museo gratuito\n2. 🏝️ Isole della Salvezza — storia + snorkeling\n3. 🐊 Paludi di Kaw — caimani, gita notturna\n4. 🌿 Parco Amazzonico (Saül) — escursioni\n5. 🐢 Awala-Yalimapo — tartarughe (apr-ago)\n6. 🏙️ Mercato di Cayenne — ogni mattina\n7. 🏛️ Camp de la Transportation (Saint-Laurent)\n8. 🌸 Villaggio di Cacao — mercato Hmong domenicale\n9. ⚡ Diga di Petit-Saut — lago artificiale\n10. 🌉 Ponte dell'Oyapock — confine franco-brasiliano\n\n💡 Minimo 10 giorni per vedere l'essenziale." },
    ];

    const knowledgeZH = [
        { keys:['你好','您好','大家好','嗨','早上好','晚上好','早安','晚安'],
          reply:"您好！欢迎来到圭亚那探索网站 🌿 我是法属圭亚那的虚拟导游。请随时询问关于目的地、历史、动植物、文化、航班、健康、预算等任何问题！" },
        { keys:['目的地','参观','游览','景点','推荐','去哪里','去哪','行程','景区','旅游'],
          reply:"🗺️ 法属圭亚那必游目的地：\n• 🚀 库鲁及圭亚那航天中心\n• 🏝️ 救星群岛（流放地与海滩）\n• 🦋 亚马逊公园（法国最大国家公园）\n• 🏙️ 卡宴（市场、塞佩鲁堡、美食）\n• 🏛️ 圣罗朗杜马罗尼（河流与布希楠格文化）\n• 🐢 阿瓦拉-亚利马波（革龟观察）\n\n想了解哪个目的地的更多信息？" },
        { keys:['库鲁','航天','火箭','阿丽亚娜','太空','发射','esa','欧洲航天','csg'],
          reply:"🚀 圭亚那航天中心（CSG），库鲁：\n• 欧洲的航天港——ESA、CNES和阿丽亚娜航天公司运营\n• 火箭：阿丽亚娜5号、阿丽亚娜6号、织女星\n• 参观：太空博物馆（免费）、CSG导览（需预约）\n• 现场观看火箭发射——终生难忘！\n📍 距卡宴50公里（约1小时车程）" },
        { keys:['救星群岛','魔鬼岛','流放','苦役','德雷福斯','皇家岛','监狱'],
          reply:"🏝️ 救星群岛：\n皇家岛、圣约瑟夫岛、魔鬼岛三座岛屿\n• 1852–1953年流放地——保存完好的遗址\n• 魔鬼岛：德雷福斯被关押于此（1895–1899）\n• 活动：浮潜、观鸟、历史步道\n⛵ 从库鲁港乘船：45分钟" },
        { keys:['卡宴','首都','市场','购物','棕榈','塞佩鲁','首府'],
          reply:"🏙️ 卡宴，克里奥尔首都：\n• 棕榈广场：城市中心\n• 卡宴市场：异国水果、香料——每天早上\n• 塞佩鲁堡：俯瞰海湾全景\n• 蒙若利海滩（15分钟）——夜晚观察革龟" },
        { keys:['亚马逊','公园','国家公园','生物多样性','丛林','森林','徒步','萨勒'],
          reply:"🦋 圭亚那亚马逊公园：\n• 法国最大国家公园（340万公顷）\n• 覆盖34%领土——联合国教科文组织世界遗产\n• 5,500+植物种类、700+鸟类、190+哺乳动物\n• 主要入口：萨勒（徒步）、马里帕苏拉（河流与文化）\n⚠️ 核心区域需要向导" },
        { keys:['革龟','海龟','产卵','阿瓦拉','亚利马波','蒙若利','龟卵'],
          reply:"🐢 圭亚那的革龟：\n• 全球最大种群——体长达2米、体重900公斤！\n• 主要海滩：阿瓦拉-亚利马波（距卡宴3小时）\n🗓️ 产卵：4月至8月 | 孵化：7月至10月\n🌙 有导游的夜间游览——需提前预约" },
        { keys:['航班','飞机','巴黎','法航','机场','出发','怎么去','如何前往'],
          reply:"✈️ 前往圭亚那：\n• 从巴黎：直飞约8小时30分（法国航空、法航加勒比）\n• 无需签证（法国海外省）\n• 从马提尼克/瓜德罗普：每日法航航班\n• 从巴西：每周航班（贝伦、福塔莱萨）" },
        { keys:['预算','费用','价格','钱','花多少','欧元','开销'],
          reply:"💰 圭亚那旅行预算：\n• 平均：每人每天80–120欧元\n• 经济型：民宿、当地餐厅（30–60欧元/天）\n• 主要开支：内陆交通（非常贵）、住宿\n💡 建议：提前预订！" },
        { keys:['健康','疫苗','黄热病','疟疾','蚊子','医院','卫生'],
          reply:"🏥 圭亚那健康须知：\n• 🔴 必须接种：黄热病疫苗\n• 🟡 建议接种：甲/乙型肝炎、伤寒\n• 内陆地区有疟疾风险——建议预防用药\n• 防蚊措施：长袖衣物、驱虫剂、蚊帐\n⚠️ 出发前请咨询医生" },
        { keys:['历史','殖民','法国','流放地','奴隶','过去','克里奥尔'],
          reply:"📜 圭亚那历史：\n• 1667年：正式并入法国\n• 1848年：永久废除奴隶制\n• 1852–1953年：流放地（超过7万名犯人）\n• 1946年：成为法国海外省\n• 1968年：航天中心开幕" },
        { keys:['动物','野生动物','美洲豹','猴子','貘','凯门鳄','蟒蛇','鸟','巨嘴鸟','食人鱼'],
          reply:"🦁 圭亚那卓越的野生动物：\n🦅 鸟类（700+种）：角雕、猩红金刚鹦鹉、巨嘴鸟、朱鹮\n🐾 美洲豹、貘、巨獭（2米！）\n🐍 绿森蚺、黑凯门鳄\n🐟 巨骨舌鱼（4米，250公斤！）" },
        { keys:['狂欢节','庆典','图卢卢','音乐','游行','节日'],
          reply:"🎭 圭亚那狂欢节：\n• 法国最长的狂欢节（12月至圣灰星期三）\n• Touloulous：完全蒙面的女性自己选择舞伴\n• 音乐：卡塞科、佐克、贝莱\n• 每周末街头游行和图卢卢之夜" },
        { keys:['民族','文化','美洲印第安人','克里奥尔','布希楠格','苗族','传统'],
          reply:"🪶 圭亚那的民族：\n• 美洲印第安人（7个族群）：瓦亚姆皮、特科、卡利纳……\n• 布希楠格（6个族群）：恩德加、萨拉马卡……\n• 克里奥尔人：多数群体\n• 苗族老挝人：自1977年起在卡卡奥聚居" },
        { keys:['谢谢','太好了','完美','棒','精彩','非常好','好的'],
          reply:"不客气！😊 法属圭亚那是一个真正非凡的目的地。随时提问——旅途愉快！🌿🚀🐢" },
        { keys:['水','喝水','自来水','饮用水','矿泉水','净化','安全水','口渴'],
          reply:"🚰 圭亚那的饮水：\n• ✅ 城市自来水可饮用：卡宴、库鲁、圣罗朗\n• 农村地区和丛林：需饮瓶装水或净化处理\n• 河流：切勿直接饮用（寄生虫、汞污染）\n• 徒步需携带净水片或Sawyer滤水器\n• 每天至少补充2-3升水——热带气候出汗多" },
        { keys:['信用卡','付款','支付','ATM','取款机','现金','银行','货币','钱'],
          reply:"💳 圭亚那的支付方式：\n• 信用卡在卡宴、库鲁、圣罗朗大部分商店可用\n• 市场、卡尔贝、偏远地区：仅收现金！\n• ATM取款机：主要城市均有\n⚠️ 丛林和偏远地区：无ATM，仅用现金\n💡 离开城市前务必提取足够现金" },
        { keys:['时区','时差','当地时间','几点','GMT','日出','日落','钟表'],
          reply:"🕐 圭亚那时区：\n• UTC/GMT -3（法属圭亚那时间）\n与中国北京的时差：慢11小时\n与法国的时差：冬季-4小时，夏季-5小时\n☀️ 全年日出约6时，日落约18时 — 不实行夏令时！" },
        { keys:['海滩','游泳','大海','海洋','冲浪','浮潜','大西洋','水上活动','游泳'],
          reply:"🏖️ 圭亚那的海滩：\n• 蒙若利海滩（距卡宴15分钟）：最受欢迎\n• 大陆沿岸海水呈棕色（亚马逊河泥沙）——非蔚蓝热带海水\n🏝️ 想要清澈海水和浮潜？去救星群岛！（从库鲁坐船45分钟）\n🌙 蒙若利海滩：夜间观察革龟产卵（4-8月）" },
        { keys:['蛇','蜘蛛','昆虫','有毒','被咬','蜇','丛林危险','危险动物','毒虫'],
          reply:"⚠️ 圭亚那的危险动物：\n🐍 蛇类：矛头蝮（Bothrops atrox）——最危险！在丛林中务必穿高筒靴\n🕷️ 蜘蛛：巨型捕鸟蛛看似吓人但几乎无害\n🐜 子弹蚁：被蜇后剧痛持续24小时！\n→ 在丛林中每天早上检查鞋子\n📞 遇到蛇咬：拨打急救电话SAMU 15，保持冷静" },
        { keys:['历史','殖民','法国','流放地','奴隶','过去','德雷福斯','克里奥尔'],
          reply:"📜 圭亚那历史：\n• 1637年：卡宴建城\n• 1848年：永久废除奴隶制\n• 1852–1953年：流放地（超过7万名犯人被流放）\n• 1895–1899年：德雷福斯事件（魔鬼岛）\n• 1946年：成为法国海外省\n• 1968年：库鲁航天中心开幕" },
        { keys:['酒店','宾馆','公寓式酒店','住宿','住哪','入住','客房','民宿','旅馆'],
          reply:"🏨 圭亚那的住宿：\n\n🏙️ 卡宴：\n• ★★★★ 诺富特卡宴酒店（雷米尔）— 泳池、海滩，约120-180€/晚\n• ★★★ 亚马逊酒店 — 市中心，约70-100€/晚\n• 美居卡宴酒店，约110-160€/晚\n\n🏢 公寓式酒店：\n• Eden Suite酒店 — 设施齐全的公寓，泳池，约80-130€/晚\n• Airbnb / Booking.com 上也有很多选择\n\n🚀 库鲁：\n• 岩石酒店（海景）约80-120€/晚\n\n🌿 丛林：\n• 传统吊床小屋：15-30€/晚\n• 生态度假村：80-150€/晚\n\n📅 务必提前预订！卡宴以外的住宿十分有限。" },
        { keys:['旅游景点','景区','参观地点','名胜','必去','看什么','观光','景点推荐'],
          reply:"🗺️ 圭亚那主要旅游景点：\n\n1. 🚀 库鲁航天中心 — 免费博物馆\n2. 🏝️ 救星群岛 — 历史遗址 + 浮潜\n3. 🐊 卡乌沼泽 — 凯门鳄、夜间游船\n4. 🌿 亚马逊公园（萨勒）— 徒步\n5. 🐢 阿瓦拉-亚利马波 — 革龟产卵（4-8月）\n6. 🏙️ 卡宴市场 — 每天早上，热带风情\n7. 🏛️ 流放营地（圣罗朗）— 历史遗址\n8. 🌸 卡卡奥村 — 苗族周日集市\n9. ⚡ 小瀑布大坝 — 广阔人工湖\n10. 🌉 奥亚波克大桥 — 法巴边境\n\n💡 建议至少安排10天游览主要景点。" },
    ];

    const knowledgeJA = [
        { keys:['こんにちは','おはよう','こんばんは','やあ','はじめまして','どうも','よろしく'],
          reply:"こんにちは！ギアナ・デクヴェルトへようこそ 🌿 私はフランス領ギアナのバーチャルガイドです。目的地、歴史、野生動物、文化、フライト、健康、予算など、何でもご質問ください！" },
        { keys:['目的地','訪れる','観光','おすすめ','何をする','旅程','場所','見る'],
          reply:"🗺️ フランス領ギアナの必見スポット：\n• 🚀 クール＆ギアナ宇宙センター\n• 🏝️ サルー諸島（流刑地＆ビーチ）\n• 🦋 アマゾン公園（フランス最大の国立公園）\n• 🏙️ カイエンヌ（市場、セペルー砦、グルメ）\n• 🏛️ サン＝ローラン＝デュ＝マロニ（川＆ブシネング文化）\n• 🐢 アワラ＝ヤリマポ（オサガメ観察）\n\nどの目的地について詳しく知りたいですか？" },
        { keys:['クール','宇宙','ロケット','アリアン','宇宙センター','打ち上げ','esa','csg'],
          reply:"🚀 ギアナ宇宙センター（CSG）、クール：\n• ヨーロッパの宇宙港——ESA・CNES・アリアンスペース運営\n• ロケット：アリアン5、アリアン6、ベガ\n• 見学：宇宙博物館（無料）、ガイドツアー（要予約）\n• ライブ打ち上げ——忘れられない体験！\n📍 カイエンヌから50km（車で約1時間）" },
        { keys:['サルー','悪魔島','流刑','囚人','ドレフュス','ロワイヤル','ジョゼフ'],
          reply:"🏝️ サルー諸島：\nロワイヤル島、サン＝ジョゼフ島、悪魔島の3島\n• 1852–1953年の流刑地——保存良好な遺跡\n• 悪魔島：ドレフュス収監（1895–1899）\n• アクティビティ：シュノーケリング、バードウォッチング\n⛵ クールから船で45分" },
        { keys:['カイエンヌ','首都','市場','ショッピング','セペルー','棕梠'],
          reply:"🏙️ カイエンヌ、クレオールの首都：\n• 棕梠広場：城市中心、ロイヤルパーム\n• 市場：エキゾチックな果物、スパイス——毎朝\n• セペルー砦：湾を見下ろす絶景\n• モンジョリビーチ（15分）——夜のオサガメ観察" },
        { keys:['アマゾン','公園','国立公園','生物多様性','ジャングル','森','トレッキング','サウル'],
          reply:"🦋 ギアナ・アマゾン公園：\n• フランス最大の国立公園（340万ha）\n• ギアナの34%を保護——ユネスコ世界遺産\n• 5,500+植物種、700+鳥類\n• 入口：サウル（ハイキング）、マリパスラ（川＆文化）\n⚠️ コアゾーンはガイド同行が必須" },
        { keys:['オサガメ','海亀','産卵','アワラ','ヤリマポ','モンジョリ','卵'],
          reply:"🐢 ギアナのオサガメ：\n• 世界最大の個体群——体長2m、体重900kg！\n• メインビーチ：アワラ＝ヤリマポ（カイエンヌから3時間）\n🗓️ 産卵：4〜8月 | 孵化：7〜10月\n🌙 ガイド付き夜間ツアー——要予約" },
        { keys:['フライト','飛行機','パリ','エールフランス','空港','行き方'],
          reply:"✈️ ギアナへのアクセス：\n• パリから：直行便約8時間30分（エールフランス）\n• ビザ不要（フランス県）\n• マルティニーク/グアドループから：毎日運航\n• ブラジルから：週1便（ベレン、フォルタレザ）" },
        { keys:['予算','費用','値段','お金','高い','ユーロ','いくら'],
          reply:"💰 ギアナの旅行予算：\n• 平均：1人1日80〜120€\n• 節約型：カルベ、地元レストラン（30〜60€/日）\n• 主な出費：内陆交通費（非常に高い）、宿泊費\n💡 事前予約がおすすめ！" },
        { keys:['健康','ワクチン','黄熱病','マラリア','蚊','病院'],
          reply:"🏥 ギアナの健康情報：\n• 🔴 必須ワクチン：黄熱病\n• 🟡 推奨：A型・B型肝炎、腸チフス\n• 内陸部のマラリアリスク——予防薬を推奨\n• 防虫対策：長袖、虫よけ剤、蚊帳\n⚠️ 出発前に医師に相談" },
        { keys:['歴史','植民地','フランス','流刑地','奴隷','過去','クレオール'],
          reply:"📜 ギアナの歴史：\n• 1667年：フランスへの正式編入\n• 1848年：奴隷制度の最終廃止\n• 1852–1953年：流刑地（7万人以上が追放）\n• 1946年：海外県に昇格\n• 1968年：宇宙センター開設" },
        { keys:['動物','野生動物','ジャガー','サル','バク','カイマン','アナコンダ','鳥','オオハシ','ピラニア'],
          reply:"🦁 ギアナの動物相：\n🦅 700+鳥類：ハーピーイーグル、コンゴウインコ、オオハシ\n🐾 ジャガー、バク、オオカワウソ（2m!）\n🐍 グリーンアナコンダ、クロカイマン\n🐟 アラパイマ（4m、250kg!）" },
        { keys:['カーニバル','お祭り','トゥルルー','カセコ','ズーク','音楽','パレード'],
          reply:"🎭 ギアナのカーニバル：\n• フランス最長（12月〜灰の水曜日）\n• トゥルルー：仮面をつけた女性が自分でパートナーを選ぶ\n• 音楽：カセコ、ズーク、ベレ\n• 毎週末パレードと夜のイベント" },
        { keys:['民族','文化','先住民','クレオール','ブシネング','モン族','伝統'],
          reply:"🪶 ギアナの民族：\n• 先住民族（7民族）：ワヤンピ、テコ、カリナ...\n• ブシネング（6民族）：ンジュカ、サラマカ...\n• クレオール：多数派グループ\n• モン族：1977年以降カカオに定住" },
        { keys:['ありがとう','素晴らしい','完璧','すごい','最高','良かった'],
          reply:"どういたしまして！😊 フランス領ギアナは本当に素晴らしい目的地です。遠慮なく質問してください——良い旅を！🌿🚀🐢" },
        { keys:['水','飲料水','水道水','飲む','ボトル','浄水','口渇','脱水'],
          reply:"🚰 ギアナの飲料水：\n• ✅ 都市部の水道水は飲用可能：カイエンヌ、クール、サン＝ローラン\n• 農村部・森林：ボトル水または浄水が必須\n• 川の水：絶対に直接飲まないこと（寄生虫、水銀汚染）\n• トレッキングには浄水タブレットまたはSawyerフィルターを\n• 毎日2〜3L以上の水分補給が必須" },
        { keys:['クレジットカード','支払い','現金','ATM','両替','銀行','お金','決済'],
          reply:"💳 ギアナの支払い方法：\n• カイエンヌ、クール、サン＝ローランではカード支払い可\n• 市場、カルベ、僻地：現金のみ！\n• ATMは主要都市に設置\n⚠️ ジャングルや僻地：ATMなし、現金のみ\n💡 都市を離れる前に十分な現金を引き出しておく" },
        { keys:['時差','現地時間','タイムゾーン','GMT','日の出','日没','時計'],
          reply:"🕐 ギアナの時間帯：\n• UTC/GMT -3（フランス領ギアナ時間）\n日本との時差：日本より12時間遅れ\nフランスとの時差：冬季-4時間、夏季-5時間\n☀️ 日の出は年間を通じて約6時、日没は約18時 — サマータイムなし！" },
        { keys:['ビーチ','海水浴','泳ぐ','海','大西洋','サーフィン','シュノーケル','ダイビング'],
          reply:"🏖️ ギアナのビーチ：\n• モンジョリビーチ（カイエンヌから15分）：最も人気\n• 大陸海岸の海水は茶色（アマゾン川の堆積物）— カリブ海の透明さとは異なる\n🏝️ 透明な海でシュノーケルなら：サルー諸島（クールから船で45分）がおすすめ！\n🌙 モンジョリ：夜のオサガメ産卵観察（4〜8月）" },
        { keys:['ヘビ','クモ','昆虫','毒','かむ','刺す','ジャングルの危険','危険な動物','毒虫'],
          reply:"⚠️ ギアナの危険な動物：\n🐍 ヘビ：ランスヘッド（Bothrops atrox）— 最も危険！森ではブーツを着用\n🕷️ クモ：ゴライアスバードイーターは大きいが無害\n🐜 弾丸アリに刺されると24時間激痛！\n→ 毎朝、森の中では靴を確認すること\n📞 ヘビに咬まれたら：SAMU 15に電話、冷静に" },
        { keys:['歴史','植民地','フランス','流刑地','奴隷','過去','クレオール','ドレフュス'],
          reply:"📜 ギアナの歴史：\n• 1637年：カイエンヌ建設\n• 1848年：奴隷制度の最終廃止\n• 1852–1953年：流刑地（7万人以上が追放）\n• 1895–1899年：ドレフュス事件（悪魔島）\n• 1946年：フランス海外県に昇格\n• 1968年：クール宇宙センター開設" },
        { keys:['ホテル','アパートホテル','宿泊','宿','泊まる','部屋','レジデンス','宿泊施設'],
          reply:"🏨 ギアナの宿泊施設：\n\n🏙️ カイエンヌ：\n• ★★★★ ノボテル カイエンヌ（レミール）— プール・ビーチ付き 約120-180€/泊\n• ★★★ アマゾニア ホテル — 市街中心部 約70-100€/泊\n• メルキュール カイエンヌ 約110-160€/泊\n\n🏢 アパートホテル：\n• エデン スイート ホテル — 設備完備のアパート・プール 約80-130€/泊\n• Airbnb / Booking.comでも多数掲載\n\n🚀 クール：\n• オテル・デ・ロシュ（海景） 約80-120€/泊\n\n🌿 ジャングル：\n• 伝統的カルベ（ハンモック）: 15-30€/泊\n• エコロッジ: 80-150€/泊\n\n📅 必ず事前予約を — カイエンヌ以外は宿泊施設が少ない！" },
        { keys:['観光スポット','見どころ','名所','観光地','何を見る','おすすめ観光','訪問','観光'],
          reply:"🗺️ ギアナの主要観光スポット：\n\n1. 🚀 クール宇宙センター — 無料博物館\n2. 🏝️ サルー諸島 — 歴史遺産＋シュノーケル\n3. 🐊 カウ湿地 — カイマン・夜間ボートツアー\n4. 🌿 アマゾン公園（サウル）— ハイキング\n5. 🐢 アワラ＝ヤリマポ — オサガメ（4〜8月）\n6. 🏙️ カイエンヌ市場 — 毎朝開催\n7. 🏛️ 流刑地キャンプ（サン＝ローラン）\n8. 🌸 カカオ村 — モン族日曜市\n9. ⚡ プチ＝ソーダム — 巨大人工湖\n10. 🌉 オヤポック橋 — 仏伯国境\n\n💡 主要スポットを見るには最低10日間が必要です。" },
    ];

    const chatKnowledge = {
        fr: null, // défini ci-dessous (déjà dans le même IIFE)
        en: knowledgeEN,
        es: knowledgeES,
        pt: knowledgePT,
        nl: knowledgeNL,
        de: knowledgeDE,
        it: knowledgeIT,
        zh: knowledgeZH,
        ja: knowledgeJA,
    };

    const knowledge = [
        // --- SALUTATIONS ---
        {
            keys: ['bonjour','salut','hello','bonsoir','coucou','hey','hi','bonne journée','bjr'],
            reply: "Bonjour ! Ravi de vous accueillir 🌿 Je suis votre guide virtuel de la Guyane Française.\nPostez-moi toutes vos questions : destinations, histoire, faune, culture, vols, budget, santé, langue, carnaval, peuples autochtones..."
        },

        // --- VUE D'ENSEMBLE ---
        {
            keys: ['c\'est quoi','qu\'est-ce','présente','présentation','guyane française','département','région','dom','outre-mer','france','statut'],
            reply: "🌍 La Guyane Française en bref :\n• Département et Région français d'outre-mer (DROM) depuis 1946\n• Située en Amérique du Sud, entre le Suriname (ouest) et le Brésil (est/sud)\n• Surface : 83 534 km² (le plus grand département français)\n• Population : ~300 000 habitants\n• Chef-lieu : Cayenne\n• Monnaie : Euro (€) — territoire de l'Union Européenne\n• Seul territoire continental de l'UE en Amérique du Sud\n• 98% de forêt amazonienne, biodiversité exceptionnelle 🦋"
        },

        // --- GÉOGRAPHIE ---
        {
            keys: ['géographie','superficie','taille','grand','fleuve','rivière','montagne','relief','côte','littoral','territoire','km','kilom'],
            reply: "🗺️ Géographie de la Guyane :\n• Superficie : 83 534 km² (15% du territoire français métropolitain)\n• Littoral : 378 km de côtes atlantiques\n• Fleuves principaux :\n  - Maroni (520 km) : frontière avec le Suriname\n  - Oyapock (480 km) : frontière avec le Brésil\n  - Sinnamary (260 km), Mana (400 km), Approuague (270 km), Comté (180 km)\n• Point culminant : Bellevue de l'Inini (851 m) — Monts Tumuc-Humac\n• 98% du territoire recouvert de forêt amazonienne\n• 22 communes"
        },

        // --- HISTOIRE ---
        {
            keys: ['histoire','historique','colonisation','colonial','bagne','penal','colonie','découverte','siècle','passé','dreyfus','1946','esclave','abolition'],
            reply: "📜 Histoire de la Guyane :\n• 1604 : Premier établissement français (la France Équinoxiale)\n• 1637 : Fondation de Cayenne\n• XVIIe-XVIIIe s. : Colonies de plantations avec esclaves africains\n• 1794 : Première abolition de l'esclavage\n• 1802 : Rétablissement de l'esclavage par Napoléon\n• 1848 : Abolition définitive de l'esclavage (Victor Schoelcher)\n• 1763 : Désastre de l'expédition de Kourou (14 000 colons morts)\n• 1851-1946 : Bagne de Guyane — 70 000 forçats transportés\n• 1894-1906 : Affaire Dreyfus (emprisonné sur l'Île du Diable)\n• 1946 : La Guyane devient un département français\n• 1968 : Création du Centre Spatial Guyanais (CSG) à Kourou"
        },

        // --- BAGNE ---
        {
            keys: ['bagne','forçat','prisonnier','peine','transportation','camp','penitentiaire','pénitentiaire','puni','deporté'],
            reply: "⛓️ Le Bagne de Guyane (1851-1953) :\n• 70 000 condamnés y furent transportés depuis la France\n• Surnommé \"la guillotine sèche\" : la mortalité était très élevée\n• 3 principaux sites : les Îles du Salut, Saint-Laurent-du-Maroni (Camp de la Transportation), et Cayenne\n• L'Île du Diable accueillit Alfred Dreyfus de 1895 à 1899\n• Le livre \"Papillon\" d'Henri Charrière popularisa le bagne dans le monde entier\n• Définitivement fermé en 1953\n• Le Camp de la Transportation à Saint-Laurent est classé monument historique\n• Des circuits touristiques y sont organisés"
        },

        // --- POPULATION & DÉMOGRAPHIE ---
        {
            keys: ['population','habitants','démographie','combien de personnes','ethnies','nationalité','origine','peuple','communauté'],
            reply: "👥 Population de la Guyane (~300 000 hab.) :\n• Créoles guyanais (population historique majoritaire)\n• Métropolitains (Français de métropole)\n• Bushinengues (descendants d'esclaves marrons) : Ndjuka, Saramaka, Aluku, Matawai, Paramaka\n• Amérindiens : Kali'na, Lokono, Teko, Wayampi, Palikur\n• Haïtiens et Surinamiens (forte immigration)\n• Brésiliens (notamment garimpeiros)\n• Hmong (réfugiés laotiens arrivés dans les années 1970)\n• Chinois, Laotiens, Antillais, Guadeloupéens...\n• Forte diversité : + de 80 langues parlées sur le territoire !"
        },

        // --- LANGUES ---
        {
            keys: ['langue','parler','dialecte','créole','patois','français','communication','lingue','linguistique'],
            reply: "🗣️ Les langues de Guyane :\n• Français : langue officielle et administrative\n• Créole guyanais (gwiyannais) : langue maternelle de nombreux Guyanais\n• Langues bushinengues : Ndjuka, Saramaka, Aluku/Boni...\n• Langues amérindiennes : Kali'na, Wayampi, Teko (Emérillon), Lokono, Palikur\n• Portugais brésilien (communauté brésilienne)\n• Hmong (villages de Cacao et Javouhey)\n• Sranan Tongo (Suriname)\n• Créole haïtien\n\nPlus de 80 langues coexistent sur ce petit territoire — un record mondial de diversité linguistique !"
        },

        // --- PEUPLES AMÉRINDIENS ---
        {
            keys: ['amérindien','indien','autochtone','kali\'na','wayampi','teko','lokono','palikur','galibi','indigène','première nation','tribu'],
            reply: "🪶 Les peuples amérindiens de Guyane :\n• Kali'na (Galibi) : peuple côtier, présent à Awala-Yalimapo et Macouria\n• Lokono (Arawak) : côte et zones intérieures proches\n• Teko (Emérillon) : rivières Tampok et Camopi (intérieur)\n• Wayampi : haut Oyapock, près de la frontière brésilienne\n• Palikur : région de l'Oyapock (Saint-Georges)\n\nCes communautés maintiennent des traditions ancestrales (artisanat, langue, chamanisme). Des zones de droits d'usage collectif leur sont réservées. Le tourisme responsable et l'accueil chez l'habitant sont possibles avec des guides agréés."
        },

        // --- BUSHINENGUES ---
        {
            keys: ['bushinengue','marron','ndjuka','saramaka','aluku','boni','matawai','paramaka','kwinti','esclave marron'],
            reply: "🥁 Les Bushinengues — descendants d'esclaves marrons :\nAncêtres esclaves qui s'échappèrent des plantations coloniales et fondèrent des sociétés libres en forêt au XVIIe-XVIIIe siècle.\n\n• Ndjuka (Aukan) : Maroni moyen — les plus nombreux en Guyane\n• Aluku (Boni) : haut Maroni (Grand-Santi, Papaichton)\n• Saramaka : Suriname et haut Maroni\n• Matawai, Kwinti, Paramaka : essentiellement au Suriname\n\n🎨 Traditions remarquables : sculpture sur bois, broderie, peintures corporelles, musique (kaseko, awasa). Leurs villages sont accessibles en pirogue depuis Saint-Laurent."
        },

        // --- COMMUNAUTÉ HMONG ---
        {
            keys: ['hmong','laos','laotien','cacao','javouhey','réfugié','asie','broderie','village hmong'],
            reply: "🌺 La communauté Hmong de Guyane :\n• Arrivés dans les années 1970 comme réfugiés du Laos après la guerre du Vietnam\n• Installés dans deux villages : Cacao et Javouhey\n• Environ 4 000 personnes\n• Spécialisés dans le maraîchage (ils approvisionnent Cayenne en légumes frais)\n• Artisanat reconnu : broderies et batiks multicolores\n• Village de Cacao : marché dominical incontournable avec produits locaux, cuisine asiatique-créole et artisanat\n• Magnifique cadre naturel à 80 km de Cayenne (1h30)"
        },

        // --- DESTINATIONS INCONTOURNABLES ---
        {
            keys: ['destination','visiter','voir','incontournable','recommande','conseil','meilleur','top','que faire','programme','itinéraire'],
            reply: "🗺️ Les incontournables de Guyane :\n• 🚀 Kourou & Centre Spatial Guyanais\n• 🏝️ Îles du Salut (bagne & plages)\n• 🦋 Parc Amazonien (le + grand parc de France)\n• 🏙️ Cayenne (marché, Fort Cépérou, gastronomie)\n• 🏛️ Saint-Laurent-du-Maroni (bagne & culture bushinengue)\n• 🐢 Awala-Yalimapo (tortues luth)\n• 🐊 Marais de Kaw (caimans, oiseaux)\n• 🌸 Village de Cacao (Hmong, marché du dimanche)\n• 🌊 Barrage de Petit-Saut\n• 🌿 Saül (randonnées en forêt)\n• 🇧🇷 Saint-Georges-de-l'Oyapock (pont frontalier Brésil)\n\nSur quelle destination voulez-vous plus d'infos ?"
        },

        // --- KOUROU & CSG ---
        {
            keys: ['kourou','spatial','fusée','ariane','csg','espace','lancement','nasa','esa','agence spatiale','vega','ariane 5','ariane 6'],
            reply: "🚀 Le Centre Spatial Guyanais (CSG) de Kourou :\n• Port spatial de l'Europe, géré par l'ESA, le CNES et Arianespace\n• Emplacement stratégique : latitude 5°N, idéale pour les orbites équatoriales\n• Fusées lancées : Ariane 5, Ariane 6, Vega, Soyouz (retraité)\n• Plus de 300 lancements réussis depuis 1968\n• À visiter : Musée de l'Espace (gratuit), visite guidée du CSG (réservation obligatoire sur le site du CNES)\n• Assister à un lancement : expérience unique (dates disponibles sur arianespace.com)\n• Kourou abrite aussi de belles plages et le Zoo de Guyane (30 min)\n\n📍 50 km de Cayenne — 1h de route (RN1)"
        },

        // --- ÎLES DU SALUT ---
        {
            keys: ['îles du salut','ile du salut','iles salut','diable','bagne','royale','saint-joseph','archipel','alcatraz','papillon'],
            reply: "🏝️ Les Îles du Salut :\nArchipel de 3 îles : Royale, Saint-Joseph et l'Île du Diable\n\n• Histoire : bagne de 1852 à 1953 — vestiges bien conservés\n• L'Île du Diable : Alfred Dreyfus y fut emprisonné (1895-1899), toujours interdite au public\n• Île Royale : la plus grande, auberge, restaurant, vestiges du bagne, singes écureuils en liberté\n• Île Saint-Joseph : quartier disciplinaire, chapelle, cimetière des bagnards\n• Faune : singes écureuils, agoutis, tortues marines, oiseaux tropicaux\n• Snorkeling dans des eaux cristallines\n\n⛵ Accès : bateau depuis le port de Kourou (45 min)\n🏨 Hébergement : Auberge des Îles du Salut (réservez !)"
        },

        // --- SAINT-LAURENT-DU-MARONI ---
        {
            keys: ['saint-laurent','maroni','saint laurent','deuxième ville','camp transportation','transport','bagne saint'],
            reply: "🏛️ Saint-Laurent-du-Maroni :\n• Deuxième ville de Guyane (~50 000 hab.) sur les rives du Maroni\n• Fondée en 1857 comme centre pénitentiaire\n• Le Camp de la Transportation : monument historique classé, visites guidées\n• Musée du Bagne\n• Port de Saint-Laurent : départ pour les villages bushinengues en pirogue\n• Excursions fluviales sur le Maroni\n• Marché Saint-Antoine : épices, artisanat, produits locaux\n• Couchers de soleil sur le Maroni face au Suriname\n• Architecture coloniale du centre-ville\n\n📍 250 km de Cayenne (3h30 via RN1) — 🛂 Passeport obligatoire pour Suriname"
        },

        // --- PARC AMAZONIEN ---
        {
            keys: ['parc amazonien','parc national','forêt','amazonie','biodiversité','saül','maripasoula','randonnée','trek','jungle','interior','intérieur','camopi'],
            reply: "🦋 Parc Amazonien de Guyane :\n• Créé en 2007 — le plus grand parc national de France (3,4 millions d'ha)\n• Couvre 34% du territoire guyanais\n• Patrimoine Mondial de l'UNESCO\n• Biodiversité : 5 500 espèces végétales, 700+ espèces d'oiseaux, 190+ espèces de mammifères\n• Communautés amérindiennes et bushinengues protégées (zone cœur)\n\n🥾 Principales portes d'entrée :\n• Saül : village isolé, randonnées balisées exceptionnelles, carbets\n• Maripasoula : capitale du Maroni, accès en avion ou pirogue\n• Camopi : territoire wayampi, haut Oyapock\n\n⚠️ Guide obligatoire pour la zone cœur. Accès en avion (Air Guyane) ou pirogue"
        },

        // --- CAYENNE ---
        {
            keys: ['cayenne','capitale','marché','palmistes','fort','cépérou','shopping','préfecture','chef-lieu','musée'],
            reply: "🏙️ Cayenne, la capitale créole (~60 000 hab.) :\n• Place des Palmistes : cœur de la ville, palmiers royaux, cafés, fontaine\n• Marché central de Cayenne : charpente métallique conçue par Gustave Eiffel ! Fruits exotiques, épices, poissons amazonniens — ouvert tous les matins\n• Fort Cépérou : vue panoramique sur la ville et la baie (ruines historiques XVIIe s.)\n• Cathédrale Saint-Sauveur (XIXe siècle)\n• Musée Alexandre-Franconie : histoire naturelle et ethnographie\n• Musée des Cultures Guyanaises\n• Centre commercial Katoury\n• Plage de Montjoly (15 min) : observation des tortues luth la nuit (avr-août)\n• Quartier Chinatown\n• Place Victor-Schoelcher\n• Maison du Bagne (archives, photos d'époque)\n\nCayenne est le point de départ idéal pour explorer la Guyane."
        },

        // --- TORTUES LUTH ---
        {
            keys: ['tortue','luth','ponte','awala','montjoly','yalimapo','mer','leatherback','dermochelys'],
            reply: "🐢 Les Tortues Luth de Guyane :\n• La Guyane héberge l'une des plus grandes populations mondiales de tortues luth (Dermochelys coriacea)\n• Plus grande tortue du monde : jusqu'à 2 m et 900 kg !\n• Plage principale : Awala-Yalimapo (commune de Mana, 3h de Cayenne)\n• Aussi : Plage de Montjoly et Rémire-Montjoly (proches de Cayenne)\n\n🗓️ Calendrier :\n• Ponte : avril à août (pic en mai-juin)\n• Éclosions : juillet à octobre\n\n🌙 Sorties nocturnes encadrées obligatoires — réservation auprès de l'Association Kwata ou de l'Office de tourisme de Mana\n⚠️ Règles strictes : silence, pas de flash, distance minimum"
        },

        // --- MARAIS DE KAW ---
        {
            keys: ['kaw','marais','caiman','caïman','regina','oiseau','ibis','nuit','pirogue marais'],
            reply: "🐊 Marais de Kaw :\n• Zone humide protégée à 90 km de Cayenne (1h30)\n• Refuge naturel exceptionnel : caimans noirs, caïmans à front lisse, ibis rouges, hérons, anacondas\n• Sorties nocturnes en pirogue pour observer les caïmans (yeux qui brillent dans le noir !)\n• Lever de soleil sur les marais : spectacle inoubliable\n• Oiseaux migrateurs en saison\n• Village de Kaw : carbets et gîtes pour séjour immersif\n\n💡 Le marais de Kaw est l'une des plus grandes zones humides de Guyane. Réservez un guide local pour la pirogue nocturne !"
        },

        // --- SAINT-GEORGES-DE-L'OYAPOCK ---
        {
            keys: ['saint-georges','oyapock','brésil','frontière brésilienne','pont','oiapoque','amapa'],
            reply: "🇧🇷 Saint-Georges-de-l'Oyapock :\n• Commune à la frontière avec le Brésil (Oiapoque)\n• Le Pont de l'Oyapock (2017) : premier pont routier franco-brésilien — symbole fort\n• Accès au Brésil (Amapá) — passeport obligatoire\n• Communauté amérindienne Teko et Wayampi\n• Zone de l'Oyapock : pêche, nature, biodiversité\n• Accès depuis Cayenne : 4h de route (RN2, route de l'Est)\n• Possible aussi en avion (Air Guyane)\n\n💡 Depuis Saint-Georges vous pouvez visiter l'Amapá brésilien ou remonter l'Oyapock vers les villages wayampi."
        },

        // --- PETIT-SAUT ---
        {
            keys: ['petit-saut','barrage','sinnamary','hydroélectrique','lac','réservoir','eel','énergie'],
            reply: "⚡ Barrage de Petit-Saut :\n• Barrage hydroélectrique sur le fleuve Sinnamary, construit en 1994\n• L'un des plus grands d'Amérique du Sud\n• Lac artificiel de 365 km² — paysage lacustre spectaculaire avec arbres émergents\n• Fournit 60% de l'électricité de la Guyane\n• Faune remarquable : dauphins rose-gris, loutres géantes, caïmans, oiseaux\n• Excursions en bateau sur le lac\n• Village de Sinnamary (proche) : manatees (lamantins) dans l'estuaire\n\n📍 À 130 km de Cayenne (2h de route). Visite du barrage sur réservation EDF."
        },

        // --- CACAO (VILLAGE HMONG) ---
        {
            keys: ['cacao','village','hmong','marché dominical','artisanat hmong','laotien','broderie'],
            reply: "🌸 Village de Cacao :\n• Village Hmong à 80 km de Cayenne (1h30 via RN2)\n• Marché du dimanche matin : incontournable !\n  - Broderies et batiks Hmong multicolores\n  - Cuisine asiatique-créole (nems, bò bún, pâtisseries)\n  - Fruits et légumes du maraîchage local\n  - Artisanat varié\n• Cadre naturel magnifique au cœur de la forêt\n• Église et école du village\n• Possibilité de randonnées autour du village\n\n⏰ Marché : dimanche matin uniquement. Arrivez tôt !"
        },

        // --- IRACOUBO ---
        {
            keys: ['iracoubo','fresques','église','peintures','gobin','art'],
            reply: "🎨 Iracoubo :\n• Commune entre Sinnamary et Saint-Laurent (sur la RN1)\n• Célèbre pour l'église Saint-Joseph et ses fresques extraordinaires\n• L'abbé Pierre-Yves Gobin (forçat devenu prêtre) a peint l'intérieur de l'église entre 1887 et 1904\n• Œuvres naïves et colorées représentant des scènes religieuses avec des personnages locaux\n• Considéré comme un chef-d'œuvre de l'art populaire français\n• Musée du Bagne d'Iracoubo\n• Village paisible sur les rives de la rivière Iracoubo"
        },

        // --- MANA & AWALA ---
        {
            keys: ['mana','awala','yalimapo','kali\'na','mangrove','nord-ouest','commune mana'],
            reply: "🌿 Mana et Awala-Yalimapo :\n• Mana : commune à l'extrême nord-ouest de la Guyane\n• Awala-Yalimapo : village Kali'na (Galibi), en pleine mangrove\n• Plage d'Awala-Yalimapo : site principal de ponte des tortues luth\n• Mangroves remarquables : balades en pirogue possible\n• Village Kali'na : artisanat amérindien, hamacs, poterie\n• Zone protégée Réserve Naturelle de l'Amana\n• Couchers de soleil sur l'Atlantique depuis les plages\n\n📍 À 250 km de Cayenne — via Saint-Laurent-du-Maroni"
        },

        // --- FAUNE ---
        {
            keys: ['animal','faune','jaguar','tapir','singe','oiseau','anaconda','piranha','arapaima','pirourou','caiman','fourmilier','loutre','aigle','harpie','perroquet','toucan','ara'],
            reply: "🦁 Faune exceptionnelle de Guyane :\n🦅 Oiseaux (700+ espèces) :\n• Aigle Harpie (le plus grand d'Amérique)\n• Ara rouge et ara ararauna\n• Toucan toco, perroquets amazones\n• Ibis rouge (marais de Kaw)\n• Spatule rosée, héron cocoi\n\n🐾 Mammifères :\n• Jaguar, puma, ocelot\n• Tapir d'Amazonie\n• Grand fourmilier, paresseux à deux et trois doigts\n• 8 espèces de singes : hurleur, araignée, capucin, tamarin...\n• Loutre géante (jusqu'à 2 m !)\n• Dauphin de Guyane (côte)\n\n🐍 Reptiles : anaconda vert, boa, caimans noirs et communs\n🐟 Poissons : arapaima/pirarucu (4m, 250kg), piranha, raie pastenague"
        },

        // --- FLORE ---
        {
            keys: ['plante','flore','arbre','végétation','orchidée','palmier','lianes','forêt tropicale','canopée'],
            reply: "🌿 Flore de Guyane — une richesse incroyable :\n• 5 500+ espèces végétales recensées (dont beaucoup endémiques)\n• Canopée à 30-45 m de hauteur\n• Arbres géants : Angélique (Dicorynia guianensis, jusqu'à 50 m), Wapa, Gonfolo, Mahoganis\n• Palmiers : wassaï (açaï), awara, palmiste-chou, inaja\n• 700+ espèces d'orchidées\n• Broméliacées et épiphytes couvrant les troncs\n• Plantes médicinales utilisées par les communautés traditionnelles\n• Espèces carnivores : Heliamphora, Drosera\n• Aquatique : Victoria amazonica (nénuphar géant)\n\n🌱 La forêt guyanaise capte environ 800 millions de tonnes de CO² — un poumon de la planète."
        },

        // --- VOL & TRANSPORT ---
        {
            keys: ['vol','avion','paris','transport','arriver','depuis','air france','air caraïbes','aéroport','billet','felix eboué','rochambeau'],
            reply: "✈️ Comment venir en Guyane :\n• Aéroport : Félix Eboué (Matoury, 15 min de Cayenne)\n• Depuis Paris-Orly : vol direct 8h30 — Air France & Air Caraïbes (2-3 vols/jour)\n• Depuis Martinique (Fort-de-France) : ~1h de vol, jusqu'à 2 vols/jour\n• Depuis Guadeloupe (Pointe-à-Pitre) : via Fort-de-France, 2 vols/jour\n• Depuis le Brésil : Belém et Fortaleza — 1 vol/semaine Air France\n\n🚗 Sur place :\n• Location de voiture recommandée\n• RN1 (Cayenne-Saint-Laurent) et RN2 (Cayenne-Saint-Georges)\n• Taxis brousses (liaisons entre villes)\n• Pirogues sur les fleuves\n• Air Guyane : vols intérieurs vers l'intérieur (Maripasoula, Saül, Camopi)\n\n✅ Aucun visa requis — passeport ou carte d'identité"
        },

        // --- TRANSPORT INTÉRIEUR ---
        {
            keys: ['pirogue','bateau','taxi brousse','location voiture','transport local','se déplacer','intérieur','voiture','conduire','route'],
            reply: "🚗 Se déplacer en Guyane :\n• Voiture de location : INDISPENSABLE pour explorer (Cayenne, Kourou, côte)\n  Comptez 40-80 €/jour. Permis de conduire français accepté.\n• RN1 : Cayenne → Kourou → Sinnamary → Saint-Laurent (route principale)\n• RN2 : Cayenne → Roura → Regina → Saint-Georges (route de l'Est)\n• Taxi brousse : minibus collectifs entre villes (moins cher)\n• 🛶 Pirogue : transport essentiel sur les fleuves vers l'intérieur\n• ✈️ Air Guyane : vols intérieurs (Maripasoula, Saül, Grand-Santi, Camopi)\n  - Comptez 100-250 € l'aller\n• Pas de train en Guyane\n• Pas de réseau routier dans le Parc Amazonien : pirogue ou avion uniquement"
        },

        // --- VISA & DOCUMENTS ---
        {
            keys: ['visa','passeport','document','papier','formalité','carte identité','douane','frontieres','entrer'],
            reply: "📋 Documents et formalités :\n• Ressortissants français et européens : carte d'identité suffisante\n• La Guyane est un département français — aucun visa requis depuis l'UE\n• Douane française (règles européennes)\n• Pour entrer au Suriname (Saint-Laurent) : passeport valide obligatoire\n• Pour entrer au Brésil (Saint-Georges) : passeport valide obligatoire\n• Pour accéder aux zones amérindiennes du Parc Amazonien : autorisation spéciale délivrée en préfecture\n• Pas de vaccination obligatoire préalable à l'entrée, mais fièvre jaune fortement recommandée\n\n💡 Conseil : prenez votre passeport même si vous restez en Guyane — utile pour certaines excursions"
        },

        // --- SANTÉ ---
        {
            keys: ['santé','vaccin','vaccination','fièvre jaune','moustique','maladie','paludisme','dengue','médecin','hôpital','pharmacie','urgence','samu'],
            reply: "🏥 Santé en Guyane :\n\n💉 Vaccinations :\n• OBLIGATOIRE avant l'entrée : fièvre jaune (valable à vie depuis 2016)\n• Recommandés : hépatites A et B, typhoïde, méningite, rage (pour aventuriers)\n• Consultez votre médecin 4-6 semaines avant le départ\n\n🦟 Moustiques :\n• Protection INDISPENSABLE : répulsif DEET 50% ou icaridine\n• Manches longues et pantalons longs le soir\n• Risque de paludisme en forêt (prophylaxie recommandée)\n• Dengue, chikungunya et zika présents\n\n🏨 Structures médicales :\n• Centre Hospitalier A. Rosemon (Cayenne) — principal hôpital\n• Urgences à Kourou et Saint-Laurent\n• Pharmacies bien approvisionnées dans les villes\n• Numéros : SAMU 15 / Police 17 / Pompiers 18 / Urgence européen 112"
        },

        // --- BUDGET ---
        {
            keys: ['budget','prix','euro','argent','coût','cher','monnaie','combien','dépenser','finance'],
            reply: "💰 Budget pour la Guyane :\n• Monnaie : Euro (€) — même prix qu'en métropole voire plus cher\n\n📊 Budget global (source officielle guyane-amazonie.fr) :\n• 1 500 à 2 500 €/personne (hors billet d'avion) pour 1 semaine\n  → Inclut hébergement + voiture + repas + activités\n\n📅 Budget journalier :\n• Budget serré : 50-80 €/jour (carbet, gargote locale)\n• Budget moyen : 80-130 €/jour (hôtel 2*, resto, activités)\n• Budget confort : 150 €+/jour\n\n🏨 Hébergement :\n• Carbet/hamac en forêt : 15-40 €/nuit\n• Gîte/chambre d'hôte : 40-80 €/nuit\n• Hôtel correct : 60-120 €/nuit\n\n🍽️ Restauration :\n• Gargote créole / snack : 8-15 €\n• Restaurant : 20-40 €\n• Supermarché : prix 15-30% plus élevés qu'en métropole\n\n🚗 Location voiture : 40-80 €/jour — indispensable"
        },

        // --- MÉTÉO & SAISONS ---
        {
            keys: ['météo','saison','pluie','quand partir','quand y aller','période','sèche','humide','climat','température','chaleur','saison des pluies'],
            reply: "🌡️ Climat équatorial de la Guyane :\n\n☀️ Grande saison sèche : juillet à mi-novembre\n→ Meilleure période pour visiter — idéale pour tous les types de voyage\n→ Septembre & octobre : les mois les plus ensoleillés de l'année !\n\n🌦️ Petite saison des pluies : mi-novembre à début février\n→ Quelques averses, reste agréable\n\n🌤️ Petite saison sèche : mi-février à mi-mars\n→ Courte fenêtre favorable\n\n🌧️ Grande saison des pluies : mi-mars à fin juin\n→ Pluies abondantes, fleuves gonflés, forêt plus difficile d'accès\n\n🌡️ Températures : 24-32°C toute l'année. Humidité : 80-90%\n\n💡 Spécifique :\n• 🐢 Tortues luth : avril-août (ponte), juillet-octobre (éclosions)\n• 🎭 Carnaval : janvier-février (grande saison des pluies !)\n• 🐦 Oiseaux migrateurs : saison des pluies (mars-juillet)\n\n(Source : guyane-amazonie.fr — site officiel du tourisme guyanais)"
        },

        // --- HÔTELS CAYENNE ---
        {
            keys: ['hôtel','hotel','hébergement','logement','dormir','séjour','nuit','auberge','lodge','résidence','chambre','hôtel cayenne','hotel cayenne'],
            reply: "🏨 Hôtels en Guyane — liste complète :\n\n━━ 🏙️ CAYENNE & ENVIRONS ━━\n★★★★ Novotel Cayenne (Rémire-Montjoly)\n  → Piscine, plage privée, restaurant, spa | ~120-180€/nuit\n  📍 Ave du Général de Gaulle, Rémire-Montjoly\n\n★★★★ Hôtel Le Mahury (Matoury)\n  → Proche aéroport (10 min), moderne, piscine | ~100-150€/nuit\n\n★★★ Hôtel Mercure Cayenne\n  → Chaîne internationale, confort fiable | ~110-160€/nuit\n  📍 rue François Arago, Cayenne\n\n★★★ Hôtel Amazonia (centre Cayenne)\n  → Bon rapport qualité/prix, central | ~70-100€/nuit\n\n★★★ Katoury Tropical Suites\n  → Suites tout équipées, cadre soigné | ~90-130€/nuit\n\n★★★ Hôtel Le Toucan (Rémire-Montjoly)\n  → Piscine, calme, proche mer | ~80-110€/nuit\n\n★★ Hôtel Central (Cayenne)\n  → En cœur de ville, pratique | ~60-90€/nuit\n  📍 Rue Christophe Colomb\n\n★★ Hôtel des Palmistes (Cayenne)\n  → Place des Palmistes, emplacement idéal | ~55-80€/nuit\n\n★★ Hôtel Beausoleil\n  → Quartier calme de Cayenne | ~50-70€/nuit\n\n★ Hôtel de la Guyane\n  → Économique, fonctionnel | ~45-65€/nuit\n\n━━ 🚀 KOUROU ━━\n★★★ Hôtel Mercure Kourou Ariatel\n  → Piscine, restaurant, confort 3★ | ~90-130€/nuit\n\n★★★ Hôtel des Roches\n  → Face à la mer, ambiance balnéaire | ~80-120€/nuit\n  📍 Route des Roches, Kourou\n\n★★ Hôtel Malvina\n  → Centre-ville, simple et propre | ~60-80€/nuit\n\n★★ Hôtel La Malouine\n  → Calme, proche centre | ~55-75€/nuit\n\n★ Le Ballahou (Kourou)\n  → Restaurant + chambres, vue sur mer | ~50-70€/nuit\n\n━━ 🏛️ SAINT-LAURENT-DU-MARONI ━━\n★★★ Hôtel La Tentiaire\n  → Jardin tropical, calme, restaurant | ~70-100€/nuit\n\n★★ Hôtel Star\n  → Central, bon rapport qualité/prix | ~60-90€/nuit\n\n★★ Hôtel Le Toucan (Saint-Laurent)\n  → Vue sur le Maroni, terrasse | ~65-85€/nuit\n\n★ Hôtel Amazone\n  → Simple et fonctionnel | ~40-60€/nuit\n\n━━ 🏝️ ÎLES DU SALUT ━━\n• Auberge des Îles du Salut (Île Royale)\n  → UNIQUE hébergement sur l'archipel | ~50-80€/nuit\n  ⚠️ Réservation obligatoire longtemps à l'avance !\n\n━━ 🌿 AUTRES VILLES ━━\n• Saint-Georges-de-l'Oyapock : Hôtel Modestine, gîtes\n• Maripasoula : Gîte du Fleuve, carbets\n• Grand-Santi : hébergements chez l'habitant bushinengue\n\n📅 Booking.com, Airbnb, Expedia — tous actifs en Guyane\n💡 Réservez toujours à l'avance hors Cayenne !"
        },

        // --- APART-HÔTELS & RÉSIDENCES ---
        {
            keys: ['apart','appart','apart-hôtel','appart-hôtel','appartement','résidence hôtelière','studio','meublé','location saisonnière','airbnb','booking'],
            reply: "🏢 Apart-hôtels & résidences en Guyane :\n\nIdéal pour les séjours longs ou en famille — cuisine équipée, plus d'espace, prix souvent plus bas.\n\n🏙️ Cayenne :\n• Eden Suite Hôtel (Rémire-Montjoly) — appartements tout équipés, piscine, ~80-130€/nuit\n• Résidence Caraïbes (Cayenne) — studios et T2, ~60-90€/nuit\n• Résidence La Promenade — central, séjours semaine ou mois\n• Green Résidence (Rémire) — calme, équipé, ~70-100€/nuit\n• Studios et appartements via Airbnb / Booking.com — nombreuses offres\n\n🚀 Kourou :\n• Résidence Ariatel — studios et appartements, ~70-100€/nuit\n• Appartements privés via agences locales (Century 21, Laforêt)\n\n🏛️ Saint-Laurent-du-Maroni :\n• Locations meublées courte durée disponibles\n\n💡 Conseils :\n• Pour 1 semaine+ : l'apart-hôtel revient souvent 20-30% moins cher qu'un hôtel classique\n• Cherchez aussi sur Leboncoin.gf (site local) pour des offres non listées ailleurs\n• Agence Guyane Habitation pour locations longue durée"
        },

        // --- GÎTES & CARBETS ---
        {
            keys: ['gîte','carbet','hamac','forêt dormir','lodge éco','camp','bivouac','saül dormir','hébergement forêt','village nuit'],
            reply: "🌿 Gîtes & carbets en Guyane :\n\nLe carbet est le mode d'hébergement traditionnel en forêt — structure ouverte sous laquelle on suspend son hamac.\n\n🌿 En forêt :\n• Carbet simple avec hamac : 15-30€/nuit\n• Gîte forestier (dortoir ou chambre) : 30-60€/nuit\n• Lodge éco-touristique (confort++): 80-150€/nuit\n\n🏘️ Principaux hébergements par zone :\n• Saül : Gîte de la Montagne, Gîte Les Cascades, Gîte Nathalie, Carbet des Roches (~30-60€)\n• Marais de Kaw : Carbet chez Hector, Carbet Amazonia (~25-45€)\n• Maroni (Saint-Laurent) : Carbet Toucan, séjours chez l'habitant bushinengue\n• Îles du Salut : Auberge des Îles + camping possible (hamac sur l'île)\n• Cacao : Gîtes privés (~40-60€), nuit chez l'habitant hmong\n\n💡 Ce qu'il faut apporter :\n• Votre hamac (ou louez-le sur place)\n• Draps ou sac de couchage léger\n• Répulsif moustiques indispensable\n• Lampe frontale"
        },

        // --- LIEUX TOURISTIQUES ---
        {
            keys: ['lieu touristique','site touristique','attraction','curiosité','visite','monument','point intérêt','que voir','quoi voir','incontournable','tourisme'],
            reply: "🗺️ Les grands lieux touristiques de Guyane :\n\n🚀 Nord-Ouest :\n1. Centre Spatial Guyanais (Kourou) — musée gratuit + visites guidées + lancements\n2. Îles du Salut (archipel) — bagne historique, singes, snorkeling\n3. Zoo de Guyane (Macouria) — faune amazonienne\n\n🏙️ Cayenne :\n4. Marché central — le matin, incontournable\n5. Fort Cépérou — panorama sur la ville\n6. Place des Palmistes — cœur de la cité\n7. Musée Alexandre-Franconie — histoire naturelle\n8. Musée des Cultures Guyanaises\n9. Plage de Montjoly — tortues la nuit (avr-août)\n\n🌿 Nature & Intérieur :\n10. Marais de Kaw — caimans, oiseaux, pirogue nocturne\n11. Parc Amazonien — Saül (randonnées), Maripasoula (fleuves)\n12. Barrage de Petit-Saut — lac immense, faune aquatique\n13. Village de Cacao — marché hmong du dimanche\n14. Iracoubo — église aux fresques extraordinaires (abbé Gobin)\n15. Awala-Yalimapo — plage de ponte des tortues luth\n16. Pont de l'Oyapock — frontière franco-brésilienne\n17. Saint-Laurent-du-Maroni — Camp de la Transportation classé\n\n💡 Combien de temps ? Minimum 10 jours pour voir les essentiels."
        },

        // --- SITES NATURELS DÉTAILLÉS ---
        {
            keys: ['montagne','sommet','cascade','chute eau','rocher','grottes','savane','saül paysage','nouragues','mitaraka','monts tumuc'],
            reply: "⛰️ Sites naturels remarquables en Guyane :\n\n🏔️ Reliefs :\n• Monts Tumuc-Humac (frontière brésilienne) — point culminant : Bellevue de l'Inini (851m)\n• Monts Atachi-Bakka (Suriname) — randonnée épique\n• Montagne de Kaw (90 km de Cayenne) — vue sur les marais\n• Montagne du Mahury (Cayenne) — sentier 2h, accessible\n\n💧 Cascades :\n• Cascades Voltaire (Saül) — magnifiques, 2h de trek\n• Saut Athanase (Maroni)\n• Saut Sonnelle (Approuague)\n• Saut Maripa (côté brésilien, Saint-Georges)\n\n🌿 Zones sauvages :\n• Réserve naturelle des Nouragues — biodiversité record, accès scientifique\n• Mitaraka — expédition extrême, frontière brésilienne\n• Savane Matiti (Kourou) — paysage unique de savane ouverte\n• Savane Sarcelle (Approuague)\n\n🦅 Observation de la nature :\n• Marais de Kaw : ibis rouges au lever du soleil\n• Nuit en forêt : daguets, tapirs, agoutis, escargots géants\n• Plages nocturnes : tortues luth (mai-juin peak)"
        },

        // --- MUSÉES & PATRIMOINE ---
        {
            keys: ['musée','patrimoine','monument','historique','culture','exposition','visite culturelle','art','galerie','mémorial'],
            reply: "🏛️ Musées et patrimoine culturel en Guyane :\n\n🏙️ À Cayenne :\n• Musée Alexandre-Franconie : histoire naturelle, ethnographie amérindienne et bushinengue — entrée ~5€\n• Musée des Cultures Guyanaises : expositions thématiques sur les peuples de Guyane\n• Espace Georg Friedrich Händel : musique et spectacles\n• Maison des Cultures de l'Oral (MCO)\n• Maison du Bagne (archives, photos d'époque)\n\n🚀 À Kourou :\n• Musée de l'Espace (CSG) : collection de fusées, histoire spatiale — GRATUIT\n• Musée Historique de Kourou\n\n🏛️ À Saint-Laurent-du-Maroni :\n• Camp de la Transportation — monument historique classé, visites guidées quotidiennes (~5€)\n• Musée du Bagne — témoignages, objets des forçats\n• Centre d'Interprétation de l'Architecture et du Patrimoine (CIAP)\n\n🎨 Autres sites patrimoniaux :\n• Église d'Iracoubo (fresques de l'abbé Gobin) — gratuit\n• Vestiges des Îles du Salut (quartiers disciplinaires, chapelle)\n• Fort Cépérou (Cayenne) — ruines, vue panoramique\n• Église Saint-Sauveur de Cayenne (XIXe siècle)"
        },

        // --- GASTRONOMIE ---
        {
            keys: ['manger','nourriture','gastronomie','cuisine','spécialité','colombo','awara','bouillon','plat','fruit','épice','rhum','ti-punch'],
            reply: "🍽️ La cuisine guyanaise — fusion de cultures :\n\n🍲 Plats créoles incontournables :\n• Bouillon d'awara : LE plat traditionnel (Pâques), palmiste awara + viandes + légumes\n• Pimentade : poisson fumé ou viande marinée au piment\n• Matété de crabe : riz au crabe et épices\n• Féroce d'avocat : avocat, morue salée, manioc, piment fort\n• Couac : farine de manioc torréfiée, accompagnement universel\n\n🌶️ Plats antillais & créoles :\n• Colombo de poulet, de cabri ou de crevettes\n• Accras de morue (beignets frits)\n• Grillades marinées au piment et citron vert\n• Blaff de poissons\n\n🍣 Produits locaux :\n• Poissons amazonniens : coumarou, aïmara, matrincha, coumarou\n• Crevettes sauvages de l'Atlantique (délicieuses !)\n• Gibier : paca, agouti, biche de Guyane\n• Fruits tropicaux : corossol, carambole, sapotille, pawpaw, tamarin, fruit du dragon\n\n🌏 Cuisines des communautés :\n• Cuisine hmong : nem, bò bún, soupes asiatiques (Cacao)\n• Cuisine brésilienne : feijoada, churrasco (Saint-Georges)\n• Cuisine surinamaise et bushinengue (Saint-Laurent)\n• Cuisine haïtienne (Cayenne)\n\n🍹 Boissons :\n• Rhum blanc agricole guyanais — le meilleur souvenir !\n• Ti-punch, planteur, shrubb\n• Jus de fruits frais : corossol, tamarin, grenadine locale"
        },

        // --- RESTAURANTS ---
        {
            keys: ['restaurant','resto','où manger','table','dîner','déjeuner','brasserie','snack','gargote','traiteur','pizzeria','bonne table'],
            reply: "🍴 Restaurants en Guyane :\n\n━━ 🏙️ CAYENNE ━━\n🥇 Gastronomique / Cuisine créole raffinée :\n• La Villa Créole ⭐ — cuisine créole gastronomique, cadre colonial ~25-45€/pers\n• Restaurant Le Phare — fruits de mer, poissons amazonniens, vue mer ~25-40€\n• La Riviera — cuisine franco-créole soignée ~30-50€\n• Restaurant La Terrasse — terrasse agréable, carte créole ~20-35€\n\n🍽️ Cuisine locale & créole :\n• Chez Félicia — gargote créole authentique, incontournable ~10-18€\n• La Case Créole — plats du jour créoles copieux ~10-15€\n• O'Bon Morceau — cuisine guyanaise familiale ~12-20€\n• Chez Paulette — gargote mythique, bouillon d'awara ~8-15€\n• Restaurant du Marché — au cœur du marché central ~10-18€\n\n🍕 Brasserie / International :\n• La Coupole — brasserie française, viandes, salades ~20-35€\n• Le Bistrot Tropical — menu midi, cuisine du monde ~15-25€\n• La Brasserie — cadre agréable, carte variée ~18-30€\n• Le Galion — fruits de mer, homards ~30-55€\n• Restaurant Le Saint-Georges — cuisine internationale ~20-35€\n\n🌏 Cuisines du monde :\n• Golden Dragon / Saveurs d'Asie — cuisine chinoise ~12-22€\n• Grand Wok — cuisine asiatique, buffets ~14-20€\n• Le Palmier d'Or — cuisine asiatique, service rapide ~10-18€\n• Restaurant brésilien (Quartier chaud) — churrasco, feijoada ~15-25€\n• Pizza & Pasta (plusieurs adresses) ~12-20€\n\n🍹 Bars & snacks :\n• Snack Tchi Tchi — Cayenne, rapide et bon marché\n• Nombreux food trucks autour de la Place des Palmistes (soir)\n\n━━ 🚀 KOUROU ━━\n• Le Ballahou — cuisine créole & grillades, face à la plage ~20-35€\n• Restaurant des Roches (Hôtel des Roches) — poissons, fruits de mer ~25-40€\n• Brasserie du Marché — cuisine locale, menu midi ~12-20€\n• Restaurant L'Amazonie — créole et international ~18-28€\n• La Caravelle — cuisine créole traditionnelle ~15-25€\n• La Kaz Créole — ambiance locale, plats du jour ~10-18€\n• Chez Antoinette — gargote, cuisine maison ~8-15€\n\n━━ 🏛️ SAINT-LAURENT-DU-MARONI ━━\n• Restaurant Le Central — cuisine créole ~15-25€\n• La Goélette — vue sur le Maroni, poissons ~20-30€\n• La Bonne Marmite — cuisine maison, copieuse ~10-18€\n• Restaurant Le Grillon — gargote locale ~8-15€\n• Restaurant Chez Coyotte — créole, ambiance locale ~12-20€\n\n━━ 🌸 CACAO (Dimanche uniquement) ━━\n• Restauration hmong sur le marché du dimanche matin\n  - Soupes pho, nems, bò bún, pâtisseries asiatiques\n  - Cuisine créole-asiatique fusion\n  - Prix très raisonnables : 5-15€\n\n💡 Conseils pratiques :\n• Beaucoup de restaurants ferment le dimanche et le lundi\n• Réservez le soir pour les restaurants gastronomiques\n• Les gargotes créoles servent souvent midi uniquement\n• Le marché de Cayenne (matin) propose de la cuisine sur place"
        },

        // --- RESTAURANTS PAR TYPE ---
        {
            keys: ['restaurant créole','cuisine créole','resto créole','gastronomie locale','spécialité locale','où manger créole','bouillon awara restaurant'],
            reply: "🍲 Meilleurs restaurants créoles en Guyane :\n\n🥇 Incontournables à Cayenne :\n• La Villa Créole — référence gastronomique créole, cadre raffiné, ~25-45€\n• Chez Félicia — authentique gargote créole depuis des années, bouillons, poissons ~10-18€\n• Chez Paulette — le bouillon d'awara de Pâques est légendaire\n• La Case Créole — plats du jour copieux et savoureux\n• O'Bon Morceau — pimentade, matété de crabe, féroce d'avocat ~12-20€\n\n🍽️ À Kourou :\n• La Kaz Créole — plats traditionnels, prix raisonnables\n• Chez Antoinette — cuisine maison, accueil chaleureux\n\n🏛️ À Saint-Laurent :\n• La Bonne Marmite — cuisine guyanaise copieuse\n• Restaurant Le Grillon — gargote locale authentique\n\n💡 Le plat créole par excellence : le bouillon d'awara (uniquement à Pâques !)\nPour goûter au quotidien : féroce d'avocat, matété de crabe, pimentade."
        },

        // --- MARCHÉS ALIMENTAIRES ---
        {
            keys: ['marché','marché central','marché cayenne','marché cacao','marché saint-laurent','fruits marché','légumes','épicerie','supermarché'],
            reply: "🛒 Marchés et alimentation en Guyane :\n\n🥭 Marché central de Cayenne :\n• Ouvert tous les matins (lundi-samedi : 5h-12h, dimanche : 5h-10h)\n• Fruits tropicaux exotiques : corossol, carambole, sapotille, piment\n• Poissons amazonniens frais : aïmara, coumarou, matrincha\n• Crevettes de l'Atlantique (fraîches ou séchées)\n• Épices : colombo, bois d'Inde, piment lampion\n• Artisanat, huiles essentielles, plantes médicinales\n• Restauration sur place : gargotes créoles (~8-12€)\n\n🌸 Marché de Cacao (dimanche matin uniquement) :\n• 8h-12h — arrivez tôt !\n• Produits maraîchers hmong ultra-frais\n• Cuisine asiatique-créole : nems, soupes, pâtisseries\n• Broderies et artisanat hmong\n• Cadre forestier magnifique\n\n🏛️ Marché de Saint-Laurent-du-Maroni :\n• Marché Saint-Antoine — épices, fruits, artisanat bushinengue\n• Produits surinamais introuvables ailleurs\n\n🏪 Grandes surfaces :\n• Leclerc Cayenne — le plus grand hypermarché\n• Carrefour Market (Cayenne, Kourou)\n• Leader Price, Champion (réseau local)\n• Prix souvent 15-30% plus élevés qu'en métropole"
        },

        // --- CARNAVAL ---
        {
            keys: ['carnaval','carnival','fête','touloulou','toulou','masque','déguisement','vidé','kaseko','mardi gras','fêtes'],
            reply: "🎭 Le Carnaval de Guyane :\n• Le plus long carnaval de France ! De décembre à mi-mars (Mardi Gras)\n• Unique et très différent du carnaval de Rio ou de Venise\n\n🌟 Les grandes figures :\n• Touloulous : femmes entièrement masquées et costumées qui choisissent seules leurs cavaliers dans les bals\n• Démoniaks : groupes en noir avec satire politique et sociale\n• Nèg'marron : hommes enduits de mélasse et couverts de feuilles\n• Pantalon-Caleçon et Marianne Lamentin (Mardi Gras)\n• Bubus (mercredi des Cendres) : enterrement du carnaval\n\n🥁 Musique : kaseko, zouk, bèlè, gwo-ka\n\n📅 Calendrier :\n• Soirées touloulous : chaque samedi soir (salles de bal)\n• Vidé (défilés de rue) : dimanche après-midi\n• Grand Vidé : Mardi Gras (apogée)\n\nC'est L'événement culturel incontournable de la Guyane !"
        },

        // --- CULTURE & ARTS ---
        {
            keys: ['culture','art','artisanat','musique','zouk','kaseko','tradition','patrimoine','musée','exposition'],
            reply: "🎨 Culture et arts de Guyane :\n\n🎵 Musique :\n• Kaseko : musique des Bushinengues, très rythmée\n• Zouk : influence antillaise\n• Bèlè et gwo-ka : traditions africaines créolisées\n• Awasa : danse des Bushinengues\n• Musique amérindienne : chants rituels, flûtes\n\n🎨 Arts visuels et artisanat :\n• Sculpture sur bois bushinengue (motifs géométriques très travaillés)\n• Broderies et batiks hmong (multicolores)\n• Poterie amérindienne\n• Peintures de l'abbé Gobin (église d'Iracoubo)\n• Art contemporain guyanais (artistes locaux)\n\n🏛️ Musées :\n• Musée Alexandre-Franconie (Cayenne)\n• Musée des Cultures Guyanaises (Cayenne)\n• Camp de la Transportation (Saint-Laurent)\n• Espace Georg Friedrich Händel (Cayenne) — musique\n\n🌐 La Guyane est membre de l'OTCA (Organisation du Traité de Coopération Amazonienne)"
        },

        // --- SPORTS & ACTIVITÉS ---
        {
            keys: ['activité','sport','kayak','canoe','pêche','randonnée','surf','plongée','snorkeling','vélo','escalade','quad','4x4','golf'],
            reply: "🏄 Activités et sports en Guyane :\n\n🌿 Nature & Aventure :\n• Randonnée en forêt (Saül, Roura, Montagne de Kaw)\n• Kayak et canoë sur les fleuves et marais\n• Pirogue traditionnelle sur le Maroni et l'Oyapock\n• 4x4 sur les pistes forestières\n• Observation des oiseaux (700+ espèces)\n• Photographie animalière\n• Gold panning touristique (chercher de l'or)\n\n🌊 Mer & eau :\n• Snorkeling aux Îles du Salut\n• Pêche sportive côtière (barracuda, thon, voilier)\n• Pêche fluviale (piranha, aïmara, coumarou)\n• Surf sur les plages de Cayenne (Montjoly)\n• Kitesurf sur la côte\n\n🌙 Nocturne :\n• Sorties caïmans dans les marais de Kaw\n• Observation des tortues luth la nuit\n• Safari photographique nocturne en forêt\n\n🎭 Culturel :\n• Danses créoles et bushinengues\n• Cours de cuisine guyanaise\n• Visite de villages amérindiens"
        },

        // --- OR & MINES ---
        {
            keys: ['or','mine','orpaillage','garimpo','garimpeiro','orpailleur','chercheur d\'or','opération harpie','or illégal'],
            reply: "⛏️ L'or en Guyane :\n• La Guyane possède d'importants gisements aurifères\n• Histoire : ruée vers l'or depuis le XVIIe siècle\n• Orpaillage légal : sociétés minières encadrées (SARROM, etc.)\n• Orpaillage illégal (garimpo) : fléau majeur\n  - 15 000+ garimpeiros (orpailleurs brésiliens illégaux) estimés\n  - Dégâts environnementaux : mercure dans les rivières, déforestation\n  - Opération Harpie : opération militaire permanente pour lutter contre l'orpaillage illégal\n• Musée du BRGM à Cayenne : exposition sur la géologie guyanaise\n• Tourisme minier : visites de sites légaux possibles\n• Achat d'or artisanal en boutiques (bijouteries créoles)\n\n⚠️ Les zones d'orpaillage illégal sont dangereuses — évitez-les absolument."
        },

        // --- ÉCONOMIE ---
        {
            keys: ['économie','industrie','emploi','richesse','pib','développement','spatial','pêche','agriculture','bois','forêt économie'],
            reply: "📊 Économie de la Guyane :\n• PIB/habitant : ~23 000 € (supérieur aux pays voisins mais inférieur à la métropole)\n• Chômage élevé : ~22% (inégalités fortes)\n\n🏭 Principaux secteurs :\n• 🚀 Industrie spatiale (CSG) : premier moteur économique, 15% du PIB direct\n• 🐟 Pêche : crevettes, poissons (exportations importantes)\n• 🌱 Agriculture : maraîchage (Hmong), élevage, fruits tropicaux\n• 🌳 Exploitation forestière limitée (sous contrôle strict)\n• 🏛️ Secteur public : employeur majeur (administrations, armée)\n• ⛏️ Mines : or et bauxite (exploitation légale croissante)\n• 🌿 Éco-tourisme : secteur en développement\n\n💡 La Guyane reçoit d'importants transferts de l'État français (dotations, investissements)"
        },

        // --- ÉLECTRICITÉ & PRATIQUE ---
        {
            keys: ['électricité','prise','voltage','ampere','chargeur','adaptateur','téléphone','internet','wifi','réseau mobile','4g','5g'],
            reply: "🔌 Infos pratiques électricité & télécoms :\n\n⚡ Électricité :\n• 220V / 50 Hz — identique à la France métropolitaine\n• Prises de type E (rondes à 2 broches + terre) — même qu'en France\n• Aucun adaptateur nécessaire pour les appareils français\n\n📱 Téléphone & Internet :\n• Réseaux français : Orange, SFR, Bouygues, Free — couverture correcte en zone urbaine et le long des routes\n• Roaming européen inclus dans la plupart des forfaits (vérifiez les DOM)\n• 4G disponible à Cayenne, Kourou, Saint-Laurent\n• Dans l'intérieur et en forêt : PAS de réseau (ni téléphone, ni internet)\n• WiFi dans les hôtels et restaurants des villes\n• Cartes SIM locales disponibles (Orange Caraïbes)"
        },

        // --- SÉCURITÉ ---
        {
            keys: ['sécurité','danger','safe','sûr','criminalité','vol','arnaque','risque','délinquance','quartier','conseil sécurité'],
            reply: "🔒 Sécurité en Guyane :\n\n✅ Zones généralement sûres pour les touristes :\n• Îles du Salut, Kourou (zones touristiques)\n• Village de Cacao, Saül\n• Zone côtière nord\n\n⚠️ Précautions à Cayenne :\n• Évitez les quartiers Saint-Roch et certains secteurs la nuit\n• Ne laissez rien en vue dans votre voiture\n• Vigilance au marché (pickpockets)\n• Préférez les taxis officiels la nuit\n\n🚫 Zones dangereuses :\n• Pistes d'orpaillage illégal (garimpo) — à éviter absolument\n• Zones frontalières sauvages sans guide\n\n📞 Urgences :\n• SAMU : 15 | Police : 17 | Pompiers : 18\n• Urgences européen : 112\n• Ambassade de France : déjà en France 🙂\n\nGlobalement, la Guyane est plus sûre que certains pays voisins pour un voyageur raisonnable."
        },

        // --- SOUVENIRS & SHOPPING ---
        {
            keys: ['souvenir','cadeau','achat','boutique','artisanat','rapporter','ramener','shopping'],
            reply: "🛍️ Souvenirs et achats en Guyane :\n\n🎨 Artisanat local :\n• Sculptures sur bois bushinengues (panneaux, bols, ceintures gravées)\n• Broderies et batiks Hmong (marché de Cacao — incontournable)\n• Bijoux en or guyanais\n• Poteries amérindiennes\n• Hamacs tissés traditionnels\n• Paniers et vannerie\n\n🍫 Produits alimentaires :\n• Rhum agricole de Guyane\n• Épices locales (colombo, bois d'Inde)\n• Miel de forêt amazonienne\n• Confitures de fruits tropicaux (corossol, carambole)\n• Chocolat artisanal au cacao guyanais\n\n🛒 Où acheter ?\n• Marché de Cayenne (meilleur rapport qualité/prix)\n• Marché de Cacao (dimanche matin)\n• Boutiques artisanales du centre de Cayenne\n• Marché de Saint-Laurent-du-Maroni\n• Boutique du CSG (produits dérivés espace)"
        },

        // --- CARTES & ADMINISTRATION ---
        {
            keys: ['communes','ville','mairie','administration','préfecture','sous-préfecture','commune','ville guyane','liste des villes'],
            reply: "🏘️ Les communes de Guyane (22 au total) :\n\n Littoral & nord :\nCayenne (préfecture), Matoury, Rémire-Montjoly, Montsinéry-Tonnégrande, Roura, Mana, Saint-Laurent-du-Maroni, Awala-Yalimapo\n\n Centre-nord :\nKourou, Sinnamary, Iracoubo, Saint-Élie\n\n Est :\nRégina, Saint-Georges-de-l'Oyapock, Ouanary\n\n🌿 Intérieur (accessibles uniquement par avion ou pirogue) :\nMaripasoula, Grand-Santi, Papaichton, Saül, Camopi, Maripa-Soula\n\n📋 Administration :\n• Préfecture : Cayenne\n• Sous-préfecture : Saint-Laurent-du-Maroni\n• Conseil régional et départemental (fusionnés en 2015 — CTG)\n• Représentée à l'Assemblée Nationale : 2 députés\n• Au Sénat : 2 sénateurs\n• Département 973 — Région 03"
        },

        // --- ÉDUCATION ---
        {
            keys: ['école','éducation','université','étudiant','lycée','collège','enseignement','étude'],
            reply: "🎓 Éducation en Guyane :\n• Système scolaire français identique à la métropole\n• Académie de Guyane\n• Université de Guyane (campus de Cayenne et Kourou) : ~4 000 étudiants\n• Formations : droit, économie, sciences, santé, lettres\n• IUT de Kourou\n• ESPE (formation des enseignants)\n• Difficultés scolaires importantes liées à la diversité linguistique et à l'isolement géographique\n• Taux de scolarisation encore insuffisant dans certaines communes reculées\n• École à distance (CNED) pour les zones enclavées"
        },

        // --- RELIGION ---
        {
            keys: ['religion','église','cathédrale','mosquée','temple','catholique','protestantisme','animisme','croyance','spiritualité'],
            reply: "🕌 Religions et spiritualités en Guyane :\n• Catholicisme : religion majoritaire (héritage colonial)\n  - Cathédrale Saint-Sauveur de Cayenne\n• Protestantisme en croissance (évangélisme)\n• Islam (communautés haïtienne, surinamaise)\n• Animisme amérindien : chamanes, esprits de la forêt, rites traditionnels toujours vivants\n• Religion Winti (Bushinengues) : syncrétisme africain-animiste\n• Bouddhisme (communauté Hmong et Laotienne)\n• Hindouisme (communauté surinamaise d'origine indienne)\n\nLa Guyane est un kaléidoscope spirituel unique, reflet de sa diversité culturelle exceptionnelle."
        },

        // --- EAU POTABLE ---
        {
            keys: ['eau','robinet','potable','boire','eau bouteille','déshydratation','eau rivière','soif','eau fleuves'],
            reply: "🚰 Eau en Guyane :\n• ✅ Eau du robinet potable en ville : Cayenne, Kourou, Saint-Laurent\n• Zones rurales et en forêt : eau en bouteille ou purification obligatoire\n• Rivières et fleuves : ne buvez JAMAIS sans filtration (parasites, mercure dans certains fleuves)\n• Comprimés de purification ou filtre Sawyer recommandés pour les treks\n• Hydratation essentielle : chaleur + humidité 80-90% — buvez 2-3 L/jour minimum\n\n💡 En ville : safe. En forêt : préparez toujours votre eau avant de boire."
        },

        // --- PAIEMENTS ---
        {
            keys: ['carte bancaire','paiement','payer','cb','visa','mastercard','espèces','retrait','distributeur','atm','banque','liquide','argent liquide','cash'],
            reply: "💳 Paiements et banque en Guyane :\n• Carte bancaire acceptée dans la plupart des commerces de Cayenne, Kourou, Saint-Laurent\n• Marchés, carbets, villages reculés : espèces uniquement !\n• Distributeurs automatiques (DAB/ATM) : nombreux à Cayenne, disponibles à Kourou, Saint-Laurent, Saint-Georges\n• Banques françaises présentes : BNP Paribas, Crédit Agricole, Caisse d'Épargne\n\n⚠️ En forêt et dans les villages éloignés : aucune infrastructure bancaire — emportez du cash\n💡 Retirez des espèces en euros avant de quitter les grandes villes."
        },

        // --- FUSEAU HORAIRE ---
        {
            keys: ['heure','décalage','fuseau','horaire','heure locale','gmt','utc','heure guyane','coucher soleil','lever soleil','nuit tombée'],
            reply: "🕐 Fuseau horaire de la Guyane :\n• UTC/GMT -3 (Heure de Guyane — GFT)\n\nDécalage avec Paris :\n• Heure d'hiver (oct-mars) : -4h (15h en Guyane = 19h à Paris)\n• Heure d'été (mars-oct) : -5h\n\n☀️ Spécificité équatoriale :\n• Lever du soleil : vers 6h toute l'année\n• Coucher du soleil : vers 18h toute l'année\n• Pas de changement d'heure saisonnier — les jours ne varient pas !"
        },

        // --- GUIDES & AGENCES ---
        {
            keys: ['guide','agence','excursion','organiser','réserver','accompagnateur','visite guidée','tour','opérateur touristique'],
            reply: "🧭 Guides et agences touristiques en Guyane :\n\n📞 Contacts officiels :\n• Comité du Tourisme de Guyane : tourisme-guyane.com\n• Office de Tourisme de Cayenne\n\n🏢 Agences reconnues :\n• JAL Voyages (Cayenne) — généraliste\n• Takari Tour — spécialiste forêt & fleuves\n• Guyane Discovery — éco-tourisme\n• Sêbêkô — fleuves, cultures, peuples autochtones\n\n⚠️ Guide OBLIGATOIRE pour :\n• Zone cœur du Parc Amazonien\n• Villages amérindiens\n• Sorties nocturnes aux tortues (Awala-Yalimapo)\n\n💡 Réservez 4 à 6 semaines à l'avance pour les séjours en forêt — les places sont très limitées !"
        },

        // --- FAMILLE & ENFANTS ---
        {
            keys: ['enfant','famille','bébé','gamin','bambin','voyage famille','avec enfants','enfants guyane'],
            reply: "👨‍👩‍👧 Voyager en famille en Guyane :\n\n✅ Adapté aux enfants :\n• Zoo de Guyane (Macouria, 30 min de Cayenne) — incontournable\n• Village de Cacao — marché coloré, nature accessible\n• Observation des tortues luth (dès 8 ans, en soirée encadrée)\n• Marais de Kaw en pirogue (dès 6 ans)\n• Plage de Montjoly (baignade)\n• Musée de l'Espace à Kourou (gratuit)\n\n⚠️ Points de vigilance :\n• Moustiques : répulsif adapté à l'âge (pas de DEET avant 2 ans)\n• Fièvre jaune : vaccin possible dès 9 mois (consulter le pédiatre)\n• Soleil tropical : SPF 50+ obligatoire\n• Forêt profonde : déconseillée < 6 ans"
        },

        // --- PLAGES & BAIGNADE ---
        {
            keys: ['plage','baignade','nager','mer','océan','atlantique','surf','vague','bain mer','se baigner'],
            reply: "🏖️ Plages et baignade en Guyane :\n\n🌊 Principales plages :\n• Montjoly & Rémire-Montjoly (15 min de Cayenne) : la plus fréquentée\n• Plage des Hattes (Awala-Yalimapo) : site des tortues luth\n• Plage de Kourou\n• Tonate/Macouria\n\n⚠️ À savoir :\n• L'eau de mer est souvent brune sur le littoral guyanais (sédiments de l'Amazone) — pas de turquoise !\n• Courants marins puissants — dangereux parfois, pas de surveillance permanente\n• Requins-bouledogues et méduses signalés\n\n🏝️ Pour les eaux turquoise et le snorkeling : privilégiez les Îles du Salut (bateau depuis Kourou, 45 min) — sublimes !\n🌙 Montjoly : observation des tortues luth la nuit (avr-août)"
        },

        // --- ENVIRONNEMENT ---
        {
            keys: ['environnement','déforestation','mercure','pollution','écologie','durabilité','conservation','écosystème','changement climatique'],
            reply: "🌱 Enjeux environnementaux en Guyane :\n\n🚨 Principal fléau : l'orpaillage illégal (garimpo)\n• ~15 000 garimpeiros brésiliens opèrent illégalement\n• Mercure utilisé pour extraire l'or → contamination des fleuves et poissons\n• Déforestation locale autour des chantiers\n• Opération Harpie (armée + gendarmerie) combat ce fléau en permanence\n\n✅ Forces écologiques de la Guyane :\n• 98% de couverture forestière — l'une des plus hautes au monde\n• Parc Amazonien (3,4 millions d'ha) + 8 réserves naturelles\n• Forêt guyanaise = environ 800 millions de tonnes de CO₂ stockés (poumon planétaire)\n• Politique environnementale française & européenne appliquée"
        },

        // --- SERPENTS & DANGERS ---
        {
            keys: ['serpent','araignée','insecte','venimeux','morsure','piqûre','danger forêt','blessure','fourmi','guêpe','scorpion','danger jungle'],
            reply: "⚠️ Faune potentiellement dangereuse en Guyane :\n\n🐍 Serpents :\n• Fer-de-Lance (Bothrops atrox) : le plus dangereux — portez des bottes montantes en forêt !\n• Anaconda vert : imposant mais fuyant, non dangereux sauf provocation\n• Bushmaster (Lachesis muta) : rare mais venin très puissant\n\n🕷️ Araignées :\n• Mygale de Leblond (Theraphosa blondi) : la plus grande du monde — impressionnante mais rarement agressive\n\n🐝 Insectes :\n• Fourmi Bala (Paraponera) : piqûre = 24h de douleur intense\n• Guêpes et abeilles de forêt — évitez les nids\n→ Vérifiez vos chaussures chaque matin !\n\n📞 En cas de morsure de serpent : SAMU 15 — restez calme, immobilisez le membre, ne sucez pas le venin"
        },

        // --- ZOO & PARCS ---
        {
            keys: ['zoo','jardin botanique','parc animalier','macouria','animaux captifs','zoo guyane','reserve naturelle'],
            reply: "🦁 Zoo et espaces naturels en Guyane :\n\n🌿 Zoo de Guyane (Macouria) :\n• Seul zoo de Guyane — à 30 min de Cayenne via la RN1\n• Espèces amazoniennes en cadre naturel : jaguar, tapir, caïman, anaconda, singes, paresseux...\n• Idéal pour les familles — ouvert du mardi au dimanche\n\n🌿 Réserves naturelles :\n• Réserve naturelle de Kaw-Roura (marais, oiseaux)\n• Réserve naturelle des Nouragues (biodiversité exceptionnelle)\n• Réserve naturelle de l'Amana (côte, tortues)\n• Réserve du Mont Grand Matoury (proche Cayenne)\n\n💡 Le Zoo de Guyane est souvent le meilleur endroit pour observer les espèces rares — même les locaux y vont !"
        },

        // --- PONT DE L'OYAPOCK & BRÉSIL ---
        {
            keys: ['pont oyapock','frontière brésil','oiapoque','amapá','traverser brésil','passeport brésil','brésil guyane'],
            reply: "🌉 Pont de l'Oyapock & frontière brésilienne :\n• Pont international Franco-Brésilien inauguré en 2017 (378 m)\n• Relie Saint-Georges-de-l'Oyapock (France) à Oiapoque (Brésil, Amapá)\n\n📋 Documents pour traverser :\n• Passeport valide OBLIGATOIRE (carte d'identité insuffisante)\n• Pas de visa pour les Français au Brésil (séjour < 90 jours)\n• Tamponnage du passeport côté brésilien\n\n🚗 Accès depuis Cayenne :\n• Route RN2 (4h) — parfois difficile en saison des pluies\n• Avion Air Guyane (30 min) vers Saint-Georges\n\n💡 Depuis Oiapoque vous pouvez visiter la cascade du Saut Maripa et l'Amapá brésilien."
        },

        // --- SÉCURITÉ EN FORÊT ---
        {
            keys: ['se perdre','perdus','forêt sécurité','precaution forêt','trek seul','randonnée seul','équipement forêt','bottes','matériel'],
            reply: "🌿 Conseils de sécurité en forêt guyanaise :\n\n⚠️ Règles absolues :\n• Ne jamais partir seul en forêt — toujours avec un guide ou en groupe\n• Prévenir quelqu'un de votre itinéraire et heure de retour\n• GPS ou carte IGN 1/25 000 obligatoires\n• Téléphone de secours (sans réseau en forêt, mais utile aux clairières)\n\n🎒 Équipement indispensable :\n• Bottes imperméables hautes (protection serpents)\n• Répulsif DEET 50%\n• Eau filtrée ou purifiée\n• Kit premiers secours\n• Couverture de survie\n• Machette (coupe-coupe)\n• Lampe frontale + piles de rechange\n\n📞 Urgence en forêt : essayez le 15 (SAMU) ou le 17 — prévenez toujours quelqu'un avant de partir."
        },

        // --- RÉSERVE NATURELLE TRÉSOR ---
        {
            keys: ['réserve trésor','trésor naturelle','coq de roche','coq-de-roche','rupicola','montagne kaw sentier','réserve naturelle kaw'],
            reply: "🌿 Réserve Naturelle Trésor :\n• Nichée contre les contreforts de la montagne de Kaw, à 90 km de Cayenne\n• Créée en 1993 — 7 600 ha de forêt primaire protégée\n\n🐦 L'attraction vedette : le Coq-de-roche (Rupicola rupicola)\n• Oiseau emblématique au plumage orange flamboyant\n• Le mâle effectue des parades nuptiales spectaculaires à l'aube\n• Meilleures observations : tôt le matin, en saison sèche\n\n🥾 Sentier botanique (1,7 km) :\n• Accessible sans guide (bien balisé)\n• Panneaux pédagogiques sur la flore amazonienne\n• Arbres géants, orchidées, épiphytes\n\n💡 Combinez avec le marais de Kaw (pirogue nocturne aux caimans) — même zone géographique."
        },

        // --- RANDONNÉES TOP 10 ---
        {
            keys: ['randonnée','trek','sentier','chemin','marche','balade','rando','itinéraire randonnée','trails','roche bateau','gros arbre','roche virginie','mont chauve','randonnées saül'],
            reply: "🥾 Top randonnées en Guyane (source : guyane-amazonie.fr) :\n\n🏔️ À Saül (accessible avion) :\n1. 🌊 Roche Bateau — vue panoramique sur la forêt depuis un piton rocheux (3h A/R)\n2. 🌳 Gros Arbre — géant Hura crepitans (Sablier) de 3 m de diamètre ! (2h A/R)\n3. 💧 Cascades Voltaire — chutes magnifiques en forêt dense (4h A/R)\n4. 🏔️ Belvédère de la Croix — panorama 360° sur le massif (1h30 A/R)\n5. 🌿 Sentier des Mouchoirs — biodiversité exceptionnelle (3h boucle)\n\n⛰️ Inselbergs & rochers :\n6. 🪨 Roche Virginie (Régina/Regina) — inselberg émergent, vue canopée au lever du soleil ★★★\n7. 🪨 Mont Chauve (Oyapock) — inselberg spectaculaire, roche nue immense\n8. 🪨 Rocher de Virginie (Kaw) — vue sur les marais depuis les hauteurs\n\n🌿 Côte & forêts accessibles :\n9. 🌿 Sentier Trésor (Kaw) — 1,7 km botanique, coq-de-roche\n10. 🌿 Montagne du Mahury (Cayenne) — 2h accessible sans 4x4\n\n💡 Niveau débutant à confirmé. Guide obligatoire en zone cœur du Parc Amazonien."
        },

        // --- INSELBERGS ---
        {
            keys: ['inselberg','rocher émergent','roche émergente','formation rocheuse','roche virginie','mont chauve','dôme rocheux','rocher jungle','roche granitique'],
            reply: "🪨 Les Inselbergs de Guyane :\n\nLes inselbergs sont des formations rocheuses granitiques qui surgissent brutalement au-dessus de la canopée — paysage unique et spectaculaire !\n\n🌟 Les plus remarquables :\n• Roche Virginie (Régina) : le plus accessible depuis Cayenne (RN2). Sentier 2h, vue à 360° sur l'immensité de la forêt\n• Mont Chauve (Oyapock) : inselberg colossal, roche quasi nue, très impressionnant\n• Roche Koutou (Maroni) : accessible en pirogue depuis Saint-Laurent\n• Inselberg des Nouragues : au cœur de la réserve scientifique\n• Monts Atachi-Bakka (frontière Suriname) : expédition avancée\n\n🦎 Faune spécifique aux inselbergs :\n• Lézards endémiques (Anolis), plantes carnivores (Heliamphora), orchidées saxicoles\n• Espèces inféodées à ces milieux rocheux ouverts\n\n📍 Roche Virginie : accès RN2, direction Régina — 130 km de Cayenne"
        },

        // --- TERRITOIRES DE GUYANE ---
        {
            keys: ['territoire','zone','région','est guyane','ouest guyane','littoral','intérieur guyane','savane','côte','maroni territoire','oyapock territoire'],
            reply: "🗺️ Les territoires de Guyane :\n\nLa Guyane s'organise en 4 grandes zones géographiques et culturelles :\n\n🌊 Littoral & Côte Nord :\n• Cayenne, Kourou, Rémire-Montjoly, Matoury\n• Zone urbanisée, accessible, la plupart des services\n• Plages atlantiques (eau brune mais belles), mangroves\n\n🌿 Territoire Est — Oyapock :\n• De Roura à Saint-Georges-de-l'Oyapock\n• Fleuve Oyapock : frontière avec le Brésil\n• Communautés Teko et Wayampi, biodiversité record\n• Marais de Kaw, Réserve Trésor, inselbergs de Régina\n\n🏝️ Territoire Ouest — Maroni :\n• Saint-Laurent-du-Maroni, Grand-Santi, Maripasoula\n• Fleuve Maroni : frontière avec le Suriname\n• Communautés Bushinengues (Ndjuka, Aluku, Saramaka)\n• Culture, pirogues, Parc Amazonien\n\n🏕️ Savanes & Intérieur (zone cœur) :\n• Saül, Camopi, Maripasoula, Trois-Sauts\n• Accessibles uniquement par avion ou pirogue\n• Peuples amérindiens (Wayãpi, Wayana, Teko, Apalaï, Tïlïo)\n• Nature sauvage absolue, Parc Amazonien"
        },

        // --- POPULATION ARC-EN-CIEL ---
        {
            keys: ['population','habitant','peuple','communauté','ethnie','diversité','multiculturel','origine','arc-en-ciel','métis','créole guyane'],
            reply: "🌈 La population arc-en-ciel de Guyane (~300 000 hab.) :\n\n🪶 Peuples autochtones (Amérindiens) :\n• Kali'na (Galibi) : littoral nord — Awala-Yalimapo, Mana\n• Teko (Émerillon) : Haut-Oyapock\n• Wayãpi : Haut-Oyapock (Camopi, Trois-Sauts)\n• Wayana & Apalaï : Haut-Maroni (Maripasoula)\n• Palikur : région de Saint-Georges\n• Tïlïo : Haut-Maroni\n\n🥁 Bushinengues (descendants d'esclaves marrons) :\n• Ndjuka (Aukan) : le groupe le plus nombreux\n• Aluku (Boni) : Haut-Maroni, Grand-Santi, Papaichton\n• Saramaka, Matawai, Paramaka, Kwinti\n\n🌺 Communautés récentes :\n• Créoles guyanais : premiers colons africains, la colonne vertébrale culturelle\n• Hmong : réfugiés du Laos (années 70), installés à Cacao et Javouhey\n• Haïtiens, Brésiliens, Surinamais : communautés importantes\n• Métropolitains (Français de métropole)\n• Ressortissants du monde entier (50+ nationalités à Cayenne)\n\n💡 La Guyane parle plus de 15 langues au quotidien !"
        },

        // --- PATRIMOINE & MÉMOIRE ---
        {
            keys: ['bagne','forçat','pénitentiaire','colonisation','esclave','traite','histoire bagne','camp transportation','dreyfus','papillon charrière'],
            reply: "📜 Patrimoine et mémoire de Guyane :\n\n⛓️ Le bagne (1852-1953) :\n• La France a déporté plus de 70 000 bagnards en Guyane sur 100 ans\n• Trois sites principaux : Îles du Salut, Saint-Laurent-du-Maroni, Cayenne\n• Camp de la Transportation (Saint-Laurent) : classé monument historique, visites guidées quotidiennes\n• Îles du Salut : vestiges exceptionnellement bien conservés\n  → Île du Diable : Alfred Dreyfus y fut exilé (1895-1899)\n  → Île Royale : administration pénitentiaire, chapelle, singes libres\n• L'Abbé Gobin, forçat devenu prêtre, a peint l'église d'Iracoubo (1887-1904) — chef-d'œuvre de l'art populaire\n\n🏛️ Histoire coloniale :\n• 1498 : Christophe Colomb aperçoit la côte guyanaise\n• 1604 : première tentative de colonisation française\n• 1794 : abolition de l'esclavage (Révolution française) — puis rétablissement en 1802\n• 1848 : abolition définitive — Victor Schoelcher\n• 1946 : la Guyane devient département français (DOM)\n\n📚 Personnages célèbres liés à la Guyane :\n• Alfred Dreyfus (Île du Diable)\n• Henri Charrière dit 'Papillon' (Îles du Salut — son livre et le film)\n• Félix Éboué : gouverneur guyanais, héros de la Résistance"
        },

        // --- ECOTOURISME & IMMERSION ---
        {
            keys: ['écotourisme','ecoturisme','immersion','nature séjour','séjour forêt','experience amazonie','expedition','bivouac forêt','nuit forêt','stage survie'],
            reply: "🌿 Écotourisme et immersion en Amazonie guyanaise :\n\nLa Guyane est l'une des meilleures destinations au monde pour l'écotourisme authentique.\n\n🌿 Expériences uniques :\n• Nuit en carbet dans la forêt primaire (avec guide)\n• Observation nocturne des caïmans en pirogue\n• Sortie aurore : coq-de-roche à la Réserve Trésor\n• Remontée de fleuve en pirogue vers les villages bushinengues\n• Séjour chez l'habitant amérindien (avec autorisation préfectorale)\n• Trek multi-jours à Saül (carbets, cascades, inselbergs)\n• Safari photo nocturne : tapirs, daguets, agoutis\n\n🏕️ Agences spécialisées écotourisme :\n• Takari Tour — fleuves, forêt, culture\n• Guyane Discovery — éco-séjours\n• Sêbêkô — Maroni, Bushinengues\n• JAL Voyages — généraliste\n\n⚠️ Règle d'or : toujours avec un guide agréé dans le Parc Amazonien. L'écosystème est fragile — no-trace obligatoire.\n\n💡 Le meilleur séjour : 4 jours à Saül + 2 jours au marais de Kaw + 1 jour aux Îles du Salut."
        },

        // --- SITE OFFICIEL TOURISME ---
        {
            keys: ['site officiel tourisme','office de tourisme','guyane amazonie','comité tourisme','ctig','tourisme guyane site','infos officielles'],
            reply: "ℹ️ Informations officielles sur le tourisme en Guyane :\n\n🌐 Site officiel : guyane-amazonie.fr\n→ Portail officiel du tourisme géré par le Comité du Tourisme de l'Île de Guyane (CTIG)\n\n📚 Contenu du site officiel :\n• 🗺️ Je découvre : destinations, incontournables, territoires\n• 🎒 Je prépare : infos pratiques, climat, FAQ, santé, transport\n• 🌿 Une diversité infinie : nature, culture, peuples\n• 💡 Je m'inspire : à voir à faire, idées circuits\n• 📅 Agenda : événements, carnaval, fêtes\n\n📞 Contacts utiles :\n• Comité du Tourisme : +594 (0)594 29 65 00\n• Office de Tourisme de Cayenne\n• Office de Tourisme de Kourou\n\n🏅 Certifications :\n• Labels Tourisme & Handicap (certains sites)\n• Gîtes de France\n• Labels Écotourisme"
        },

        // --- REMERCIEMENTS ---
        {
            keys: ['merci','super','parfait','génial','excellent','top','cool','bravo','nickel','impressionnant','wow','incroyable'],
            reply: "Avec plaisir ! 😊 La Guyane est l'une des destinations les plus extraordinaires du monde — un véritable trésor naturel et culturel. N'hésitez pas à poser d'autres questions, je suis là pour vous aider à préparer le voyage parfait ! 🌿🚀🐢"
        },

        // --- AU REVOIR ---
        {
            keys: ['au revoir','bye','à bientôt','à plus','ciao','tchao','bonne continuation','adieu'],
            reply: "Au revoir et bon voyage en Guyane ! 🌿 J'espère avoir pu vous aider. La Guyane vous attend avec sa forêt amazonienne, ses cultures métissées et son ciel étoilé depuis la savane de Kourou. À bientôt !"
        },
    ];

    const defaultRepliesByLang = {
        fr: [
            "Je n'ai pas trouvé de réponse précise 🤔 Essayez l'un de ces sujets :\n🗺️ destinations • 🚀 Kourou/CSG • 🏝️ Îles du Salut • 🌿 forêt/randonnée\n🐢 tortues • 🐊 marais de Kaw • 🦁 faune • 🌸 flore\n📜 histoire • 🪶 peuples • 🎭 carnaval • 🍽️ gastronomie\n✈️ vols • 💰 budget • 🌡️ météo • 🏥 santé • 🚰 eau • 💳 paiement",
            "Hmm, je n'ai pas compris votre question 😅 Je réponds à tout ce qui concerne la Guyane Française : destinations, faune, flore, histoire, peuples autochtones, vols, budget, santé, météo, carnaval, gastronomie, sécurité... Reformulez ou choisissez un sujet !",
        ],
        en: [
            "I'm not sure I understand 😅 Try: destinations, history, wildlife, peoples, carnival, flights, budget, health, weather or Guianese cuisine!",
            "Could you rephrase? I cover all topics about Guiana: geography, history, culture, wildlife, flora, indigenous peoples... 🌿",
        ],
        es: [
            "No estoy seguro de entender 😅 Prueba: destinos, historia, fauna, pueblos, carnaval, vuelos, presupuesto, salud, tiempo o gastronomía guyanesa!",
            "¿Puedes reformular? Cubro todos los temas sobre la Guayana 🌿",
        ],
        pt: [
            "Não tenho certeza se entendi 😅 Tente: destinos, história, fauna, povos, carnaval, voos, orçamento, saúde, clima ou gastronomia guianense!",
            "Pode reformular? Cubro todos os temas sobre a Guiana 🌿",
        ],
        nl: [
            "Ik begrijp het niet helemaal 😅 Probeer: bestemmingen, geschiedenis, fauna, volkeren, carnaval, vluchten, budget, gezondheid, weer of Guyanese keuken!",
            "Kunt u het herformuleren? Ik behandel alle onderwerpen over Guyana 🌿",
        ],
        de: [
            "Ich bin nicht ganz sicher 😅 Versuchen Sie: Reiseziele, Geschichte, Tierwelt, Völker, Karneval, Flüge, Budget, Gesundheit, Wetter oder guyanische Küche!",
            "Könnten Sie das umformulieren? Ich decke alle Themen über Guayana ab 🌿",
        ],
        it: [
            "Non sono sicuro di capire 😅 Prova: destinazioni, storia, fauna, popoli, carnevale, voli, budget, salute, meteo o cucina guianense!",
            "Puoi riformulare? Copro tutti gli argomenti sulla Guiana 🌿",
        ],
        zh: [
            "我不太明白您的问题 😅 请尝试询问：目的地、历史、野生动物、民族、狂欢节、航班、预算、健康或圭亚那美食！",
            "能否换个说法？我可以回答关于圭亚那的所有问题 🌿",
        ],
        ja: [
            "よくわかりませんでした 😅 こちらをお試しください：目的地、歴史、野生動物、民族、カーニバル、フライト、予算、健康、気候、またはギアナ料理！",
            "言い換えていただけますか？ギアナに関するすべてのトピックをカバーしています 🌿",
        ],
    };

    chatKnowledge.fr = knowledge;

    function getReply(text) {
        const norm = s => s.toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

        const normalized = norm(text);
        const words = normalized.split(' ').filter(w => w.length >= 3);
        const kb = chatKnowledge[currentLang] || chatKnowledge.fr;

        // Pass 1 : correspondance exacte — la clé la plus longue gagne (plus spécifique)
        let bestMatch1 = null, bestKeyLen = 0;
        for (const entry of kb) {
            for (const k of entry.keys) {
                const nk = norm(k);
                if (nk.length > bestKeyLen && normalized.includes(nk)) {
                    bestKeyLen = nk.length;
                    bestMatch1 = entry;
                }
            }
        }
        if (bestMatch1) return bestMatch1.reply;

        // Pass 2 : correspondance par racine de mot (gère pluriels, conjugaisons, variantes)
        let best = null, bestScore = 0;
        for (const entry of kb) {
            let score = 0;
            for (const k of entry.keys) {
                const kWords = norm(k).split(' ').filter(w => w.length >= 4);
                for (const kw of kWords) {
                    const stem = kw.slice(0, Math.max(4, kw.length - 2));
                    if (words.some(w => w.startsWith(stem) || (w.length >= 4 && kw.startsWith(w.slice(0, -1))))) {
                        score++;
                        break;
                    }
                }
            }
            if (score > bestScore) { bestScore = score; best = entry; }
        }
        if (bestScore >= 1) return best.reply;

        // Pass 3 : si langue non-FR, tenter la base française (sujets non traduits)
        if (currentLang !== 'fr') {
            const frKb = chatKnowledge.fr;
            let frBest = null, frScore = 0;
            for (const entry of frKb) {
                let s = 0;
                for (const k of entry.keys) {
                    const kWords = norm(k).split(' ').filter(w => w.length >= 4);
                    for (const kw of kWords) {
                        const stem = kw.slice(0, Math.max(4, kw.length - 2));
                        if (words.some(w => w.startsWith(stem))) { s++; break; }
                    }
                }
                if (s > frScore) { frScore = s; frBest = entry; }
            }
            if (frScore >= 1) return frBest.reply;
        }

        const defaults = defaultRepliesByLang[currentLang] || defaultRepliesByLang.fr;
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    function now() {
        return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = 'chat-msg ' + sender;
        div.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div><div class="msg-time">${now()}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = 'chat-msg bot typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = `<div class="msg-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function handleSend(text) {
        if (!text.trim()) return;
        appendMessage(text, 'user');
        document.getElementById('chat-input').value = '';
        document.getElementById('chat-send-btn').disabled = true;
        document.querySelector('.chat-suggestions')?.remove();
        showTyping();
        const delay = 700 + Math.random() * 600;
        setTimeout(() => {
            hideTyping();
            appendMessage(getReply(text), 'bot');
            document.getElementById('chat-send-btn').disabled = false;
        }, delay);
    }

    window.sendMessage = function() {
        handleSend(document.getElementById('chat-input').value);
    };

    window.sendSuggestion = function(text) {
        handleSend(text);
    };

    document.addEventListener('DOMContentLoaded', function() {
        const widget = document.getElementById('ai-chat-widget');
        const toggleBtn = document.getElementById('chat-toggle-btn');
        const closeBtn = document.getElementById('chat-close-btn');
        const input = document.getElementById('chat-input');

        toggleBtn.addEventListener('click', () => widget.classList.toggle('open'));
        closeBtn.addEventListener('click', () => widget.classList.remove('open'));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

        // Applique la langue sauvegardée au chargement
        setLanguage(currentLang);

        // Câble les chips après initialisation
        document.querySelectorAll('.suggestion-chip[data-question-key]').forEach(btn => {
            const qKey = btn.getAttribute('data-question-key');
            btn.onclick = () => {
                const q = TRANSLATIONS[currentLang][qKey] || btn.textContent;
                handleSend(q);
            };
        });
    });
})();