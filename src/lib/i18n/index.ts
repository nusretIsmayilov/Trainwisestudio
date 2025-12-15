import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.programs': 'Programs',
      'nav.progress': 'Progress',
      'nav.library': 'Library',
      'nav.coaches': 'Coaches',
      'nav.settings': 'Settings',
      'nav.messages': 'Messages',
      'nav.income': 'Income',
      'nav.clients': 'Clients',
      'nav.blog': 'Blog',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.submit': 'Submit',
      'common.close': 'Close',
      
      // Auth
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.signup': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      'auth.createAccount': 'Create Account',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.dontHaveAccount': "Don't have an account?",
      
      // Onboarding
      'onboarding.welcome': 'Welcome to Harmony Stride',
      'onboarding.selectGoals': 'Select Your Goals',
      'onboarding.personalInfo': 'Personal Information',
      'onboarding.preferences': 'Preferences',
      'onboarding.contact': 'Contact Information',
      'onboarding.complete': 'Setup Complete',
      
      // Dashboard
      'dashboard.welcome': 'Welcome back',
      'dashboard.today': 'Today',
      'dashboard.thisWeek': 'This Week',
      'dashboard.progress': 'Your Progress',
      'dashboard.recommendations': 'AI Recommendations',
      'dashboard.checkIn': 'Daily Check-in',
      
      // Programs
      'programs.title': 'Programs',
      'programs.active': 'Active Programs',
      'programs.completed': 'Completed Programs',
      'programs.startProgram': 'Start Program',
      'programs.viewDetails': 'View Details',
      'programs.markComplete': 'Mark Complete',
      
      // Progress
      'progress.title': 'Progress Tracking',
      'progress.dailyCheckins': 'Daily Check-ins',
      'progress.weight': 'Weight',
      'progress.photos': 'Progress Photos',
      'progress.trends': 'Trends',
      'progress.insights': 'AI Insights',
      
      // Library
      'library.title': 'Library',
      'library.exercises': 'Exercises',
      'library.recipes': 'Recipes',
      'library.meditation': 'Meditation',
      'library.search': 'Search Library',
      'library.categories': 'Categories',
      
      // Coaches
      'coaches.title': 'Find a Coach',
      'coaches.browse': 'Browse Coaches',
      'coaches.specialties': 'Specialties',
      'coaches.experience': 'Experience',
      'coaches.rating': 'Rating',
      'coaches.contact': 'Contact Coach',
      'coaches.request': 'Send Request',
      
      // Settings
      'settings.title': 'Settings',
      'settings.profile': 'Profile',
      'settings.preferences': 'Preferences',
      'settings.notifications': 'Notifications',
      'settings.privacy': 'Privacy',
      'settings.language': 'Language',
      'settings.currency': 'Currency',
      
      // Messages
      'messages.title': 'Messages',
      'messages.new': 'New Message',
      'messages.send': 'Send',
      'messages.typeMessage': 'Type a message...',
      'messages.noMessages': 'No messages yet',
      
      // Income (Coach)
      'income.title': 'Income',
      'income.totalEarnings': 'Total Earnings',
      'income.thisMonth': 'This Month',
      'income.pending': 'Pending',
      'income.withdraw': 'Withdraw',
      'income.payouts': 'Payouts',
      
      // Clients (Coach)
      'clients.title': 'Clients',
      'clients.overview': 'Client Overview',
      'clients.status': 'Status',
      'clients.progress': 'Progress',
      'clients.communication': 'Communication',
      'clients.sendOffer': 'Send Offer',
      'clients.assignProgram': 'Assign Program',
      
      // Blog
      'blog.title': 'Blog',
      'blog.create': 'Create Post',
      'blog.edit': 'Edit Post',
      'blog.publish': 'Publish',
      'blog.draft': 'Save as Draft',
      'blog.categories': 'Categories',
      
      // AI Features
      'ai.recommendations': 'AI Recommendations',
      'ai.generatePlan': 'Generate AI Plan',
      'ai.trends': 'Trend Analysis',
      'ai.insights': 'AI Insights',
      
      // Access Control
      'access.subscriptionRequired': 'Subscription Required',
      'access.coachRequired': 'Coach Required',
      'access.upgrade': 'Upgrade Now',
      'access.findCoach': 'Find a Coach',
      'access.limitedAccess': 'Limited Access',
      
      // Errors
      'error.network': 'Network error. Please check your connection.',
      'error.unauthorized': 'You are not authorized to perform this action.',
      'error.notFound': 'The requested resource was not found.',
      'error.serverError': 'Server error. Please try again later.',
      'error.validation': 'Please check your input and try again.',
      
      // Success Messages
      'success.saved': 'Changes saved successfully',
      'success.deleted': 'Item deleted successfully',
      'success.created': 'Item created successfully',
      'success.updated': 'Item updated successfully',
      'success.sent': 'Message sent successfully',
      
      // Time
      'time.today': 'Today',
      'time.yesterday': 'Yesterday',
      'time.thisWeek': 'This Week',
      'time.lastWeek': 'Last Week',
      'time.thisMonth': 'This Month',
      'time.lastMonth': 'Last Month',
      'time.thisYear': 'This Year',
      'time.lastYear': 'Last Year',
      
      // Units
      'unit.kg': 'kg',
      'unit.lbs': 'lbs',
      'unit.cm': 'cm',
      'unit.ft': 'ft',
      'unit.in': 'in',
      'unit.liters': 'L',
      'unit.hours': 'hours',
      'unit.minutes': 'minutes',
      'unit.days': 'days',
      'unit.weeks': 'weeks',
      'unit.months': 'months',
      'unit.years': 'years'
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.dashboard': 'Panel',
      'nav.programs': 'Programas',
      'nav.progress': 'Progreso',
      'nav.library': 'Biblioteca',
      'nav.coaches': 'Entrenadores',
      'nav.settings': 'Configuración',
      'nav.messages': 'Mensajes',
      'nav.income': 'Ingresos',
      'nav.clients': 'Clientes',
      'nav.blog': 'Blog',
      
      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.back': 'Atrás',
      'common.next': 'Siguiente',
      'common.previous': 'Anterior',
      'common.submit': 'Enviar',
      'common.close': 'Cerrar',
      
      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.logout': 'Cerrar Sesión',
      'auth.signup': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.forgotPassword': '¿Olvidaste tu contraseña?',
      'auth.resetPassword': 'Restablecer Contraseña',
      'auth.createAccount': 'Crear Cuenta',
      'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
      'auth.dontHaveAccount': '¿No tienes una cuenta?',
      
      // Dashboard
      'dashboard.welcome': 'Bienvenido de nuevo',
      'dashboard.today': 'Hoy',
      'dashboard.thisWeek': 'Esta Semana',
      'dashboard.progress': 'Tu Progreso',
      'dashboard.recommendations': 'Recomendaciones IA',
      'dashboard.checkIn': 'Registro Diario',
      
      // Programs
      'programs.title': 'Programas',
      'programs.active': 'Programas Activos',
      'programs.completed': 'Programas Completados',
      'programs.startProgram': 'Iniciar Programa',
      'programs.viewDetails': 'Ver Detalles',
      'programs.markComplete': 'Marcar Completo',
      
      // Progress
      'progress.title': 'Seguimiento de Progreso',
      'progress.dailyCheckins': 'Registros Diarios',
      'progress.weight': 'Peso',
      'progress.photos': 'Fotos de Progreso',
      'progress.trends': 'Tendencias',
      'progress.insights': 'Insights IA',
      
      // Library
      'library.title': 'Biblioteca',
      'library.exercises': 'Ejercicios',
      'library.recipes': 'Recetas',
      'library.meditation': 'Meditación',
      'library.search': 'Buscar en Biblioteca',
      'library.categories': 'Categorías',
      
      // Coaches
      'coaches.title': 'Encontrar un Entrenador',
      'coaches.browse': 'Explorar Entrenadores',
      'coaches.specialties': 'Especialidades',
      'coaches.experience': 'Experiencia',
      'coaches.rating': 'Calificación',
      'coaches.contact': 'Contactar Entrenador',
      'coaches.request': 'Enviar Solicitud',
      
      // Settings
      'settings.title': 'Configuración',
      'settings.profile': 'Perfil',
      'settings.preferences': 'Preferencias',
      'settings.notifications': 'Notificaciones',
      'settings.privacy': 'Privacidad',
      'settings.language': 'Idioma',
      'settings.currency': 'Moneda',
      
      // Messages
      'messages.title': 'Mensajes',
      'messages.new': 'Nuevo Mensaje',
      'messages.send': 'Enviar',
      'messages.typeMessage': 'Escribe un mensaje...',
      'messages.noMessages': 'Aún no hay mensajes',
      
      // AI Features
      'ai.recommendations': 'Recomendaciones IA',
      'ai.generatePlan': 'Generar Plan IA',
      'ai.trends': 'Análisis de Tendencias',
      'ai.insights': 'Insights IA',
      
      // Access Control
      'access.subscriptionRequired': 'Suscripción Requerida',
      'access.coachRequired': 'Entrenador Requerido',
      'access.upgrade': 'Actualizar Ahora',
      'access.findCoach': 'Encontrar Entrenador',
      'access.limitedAccess': 'Acceso Limitado',
      
      // Errors
      'error.network': 'Error de red. Verifica tu conexión.',
      'error.unauthorized': 'No estás autorizado para realizar esta acción.',
      'error.notFound': 'El recurso solicitado no fue encontrado.',
      'error.serverError': 'Error del servidor. Inténtalo más tarde.',
      'error.validation': 'Verifica tu entrada e inténtalo de nuevo.',
      
      // Success Messages
      'success.saved': 'Cambios guardados exitosamente',
      'success.deleted': 'Elemento eliminado exitosamente',
      'success.created': 'Elemento creado exitosamente',
      'success.updated': 'Elemento actualizado exitosamente',
      'success.sent': 'Mensaje enviado exitosamente',
      
      // Time
      'time.today': 'Hoy',
      'time.yesterday': 'Ayer',
      'time.thisWeek': 'Esta Semana',
      'time.lastWeek': 'Semana Pasada',
      'time.thisMonth': 'Este Mes',
      'time.lastMonth': 'Mes Pasado',
      'time.thisYear': 'Este Año',
      'time.lastYear': 'Año Pasado',
      
      // Units
      'unit.kg': 'kg',
      'unit.lbs': 'lbs',
      'unit.cm': 'cm',
      'unit.ft': 'ft',
      'unit.in': 'in',
      'unit.liters': 'L',
      'unit.hours': 'horas',
      'unit.minutes': 'minutos',
      'unit.days': 'días',
      'unit.weeks': 'semanas',
      'unit.months': 'meses',
      'unit.years': 'años'
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.home': 'Accueil',
      'nav.dashboard': 'Tableau de bord',
      'nav.programs': 'Programmes',
      'nav.progress': 'Progrès',
      'nav.library': 'Bibliothèque',
      'nav.coaches': 'Entraîneurs',
      'nav.settings': 'Paramètres',
      'nav.messages': 'Messages',
      'nav.income': 'Revenus',
      'nav.clients': 'Clients',
      'nav.blog': 'Blog',
      
      // Common
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.save': 'Enregistrer',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.back': 'Retour',
      'common.next': 'Suivant',
      'common.previous': 'Précédent',
      'common.submit': 'Soumettre',
      'common.close': 'Fermer',
      
      // Auth
      'auth.login': 'Se connecter',
      'auth.logout': 'Se déconnecter',
      'auth.signup': 'S\'inscrire',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.forgotPassword': 'Mot de passe oublié ?',
      'auth.resetPassword': 'Réinitialiser le mot de passe',
      'auth.createAccount': 'Créer un compte',
      'auth.alreadyHaveAccount': 'Vous avez déjà un compte ?',
      'auth.dontHaveAccount': 'Vous n\'avez pas de compte ?',
      
      // Dashboard
      'dashboard.welcome': 'Bon retour',
      'dashboard.today': 'Aujourd\'hui',
      'dashboard.thisWeek': 'Cette semaine',
      'dashboard.progress': 'Votre progrès',
      'dashboard.recommendations': 'Recommandations IA',
      'dashboard.checkIn': 'Enregistrement quotidien',
      
      // Programs
      'programs.title': 'Programmes',
      'programs.active': 'Programmes actifs',
      'programs.completed': 'Programmes terminés',
      'programs.startProgram': 'Commencer le programme',
      'programs.viewDetails': 'Voir les détails',
      'programs.markComplete': 'Marquer comme terminé',
      
      // Progress
      'progress.title': 'Suivi des progrès',
      'progress.dailyCheckins': 'Enregistrements quotidiens',
      'progress.weight': 'Poids',
      'progress.photos': 'Photos de progrès',
      'progress.trends': 'Tendances',
      'progress.insights': 'Insights IA',
      
      // Library
      'library.title': 'Bibliothèque',
      'library.exercises': 'Exercices',
      'library.recipes': 'Recettes',
      'library.meditation': 'Méditation',
      'library.search': 'Rechercher dans la bibliothèque',
      'library.categories': 'Catégories',
      
      // Coaches
      'coaches.title': 'Trouver un entraîneur',
      'coaches.browse': 'Parcourir les entraîneurs',
      'coaches.specialties': 'Spécialités',
      'coaches.experience': 'Expérience',
      'coaches.rating': 'Note',
      'coaches.contact': 'Contacter l\'entraîneur',
      'coaches.request': 'Envoyer une demande',
      
      // Settings
      'settings.title': 'Paramètres',
      'settings.profile': 'Profil',
      'settings.preferences': 'Préférences',
      'settings.notifications': 'Notifications',
      'settings.privacy': 'Confidentialité',
      'settings.language': 'Langue',
      'settings.currency': 'Devise',
      
      // Messages
      'messages.title': 'Messages',
      'messages.new': 'Nouveau message',
      'messages.send': 'Envoyer',
      'messages.typeMessage': 'Tapez un message...',
      'messages.noMessages': 'Aucun message pour le moment',
      
      // AI Features
      'ai.recommendations': 'Recommandations IA',
      'ai.generatePlan': 'Générer un plan IA',
      'ai.trends': 'Analyse des tendances',
      'ai.insights': 'Insights IA',
      
      // Access Control
      'access.subscriptionRequired': 'Abonnement requis',
      'access.coachRequired': 'Entraîneur requis',
      'access.upgrade': 'Mettre à niveau maintenant',
      'access.findCoach': 'Trouver un entraîneur',
      'access.limitedAccess': 'Accès limité',
      
      // Errors
      'error.network': 'Erreur réseau. Vérifiez votre connexion.',
      'error.unauthorized': 'Vous n\'êtes pas autorisé à effectuer cette action.',
      'error.notFound': 'La ressource demandée n\'a pas été trouvée.',
      'error.serverError': 'Erreur du serveur. Veuillez réessayer plus tard.',
      'error.validation': 'Veuillez vérifier votre saisie et réessayer.',
      
      // Success Messages
      'success.saved': 'Modifications enregistrées avec succès',
      'success.deleted': 'Élément supprimé avec succès',
      'success.created': 'Élément créé avec succès',
      'success.updated': 'Élément mis à jour avec succès',
      'success.sent': 'Message envoyé avec succès',
      
      // Time
      'time.today': 'Aujourd\'hui',
      'time.yesterday': 'Hier',
      'time.thisWeek': 'Cette semaine',
      'time.lastWeek': 'Semaine dernière',
      'time.thisMonth': 'Ce mois',
      'time.lastMonth': 'Mois dernier',
      'time.thisYear': 'Cette année',
      'time.lastYear': 'Année dernière',
      
      // Units
      'unit.kg': 'kg',
      'unit.lbs': 'lbs',
      'unit.cm': 'cm',
      'unit.ft': 'ft',
      'unit.in': 'in',
      'unit.liters': 'L',
      'unit.hours': 'heures',
      'unit.minutes': 'minutes',
      'unit.days': 'jours',
      'unit.weeks': 'semaines',
      'unit.months': 'mois',
      'unit.years': 'années'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
