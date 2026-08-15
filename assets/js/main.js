var LANG_STORAGE_KEY='chef4you_lang';
var ANALYTICS_CONSENT_KEY='chef4you_analytics_consent';
var SUPPORTED_LANGS=['en','es','fr'];
var analyticsEnabled=false;

function getStoredValue(key){
  try{return window.localStorage.getItem(key)}catch(_){return null}
}
function setStoredValue(key,value){
  try{window.localStorage.setItem(key,value)}catch(_){}
}

function enableAnalytics(){
  if(analyticsEnabled)return;
  analyticsEnabled=true;
  var script=document.createElement('script');
  script.async=true;
  script.src='https://www.googletagmanager.com/gtag/js?id=G-X4T0SBCQVF';
  document.head.appendChild(script);
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('js',new Date());
  window.gtag('config','G-X4T0SBCQVF');
  window.gtag('config','GT-P8266HD5');
}
/* NAV */
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('scrolled',scrollY>60));

/* QUOTE CALCULATOR */
function calcQuote(){
  const guests=Math.max(1,Math.min(500,parseInt(document.getElementById('q_guests').value||'1',10)));
  const pkg=document.getElementById('q_package').value;
  const loc=document.getElementById('q_location').value;
  const service=document.getElementById('q_service').value;
  const basePerGuest={standard:120,premium:180,gold:260};
  const locFee={pv:0,nn:35,pm:55};
  const serviceMult={villa:1,romantic:1.1,wedding:1.35,class:0.95,yacht:1.25};
  let subtotal=guests*basePerGuest[pkg]*serviceMult[service];
  subtotal+=locFee[loc];
  const iva=subtotal*0.16;
  const serviceFee=subtotal*0.18;
  const total=subtotal+iva+serviceFee;
  document.getElementById('q_result').innerHTML=
    `Estimated subtotal: <strong>$${subtotal.toFixed(0)} USD</strong><br>`+
    `Estimated total (IVA + service): <strong>$${total.toFixed(0)} USD</strong>`;
}

/* REVEAL */
var obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('vis')}),{threshold:.1});
document.querySelectorAll('.rv,.rvl,.rvr').forEach(el=>obs.observe(el));




