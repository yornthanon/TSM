import { translations, Language } from './dictionary';

const originalTextNodes = new WeakMap<Text, string>();

const translateDocument = (language: Language) => {
  const dictionary: Record<string, string> = {
    ...translations[language],
    ...(language === 'km' ? {
      'Admin E-Commerce & Ticketing Management': 'ប្រព័ន្ធគ្រប់គ្រងការលក់សំបុត្រ និងពាណិជ្ជកម្ម',
      'Admin Executive View': 'ទិដ្ឋភាពសម្រាប់អ្នកគ្រប់គ្រង',
      'Export Sales to CSV': 'នាំចេញរបាយការណ៍លក់ជា CSV',
      'Export CSV': 'នាំចេញ CSV',
      'ផ្ទាំងគ្រប់គ្រងការលក់ និងចំណូលសំបុត្រ (Sales & Revenue)': 'ផ្ទាំងគ្រប់គ្រងការលក់ និងចំណូលសំបុត្រ',
      'ចំណូលសរុប (Total Revenue)': 'ចំណូលសរុប',
      'សំបុត្រលក់ចេញ (Tickets Sold)': 'សំបុត្រដែលបានលក់',
      'មធ្យមភាគក្នុងមួយ Order (AOV)': 'តម្លៃបញ្ជាទិញជាមធ្យម (AOV)',
      'ដំណើរការទូទាត់ (Pending)': 'ការទូទាត់ដែលកំពុងរង់ចាំ',
      'និន្នាការនៃការលក់សំបុត្រ (Ticket Sales & Revenue Trend)': 'និន្នាការការលក់សំបុត្រ និងចំណូល',
      'វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Channels)': 'មធ្យោបាយទូទាត់ប្រាក់',
      'ចំនួន Orders': 'ចំនួនការបញ្ជាទិញ',
      'Orders': 'ការបញ្ជាទិញ',
      'ADMIN BUSINESS PORTAL (អាជីវកម្ម & រដ្ឋបាល)': 'ផតថលគ្រប់គ្រងអាជីវកម្ម និងរដ្ឋបាល',
      'ផ្ទាំងគ្រប់គ្រងការលក់ (Sales Dashboard)': 'ផ្ទាំងគ្រប់គ្រងការលក់',
      'កម្មវិធី & Shows (Events Catalog)': 'កម្មវិធី និងកាតាឡុកកម្មវិធី',
      'ស្តុកសំបុត្រ & កៅអី (Ticket Inventory)': 'ស្តុកសំបុត្រ និងកៅអី',
      'ការកុម្ម៉ង់ & Checkout (Orders)': 'ការបញ្ជាទិញ និងការទូទាត់',
      'បញ្ជីទូទាត់ប្រាក់ (Payment Ledger)': 'បញ្ជីប្រតិបត្តិការទូទាត់',
      'អ្នកប្រើប្រាស់ & RBAC (Users)': 'អ្នកប្រើប្រាស់ និងសិទ្ធិ RBAC',
      'API & SERVICES HUB (គ្រប់គ្រង API & ERROR)': 'មជ្ឈមណ្ឌល API និងសេវាកម្ម',
      'គ្រប់គ្រង API & Error Diagnostics': 'គ្រប់គ្រង API និងវិភាគកំហុស',
      'Kafka Event Stream (Notifications)': 'លំហូរព្រឹត្តិការណ៍ Kafka និងការជូនដំណឹង',
      'Simulator Active': 'របៀបសាកល្បងកំពុងដំណើរការ',
      'Live Gateway :8080': 'Gateway ផ្ទាល់ :8080',
      'Config': 'ការកំណត់',
      'JSON Request Body មិនត្រឹមត្រូវ!': 'ខ្លឹមសារ JSON សម្រាប់សំណើមិនត្រឹមត្រូវ!',
      'Microservices & API Gateway Management Portal': 'ផតថលគ្រប់គ្រង Microservices និង API Gateway',
      'គ្រប់គ្រង API & តាមដាន Error តាម Microservices (Service Diagnostics)': 'គ្រប់គ្រង API និងវិភាគសេវាកម្ម',
      'ពិនិត្យមើលការតភ្ជាប់ API Gateway, ស្ថានភាព Microservice នីមួយៗ និងតាមដាន Error Logs ជាក់ស្តែង': 'ពិនិត្យការតភ្ជាប់ API Gateway ស្ថានភាពសេវាកម្ម និងកំណត់ត្រាកំហុសជាក់ស្តែង',
      'Gateway & Diagnostics': 'ការវិនិច្ឆ័យ Gateway',
      'API & Services': 'API និងសេវាកម្ម',
      'Health, routes & errors': 'ស្ថានភាពសេវាកម្ម បណ្តាញ និងកំហុស',
      'Event Stream': 'លំហូរព្រឹត្តិការណ៍',
      'Live API Traffic': 'ចរាចរ API ជាក់ស្តែង',
      'Management API Service': 'សេវាកម្មគ្រប់គ្រង API',
      'Services UP': 'សេវាកម្មកំពុងដំណើរការ',
      'Unresolved Errors': 'កំហុសមិនទាន់ដោះស្រាយ',
      '+ លក់សំបុត្រថ្មី (New Sale)': '+ លក់សំបុត្រថ្មី',
      'ចំណូលតាមព្រឹត្តិការណ៍នីមួយៗ (Sales by Event Performance)': 'លទ្ធផលការលក់តាមកម្មវិធី',
      'ប្រតិបត្តិការទិញ-លក់របស់អតិថិជន (Recent Customer Purchases & Orders)': 'ការបញ្ជាទិញថ្មីៗរបស់អតិថិជន',
      'វិក្កយបត្រ (Invoice)': 'វិក្កយបត្រ',
      'វិក្កយបត្រការលក់សំបុត្រ (Sales Receipt)': 'បង្កាន់ដៃលក់សំបុត្រ',
      'ទឹកប្រាក់សរុប (Total Paid):': 'ទឹកប្រាក់សរុបដែលបានបង់:',
      'បោះពុម្ព (Print)': 'បោះពុម្ព',
      'បិទផ្ទាំង (Done)': 'រួចរាល់',
      'Payment Service Engine:': 'ម៉ាស៊ីនសេវាកម្មទូទាត់:',
      'Online (:8085)': 'កំពុងដំណើរការ (:8085)',
      'Verified Buyer': 'អ្នកទិញដែលបានផ្ទៀងផ្ទាត់',
      'Search orders by invoice #, event, or customer...': 'ស្វែងរកតាមលេខវិក្កយបត្រ កម្មវិធី ឬអតិថិជន...',
      'New Order / Checkout': 'បញ្ជាទិញថ្មី / ទូទាត់',
      'View Pass': 'មើលប័ណ្ណចូល',
      'No orders match the current criteria.': 'រកមិនឃើញការបញ្ជាទិញតាមលក្ខខណ្ឌនេះទេ។',
      'Ticket Reservation & Checkout': 'ការកក់សំបុត្រ និងការទូទាត់',
      'Interactive Venue Seating:': 'ផែនទីកៅអីក្នុងទីតាំង:',
      'Click any seat to lock or buy': 'ចុចលើកៅអី ដើម្បីចាក់សោ ឬទិញ',
      'Redis Locked': 'បានចាក់សោដោយ Redis',
      'Sold Out': 'លក់អស់',
      'Lock Seat (Redis)': 'ចាក់សោកៅអី (Redis)',
      'Checkout Now': 'ទូទាត់ឥឡូវនេះ',
      'Complete Purchase': 'បញ្ចប់ការទិញ',
      'កំពុងជ្រើសរើស ✓': 'បានជ្រើសរើស ✓',
      'ចុចមើល Error →': 'ចុចមើលកំហុស →',
    } : {
      'ប្រព័ន្ធគ្រប់គ្រងការលក់សំបុត្រ និងពាណិជ្ជកម្ម': 'Ticket sales and commerce management system',
      'ទិដ្ឋភាពសម្រាប់អ្នកគ្រប់គ្រង': 'Administrator view',
      'នាំចេញរបាយការណ៍លក់ជា CSV': 'Export sales report as CSV',
      'នាំចេញ CSV': 'Export CSV',
      'ផ្ទាំងគ្រប់គ្រងការលក់ និងចំណូលសំបុត្រ': 'Ticket sales and revenue dashboard',
      'ចំណូលសរុប': 'Total revenue',
      'សំបុត្រដែលបានលក់': 'Tickets sold',
      'តម្លៃបញ្ជាទិញជាមធ្យម (AOV)': 'Average order value (AOV)',
      'ការទូទាត់ដែលកំពុងរង់ចាំ': 'Pending payments',
      'និន្នាការការលក់សំបុត្រ និងចំណូល': 'Ticket sales and revenue trend',
      'មធ្យោបាយទូទាត់ប្រាក់': 'Payment methods',
      'ចំនួនការបញ្ជាទិញ': 'Number of orders',
      'ផតថលគ្រប់គ្រងអាជីវកម្ម និងរដ្ឋបាល': 'Business and administration portal',
      'ផ្ទាំងគ្រប់គ្រងការលក់': 'Sales dashboard',
      'កម្មវិធី និងកាតាឡុកកម្មវិធី': 'Events and event catalog',
      'ស្តុកសំបុត្រ និងកៅអី': 'Ticket and seat inventory',
      'ការបញ្ជាទិញ និងការទូទាត់': 'Orders and checkout',
      'បញ្ជីប្រតិបត្តិការទូទាត់': 'Payment transaction ledger',
      'អ្នកប្រើប្រាស់ និងសិទ្ធិ RBAC': 'Users and RBAC permissions',
      'មជ្ឈមណ្ឌល API និងសេវាកម្ម': 'API and services hub',
      'គ្រប់គ្រង API និងវិភាគកំហុស': 'API management and error diagnostics',
      'លំហូរព្រឹត្តិការណ៍ Kafka និងការជូនដំណឹង': 'Kafka event stream and notifications',
      'របៀបសាកល្បងកំពុងដំណើរការ': 'Simulator active',
      'Gateway ផ្ទាល់ :8080': 'Live Gateway :8080',
      'ការកំណត់': 'Configuration',
      'ខ្លឹមសារ JSON សម្រាប់សំណើមិនត្រឹមត្រូវ!': 'Invalid JSON request body!',
      'ផតថលគ្រប់គ្រង Microservices និង API Gateway': 'Microservices and API Gateway management portal',
      'គ្រប់គ្រង API និងវិភាគសេវាកម្ម': 'API management and service diagnostics',
      'ពិនិត្យការតភ្ជាប់ API Gateway ស្ថានភាពសេវាកម្ម និងកំណត់ត្រាកំហុសជាក់ស្តែង': 'Monitor API Gateway connectivity, service health, and real-time error logs',
      'ការវិនិច្ឆ័យ Gateway': 'Gateway diagnostics',
      'API និងសេវាកម្ម': 'API and services',
      'ស្ថានភាពសេវាកម្ម បណ្តាញ និងកំហុស': 'Service health, routes, and errors',
      'លំហូរព្រឹត្តិការណ៍': 'Event stream',
      'ចរាចរ API ជាក់ស្តែង': 'Live API traffic',
      'សេវាកម្មគ្រប់គ្រង API': 'Management API service',
      'សេវាកម្មកំពុងដំណើរការ': 'Services online',
      'កំហុសមិនទាន់ដោះស្រាយ': 'Unresolved errors',
      'ផ្ទាំងសង្ខេប': 'Overview',
      'កម្មវិធី & Shows': 'Events & Shows',
      'សំបុត្រ & កៅអី': 'Tickets & Seats',
      'ការកុម្ម៉ង់': 'Orders',
      'ការទូទាត់': 'Payments',
      'អ្នកប្រើប្រាស់': 'Users',
      'សេចក្តីសង្ខេបការលក់': 'Sales overview',
      'កាតាឡុកកម្មវិធី': 'Events catalog',
      'ស្តុកសំបុត្រ': 'Ticket inventory',
      'ការកុម្ម៉ង់ និង checkout': 'Orders and checkout',
      'បញ្ជីទូទាត់ប្រាក់': 'Payment ledger',
      'អ្នកប្រើប្រាស់ និង RBAC': 'Users and RBAC',
      'ការលក់ និងចំណូល': 'Sales and revenue',
      'គ្រប់គ្រង API': 'Management API',
      'សេវាកម្មដំណើរការ': 'Services online',
      'កន្លែងធ្វើការ': 'Workspace',
      'API និង Services': 'API and services',
      'សុខភាព, routes និង errors': 'Service health, routes, and errors',
      'ការជូនដំណឹង Kafka': 'Kafka notifications',
      '+ លក់សំបុត្រថ្មី': '+ New ticket sale',
      'លទ្ធផលការលក់តាមកម្មវិធី': 'Sales performance by event',
      'ការបញ្ជាទិញថ្មីៗរបស់អតិថិជន': 'Recent customer orders',
      'វិក្កយបត្រ': 'Invoice',
      'បង្កាន់ដៃលក់សំបុត្រ': 'Ticket sales receipt',
      'ទឹកប្រាក់សរុបដែលបានបង់:': 'Total paid:',
      'បោះពុម្ព': 'Print',
      'រួចរាល់': 'Done',
      'ម៉ាស៊ីនសេវាកម្មទូទាត់:': 'Payment service engine:',
      'កំពុងដំណើរការ (:8085)': 'Online (:8085)',
      'អ្នកទិញដែលបានផ្ទៀងផ្ទាត់': 'Verified buyer',
      'ស្វែងរកតាមលេខវិក្កយបត្រ កម្មវិធី ឬអតិថិជន...': 'Search orders by invoice number, event, or customer...',
      'បញ្ជាទិញថ្មី / ទូទាត់': 'New order / checkout',
      'មើលប័ណ្ណចូល': 'View pass',
      'រកមិនឃើញការបញ្ជាទិញតាមលក្ខខណ្ឌនេះទេ។': 'No orders match the current criteria.',
      'ការកក់សំបុត្រ និងការទូទាត់': 'Ticket reservation and checkout',
      'ផែនទីកៅអីក្នុងទីតាំង:': 'Interactive venue seating:',
      'ចុចលើកៅអី ដើម្បីចាក់សោ ឬទិញ': 'Click any seat to lock or buy',
      'បានចាក់សោដោយ Redis': 'Redis locked',
      'លក់អស់': 'Sold out',
      'ចាក់សោកៅអី (Redis)': 'Lock seat (Redis)',
      'ទូទាត់ឥឡូវនេះ': 'Checkout now',
      'បញ្ចប់ការទិញ': 'Complete purchase',
      'បានជ្រើសរើស ✓': 'Selected ✓',
      'ចុចមើលកំហុស →': 'View errors →',
    }),
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  nodes.forEach((textNode) => {
    const raw = textNode.nodeValue || '';
    if (!originalTextNodes.has(textNode)) originalTextNodes.set(textNode, raw);
    const sourceText = originalTextNodes.get(textNode) || raw;
    const trimmed = sourceText.trim();
    if (!trimmed || textNode.parentElement?.closest('script,style,textarea')) return;
    const entries = Object.entries(dictionary).sort(([a], [b]) => b.length - a.length);
    const escapedSources = entries.map(([source]) => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const sourcePattern = escapedSources.length > 0 ? new RegExp(escapedSources.join('|'), 'g') : null;
    const translated = sourcePattern
      ? sourceText.replace(sourcePattern, (match) => dictionary[match] || match)
      : sourceText;
    if (translated !== raw) textNode.nodeValue = translated;
  });
  document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && dictionary[value]) element.setAttribute(attribute, dictionary[value]);
    });
  });
};

export { translateDocument };
