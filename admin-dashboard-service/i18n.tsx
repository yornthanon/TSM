import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'km';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; isKhmer: boolean };
const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Language, Record<string, string>> = {
  km: {
    'Overview': 'ផ្ទាំងសង្ខេប', 'Events': 'កម្មវិធី', 'Tickets': 'សំបុត្រ', 'Orders': 'ការកុម្ម៉ង់', 'Payments': 'ការទូទាត់', 'Users': 'អ្នកប្រើប្រាស់', 'Dashboard': 'ផ្ទាំងគ្រប់គ្រង', 'Admin modules': 'ម៉ូឌុល Admin', 'API modules': 'ម៉ូឌុល API', 'Search': 'ស្វែងរក', 'Filter': 'តម្រង', 'Sort': 'តម្រៀប', 'Actions': 'សកម្មភាព', 'Status': 'ស្ថានភាព', 'Role': 'តួនាទី', 'Phone': 'ទូរស័ព្ទ', 'User': 'អ្នកប្រើប្រាស់', 'Email': 'អ៊ីមែល', 'Created': 'កាលបរិច្ឆេទបង្កើត', 'Name': 'ឈ្មោះ', 'Price': 'តម្លៃ', 'Date': 'កាលបរិច្ឆេទ', 'Title': 'ចំណងជើង', 'Category': 'ប្រភេទ', 'Location': 'ទីតាំង', 'Capacity': 'ចំណុះ', 'Edit': 'កែប្រែ', 'Delete': 'លុប', 'Cancel': 'បោះបង់', 'Save changes': 'រក្សាទុកការកែប្រែ', 'Create account': 'បង្កើតគណនី', 'New user': 'អ្នកប្រើប្រាស់ថ្មី', 'Edit user': 'កែប្រែអ្នកប្រើប្រាស់', 'Edit event': 'កែប្រែកម្មវិធី', 'Publish new event': 'បង្កើតកម្មវិធីថ្មី', 'Publish event': 'បង្កើតកម្មវិធី', 'No users found': 'រកមិនឃើញអ្នកប្រើប្រាស់', 'No events found': 'រកមិនឃើញកម្មវិធី', 'Try another search term': 'សាកល្បងពាក្យស្វែងរកផ្សេងទៀត', 'Try clearing filters or searching another term': 'សាកល្បងលុបតម្រង ឬស្វែងរកពាក្យផ្សេង', 'Login': 'ចូលប្រើ', 'Logged in': 'កំពុងប្រើ', 'Book': 'កក់', 'Order': 'កុម្ម៉ង់', 'Save': 'រក្សាទុក', 'Refresh': 'ធ្វើបច្ចុប្បន្នភាព', 'Loading...': 'កំពុងដំណើរការ...', 'No data': 'គ្មានទិន្នន័យ', 'Available': 'ទំនេរ', 'Locked': 'បានចាក់សោ', 'Sold': 'លក់រួច', 'Search by username, email, or role...': 'ស្វែងរកតាមឈ្មោះ, អ៊ីមែល ឬតួនាទី...', 'Search by ticket code or seat number...': 'ស្វែងរកតាមលេខសំបុត្រ ឬលេខកៅអី...', 'Search by title, artist, or venue...': 'ស្វែងរកតាមចំណងជើង ឬទីតាំង...', 'View seats': 'មើលកៅអី', 'Book ticket': 'កក់សំបុត្រ', 'Login as user': 'ចូលជាអ្នកប្រើប្រាស់', 'Register new user': 'បង្កើតអ្នកប្រើប្រាស់ថ្មី', 'Ticket Code': 'លេខសំបុត្រ', 'Event Title': 'ចំណងជើងកម្មវិធី', 'Seat Number': 'លេខកៅអី', 'Tier': 'កម្រិត', 'Base Price': 'តម្លៃដើម', 'Event Category': 'ប្រភេទកម្មវិធី', 'Date & Time': 'កាលបរិច្ឆេទ និងម៉ោង', 'Venue Location': 'ទីតាំងកម្មវិធី', 'Total Capacity': 'ចំណុះសរុប', 'Username *': 'ឈ្មោះអ្នកប្រើប្រាស់ *', 'Phone number *': 'លេខទូរស័ព្ទ *', 'Gateway online': 'Gateway ដំណើរការ', 'Business services healthy': 'សេវាកម្មអាជីវកម្មដំណើរការ', 'Live traffic': 'ចរាចរ API', 'API Gateway & Service Diagnostics': 'API Gateway និងការត្រួតពិនិត្យ Service', 'Event Stream Monitoring': 'តាមដាន Event Stream', 'ចំណូល': 'Revenue', 'ស្វែងរក Order #, អតិថិជន...': 'Search Order # or customer...', 'JSON Request Body មិនត្រឹមត្រូវ!': 'Invalid JSON request body!', 'កំពុងជ្រើសរើស ✓': 'Selected ✓', 'ចុចមើល Error →': 'View errors →', 'សាកល្បងលុប filter ឬស្វែងរកពាក្យផ្សេង': 'Try clearing filters or another search', 'ស្វែងរកកម្មវិធី កក់កៅអី និងបង្កើតកម្មវិធីថ្មី': 'Discover events, reserve seats, and publish new events', 'ស្វែងរកតាមឈ្មោះ ឬទីតាំង...': 'Search by name or location...', 'កម្មវិធី និងកាតាឡុកសំបុត្រ': 'Events and ticket catalog', 'កាតកម្មវិធី': 'Cards', 'តារាង': 'Table', 'បានកែប្រែកម្មវិធីជោគជ័យ': 'Event updated successfully', 'មានបញ្ហា': 'Error', 'មើលកៅអី': 'View seats', 'លុបកម្មវិធីបានជោគជ័យ': 'Event deleted successfully', 'លុបមិនបានសម្រេច': 'Delete failed', 'គ្រប់គ្រងតួនាទី សិទ្ធិ និងគណនីអ្នកប្រើប្រាស់': 'Manage roles, permissions, and user accounts', 'ចូលជា user': 'Login as user', 'បង្កើតអ្នកប្រើប្រាស់': 'New user', 'បង្កើតអ្នកប្រើប្រាស់ថ្មី': 'Register new user', 'បានកែប្រែអ្នកប្រើប្រាស់ជោគជ័យ': 'User updated successfully', 'រក្សាទុកមិនបានសម្រេច': 'Save failed', 'លុបអ្នកប្រើប្រាស់បានជោគជ័យ': 'User deleted successfully', 'អ្នកប្រើប្រាស់ និងសិទ្ធិ RBAC': 'Users and RBAC security', 'ផ្ទាំង Admin': 'Admin Dashboard', 'កន្លែងធ្វើការ': 'Workspace', 'ការគ្រប់គ្រងអាជីវកម្ម': 'BUSINESS OPERATIONS', 'គ្រប់គ្រង API →': 'Management API →', 'សេវាកម្មដំណើរការ': 'Business services healthy', 'ការលក់ និងចំណូល': 'Sales & Revenue', 'សេចក្តីសង្ខេបការលក់': 'Sales overview', 'កម្មវិធី & Shows': 'Events & Shows', 'កាតាឡុកកម្មវិធី': 'Events catalog', 'ការកុម្ម៉ង់ និង checkout': 'Orders & checkout', 'បញ្ជីទូទាត់ប្រាក់': 'Payment ledger', 'ស្តុកសំបុត្រ': 'Ticket inventory', 'អ្នកប្រើប្រាស់ និង RBAC': 'Users & RBAC', 'គ្រប់គ្រង API': 'Management API', 'ប្រតិបត្តិការប្រព័ន្ធ': 'PLATFORM OPERATIONS', 'Gateway និង Diagnostics': 'Gateway & Diagnostics', 'ការជូនដំណឹង Kafka': 'Kafka notifications', 'សុខភាព, routes និង errors': 'Health, routes & errors', 'ចរាចរ API': 'Live traffic', 'Gateway ដំណើរការ': 'Gateway online', 'ផ្ទាំងគ្រប់គ្រងការលក់ និងចំណូលសំបុត្រ (Sales & Revenue)': 'Ticket Sales & Revenue Dashboard', 'តាមដានទិន្នន័យការទិញ-លក់សំបុត្រជាក់ស្តែង ចំណូលសរុប និងប្រវត្តិប្រតិបត្តិការរបស់អតិថិជន': 'Track real-time ticket sales, total revenue, and customer transaction history', '+ លក់សំបុត្រថ្មី (New Sale)': '+ New sale', 'ចំណូលសរុប (Total Revenue)': 'Total revenue', 'ពីការបញ្ជាទិញជោគជ័យចំនួន': 'from completed orders', 'សំបុត្រលក់ចេញ (Tickets Sold)': 'Tickets sold', 'សំបុត្រ/កៅអី': 'tickets/seats', 'មធ្យមភាគក្នុងមួយ Order (AOV)': 'Average order value (AOV)', 'មធ្យម': 'Average', 'អតិថិជនជាមធ្យមទិញ 1.8 សំបុត្រ/លើក': 'Customers buy 1.8 tickets per order on average', 'ដំណើរការទូទាត់ (Pending)': 'Pending payments', 'កំពុងរង់ចាំការបញ្ជាក់ពីធនាគារ': 'Waiting for bank confirmation', 'និន្នាការនៃការលក់សំបុត្រ (Ticket Sales & Revenue Trend)': 'Ticket sales & revenue trend', 'ស្ថិតិចំណូលប្រចាំថ្ងៃ និងបរិមាណសំបុត្រដែលបានទិញតាមប្រព័ន្ធ': 'Daily revenue and ticket volume statistics', 'ចំណូល ($)': 'Revenue ($)', 'ចំនួនសំបុត្រ': 'Tickets', 'ចំនួន Orders': 'Orders', 'សរុបចំណូលសរុបក្នុងប្រព័ន្ធ:': 'Total revenue in system:', 'ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាពតាម Real-time': 'Data updates in real time', 'វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Channels)': 'Payment channels', 'ការទូទាត់តាមធនាគារក្នុងស្រុក និងកាតអន្តរជាតិ': 'Local bank and international card payments', 'ប្រតិបត្តិការ': 'transactions', 'នៃចំណូលសរុប': 'of total revenue', 'Orders កំពុងរង់ចាំ': 'pending orders', 'ចំណូលតាមព្រឹត្តិការណ៍នីមួយៗ (Sales by Event Performance)': 'Sales by event performance', 'ចំនួនសំបុត្រដែលបានលក់ចេញ និងចំណូលសរុបគិតតាមកម្មវិធីប្រគំតន្ត្រី និងសន្និសីទ': 'Tickets sold and total revenue by concert and conference', 'គ្រប់គ្រងព្រឹត្តិការណ៍': 'Manage events', 'សំបុត្រលក់បាន:': 'Tickets sold:', 'តម្លៃគោល:': 'Base price:', 'ប្រតិបត្តិការទិញ-លក់របស់អតិថិជន (Recent Customer Purchases & Orders)': 'Recent customer purchases & orders', 'រាយនាមការបញ្ជាទិញជាក់ស្តែងក្នុងប្រព័ន្ធ សម្រាប់ Admin ត្រួតពិនិត្យ និងចេញវិក្កយបត្រ': 'Recent orders for admin review and invoicing', 'ស្ថានភាពទាំងអស់': 'All statuses', 'ជោគជ័យ': 'Completed', 'ដំណើរការ': 'Processing', 'លុបចោល': 'Cancelled', 'Order ID & កាលបរិច្ឆេទ': 'Order ID & date', 'អតិថិជន (Customer)': 'Customer', 'ព្រឹត្តិការណ៍ (Event)': 'Event', 'កូដសំបុត្រ (Ticket)': 'Ticket code', 'ចំនួនទឹកប្រាក់': 'Amount', 'ស្ថានភាព (Status)': 'Status', 'វិក្កយបត្រ (Invoice)': 'Invoice', 'រកមិនឃើញការបញ្ជាទិញដែលត្រូវនឹងការស្វែងរកនេះទេ។': 'No orders match your search.', 'វិក្កយបត្រការលក់សំបុត្រ (Sales Receipt)': 'Ticket sales receipt', 'អតិថិជន (Buyer):': 'Buyer:', 'កូដសំបុត្រ (Ticket Code):': 'Ticket code:', 'ចំនួនសំបុត្រ:': 'Ticket quantity:', 'ស្ថានភាពការទូទាត់:': 'Payment status:', 'ទឹកប្រាក់សរុប (Total Paid):': 'Total paid:', 'បោះពុម្ព (Print)': 'Print', 'បិទផ្ទាំង (Done)': 'Done',
  },
  en: {
    'ផ្ទាំងសង្ខេប': 'Overview', 'កម្មវិធី': 'Events', 'សំបុត្រ': 'Tickets', 'សំបុត្រ & កៅអី': 'Tickets & Seats', 'ការកុម្ម៉ង់': 'Orders', 'ការទូទាត់': 'Payments', 'អ្នកប្រើប្រាស់': 'Users', 'ផ្ទាំងគ្រប់គ្រង': 'Dashboard', 'ម៉ូឌុល Admin': 'Admin modules', 'ម៉ូឌុល API': 'API modules', 'ស្វែងរក': 'Search', 'តម្រង': 'Filter', 'តម្រៀប': 'Sort', 'សកម្មភាព': 'Actions', 'ស្ថានភាព': 'Status', 'តួនាទី': 'Role', 'ទូរស័ព្ទ': 'Phone', 'អ៊ីមែល': 'Email', 'កាលបរិច្ឆេទ': 'Date', 'ឈ្មោះ': 'Name', 'តម្លៃ': 'Price', 'ចំណងជើង': 'Title', 'ប្រភេទ': 'Category', 'ទីតាំង': 'Location', 'ចំណុះ': 'Capacity', 'កែប្រែ': 'Edit', 'លុប': 'Delete', 'បោះបង់': 'Cancel', 'រក្សាទុកការកែប្រែ': 'Save changes', 'បង្កើតគណនី': 'Create account', 'អ្នកប្រើប្រាស់ថ្មី': 'New user', 'កែប្រែអ្នកប្រើប្រាស់': 'Edit user', 'កែប្រែកម្មវិធី': 'Edit event', 'បង្កើតកម្មវិធីថ្មី': 'Publish new event', 'បង្កើតកម្មវិធី': 'Publish event', 'រកមិនឃើញអ្នកប្រើប្រាស់': 'No users found', 'រកមិនឃើញកម្មវិធី': 'No events found', 'សាកល្បងពាក្យស្វែងរកផ្សេងទៀត': 'Try another search term', 'សាកល្បងលុបតម្រង ឬស្វែងរកពាក្យផ្សេង': 'Try clearing filters or searching another term', 'ចូលប្រើ': 'Login', 'កំពុងប្រើ': 'Logged in', 'កក់': 'Book', 'កុម្ម៉ង់': 'Order', 'រក្សាទុក': 'Save', 'កំពុងដំណើរការ...': 'Loading...', 'គ្មានទិន្នន័យ': 'No data', 'ទំនេរ': 'Available', 'បានចាក់សោ': 'Locked', 'លក់រួច': 'Sold', 'លេខសំបុត្រ': 'Ticket Code', 'ចំណងជើងកម្មវិធី': 'Event Title', 'លេខកៅអី': 'Seat Number', 'កម្រិត': 'Tier', 'តម្លៃដើម': 'Base Price', 'ប្រភេទកម្មវិធី': 'Event Category', 'កាលបរិច្ឆេទ និងម៉ោង': 'Date & Time', 'ទីតាំងកម្មវិធី': 'Venue Location', 'ចំណុះសរុប': 'Total capacity', 'ឈ្មោះអ្នកប្រើប្រាស់ *': 'Username *', 'លេខទូរស័ព្ទ *': 'Phone number *', 'សេវាកម្មអាជីវកម្មដំណើរការ': 'Business services healthy', 'API Gateway និងការត្រួតពិនិត្យ Service': 'API Gateway & Service Diagnostics', 'តាមដាន Event Stream': 'Event Stream Monitoring',
  },
};

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
    const trimmed = raw.trim();
    if (!trimmed || textNode.parentElement?.closest('script,style,textarea')) return;
    let translated = raw;
    Object.entries(dictionary).forEach(([source, target]) => {
      if (translated.includes(source)) translated = translated.split(source).join(target);
    });
    if (translated !== raw) textNode.nodeValue = translated;
  });
  document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value && dictionary[value]) element.setAttribute(attribute, dictionary[value]);
    });
  });
};

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'en' || requested === 'km') {
      localStorage.setItem('tsm_language', requested);
      return requested;
    }
    const saved = localStorage.getItem('tsm_language');
    return saved === 'en' || saved === 'km' ? saved : 'km';
  });

  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
    const apply = () => translateDocument(language);
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({
    language,
    isKhmer: language === 'km',
    setLanguage: (next: Language) => {
      setLanguageState(next);
      localStorage.setItem('tsm_language', next);
      window.setTimeout(() => window.location.reload(), 0);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};

export const LanguageSwitcher: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const { language, setLanguage } = useLanguage();
  return <div className={`inline-flex items-center gap-0.5 rounded-lg p-1 border ${dark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`} aria-label="Language selector"><button onClick={() => setLanguage('km')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'km' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>ខ្មែរ</button><button onClick={() => setLanguage('en')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${language === 'en' ? (dark ? 'bg-cyan-600 text-white' : 'bg-white text-indigo-700 shadow-sm') : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>EN</button></div>;
};