/* i18n */
var lang='es';
var T={
  en:{ns:'Services',na:'The Chef',nb:'Book',nc:'Book Now',
    he:'Award-Winning Private Chef · Puerto Vallarta · Punta Mita · Riviera Nayarit',
    hs:'Fine Dining · ',hs2:'Yachts',hs3:'Cooking Classes',
    hc1:'Book Your Experience',hc2:'View Packages & Pricing',hsc:'Discover',
    m1l:'Culinary Art',m1t:'Personalized.<br>Intimate. Memorable.',m2l:'Private Dining',m2t:'Redefined.',
    sl:'Our Services',st:'An experience <em>for every occasion</em>',sb:'From intimate romantic dinners to grand weddings — every experience is designed exclusively for you.',
    s1t:'Private Villa Dinner',s2t:'Romantic Dinner',s3t:'Wedding Expert',s4t:'Cooking Classes',s5t:'Yacht Chef',s6t:'VIP Events & Multi-Day',
    s1b:'Fine dining at your villa. Custom menu, full mise en place.',s2b:'Candles, flowers, personalized menu and a night to remember.',s3b:'Full culinary coordination for your wedding. Custom menus, full service team.',s4b:'Learn authentic Mexican techniques with a professional chef at your villa.',s5b:'Gourmet cuisine at sea. Menus for Banderas Bay adventures.',s6b:'Corporate retreats, family reunions, multi-day stays.',sa:'Book now →',
    pl:'Transparent Pricing',pt:'Three packages, <em>one unforgettable</em> experience',pb:'No hidden fees. All prices include chef, ingredients, equipment, setup and cleanup.',
    pt1:'Private Dinners',pt2:'Weddings',pt3:'Cooking Classes',
    t1:'Standard',n1:'Essential Dining',pp1:' USD / person',d1:'Perfect for couples and small groups seeking a quality private dining experience.',f1a:'3-course plated menu',f1b:'2 entrée options',f1c:'Non-alcoholic beverages',f1d:'Chef + kitchen assistant',f1e:'Full setup & cleanup',f1f:'Min. 4 guests',pb1:'Reserve Standard',
    t2:'Premium',n2:'Gourmet Experience',pp2:' USD / person',d2:'Our signature experience. The most popular choice for luxury villa guests.',f2a:'5-course tasting menu',f2b:'Personalized menu design',f2c:'Welcome cocktail',f2d:'Wine pairing guidance',f2e:'Chef + 2 assistants',f2f:'Canapés on arrival',f2g:'Full setup & cleanup',f2h:'Min. 4 guests',pb2:'Reserve Premium',bp:'Most Popular',
    t3:'Gold',n3:"Chef's Table Gold",pp3:' USD / person',d3:'The ultimate culinary experience. An intimate journey through flavors and live techniques.',f3a:"7-course chef's table menu",f3b:'Live cooking & plating show',f3c:'Premium wine pairing included',f3d:'Personalized printed menu card',f3e:'Chef + full service team',f3f:'Floral table setting',f3g:'Signed recipe card to take home',f3h:'Min. 2 guests',pb3:'Reserve Gold',
    pnote:'All prices are per person in USD. Tax (16% IVA) + 18% service charge applies.',
    hwl:'How It Works',hwt:'Simple, <em>seamless</em> from start to finish',
    hw1t:'Choose Your Experience',hw1b:'Select your service type, date, number of guests, and preferred location.',hw2t:'We Design Your Menu',hw2b:'Chef Franko creates a custom menu based on your preferences and seasonal ingredients.',hw3t:'Chef Arrives at Your Space',hw3b:'We handle everything — shopping, prep, cooking, plating, service and cleanup.',hw4t:'You Just Enjoy',hw4b:'Relax and experience world-class cuisine in your own space.',
    al:'The Chef',atl:'The Team · Puerto Vallarta',ab:'Award-winning private chef with over 15 years of fine dining experience. Recipient of the Star Diamond Award from the American Academy of Hospitality Sciences.',ab2:'Based in Puerto Vallarta, I serve clients from California, Canada, Europe and beyond.',abl:'Star Diamond Award',st1:'Years Experience',st2:'Private Events',st3:'Luxury Destinations',
    gl:'Gallery',gt:'A feast <em>for the eyes</em>',el:'Featured Experiences',et:'Moments you <em>never forget</em>',et1:'Fine Dining',ec1:'Private Villa Dinner',ed1:'From 4 guests. 5-course tasting menu.',et2:'Weddings',ec2:'Destination Wedding',ed2:'Full culinary coordination.',et3:'Cooking Class',ec3:"Chef's Masterclass",ed3:'Hands-on at your villa.',
    tl:'What our clients say',tt:'Real <em>experiences</em>',
    bkl:'Book Your Experience',bkt:'Begin your <em>experience</em>',bkb:"I respond within 2 hours. Tell me your vision and we'll design the perfect menu.",
    f1t:'Response in <2 hours',f1b:'We confirm availability quickly for your date.',f2t:'100% custom menu',f2b:'Designed for you and your dietary needs.',f3t:'Private & discreet',f3b:'Full confidentiality. Your space, your rules.',f4t:'Easy communication',f4b:'WhatsApp, email or phone — your choice.',
    fh:'Check Availability',fsb:"Fill out the form and we'll contact you within 2 hours.",fn:'Full Name *',fe:'Email Address',fp:'WhatsApp / Phone',fc:'Preferred Contact *',fx:'Experience Type *',fz:'Service Area *',fd:'Preferred Date',fg2:'Number of Guests',fm:'Dietary preferences / special requests',fbt:'Check Availability',
    chat_hi:"Hi! I'm the Chef 4 You AI assistant. I can help with pricing, availability, menu ideas, cooking classes or anything else. What brings you here today?",chat_err:'Sorry, I had a technical issue. Please contact us directly on WhatsApp: +52 322 160 6843'},
  es:{ns:'Servicios',na:'El Chef',nb:'Reservar',nc:'Reservar',
    he:'Chef Privado Galardonado · Puerto Vallarta · Punta Mita · Riviera Nayarit',
    hs:'Fine Dining · ',hs2:'Yates',hs3:'Clases de Cocina',
    hc1:'Reserva Tu Experiencia',hc2:'Ver Paquetes y Precios',hsc:'Descubrir',
    m1l:'Arte Culinario',m1t:'Personalizado.<br>Íntimo. Memorable.',m2l:'Cena Privada',m2t:'Redefinida.',
    sl:'Nuestros Servicios',st:'Una experiencia <em>para cada ocasión</em>',sb:'Desde cenas románticas íntimas hasta grandes bodas — cada experiencia se diseña exclusivamente para ti.',
    s1t:'Cena Privada en Villa',s2t:'Cena Romántica',s3t:'Experto en Bodas',s4t:'Clases de Cocina',s5t:'Chef en Yate',s6t:'Eventos VIP y Multi-Día',
    s1b:'Alta cocina en tu villa. Menú personalizado, mise en place completo.',s2b:'Velas, flores, menú personalizado y una noche para recordar.',s3b:'Coordinación culinaria completa para tu boda. Menús personalizados, equipo de servicio.',s4b:'Aprende técnicas mexicanas auténticas con un chef profesional en tu villa.',s5b:'Gastronomía gourmet en el mar. Menús para Bahía de Banderas.',s6b:'Retiros corporativos, reuniones familiares, estadías multi-día.',sa:'Reservar ahora →',
    pl:'Precios Transparentes',pt:'Tres paquetes, <em>una experiencia</em> inolvidable',pb:'Sin cargos ocultos. Todos los precios incluyen chef, ingredientes, equipo y limpieza.',
    pt1:'Cenas Privadas',pt2:'Bodas',pt3:'Clases de Cocina',
    t1:'Estándar',n1:'Cena Esencial',pp1:' USD / persona',d1:'Ideal para parejas y grupos pequeños que buscan una experiencia de chef privado de calidad.',f1a:'Menú emplatado 3 tiempos',f1b:'2 opciones de plato fuerte',f1c:'Bebidas sin alcohol',f1d:'Chef + asistente de cocina',f1e:'Montaje y limpieza incluidos',f1f:'Mín. 4 personas',pb1:'Reservar Estándar',
    t2:'Premium',n2:'Experiencia Gourmet',pp2:' USD / persona',d2:'Nuestra experiencia estrella. La más solicitada por huéspedes de California y Canadá.',f2a:'Menú degustación 5 tiempos',f2b:'Diseño de menú personalizado',f2c:'Cóctel de bienvenida',f2d:'Guía de maridaje',f2e:'Chef + 2 asistentes',f2f:'Canapés a la llegada',f2g:'Montaje y limpieza incluidos',f2h:'Mín. 4 personas',pb2:'Reservar Premium',bp:'Más Popular',
    t3:'Gold',n3:'Chef\'s Table Gold',pp3:' USD / persona',d3:'La experiencia culinaria máxima. Un recorrido íntimo por sabores, historias y técnicas en vivo.',f3a:'Menú chef\'s table 7 tiempos',f3b:'Show de cocina y emplatado en vivo',f3c:'Maridaje de vinos premium incluido',f3d:'Tarjeta de menú impresa personalizada',f3e:'Chef + equipo de servicio completo',f3f:'Decoración floral de mesa',f3g:'Tarjeta de receta firmada para llevar',f3h:'Mín. 2 personas',pb3:'Reservar Gold',
    pnote:'Todos los precios son por persona en USD. Se aplica IVA (16%) + cargo por servicio (18%).',
    hwl:'Cómo Funciona',hwt:'Simple, <em>sin complicaciones</em> de inicio a fin',
    hw1t:'Elige Tu Experiencia',hw1b:'Selecciona tipo de servicio, fecha, número de personas y ubicación.',hw2t:'Diseñamos Tu Menú',hw2b:'El Chef Franko crea un menú personalizado según tus preferencias e ingredientes de temporada.',hw3t:'El Chef Llega a Tu Espacio',hw3b:'Nos encargamos de todo — compras, preparación, cocina, emplatado, servicio y limpieza.',hw4t:'Tú Solo Disfrutas',hw4b:'Relájate y vive una cocina de clase mundial en tu propio espacio.',
    al:'El Chef',atl:'El Equipo · Puerto Vallarta',ab:'Chef profesional galardonado con más de 15 años en alta cocina. Receptor del prestigioso Star Diamond Award de la American Academy of Hospitality Sciences.',ab2:'Basado en Puerto Vallarta, sirvo a clientes de California, Canadá, Europa y todo el mundo.',abl:'Star Diamond Award',st1:'Años de Experiencia',st2:'Eventos Privados',st3:'Destinos de Lujo',
    gl:'Galería',gt:'Un festín <em>para los ojos</em>',el:'Experiencias Destadadas',et:'Momentos que <em>nunca olvidas</em>',et1:'Fine Dining',ec1:'Cena Privada en Villa',ed1:'Desde 4 personas. Menú 5 tiempos.',et2:'Bodas',ec2:'Boda de Destino',ed2:'Coordinación culinaria completa.',et3:'Clase de Cocina',ec3:'Clase Magistral',ed3:'Práctico en tu villa.',
    tl:'Lo que dicen nuestros clientes',tt:'Experiencias <em>reales</em>',
    bkl:'Reserva Tu Experiencia',bkt:'Comienza tu <em>experiencia</em>',bkb:'Respondo en menos de 2 horas. Cuéntame tu visión y diseñamos el menú perfecto.',
    f1t:'Respuesta en <2 horas',f1b:'Confirmamos disponibilidad rápidamente.',f2t:'Menú 100% personalizado',f2b:'Diseñado para ti y tus preferencias.',f3t:'Privado y confidencial',f3b:'Discreción total. Tu espacio, tus reglas.',f4t:'Comunicación fácil',f4b:'WhatsApp, email o teléfono — lo que prefieras.',
    fh:'Consultar Disponibilidad',fsb:'Completa el formulario y te contactamos en menos de 2 horas.',fn:'Nombre completo *',fe:'Correo electrónico',fp:'WhatsApp / Teléfono',fc:'Método de contacto *',fx:'Tipo de experiencia *',fz:'Zona de servicio *',fd:'Fecha preferida',fg2:'Número de personas',fm:'Preferencias / restricciones alimentarias',fbt:'Consultar Disponibilidad',
    chat_hi:'¡Hola! Soy el asistente de Chef 4 You. Puedo ayudarte con precios, disponibilidad, ideas de menú, clases de cocina y más. ¿Qué tienes en mente?',chat_err:'Lo siento, tuve un problema técnico. Contáctame por WhatsApp: +52 322 160 6843'},
  fr:{ns:'Services',na:'Le Chef',nb:'Réserver',nc:'Réserver',
    he:'Chef Privé Primé · Puerto Vallarta · Punta Mita · Riviera Nayarit',
    hs:'Fine Dining · ',hs2:'Yachts',hs3:'Cours de Cuisine',
    hc1:'Réservez Votre Expérience',hc2:'Voir les Forfaits & Tarifs',hsc:'Découvrir',
    m1l:'Art Culinaire',m1t:'Personnalisé.<br>Intime. Mémorable.',m2l:'Dîner Privé',m2t:'Réinventé.',
    sl:'Nos Services',st:'Une expérience <em>pour chaque occasion</em>',sb:"Des dîners romantiques intimes aux grands mariages — chaque expérience est conçue exclusivement pour vous.",
    s1t:'Dîner Privé en Villa',s2t:'Dîner Romantique',s3t:'Expert Mariage',s4t:'Cours de Cuisine',s5t:'Chef sur Yacht',s6t:'Événements VIP',
    s1b:'Haute cuisine dans votre villa. Menu personnalisé, mise en place complète.',s2b:'Bougies, fleurs, menu personnalisé et une nuit inoubliable.',s3b:'Coordination culinaire complète pour votre mariage.',s4b:'Apprenez les techniques mexicaines authentiques dans votre villa.',s5b:'Gastronomie haut de gamme en mer. Menus pour la Baie de Banderas.',s6b:'Retraites, réunions familiales, séjours multi-jours.',sa:'Réserver →',
    pl:'Tarifs Transparents',pt:'Trois forfaits, <em>une expérience</em> inoubliable',pb:'Sans frais cachés. Tous les prix incluent chef, ingrédients, équipement et ménage.',
    pt1:'Dîners Privés',pt2:'Mariages',pt3:'Cours de Cuisine',
    t1:'Standard',n1:'Dîner Essentiel',pp1:' USD / personne',d1:'Idéal pour les couples et petits groupes.',f1a:'Menu 3 services',f1b:'2 choix de plat principal',f1c:'Boissons non alcoolisées',f1d:'Chef + assistant',f1e:'Installation & nettoyage inclus',f1f:'Min. 4 personnes',pb1:'Réserver Standard',
    t2:'Premium',n2:'Expérience Gastronomique',pp2:' USD / personne',d2:"Notre expérience signature. Le choix le plus populaire pour les vacanciers de luxe.",f2a:'Menu dégustation 5 services',f2b:'Menu personnalisé',f2c:'Cocktail de bienvenue',f2d:'Conseils accord mets-vins',f2e:'Chef + 2 assistants',f2f:'Canapés à l\'arrivée',f2g:'Installation & nettoyage inclus',f2h:'Min. 4 personnes',pb2:'Réserver Premium',bp:'Le Plus Demandé',
    t3:'Gold',n3:"Chef's Table Gold",pp3:' USD / personne',d3:'L\'expérience culinaire ultime. Un voyage intime à travers les saveurs.',f3a:'Menu chef\'s table 7 services',f3b:'Show de cuisine et dressage en direct',f3c:'Accord vins premium inclus',f3d:'Carte de menu personnalisée imprimée',f3e:'Chef + équipe complète',f3f:'Décoration florale',f3g:'Fiche recette signée à emporter',f3h:'Min. 2 personnes',pb3:'Réserver Gold',
    pnote:'Tous les prix sont par personne en USD. TVA (16%) + service (18%) en sus.',
    hwl:'Comment ça Marche',hwt:'Simple, <em>sans effort</em> du début à la fin',
    hw1t:'Choisissez votre Expérience',hw1b:'Sélectionnez le type de service, la date et l\'emplacement.',hw2t:'Nous Créons votre Menu',hw2b:'Le Chef Franko crée un menu personnalisé.',hw3t:'Le Chef Arrive chez vous',hw3b:'Nous gérons tout — achats, préparation, cuisine, service et ménage.',hw4t:'Vous Profitez Simplement',hw4b:'Détendez-vous et savourez une cuisine de classe mondiale.',
    al:'Le Chef',atl:'L’équipe · Puerto Vallarta',ab:'Chef professionnel primé avec plus de 15 ans d\'expérience. Récipiendaire du prestigieux Star Diamond Award.',ab2:'Basé à Puerto Vallarta, je sers des clients de Californie, du Canada et d\'Europe.',abl:'Star Diamond Award',st1:"Ans d'Expérience",st2:'Événements Privés',st3:'Destinations de Luxe',
    gl:'Galerie',gt:'Un festin <em>pour les yeux</em>',el:'Expériences Vedettes',et:'Des moments <em>inoubliables</em>',et1:'Fine Dining',ec1:'Dîner Privé en Villa',ed1:'À partir de 4 personnes. Menu 5 services.',et2:'Mariage',ec2:'Mariage de Destination',ed2:'Coordination culinaire complète.',et3:'Cours de Cuisine',ec3:'Cours Magistral',ed3:'Pratique dans votre villa.',
    tl:'Ce que disent nos clients',tt:'Expériences <em>réelles</em>',
    bkl:'Réservez Votre Expérience',bkt:'Commencez votre <em>expérience</em>',bkb:"Je réponds dans les 2 heures. Parlez-moi de votre vision.",
    f1t:'Réponse en <2 heures',f1b:'Nous confirmons la disponibilité rapidement.',f2t:'Menu 100% personnalisé',f2b:'Conçu pour vous et vos préférences.',f3t:'Privé et confidentiel',f3b:'Discrétion totale.',f4t:'Communication facile',f4b:'WhatsApp, email ou téléphone.',
    fh:'Vérifier la Disponibilité',fsb:"Remplissez le formulaire, nous vous contacterons dans 2 heures.",fn:'Nom complet *',fe:'Adresse e-mail',fp:'WhatsApp / Téléphone',fc:'Contact préféré *',fx:"Type d'expérience *",fz:'Zone de service *',fd:'Date préférée',fg2:'Nombre de personnes',fm:'Préférences / restrictions alimentaires',fbt:'Vérifier la Disponibilité',
    chat_hi:"Bonjour ! Je suis l'assistant Chef 4 You. Je peux vous aider avec les tarifs, la disponibilité, les idées de menu ou les cours de cuisine. Comment puis-je vous aider ?",chat_err:'Désolé, problème technique. Contactez-nous sur WhatsApp : +52 322 160 6843'}
};

