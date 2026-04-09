/**
 * translations.js
 * Bilingual content (ES / EN) for all sub-pages.
 * Used by page-init.js — elements with data-i18n="key" get their textContent replaced.
 */
window.pageTranslations = {

  /* ====================================================
     ESPAÑOL
  ==================================================== */
  es: {
    /* --- Navegación --- */
    'nav.home':        'Inicio',
    'nav.about':       'Sobre Mí',
    'nav.portfolio':   'Portafolio',
    'nav.outreach':    'Divulgación',
    'nav.contact':     'Contacto',

    /* --- Footer --- */
    'footer.rights':   '© 2024 Antonio Soria. Todos los derechos reservados.',

    /* ================================================
       CONTACTO
    ================================================ */
    'contact.hero.title':   'Hablemos',
    'contact.hero.text':    'Estoy disponible para colaboraciones, proyectos interesantes y conversaciones sobre matemáticas, programación e inteligencia artificial. No dudes en contactarme.',

    'contact.wa.title':     'WhatsApp',
    'contact.wa.desc':      'Respuesta rápida, ideal para comunicación inmediata',
    'contact.wa.btn':       'Enviar mensaje',

    'contact.email.title':  'Email',
    'contact.email.desc':   'Para propuestas formales y documentación',
    'contact.email.btn':    'Enviar email',

    'contact.cv.title':     'Currículum',
    'contact.cv.desc1':     'Descarga mi CV actualizado',
    'contact.cv.desc2':     'Información profesional detallada',
    'contact.cv.btn':       'Descargar CV',

    'contact.video.title':  'Videollamada Profesional',
    'contact.video.text':   'Agenda una sesión de videollamada para discutir proyectos, asesorías o colaboraciones',

    'contact.consult.title': 'Consultoría',
    'contact.consult.li1':  'Asesoría en algoritmos y matemáticas',
    'contact.consult.li2':  'Análisis de proyectos técnicos',
    'contact.consult.li3':  'Soluciones personalizadas',
    'contact.consult.btn':  'Agendar consultoría',

    'contact.dev.title':    'Desarrollo',
    'contact.dev.li1':      'Discusión de proyectos de desarrollo',
    'contact.dev.li2':      'Análisis de requerimientos técnicos',
    'contact.dev.li3':      'Presupuestos y tiempos de entrega',
    'contact.dev.btn':      'Agendar reunión',

    'contact.academic.title': 'Asesoría Académica',
    'contact.academic.li1': 'Asesoría en matemáticas y programación',
    'contact.academic.li2': 'Revisión de proyectos académicos',
    'contact.academic.li3': 'Orientación profesional',
    'contact.academic.btn': 'Agendar asesoría',

    'contact.availability': 'Disponibilidad: Lunes a Viernes, 9:00 AM – 6:00 PM',

    'contact.process.title': 'Proceso de Colaboración',
    'contact.process.text':  'Mi enfoque para asegurar que nuestras colaboraciones sean productivas y exitosas:',
    'contact.step1.title':   '1. Consulta Inicial',
    'contact.step1.text':    'Discutimos tus necesidades, objetivos y expectativas para el proyecto.',
    'contact.step2.title':   '2. Propuesta',
    'contact.step2.text':    'Te presento un plan detallado con soluciones, timeline y presupuesto.',
    'contact.step3.title':   '3. Colaboración',
    'contact.step3.text':    'Trabajamos juntos con comunicación constante y updates regulares.',
    'contact.step4.title':   '4. Entrega',
    'contact.step4.text':    'Revisión final y entrega del proyecto completo con documentación.',
    'contact.start.btn':     'Iniciar conversación',

    'contact.social.title':  'Conectemos',

    /* ================================================
       SOBRE MÍ
    ================================================ */
    'about.hero.title':  'Mi Trayectoria',
    'about.hero.text':   'Conoce más sobre mi camino como matemático y desarrollador, mis pasiones y lo que me impulsa a crear soluciones innovadoras.',

    'about.timeline.title':  'Mi Journey',

    'about.t1.date':   '2011 – 2016',
    'about.t1.title':  'Inicios en la Programación',
    'about.t1.text':   'Mis primeros acercamientos al desarrollo de software y aplicaciones empresariales, descubriendo mi pasión por resolver problemas mediante código.',

    'about.t2.date':   '2016 – 2020',
    'about.t2.title':  'UNAM FES Acatlán',
    'about.t2.text':   'Licenciatura en Matemáticas Aplicadas y Computación. Donde solidifiqué mis bases matemáticas y descubrí la belleza de los algoritmos.',

    'about.t3.date':   '2020 – Presente',
    'about.t3.title':  'UAM Iztapalapa',
    'about.t3.text':   'Licenciatura en Computación. Profundizando en inteligencia artificial, teoría de grafos y algoritmia avanzada.',

    'about.t4.date':   '2022 – Presente',
    'about.t4.title':  'Desarrollo Profesional',
    'about.t4.text':   'Trabajando en proyectos personales y profesionales que combinan mis conocimientos en matemáticas y programación para crear soluciones innovadoras.',

    'about.gallery.title': 'Mi Mundo',
    'about.gallery.cap1':  'Desarrollo de algoritmos de IA',
    'about.gallery.cap2':  'Matemáticas aplicadas a problemas reales',
    'about.gallery.cap3':  'Desarrollo de software especializado',

    'about.philosophy.title': 'Mi Filosofía',
    'about.philosophy.p1':  'Creo firmemente que las matemáticas y la programación son dos caras de la misma moneda: herramientas poderosas para entender y transformar el mundo que nos rodea.',
    'about.philosophy.p2':  'Mi enfoque se basa en la elegancia de las soluciones simples para problemas complejos, encontrando belleza en los algoritmos eficientes y en las estructuras matemáticas que describen nuestro universo.',
    'about.philosophy.quote': '"La información es la resolución de la incertidumbre, y las matemáticas son el lenguaje perfecto para cuantificarla."',
    'about.philosophy.attr': '— Inspirado por Claude Shannon',

    'about.skills.title':    'Enfoques Principales',
    'about.skills.math':     'Matemáticas',
    'about.skills.math.li1': 'Análisis Numérico',
    'about.skills.math.li2': 'Teoría de Grafos',
    'about.skills.math.li3': 'Estadística Avanzada',
    'about.skills.math.li4': 'Optimización Matemática',

    'about.skills.prog':     'Programación',
    'about.skills.prog.li1': 'Java & Algoritmos de IA',
    'about.skills.prog.li2': 'Lenguaje C & Sistemas',
    'about.skills.prog.li3': 'Python para Análisis',
    'about.skills.prog.li4': 'Estructuras de Datos',

    'about.skills.ai':       'Inteligencia Artificial',
    'about.skills.ai.li1':   'Algoritmos de Búsqueda',
    'about.skills.ai.li2':   'BFS, DFS y A*',
    'about.skills.ai.li3':   'Minimax y Poda Alfa-Beta',
    'about.skills.ai.li4':   'Resolución de Problemas',

    /* ================================================
       PORTAFOLIO
    ================================================ */
    'portfolio.hero.title':  'Mi Portafolio',
    'portfolio.hero.text':   'Una selección de proyectos que combinan rigor matemático con implementación elegante en código.',

    'portfolio.projects.title': 'Proyectos Destacados',

    'portfolio.p1.title':  'Algoritmos de IA en Java',
    'portfolio.p1.desc':   'Implementación de algoritmos de inteligencia artificial como BFS, DFS, A* y Minimax para resolver problemas complejos.',
    'portfolio.p1.btn':    'Ver Proyecto',

    'portfolio.p2.title':  'Desarrollo de Sistemas en C',
    'portfolio.p2.desc':   'Desarrollo de sistemas eficientes y de bajo nivel utilizando lenguaje C para aplicaciones de alto rendimiento.',
    'portfolio.p2.btn':    'Ver Proyecto',

    'portfolio.p3.title':  'Algoritmo de Wang',
    'portfolio.p3.desc':   'Implementación del algoritmo de Wang para demostración automática de teoremas en lógica proposicional.',
    'portfolio.p3.btn':    'Ver Proyecto',

    'portfolio.p4.title':  'Algoritmos de Teoría de Grafos',
    'portfolio.p4.desc':   'Implementación de algoritmos de grafos para resolver problemas de optimización y análisis de redes.',
    'portfolio.p4.btn':    'Ver Proyecto',

    'portfolio.p5.title':  'Estructuras de Datos Avanzadas',
    'portfolio.p5.desc':   'Implementación de estructuras de datos complejas y algoritmos de manipulación para optimizar el rendimiento.',
    'portfolio.p5.btn':    'Ver Proyecto',

    'portfolio.p6.title':  'Sistema de Recomendación',
    'portfolio.p6.desc':   'Desarrollo de un sistema de recomendación utilizando técnicas de machine learning y filtrado colaborativo.',
    'portfolio.p6.btn':    'Ver Proyecto',

    /* ================================================
       DIVULGACIÓN
    ================================================ */
    'div.hero.title':  'Divulgación Científica',
    'div.hero.text':   'Explora los avances más fascinantes en matemáticas, programación, inteligencia artificial y ciencias a través de artículos de divulgación seleccionados para mentes curiosas.',

    'div.articles.title': 'Artículos Destacados',

    'div.a1.cat':    'Matemáticas',
    'div.a1.title':  'El Método Monte Carlo: Simulaciones para Estimación de π',
    'div.a1.text':   'Descubre cómo el azar puede ser usado para calcular π mediante simulaciones probabilísticas. Un viaje entre la estadística y la geometría.',
    'div.a1.read':   'Leer Artículo',
    'div.a1.code':   'Descargar Código',

    'div.a2.cat':    'IA & NLP',
    'div.a2.title':  'Modelos de Lenguaje de Gran Tamaño (LLMs)',
    'div.a2.text':   'Una exploración accesible de cómo funcionan los LLMs, desde transformers hasta embeddings y atención multi-cabeza.',
    'div.a2.read':   'Leer Artículo',
    'div.a2.extra':  'Ver Video',

    'div.a3.cat':    'Lenguajes',
    'div.a3.title':  'Similitudes y Congruencias de Lenguajes de Programación',
    'div.a3.text':   'Análisis comparativo de los paradigmas y estructuras en Java, C, Python y otros lenguajes populares.',
    'div.a3.read':   'Leer Artículo',
    'div.a3.extra':  'Comparativa',

    'div.a4.cat':    'Cotidiano',
    'div.a4.title':  'Aplicaciones Cotidianas de las Matemáticas',
    'div.a4.text':   'Las matemáticas están en todas partes: en la música, las redes sociales, la criptografía y el clima. Descúbrelas.',
    'div.a4.read':   'Leer Artículo',
    'div.a4.extra':  'Material Educativo',

    'div.a5.cat':    'Historia',
    'div.a5.title':  'Mujeres Pioneras en Matemáticas y Programación',
    'div.a5.text':   'Un homenaje a Ada Lovelace, Grace Hopper, Emmy Noether y otras figuras que cambiaron la ciencia.',
    'div.a5.read':   'Leer Artículo',
    'div.a5.extra':  'Galería Histórica',

    'div.a6.cat':    'Curiosidades',
    'div.a6.title':  'El Teorema del Mono Infinito y Otras Curiosidades',
    'div.a6.text':   'Probabilidad, infinito y paradojas que desafían la intuición. Una mirada divertida a los límites de las matemáticas.',
    'div.a6.read':   'Leer Artículo',
    'div.a6.extra':  'Más Curiosidades',

    'div.resources.title':   'Recursos Recomendados',
    'div.res1.title':  'Revistas de Divulgación',
    'div.res2.title':  'Plataformas Educativas',
    'div.res3.title':  'Canales YouTube',
    'div.res4.title':  'Podcasts Científicos',

    'div.table.title': 'Modelos LLM y sus Aplicaciones',
    'div.table.th1':   'Modelo',
    'div.table.th2':   'Empresa',
    'div.table.th3':   'Aplicaciones',
    'div.table.th4':   'Año',

    'div.dyk.title': '¿Sabías Que?',
    'div.dyk1.title': 'El Teorema del Mono Infinito',
    'div.dyk1.text':  'Explora probabilísticamente cuánto tardaría un mono escribiendo aleatoriamente en producir una obra como "Hamlet" de Shakespeare.',
    'div.dyk2.title': 'Peces Ciegos Mexicanos',
    'div.dyk2.text':  'Los peces de cueva mexicanos que perdieron sus ojos podrían tener la clave para luchar contra la obesidad.',
    'div.dyk3.title': 'Loros que Aprenden',
    'div.dyk3.text':  'Los loros pueden imitar lo que otros de su especie aprenden, una habilidad solo vista antes en humanos.',
  },

  /* ====================================================
     ENGLISH
  ==================================================== */
  en: {
    /* --- Navigation --- */
    'nav.home':        'Home',
    'nav.about':       'About Me',
    'nav.portfolio':   'Portfolio',
    'nav.outreach':    'Science Outreach',
    'nav.contact':     'Contact',

    /* --- Footer --- */
    'footer.rights':   '© 2024 Antonio Soria. All rights reserved.',

    /* ================================================
       CONTACT
    ================================================ */
    'contact.hero.title':   "Let's Talk",
    'contact.hero.text':    "I'm available for collaborations, interesting projects and conversations about mathematics, programming and artificial intelligence. Don't hesitate to reach out.",

    'contact.wa.title':     'WhatsApp',
    'contact.wa.desc':      'Fast response, ideal for immediate communication',
    'contact.wa.btn':       'Send message',

    'contact.email.title':  'Email',
    'contact.email.desc':   'For formal proposals and documentation',
    'contact.email.btn':    'Send email',

    'contact.cv.title':     'Curriculum Vitae',
    'contact.cv.desc1':     'Download my updated CV',
    'contact.cv.desc2':     'Detailed professional information',
    'contact.cv.btn':       'Download CV',

    'contact.video.title':  'Professional Video Call',
    'contact.video.text':   'Schedule a video call session to discuss projects, consultations or collaborations',

    'contact.consult.title': 'Consulting',
    'contact.consult.li1':  'Algorithm and mathematics consulting',
    'contact.consult.li2':  'Technical project analysis',
    'contact.consult.li3':  'Custom solutions',
    'contact.consult.btn':  'Schedule consulting',

    'contact.dev.title':    'Development',
    'contact.dev.li1':      'Development project discussions',
    'contact.dev.li2':      'Technical requirements analysis',
    'contact.dev.li3':      'Budgets and delivery timelines',
    'contact.dev.btn':      'Schedule meeting',

    'contact.academic.title': 'Academic Tutoring',
    'contact.academic.li1': 'Math and programming tutoring',
    'contact.academic.li2': 'Academic project review',
    'contact.academic.li3': 'Professional guidance',
    'contact.academic.btn': 'Schedule tutoring',

    'contact.availability': 'Availability: Monday to Friday, 9:00 AM – 6:00 PM',

    'contact.process.title': 'Collaboration Process',
    'contact.process.text':  'My approach to ensure our collaborations are productive and successful:',
    'contact.step1.title':   '1. Initial Consultation',
    'contact.step1.text':    'We discuss your needs, goals and expectations for the project.',
    'contact.step2.title':   '2. Proposal',
    'contact.step2.text':    'I present a detailed plan with solutions, timeline and budget.',
    'contact.step3.title':   '3. Collaboration',
    'contact.step3.text':    "We work together with constant communication and regular updates.",
    'contact.step4.title':   '4. Delivery',
    'contact.step4.text':    'Final review and delivery of the complete project with documentation.',
    'contact.start.btn':     'Start conversation',

    'contact.social.title':  "Let's Connect",

    /* ================================================
       ABOUT ME
    ================================================ */
    'about.hero.title':  'My Journey',
    'about.hero.text':   'Learn more about my path as a mathematician and developer, my passions and what drives me to create innovative solutions.',

    'about.timeline.title':  'My Journey',

    'about.t1.date':   '2011 – 2016',
    'about.t1.title':  'Programming Beginnings',
    'about.t1.text':   'My first steps into software development and business applications, discovering my passion for solving problems through code.',

    'about.t2.date':   '2016 – 2020',
    'about.t2.title':  'UNAM FES Acatlán',
    'about.t2.text':   'Bachelor\'s in Applied Mathematics and Computing. Where I solidified my mathematical foundations and discovered the beauty of algorithms.',

    'about.t3.date':   '2020 – Present',
    'about.t3.title':  'UAM Iztapalapa',
    'about.t3.text':   'Bachelor\'s in Computing. Deepening in artificial intelligence, graph theory and advanced algorithms.',

    'about.t4.date':   '2022 – Present',
    'about.t4.title':  'Professional Development',
    'about.t4.text':   'Working on personal and professional projects combining my knowledge in mathematics and programming to create innovative solutions.',

    'about.gallery.title': 'My World',
    'about.gallery.cap1':  'AI algorithm development',
    'about.gallery.cap2':  'Applied mathematics to real problems',
    'about.gallery.cap3':  'Specialized software development',

    'about.philosophy.title': 'My Philosophy',
    'about.philosophy.p1':  'I firmly believe that mathematics and programming are two sides of the same coin: powerful tools to understand and transform the world around us.',
    'about.philosophy.p2':  'My approach is based on the elegance of simple solutions to complex problems, finding beauty in efficient algorithms and in the mathematical structures that describe our universe.',
    'about.philosophy.quote': '"Information is the resolution of uncertainty, and mathematics is the perfect language to quantify it."',
    'about.philosophy.attr': '— Inspired by Claude Shannon',

    'about.skills.title':    'Core Expertise',
    'about.skills.math':     'Mathematics',
    'about.skills.math.li1': 'Numerical Analysis',
    'about.skills.math.li2': 'Graph Theory',
    'about.skills.math.li3': 'Advanced Statistics',
    'about.skills.math.li4': 'Mathematical Optimization',

    'about.skills.prog':     'Programming',
    'about.skills.prog.li1': 'Java & AI Algorithms',
    'about.skills.prog.li2': 'C Language & Systems',
    'about.skills.prog.li3': 'Python for Analysis',
    'about.skills.prog.li4': 'Data Structures',

    'about.skills.ai':       'Artificial Intelligence',
    'about.skills.ai.li1':   'Search Algorithms',
    'about.skills.ai.li2':   'BFS, DFS and A*',
    'about.skills.ai.li3':   'Minimax and Alpha-Beta Pruning',
    'about.skills.ai.li4':   'Problem Solving',

    /* ================================================
       PORTFOLIO
    ================================================ */
    'portfolio.hero.title':  'My Portfolio',
    'portfolio.hero.text':   'A selection of projects combining mathematical rigor with elegant code implementation.',

    'portfolio.projects.title': 'Featured Projects',

    'portfolio.p1.title':  'AI Algorithms in Java',
    'portfolio.p1.desc':   'Implementation of artificial intelligence algorithms such as BFS, DFS, A* and Minimax to solve complex problems.',
    'portfolio.p1.btn':    'View Project',

    'portfolio.p2.title':  'Systems Development in C',
    'portfolio.p2.desc':   'Development of efficient low-level systems using C language for high-performance applications.',
    'portfolio.p2.btn':    'View Project',

    'portfolio.p3.title':  'Wang Algorithm',
    'portfolio.p3.desc':   'Implementation of the Wang algorithm for automated theorem proving in propositional logic.',
    'portfolio.p3.btn':    'View Project',

    'portfolio.p4.title':  'Graph Theory Algorithms',
    'portfolio.p4.desc':   'Implementation of graph algorithms to solve optimization problems and network analysis.',
    'portfolio.p4.btn':    'View Project',

    'portfolio.p5.title':  'Advanced Data Structures',
    'portfolio.p5.desc':   'Implementation of complex data structures and manipulation algorithms to optimize performance.',
    'portfolio.p5.btn':    'View Project',

    'portfolio.p6.title':  'Recommendation System',
    'portfolio.p6.desc':   'Development of a recommendation system using machine learning techniques and collaborative filtering.',
    'portfolio.p6.btn':    'View Project',

    /* ================================================
       SCIENCE OUTREACH
    ================================================ */
    'div.hero.title':  'Science Outreach',
    'div.hero.text':   'Explore the most fascinating advances in mathematics, programming, artificial intelligence and sciences through outreach articles selected for curious minds.',

    'div.articles.title': 'Featured Articles',

    'div.a1.cat':    'Mathematics',
    'div.a1.title':  'The Monte Carlo Method: Simulations for Estimating π',
    'div.a1.text':   'Discover how randomness can be used to calculate π through probabilistic simulations. A journey between statistics and geometry.',
    'div.a1.read':   'Read Article',
    'div.a1.code':   'Download Code',

    'div.a2.cat':    'AI & NLP',
    'div.a2.title':  'Large Language Models (LLMs)',
    'div.a2.text':   'An accessible exploration of how LLMs work, from transformers to embeddings and multi-head attention.',
    'div.a2.read':   'Read Article',
    'div.a2.extra':  'Watch Video',

    'div.a3.cat':    'Languages',
    'div.a3.title':  'Similarities and Congruences of Programming Languages',
    'div.a3.text':   'Comparative analysis of paradigms and structures in Java, C, Python and other popular languages.',
    'div.a3.read':   'Read Article',
    'div.a3.extra':  'Comparison',

    'div.a4.cat':    'Everyday',
    'div.a4.title':  'Everyday Applications of Mathematics',
    'div.a4.text':   'Mathematics is everywhere: in music, social networks, cryptography and weather. Discover them.',
    'div.a4.read':   'Read Article',
    'div.a4.extra':  'Educational Material',

    'div.a5.cat':    'History',
    'div.a5.title':  'Pioneering Women in Mathematics and Programming',
    'div.a5.text':   'A tribute to Ada Lovelace, Grace Hopper, Emmy Noether and other figures who changed science.',
    'div.a5.read':   'Read Article',
    'div.a5.extra':  'Historical Gallery',

    'div.a6.cat':    'Curiosities',
    'div.a6.title':  'The Infinite Monkey Theorem and Other Curiosities',
    'div.a6.text':   'Probability, infinity and paradoxes that challenge intuition. A fun look at the limits of mathematics.',
    'div.a6.read':   'Read Article',
    'div.a6.extra':  'More Curiosities',

    'div.resources.title':   'Recommended Resources',
    'div.res1.title':  'Outreach Magazines',
    'div.res2.title':  'Learning Platforms',
    'div.res3.title':  'YouTube Channels',
    'div.res4.title':  'Science Podcasts',

    'div.table.title': 'LLM Models and Their Applications',
    'div.table.th1':   'Model',
    'div.table.th2':   'Company',
    'div.table.th3':   'Applications',
    'div.table.th4':   'Year',

    'div.dyk.title': 'Did You Know?',
    'div.dyk1.title': 'The Infinite Monkey Theorem',
    'div.dyk1.text':  'Probabilistically explores how long a monkey randomly typing would take to produce a work like Shakespeare\'s "Hamlet".',
    'div.dyk2.title': 'Blind Mexican Cavefish',
    'div.dyk2.text':  'Mexican cavefish that lost their eyes may hold the key to fighting obesity.',
    'div.dyk3.title': 'Parrots That Learn',
    'div.dyk3.text':  'Parrots can imitate what others of their species learn, a skill previously only seen in humans.',
  }
};

