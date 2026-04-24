const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';
const dict = {
  en: {
    layout: { dashboard: 'Dashboard', leads: 'Leads & Pipeline', profile: 'Store Profile', settings: 'Settings', portal: 'Partner Portal', signOut: 'Sign Out' },
    dashboard: { title: 'Dashboard', subtitle: 'Welcome back. Here\'s what\'s happening at your store.', showQr: 'Show In-Store QR', totalScans: 'Total Scans', activeLeads: 'Active Leads', estCommissions: 'Est. Commissions', fromLastMonth: 'from last month', newThisWeek: 'new this week', leadsPending: 'leads pending closure', recentActivity: 'Recent Activity' },
    leads: { title: 'Leads & Pipeline', subtitle: 'Track your customers\' progress and estimated commissions.', exportCsv: 'Export CSV', searchId: 'Search ID...', filterStatus: 'Filter by Status', cols: { id: 'Customer ID', date: 'Scan Date', source: 'Scan Source', status: 'Status', budget: 'Est. Budget', actions: 'Actions' } },
    profile: { title: 'Store Profile', subtitle: 'Manage your store details and co-branding settings.', basicInfo: 'Basic Information', storeName: 'Store Name', storeType: 'Store Type', address: 'Address', email: 'Email', phone: 'Phone', saveChanges: 'Save Changes', cobranding: 'Co-Branding', cobrandingDesc: 'Upload your logo to appear on the customer landing page when they scan your QR codes.', clickToUpload: 'Click to upload logo', fileTypes: 'SVG, PNG, or JPG (max. 2MB)', networkGroup: 'Network Group', networkDesc: 'Your store is an independent partner. If you belong to a larger chain, you can link your account.', linkChain: 'Link to Chain/Group', types: { hardware: 'Hardware Store', pharmacy: 'Pharmacy', restaurant: 'Restaurant', other: 'Other' } }
  },
  es: {
    layout: { dashboard: 'Panel', leads: 'Oportunidades', profile: 'Perfil de Tienda', settings: 'Ajustes', portal: 'Portal de Socios', signOut: 'Cerrar Sesión' },
    dashboard: { title: 'Panel', subtitle: 'Bienvenido. Esto es lo que sucede en tu tienda.', showQr: 'Mostrar QR', totalScans: 'Escaneos', activeLeads: 'Oportunidades Activas', estCommissions: 'Comisiones Est.', fromLastMonth: 'desde el mes pasado', newThisWeek: 'nuevos esta semana', leadsPending: 'cierres pendientes', recentActivity: 'Actividad Reciente' },
    leads: { title: 'Oportunidades', subtitle: 'Sigue el progreso y las comisiones.', exportCsv: 'Exportar CSV', searchId: 'Buscar ID...', filterStatus: 'Filtrar', cols: { id: 'ID Cliente', date: 'Fecha', source: 'Origen', status: 'Estado', budget: 'Presupuesto', actions: 'Acciones' } },
    profile: { title: 'Perfil de Tienda', subtitle: 'Gestiona los detalles y la marca.', basicInfo: 'Información Básica', storeName: 'Nombre de Tienda', storeType: 'Tipo', address: 'Dirección', email: 'Email', phone: 'Teléfono', saveChanges: 'Guardar', cobranding: 'Co-Branding', cobrandingDesc: 'Sube tu logo para la página de clientes.', clickToUpload: 'Haz clic para subir', fileTypes: 'SVG, PNG o JPG (máx 2MB)', networkGroup: 'Grupo de Red', networkDesc: 'Eres independiente. Enlázate si eres parte de una cadena.', linkChain: 'Enlazar a Cadena', types: { hardware: 'Ferretería', pharmacy: 'Farmacia', restaurant: 'Restaurante', other: 'Otro' } }
  },
  de: {
    layout: { dashboard: 'Dashboard', leads: 'Leads & Pipeline', profile: 'Shop-Profil', settings: 'Einstellungen', portal: 'Partnerportal', signOut: 'Abmelden' },
    dashboard: { title: 'Dashboard', subtitle: 'Willkommen zurück. Das passiert in Ihrem Shop.', showQr: 'QR anzeigen', totalScans: 'Gesamte Scans', activeLeads: 'Aktive Leads', estCommissions: 'Geschätzte Provisionen', fromLastMonth: 'seit letztem Monat', newThisWeek: 'neu diese Woche', leadsPending: 'ausstehende Abschlüsse', recentActivity: 'Letzte Aktivität' },
    leads: { title: 'Leads & Pipeline', subtitle: 'Verfolgen Sie Fortschritte und Provisionen.', exportCsv: 'CSV exportieren', searchId: 'ID suchen...', filterStatus: 'Status filtern', cols: { id: 'Kunden-ID', date: 'Datum', source: 'Quelle', status: 'Status', budget: 'Budget', actions: 'Aktionen' } },
    profile: { title: 'Shop-Profil', subtitle: 'Details und Co-Branding verwalten.', basicInfo: 'Grundinformationen', storeName: 'Shop-Name', storeType: 'Typ', address: 'Adresse', email: 'E-Mail', phone: 'Telefon', saveChanges: 'Speichern', cobranding: 'Co-Branding', cobrandingDesc: 'Logo für Kunden-Landingpage hochladen.', clickToUpload: 'Klicken zum Hochladen', fileTypes: 'SVG, PNG oder JPG (max 2MB)', networkGroup: 'Netzwerkgruppe', networkDesc: 'Unabhängiger Partner. Bei Kette verknüpfen.', linkChain: 'Mit Kette verknüpfen', types: { hardware: 'Baumarkt', pharmacy: 'Apotheke', restaurant: 'Restaurant', other: 'Andere' } }
  },
  fr: {
    layout: { dashboard: 'Tableau de bord', leads: 'Opportunités', profile: 'Profil du Magasin', settings: 'Paramètres', portal: 'Portail Partenaire', signOut: 'Déconnexion' },
    dashboard: { title: 'Tableau de bord', subtitle: 'Bienvenue. Voici ce qui se passe.', showQr: 'Afficher le QR', totalScans: 'Scans Totaux', activeLeads: 'Opportunités Actives', estCommissions: 'Commissions Est.', fromLastMonth: 'depuis le mois dernier', newThisWeek: 'nouveaux cette semaine', leadsPending: 'clôtures en attente', recentActivity: 'Activité Récente' },
    leads: { title: 'Opportunités', subtitle: 'Suivez les progrès et commissions.', exportCsv: 'Exporter CSV', searchId: 'Chercher ID...', filterStatus: 'Filtrer', cols: { id: 'ID Client', date: 'Date', source: 'Source', status: 'Statut', budget: 'Budget', actions: 'Actions' } },
    profile: { title: 'Profil', subtitle: 'Gérer les détails et le co-branding.', basicInfo: 'Informations de Base', storeName: 'Nom du Magasin', storeType: 'Type', address: 'Adresse', email: 'Email', phone: 'Téléphone', saveChanges: 'Enregistrer', cobranding: 'Co-Branding', cobrandingDesc: 'Uploadez votre logo.', clickToUpload: 'Cliquez pour uploader', fileTypes: 'SVG, PNG ou JPG (max 2MB)', networkGroup: 'Réseau', networkDesc: 'Partenaire indépendant. Lier à une chaîne.', linkChain: 'Lier à la chaîne', types: { hardware: 'Quincaillerie', pharmacy: 'Pharmacie', restaurant: 'Restaurant', other: 'Autre' } }
  },
  pt: {
    layout: { dashboard: 'Painel', leads: 'Leads e Funil', profile: 'Perfil da Loja', settings: 'Configurações', portal: 'Portal do Parceiro', signOut: 'Sair' },
    dashboard: { title: 'Painel', subtitle: 'Bem-vindo de volta.', showQr: 'Mostrar QR', totalScans: 'Total de Scans', activeLeads: 'Leads Ativos', estCommissions: 'Comissões Est.', fromLastMonth: 'do mês passado', newThisWeek: 'novos esta semana', leadsPending: 'fechamentos pendentes', recentActivity: 'Atividade Recente' },
    leads: { title: 'Leads e Funil', subtitle: 'Acompanhe o progresso e as comissões.', exportCsv: 'Exportar CSV', searchId: 'Buscar ID...', filterStatus: 'Filtrar', cols: { id: 'ID Cliente', date: 'Data', source: 'Origem', status: 'Status', budget: 'Orçamento', actions: 'Ações' } },
    profile: { title: 'Perfil', subtitle: 'Gerencie os detalhes e a marca.', basicInfo: 'Informação Básica', storeName: 'Nome da Loja', storeType: 'Tipo', address: 'Endereço', email: 'Email', phone: 'Telefone', saveChanges: 'Salvar', cobranding: 'Co-Branding', cobrandingDesc: 'Faça upload do seu logotipo.', clickToUpload: 'Clique para fazer upload', fileTypes: 'SVG, PNG ou JPG (máx 2MB)', networkGroup: 'Rede', networkDesc: 'Parceiro independente. Vincular a rede.', linkChain: 'Vincular a Rede', types: { hardware: 'Loja de Ferragens', pharmacy: 'Farmácia', restaurant: 'Restaurante', other: 'Outro' } }
  },
  ca: {
    layout: { dashboard: 'Tauler', leads: 'Oportunitats', profile: 'Perfil de Botiga', settings: 'Configuració', portal: 'Portal de Socis', signOut: 'Tancar Sessió' },
    dashboard: { title: 'Tauler', subtitle: 'Benvingut de nou. Això és el que passa a la teva botiga.', showQr: 'Mostrar QR', totalScans: 'Escanejos', activeLeads: 'Oportunitats Actives', estCommissions: 'Comissions Est.', fromLastMonth: 'des del mes passat', newThisWeek: 'nous aquesta setmana', leadsPending: 'tancaments pendents', recentActivity: 'Activitat Recent' },
    leads: { title: 'Oportunitats', subtitle: 'Segueix el progrés i les comissions.', exportCsv: 'Exportar CSV', searchId: 'Cercar ID...', filterStatus: 'Filtrar', cols: { id: 'ID Client', date: 'Data', source: 'Origen', status: 'Estat', budget: 'Pressupost', actions: 'Accions' } },
    profile: { title: 'Perfil de Botiga', subtitle: 'Gestiona els detalls i la marca.', basicInfo: 'Informació Bàsica', storeName: 'Nom de Botiga', storeType: 'Tipus', address: 'Adreça', email: 'Email', phone: 'Telèfon', saveChanges: 'Desar', cobranding: 'Co-Branding', cobrandingDesc: 'Puja el teu logo per a la pàgina de clients.', clickToUpload: 'Fes clic per pujar', fileTypes: 'SVG, PNG o JPG (màx 2MB)', networkGroup: 'Grup de Xarxa', networkDesc: 'Ets independent. Enllaça\'t si ets part d\'una cadena.', linkChain: 'Enllaçar a Cadena', types: { hardware: 'Ferreteria', pharmacy: 'Farmàcia', restaurant: 'Restaurant', other: 'Altre' } }
  },
  eu: {
    layout: { dashboard: 'Panela', leads: 'Aukerak', profile: 'Dendaren Profila', settings: 'Ezarpenak', portal: 'Bazkideen Ataria', signOut: 'Saioa Itxi' },
    dashboard: { title: 'Panela', subtitle: 'Ongi etorri berriro.', showQr: 'Erakutsi QR', totalScans: 'Eskaneatzeak', activeLeads: 'Aukera Aktiboak', estCommissions: 'Est. Komisioak', fromLastMonth: 'azken hilabetetik', newThisWeek: 'aste honetan berriak', leadsPending: 'itxi gabe', recentActivity: 'Azken Jarduera' },
    leads: { title: 'Aukerak', subtitle: 'Jarraitu aurrerapena eta komisioak.', exportCsv: 'Esportatu CSV', searchId: 'Bilatu ID...', filterStatus: 'Iragazi', cols: { id: 'Bezero ID', date: 'Data', source: 'Iturria', status: 'Egoera', budget: 'Aurrekontua', actions: 'Ekintzak' } },
    profile: { title: 'Dendaren Profila', subtitle: 'Kudeatu xehetasunak.', basicInfo: 'Oinarrizko Informazioa', storeName: 'Dendaren Izena', storeType: 'Mota', address: 'Helbidea', email: 'Posta', phone: 'Telefonoa', saveChanges: 'Gorde', cobranding: 'Co-Branding', cobrandingDesc: 'Igo zure logoa.', clickToUpload: 'Egin klik igotzeko', fileTypes: 'SVG, PNG edo JPG', networkGroup: 'Sarea', networkDesc: 'Bazkide independentea zara.', linkChain: 'Estekatu Sareari', types: { hardware: 'Burdindegia', pharmacy: 'Farmazia', restaurant: 'Jatetxea', other: 'Beste bat' } }
  }
};

fs.readdirSync(localesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const lang = file.split('.')[0];
    const fp = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    data.partner = dict[lang] || dict.en;
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    console.log('Updated ' + lang);
  }
});