function L(l){
  lang=l;
  setStoredValue(LANG_STORAGE_KEY,l);
  document.documentElement.lang=l;
  document.querySelectorAll('[data-k]').forEach(el=>{
    var k=el.getAttribute('data-k');
    if(T[l]&&T[l][k]!==undefined)el.innerHTML=T[l][k];
  });
  SUPPORTED_LANGS.forEach(x=>document.getElementById('l-'+x).classList.toggle('on',x===l));
  var chips=l==='fr'?['Tarifs','Disponibilité','Menu','Cours']:l==='es'?['Precios','Disponibilidad','Menú','Clases']:['Pricing','Availability','Menu ideas','Cooking class'];
  document.querySelectorAll('.chip').forEach((c,i)=>{if(chips[i])c.textContent=chips[i]});
  document.getElementById('fabTxt').textContent=l==='fr'?"Chat IA":l==='es'?'Chat con IA':'Chat with AI';
  document.querySelector('.ch-in').placeholder=l==='fr'?'Votre question…':l==='es'?'Tu pregunta…':'Ask anything…';
  applyLocalizedFormCopy(l);
  updateAnalyticsConsentCopy(l);
}

function scrollTo(id){document.getElementById(id).scrollIntoView({behavior:'smooth'})}

function applyLocalizedFormCopy(l){
  var copy={
    en:{
      preferredBlank:'— Select —',
      channel:{whatsapp:'WhatsApp',email:'Email',phone:'Phone call'},
      experience:{villa_dinner:'Private Villa Dinner',romantic:'Romantic Dinner',wedding:'Wedding / Event',cooking_class:'Cooking Class',yacht:'Yacht Chef',multiday:'Multi-Day Stay',other:'Other'},
      serviceArea:{puerto_vallarta:'Puerto Vallarta',punta_mita:'Punta Mita',nuevo_nayarit:'Nuevo Nayarit',riviera_nayarit:'Riviera Nayarit',other:'Other'},
      privacy:'I have read and accept the <a href="/politica-privacidad.html">privacy policy</a>. *',
      contact:'I consent to Chef 4 You by Franko contacting me to handle my inquiry. *',
      marketing:'I agree to receive marketing communications by email.'
    },
    es:{
      preferredBlank:'— Seleccionar —',
      channel:{whatsapp:'WhatsApp',email:'Correo',phone:'Llamada'},
      experience:{villa_dinner:'Cena Privada en Villa',romantic:'Cena Romántica',wedding:'Boda / Evento',cooking_class:'Clase de Cocina',yacht:'Chef en Yate',multiday:'Estadía Multi-Día',other:'Otro'},
      serviceArea:{puerto_vallarta:'Puerto Vallarta',punta_mita:'Punta Mita',nuevo_nayarit:'Nuevo Nayarit',riviera_nayarit:'Riviera Nayarit',other:'Otra'},
      privacy:'He leído y acepto la <a href="/politica-privacidad.html">política de privacidad</a>. *',
      contact:'Autorizo a Chef 4 You by Franko a contactarme para atender mi solicitud. *',
      marketing:'Acepto recibir comunicaciones de marketing por correo electrónico.'
    },
    fr:{
      preferredBlank:'— Sélectionner —',
      channel:{whatsapp:'WhatsApp',email:'E-mail',phone:'Appel'},
      experience:{villa_dinner:'Dîner Privé en Villa',romantic:'Dîner Romantique',wedding:'Mariage / Événement',cooking_class:'Cours de Cuisine',yacht:'Chef sur Yacht',multiday:'Séjour Multi-Jours',other:'Autre'},
      serviceArea:{puerto_vallarta:'Puerto Vallarta',punta_mita:'Punta Mita',nuevo_nayarit:'Nuevo Nayarit',riviera_nayarit:'Riviera Nayarit',other:'Autre'},
      privacy:'J\'ai lu et j\'accepte la <a href="/politica-privacidad.html">politique de confidentialité</a>. *',
      contact:'J\'autorise Chef 4 You by Franko à me contacter pour traiter ma demande. *',
      marketing:'J\'accepte de recevoir des communications marketing par e-mail.'
    }
  };
  var t=copy[l]||copy.en;
  var setOptionText=function(selectId,value,text){
    var opt=document.querySelector('#'+selectId+' option[value="'+value+'"]');
    if(opt)opt.textContent=text;
  };
  setOptionText('fc','',t.preferredBlank);
  Object.keys(t.channel).forEach(function(key){setOptionText('fc',key,t.channel[key])});
  setOptionText('fx','',t.preferredBlank);
  Object.keys(t.experience).forEach(function(key){setOptionText('fx',key,t.experience[key])});
  setOptionText('fz','',t.preferredBlank);
  Object.keys(t.serviceArea).forEach(function(key){setOptionText('fz',key,t.serviceArea[key])});
  var privacyLabel=document.querySelector('label[for="cp"]');
  if(privacyLabel)privacyLabel.innerHTML=t.privacy;
  var contactLabel=document.querySelector('label[for="cs"]');
  if(contactLabel)contactLabel.innerHTML=t.contact;
  var marketingLabel=document.querySelector('label[for="cm"]');
  if(marketingLabel)marketingLabel.innerHTML=t.marketing;
}