/* ====================================================
   INDEX.HTML TRANSLATIONS
   (merged into the same object)
==================================================== */
(function() {
  var t = window.pageTranslations;

  /* --- Spanish additions for index --- */
  Object.assign(t.es, {
    'idx.nav.home':      'Inicio',
    'idx.nav.about':     'Sobre mí',
    'idx.nav.skills':    'Habilidades',
    'idx.nav.research':  'Intereses',
    'idx.nav.projects':  'Proyectos',
    'idx.nav.studio':    'Studio',
    'idx.nav.contact':   'Contacto',

    'idx.hero.subtitle': 'Matemático y Desarrollador',
    'idx.hero.cta1':     'Ver Proyectos',
    'idx.hero.cta2':     'Contactar',

    'idx.about.title':   'Sobre Mí',
    'idx.about.p1':      'Soy un matemático y desarrollador con una sólida formación en matemáticas aplicadas y computación. Mi trayectoria académica combina el rigor matemático con la aplicación práctica en el campo de la programación.',
    'idx.about.p2':      'Mi enfoque profesional integra los principios matemáticos con el desarrollo de software, buscando siempre soluciones eficientes y elegantes para problemas complejos.',
    'idx.tl1.title':     'Programador Profesional',
    'idx.tl1.text':      'Desarrollo de software y aplicaciones empresariales',
    'idx.tl2.title':     'UNAM FES Acatlán',
    'idx.tl2.text':      'Licenciatura en Matemáticas Aplicadas y Computación',
    'idx.tl3.title':     'UAM Iztapalapa',
    'idx.tl3.text':      'Licenciatura en Computación',

    'idx.skills.title':  'Habilidades',
    'idx.sk.math':       'Matemáticas',
    'idx.sk.math.li1':   'Análisis Numérico',
    'idx.sk.math.li2':   'Teoría de Grafos',
    'idx.sk.math.li3':   'Estadística Avanzada',
    'idx.sk.math.li4':   'Optimización Matemática',
    'idx.sk.math.li5':   'Lógica Proposicional',
    'idx.sk.prog':       'Programación',
    'idx.sk.prog.li1':   'Java & Algoritmos de IA',
    'idx.sk.prog.li2':   'Lenguaje C & Sistemas',
    'idx.sk.prog.li3':   'Python para Análisis',
    'idx.sk.prog.li4':   'Estructuras de Datos',
    'idx.sk.prog.li5':   'Algoritmia Avanzada',
    'idx.sk.ai':         'Inteligencia Artificial',
    'idx.sk.ai.li1':     'Algoritmos de Búsqueda',
    'idx.sk.ai.li2':     'BFS, DFS y A*',
    'idx.sk.ai.li3':     'Minimax y Poda Alfa-Beta',
    'idx.sk.ai.li4':     'Resolución de Problemas',
    'idx.sk.ai.li5':     'Lógica Computacional',

    'idx.research.title': 'Intereses Académicos',

    'idx.projects.title': 'Proyectos Destacados',
    'idx.p1.title':      'Algoritmos de IA en Java',
    'idx.p1.desc':       'Implementación de BFS, DFS, A* y Minimax para resolver problemas complejos de inteligencia artificial.',
    'idx.p1.btn':        'Ver Código',
    'idx.p2.title':      'Desarrollo de Sistemas en C',
    'idx.p2.desc':       'Sistemas eficientes de bajo nivel para aplicaciones de alto rendimiento.',
    'idx.p2.btn':        'Solicitar Demo',
    'idx.p3.title':      'Algoritmo de Wang',
    'idx.p3.desc':       'Demostración automática de teoremas en lógica proposicional.',
    'idx.p3.btn':        'Ver Implementación',

    'idx.studio.title':  'Studio de Desarrollo',
    'idx.studio.desc':   'Transformo ideas en soluciones digitales robustas y elegantes. ¿Tienes una idea? Juntos podemos hacerla realidad.',
    'idx.sv1.title':     'Desarrollo Web',
    'idx.sv1.desc':      'Sitios web modernos, responsivos y optimizados para SEO que representen tu marca profesionalmente.',
    'idx.sv2.title':     'Aplicaciones Web',
    'idx.sv2.desc':      'Aplicaciones web progresivas (PWA) con funcionalidades avanzadas y experiencia de usuario excepcional.',
    'idx.sv3.title':     'Soluciones con IA',
    'idx.sv3.desc':      'Algoritmos de inteligencia artificial y machine learning para resolver problemas complejos.',
    'idx.studio.how':    '¿Cómo trabajamos?',
    'idx.cta.title':     '¿Listo para comenzar tu proyecto?',
    'idx.cta.text':      'Contáctame hoy mismo para una consulta gratuita y un presupuesto personalizado.',
    'idx.cta.btn1':      'Solicitar Consulta',
    'idx.cta.btn2':      'Enviar Email',

    'idx.contact.title': 'Contacto',
    'idx.ct1.title':     'Ubicación',
    'idx.ct2.title':     'Email',
    'idx.ct2.btn':       'Enviar mensaje',
    'idx.ct3.title':     'Currículum',
    'idx.ct3.desc':      'Descarga mi CV completo para más detalles profesionales',
    'idx.ct3.btn':       'Descargar CV',
    'idx.ct4.title':     'Redes Sociales',
    'idx.ct4.desc':      'Conectemos en las redes profesionales',

    'idx.philosophy.title': 'Mi Filosofía',
    'idx.philosophy.sub':   'Me inspira el pensamiento de Claude Shannon:',
    'idx.ax1': 'La información es la resolución de la incertidumbre, y las matemáticas son el lenguaje perfecto para cuantificarla.',
    'idx.ax2': 'Los problemas complejos del mundo real a menudo tienen soluciones elegantes cuando se abordan desde múltiples perspectivas: matemáticas, código y teoría de la información.',
    'idx.ax3': 'La belleza de un algoritmo no solo está en su eficiencia, sino en cómo modela y resuelve problemas del mundo físico.',
    'idx.ax4': 'El universo mismo puede entenderse como un sistema de procesamiento de información, donde las matemáticas son tanto el lenguaje como el mecanismo.',
    'idx.quote.text':    'Visualizo un día en el que volaremos sobre un mundo en el que los seres humanos sean libres de la monotonía y vivan la vida como debería vivirse',
    'idx.quote.author':  '— Claude Shannon, padre de la teoría de la información',

    'idx.footer.rights': '© 2024 Antonio Soria. Todos los derechos reservados.',
  });

  /* --- English additions for index --- */
  Object.assign(t.en, {
    'idx.nav.home':      'Home',
    'idx.nav.about':     'About',
    'idx.nav.skills':    'Skills',
    'idx.nav.research':  'Interests',
    'idx.nav.projects':  'Projects',
    'idx.nav.studio':    'Studio',
    'idx.nav.contact':   'Contact',

    'idx.hero.subtitle': 'Mathematician & Developer',
    'idx.hero.cta1':     'View Projects',
    'idx.hero.cta2':     'Contact Me',

    'idx.about.title':   'About Me',
    'idx.about.p1':      'I am a mathematician and developer with a solid background in applied mathematics and computing. My academic path combines mathematical rigor with practical application in programming.',
    'idx.about.p2':      'My professional approach integrates mathematical principles with software development, always seeking efficient and elegant solutions to complex problems.',
    'idx.tl1.title':     'Professional Programmer',
    'idx.tl1.text':      'Software development and business applications',
    'idx.tl2.title':     'UNAM FES Acatlán',
    'idx.tl2.text':      'Bachelor\'s in Applied Mathematics and Computing',
    'idx.tl3.title':     'UAM Iztapalapa',
    'idx.tl3.text':      'Bachelor\'s in Computing',

    'idx.skills.title':  'Skills',
    'idx.sk.math':       'Mathematics',
    'idx.sk.math.li1':   'Numerical Analysis',
    'idx.sk.math.li2':   'Graph Theory',
    'idx.sk.math.li3':   'Advanced Statistics',
    'idx.sk.math.li4':   'Mathematical Optimization',
    'idx.sk.math.li5':   'Propositional Logic',
    'idx.sk.prog':       'Programming',
    'idx.sk.prog.li1':   'Java & AI Algorithms',
    'idx.sk.prog.li2':   'C Language & Systems',
    'idx.sk.prog.li3':   'Python for Analysis',
    'idx.sk.prog.li4':   'Data Structures',
    'idx.sk.prog.li5':   'Advanced Algorithms',
    'idx.sk.ai':         'Artificial Intelligence',
    'idx.sk.ai.li1':     'Search Algorithms',
    'idx.sk.ai.li2':     'BFS, DFS and A*',
    'idx.sk.ai.li3':     'Minimax and Alpha-Beta Pruning',
    'idx.sk.ai.li4':     'Problem Solving',
    'idx.sk.ai.li5':     'Computational Logic',

    'idx.research.title': 'Academic Interests',

    'idx.projects.title': 'Featured Projects',
    'idx.p1.title':      'AI Algorithms in Java',
    'idx.p1.desc':       'Implementation of BFS, DFS, A* and Minimax to solve complex artificial intelligence problems.',
    'idx.p1.btn':        'View Code',
    'idx.p2.title':      'Systems Development in C',
    'idx.p2.desc':       'Efficient low-level systems for high-performance applications.',
    'idx.p2.btn':        'Request Demo',
    'idx.p3.title':      'Wang Algorithm',
    'idx.p3.desc':       'Automated theorem proving in propositional logic.',
    'idx.p3.btn':        'View Implementation',

    'idx.studio.title':  'Development Studio',
    'idx.studio.desc':   'I transform ideas into robust and elegant digital solutions. Got an idea? Together we can make it a reality.',
    'idx.sv1.title':     'Web Development',
    'idx.sv1.desc':      'Modern, responsive and SEO-optimized websites that represent your brand professionally.',
    'idx.sv2.title':     'Web Applications',
    'idx.sv2.desc':      'Progressive web apps (PWA) with advanced functionality and exceptional user experience.',
    'idx.sv3.title':     'AI Solutions',
    'idx.sv3.desc':      'Artificial intelligence and machine learning algorithms to solve complex problems.',
    'idx.studio.how':    'How do we work?',
    'idx.cta.title':     'Ready to start your project?',
    'idx.cta.text':      'Contact me today for a free consultation and personalized quote.',
    'idx.cta.btn1':      'Request Consultation',
    'idx.cta.btn2':      'Send Email',

    'idx.contact.title': 'Contact',
    'idx.ct1.title':     'Location',
    'idx.ct2.title':     'Email',
    'idx.ct2.btn':       'Send message',
    'idx.ct3.title':     'Curriculum Vitae',
    'idx.ct3.desc':      'Download my full CV for more professional details',
    'idx.ct3.btn':       'Download CV',
    'idx.ct4.title':     'Social Networks',
    'idx.ct4.desc':      "Let's connect on professional networks",

    'idx.philosophy.title': 'My Philosophy',
    'idx.philosophy.sub':   'Inspired by the thinking of Claude Shannon:',
    'idx.ax1': 'Information is the resolution of uncertainty, and mathematics is the perfect language to quantify it.',
    'idx.ax2': 'Complex real-world problems often have elegant solutions when approached from multiple perspectives: mathematics, code and information theory.',
    'idx.ax3': 'The beauty of an algorithm lies not only in its efficiency, but in how it models and solves problems from the physical world.',
    'idx.ax4': 'The universe itself can be understood as an information processing system, where mathematics is both the language and the mechanism.',
    'idx.quote.text':    'I visualize a day when we will soar over a world where human beings are freed from monotony and live life as it should be lived',
    'idx.quote.author':  '— Claude Shannon, father of information theory',

    'idx.footer.rights': '© 2024 Antonio Soria. All rights reserved.',
  });
})();

/* Keep backward-compat with old main.js */
window.translations = window.pageTranslations;
window.elementsToTranslate = {};