function updateAnalyticsConsentCopy(l){
  var copy={
    en:{text:'We use analytics to improve your experience. It only runs after you accept.',accept:'Accept',reject:'Reject'},
    es:{text:'Usamos analítica para mejorar tu experiencia. Solo se activará si aceptas.',accept:'Aceptar',reject:'Rechazar'},
    fr:{text:'Nous utilisons des analyses pour améliorer votre expérience. Elles s\'activent uniquement après votre accord.',accept:'Accepter',reject:'Refuser'}
  }[l]||{text:'We use analytics to improve your experience. It only runs after you accept.',accept:'Accept',reject:'Reject'};
  var text=document.getElementById('analyticsConsentText');
  if(text)text.textContent=copy.text;
  var accept=document.getElementById('analyticsAccept');
  if(accept)accept.textContent=copy.accept;
  var reject=document.getElementById('analyticsReject');
  if(reject)reject.textContent=copy.reject;
}

function setAnalyticsConsent(state){
  setStoredValue(ANALYTICS_CONSENT_KEY,state);
  if(state==='granted')enableAnalytics();
  var banner=document.getElementById('analyticsConsent');
  if(banner)banner.hidden=true;
}

function initAnalyticsConsent(){
  var state=getStoredValue(ANALYTICS_CONSENT_KEY);
  if(state==='granted'){
    enableAnalytics();
    return;
  }
  if(state==='denied')return;
  var banner=document.getElementById('analyticsConsent');
  if(banner)banner.hidden=false;
}

function makeIdempotencyKey(){
  if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID();
  return 'lead-'+Date.now()+'-'+Math.random().toString(36).slice(2);
}

/* CHAT with Gemini AI */
var hist=[],busy=false,opened=false;

function openChat(){
  document.getElementById('chat').classList.add('open');
  document.getElementById('fab').classList.add('gone');
  if(!opened){
    opened=true;
    setTimeout(()=>addMsg('b',T[lang].chat_hi||T.en.chat_hi),350);
  }
}
function closeChat(){
  document.getElementById('chat').classList.remove('open');
  document.getElementById('fab').classList.remove('gone');
}
function addMsg(r,txt){
  var w=document.getElementById('chMsgs');
  var el=document.createElement('div');
  el.className='msg '+(r==='b'?'mb':'mm');
  el.textContent=txt;
  w.appendChild(el);
  w.scrollTop=w.scrollHeight;
  return el;
}
function useChip(btn){btn.disabled=true;doSend(btn.textContent)}
function sendMsg(){var i=document.getElementById('chIn');var t=i.value.trim();if(!t||busy)return;i.value='';doSend(t)}

/* CHAT — uses Base44 backend (Gemini flash-latest, 3 idiomas) */
function logFailure(area,error,meta){
  console.warn(JSON.stringify({event:'client_request_failure',area:area,message:error&&error.message||String(error),...meta,timestamp:new Date().toISOString()}));
}

async function fetchWithRetry(url,options,config){
  var attempts=(config&&config.attempts)||3;
  var timeout=(config&&config.timeout)||8000;
  for(var attempt=0;attempt<attempts;attempt++){
    var controller=new AbortController();
    var timer=setTimeout(()=>controller.abort(),timeout);
    try{
      var response=await fetch(url,{...options,signal:controller.signal});
      if(response.ok||response.status<500||attempt===attempts-1)return response;
      throw new Error('HTTP '+response.status);
    }catch(error){
      if(attempt===attempts-1)throw error;
      await new Promise(resolve=>setTimeout(resolve,350*Math.pow(2,attempt)));
    }finally{clearTimeout(timer)}
  }
}

async function doSend(txt){
  if(busy||!txt)return;
  busy=true;
  document.getElementById('chSend').disabled=true;
  hist.push({role:'user',content:txt});
  addMsg('u',txt);
  var typing=addMsg('b','…');typing.classList.add('mt');
  try{
    var r=await fetchWithRetry('https://base44.app/api/apps/6a5508bbcd2eb3e895394f46/functions/chatAssistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:hist,lang:lang,context:'private_chef_puerto_vallarta'})},{attempts:3,timeout:8000});
    var d=await r.json();
    var reply=d.reply||d.message||d.content||T[lang].chat_err||T.en.chat_err;
    typing.remove();addMsg('b',reply);hist.push({role:'assistant',content:reply});
  }catch(error){
    logFailure('chat',error,{language:lang});
    typing.remove();addMsg('b',T[lang].chat_err||T.en.chat_err);
  }finally{
    busy=false;document.getElementById('chSend').disabled=false;
  }
}

/* FORM */
async function submitForm(){
  var btn=document.getElementById('fsub');
  var st=document.getElementById('fSt');
  if(document.querySelector('[name="_hp"]').value)return;
  var fn=document.getElementById('fn').value.trim();
  var fc=document.getElementById('fc').value;
  var fx=document.getElementById('fx').value;
  var fz=document.getElementById('fz').value;
  var fe=document.getElementById('fe').value.trim();
  var fp=document.getElementById('fp').value.trim();
  var cp=document.getElementById('cp').checked;
  var cs=document.getElementById('cs').checked;
  var emailOk=!fe||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fe);
  var phoneOk=!fp||/[0-9]{7,}/.test(fp.replace(/\D/g,''));
  if(!fn||!fc||!fx||!fz||!cp||!cs||(!fe&&!fp)||(fc==='email'&&!fe)||(fc==='whatsapp'&&!fp)||!emailOk||!phoneOk){
    st.className='er';
    st.textContent=lang==='en'?'Please check the required fields, email and phone number.':lang==='fr'?'Vérifiez les champs requis, l’adresse e-mail et le téléphone.':'Revisa los campos obligatorios, el correo y el teléfono.';
    return;
  }
  btn.disabled=true;btn.textContent=lang==='en'?'Sending…':lang==='fr'?'Envoi…':'Enviando…';
  st.className='';st.textContent='';
  var guestCountValue=document.getElementById('fg2').value;
  var payload={fullName:fn,email:fe,phone:fp,preferredChannel:fc,experienceType:fx,serviceArea:fz,serviceDate:document.getElementById('fd').value,guestCount:guestCountValue?parseInt(guestCountValue,10):undefined,message:document.getElementById('fm').value.trim(),privacyConsent:cp,contactConsent:cs,emailMarketing:document.getElementById('cm').checked,lang:lang,source:'chef4you_v4_final'};
  var idempotencyKey=makeIdempotencyKey();
  try{
    try{
      var primary=await fetchWithRetry('https://base44.app/api/apps/6a5508bbcd2eb3e895394f46/functions/captureLead',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(payload)},{attempts:2,timeout:7000});
      if(!primary.ok)throw new Error('primary_http_'+primary.status);
    }catch(primaryError){
      logFailure('lead_submission_primary',primaryError,{language:lang,preferredChannel:fc});
      try{
        var fallback=await fetchWithRetry('/api/leads',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(payload)},{attempts:2,timeout:7000});
        if(!fallback.ok)throw new Error('fallback_http_'+fallback.status);
      }catch(fallbackError){
        logFailure('lead_submission_fallback',fallbackError,{language:lang,preferredChannel:fc});
        throw fallbackError;
      }
    }
    st.className='ok';
    st.textContent=lang==='en'?'✓ Request sent! We\'ll contact you within 2 hours.':lang==='fr'?'✓ Envoyé ! Nous vous contacterons dans 2 heures.':'✓ ¡Solicitud enviada! Te contactamos en menos de 2 horas.';
    document.getElementById('bookForm').reset();
  }catch(e){
    var wa='https://wa.me/523221606843?text='+encodeURIComponent((lang==='en'?'Hi Chef Franko, I\'m interested in booking an experience. Name: ':lang==='fr'?'Bonjour Chef Franko, je voudrais réserver. Nom: ':'Hola Chef Franko, me interesa reservar. Nombre: ')+fn);
    st.className='er';
    st.innerHTML=(lang==='en'?'Issue sending. <a class="status-link" rel="noopener" target="_blank" href="'+wa+'">Contact via WhatsApp →</a>':lang==='fr'?'Problème. <a class="status-link" rel="noopener" target="_blank" href="'+wa+'">WhatsApp →</a>':'Problema. <a class="status-link" rel="noopener" target="_blank" href="'+wa+'">WhatsApp →</a>');
  }
  btn.disabled=false;btn.textContent=T[lang].fbt||T.en.fbt;
}

document.addEventListener('DOMContentLoaded',function(){
  var requestedLanguage=new URLSearchParams(window.location.search).get('lang');
  var storedLanguage=getStoredValue(LANG_STORAGE_KEY);
  var initialLanguage=SUPPORTED_LANGS.includes(requestedLanguage)?requestedLanguage:(SUPPORTED_LANGS.includes(storedLanguage)?storedLanguage:'es');
  L(initialLanguage);
  initAnalyticsConsent();
  document.querySelectorAll('[data-language]').forEach(function(button){button.addEventListener('click',function(){L(button.dataset.language)})});
  document.querySelectorAll('[data-scroll-booking]').forEach(function(item){
    item.addEventListener('click',function(){document.getElementById('booking').scrollIntoView({behavior:'smooth'})});
    item.addEventListener('keydown',function(event){
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        document.getElementById('booking').scrollIntoView({behavior:'smooth'});
      }
    });
  });
  document.getElementById('q_calc').addEventListener('click',calcQuote);
  document.getElementById('bookForm').addEventListener('submit',function(event){event.preventDefault();submitForm()});
  document.getElementById('fab').addEventListener('click',openChat);
  document.querySelector('[data-close-chat]').addEventListener('click',closeChat);
  document.querySelectorAll('[data-chat-chip]').forEach(function(button){button.addEventListener('click',function(){useChip(button)})});
  document.getElementById('chSend').addEventListener('click',sendMsg);
  document.getElementById('chIn').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();sendMsg()}});
  document.getElementById('analyticsAccept').addEventListener('click',function(){setAnalyticsConsent('granted')});
  document.getElementById('analyticsReject').addEventListener('click',function(){setAnalyticsConsent('denied')});
});
