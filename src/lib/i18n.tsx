'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';

export type Language = 'es' | 'en';

const translations = {
  es: {
    brand: 'CoSpace',
    home: 'Inicio',
    catalog: 'Espacios',
    dashboard: 'Mis Reservas',
    admin: 'Panel Admin',
    login: 'Iniciar Sesión',
    enter: 'Ingresar',
    register: 'Registrarse',
    registerNav: 'Registro',
    logout: 'Cerrar Sesión',
    exit: 'Salir',
    logoutAdmin: 'Cerrar Sesión Admin',
    heroBadge: 'Espacios de Trabajo Modernos',
    heroTitle: 'Tu espacio ideal de coworking',
    heroTitleHighlight: 'en minutos',
    heroSubtitle:
      'Reserva escritorios ergonómicos, salas de juntas equipadas y cabinas insonorizadas por horas. Sin contratos a largo plazo.',
    exploreCatalog: 'Explorar Espacios',
    footerRights: '© 2026 CoSpace. Todos los derechos reservados.',
    perHour: '/ hora',
    rate: 'Tarifa',
    pricePerHourLabel: 'Precio por hora',
    capacity: 'Capacidad',
    person: 'persona',
    people: 'personas',
    viewDetail: 'Ver Detalle',
    catalogTitle: 'Catálogo de Espacios',
    catalogSubtitle: 'Selecciona el espacio que mejor se adapte a tus necesidades de hoy.',
    bookNow: 'Reservar ahora',
    confirmBooking: 'Confirmar Reserva',
    confirmingBooking: 'Confirmando...',
    dateLabel: 'Fecha',
    selectDateError: 'Selecciona una fecha',
    startHourLabel: 'Hora de Inicio (7:00 a 20:00)',
    durationLabel: 'Duración (Horas enteras)',
    hourSingular: 'hora',
    hourPlural: 'horas',
    totalToPay: 'Total a pagar:',
    cancelBooking: 'Cancelar',
    confirmCancel: '¿Seguro que deseas cancelar esta reserva?',
    confirmedStatus: 'Confirmada',
    cancelledStatus: 'Cancelada',
    dashboardSubtitle: 'Gestiona tus espacios reservados y horarios confirmados',
    newBooking: '+ Nueva Reserva',
    loadingBookings: 'Cargando reservas...',
    noActiveBookings: 'No tienes reservas activas registradas.',
    exploreSpacesCatalog: 'Explorar catálogo de espacios',
    startLabel: 'Inicio:',
    endLabel: 'Fin:',
    totalCharged: 'Total cobrado',
    cancelTooltipDisabled: 'Solo se puede cancelar con 2 horas de anticipación',
    cancelTooltipEnabled: 'Cancelar reserva',
    loadingLocalDate: 'Cargando fecha local...',
    loginSubtitle: 'Ingresa tus credenciales para acceder a CoSpace',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    loggingIn: 'Ingresando...',
    noAccount: '¿No tienes cuenta?',
    registerHere: 'Regístrate aquí',
    createAccount: 'Crear Cuenta',
    registerSubtitle: 'Regístrate para reservar espacios de trabajo',
    fullNameLabel: 'Nombre Completo',
    minPasswordPlaceholder: 'Mínimo 6 caracteres',
    creatingAccount: 'Creando cuenta...',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    manageSpaces: 'Gestión de Espacios',
    viewPublicCatalog: 'Ver Catálogo Público',
    adminTitle: 'Administración de Espacios',
    adminSubtitle: 'Crea, edita o desactiva espacios del catálogo',
    addNewSpace: '+ Agregar Nuevo Espacio',
    spaceNamePlaceholder: 'Nombre del espacio',
    deskOption: 'DESK (Escritorio)',
    meetingRoomOption: 'MEETING_ROOM (Sala)',
    boothOption: 'BOOTH (Cabina)',
    capacityPlaceholder: 'Capacidad',
    pricePerHourPlaceholder: 'Precio por hora ($)',
    imageUrlPlaceholder: 'URL de Imagen (Unsplash u otro)',
    descriptionPlaceholder: 'Descripción detallada',
    saveSpace: 'Guardar Espacio',
    registeredSpaces: 'Espacios Registrados',
    loadingInventory: 'Cargando inventario...',
    deactivate: 'Desactivar',
    confirmDeactivate: '¿Seguro que deseas desactivar este espacio?',
  },
  en: {
    brand: 'CoSpace',
    home: 'Home',
    catalog: 'Spaces',
    dashboard: 'My Bookings',
    admin: 'Admin Panel',
    login: 'Log In',
    enter: 'Sign In',
    register: 'Register',
    registerNav: 'Sign Up',
    logout: 'Log Out',
    exit: 'Sign Out',
    logoutAdmin: 'Log Out Admin',
    heroBadge: 'Modern Workspaces',
    heroTitle: 'Your ideal coworking space',
    heroTitleHighlight: 'in minutes',
    heroSubtitle:
      'Book ergonomic desks, equipped meeting rooms, and soundproof booths by the hour. No long-term contracts.',
    exploreCatalog: 'Explore Spaces',
    footerRights: '© 2026 CoSpace. All rights reserved.',
    perHour: '/ hour',
    rate: 'Rate',
    pricePerHourLabel: 'Price per hour',
    capacity: 'Capacity',
    person: 'person',
    people: 'people',
    viewDetail: 'View Details',
    catalogTitle: 'Spaces Catalog',
    catalogSubtitle: 'Select the workspace that best fits your needs today.',
    bookNow: 'Book now',
    confirmBooking: 'Confirm Booking',
    confirmingBooking: 'Confirming...',
    dateLabel: 'Date',
    selectDateError: 'Please select a date',
    startHourLabel: 'Start Time (7:00 to 20:00)',
    durationLabel: 'Duration (Full hours)',
    hourSingular: 'hour',
    hourPlural: 'hours',
    totalToPay: 'Total to pay:',
    cancelBooking: 'Cancel',
    confirmCancel: 'Are you sure you want to cancel this booking?',
    confirmedStatus: 'Confirmed',
    cancelledStatus: 'Cancelled',
    dashboardSubtitle: 'Manage your reserved workspaces and confirmed schedules',
    newBooking: '+ New Booking',
    loadingBookings: 'Loading bookings...',
    noActiveBookings: 'You have no active bookings registered.',
    exploreSpacesCatalog: 'Explore spaces catalog',
    startLabel: 'Start:',
    endLabel: 'End:',
    totalCharged: 'Total charged',
    cancelTooltipDisabled: 'Can only be cancelled at least 2 hours in advance',
    cancelTooltipEnabled: 'Cancel booking',
    loadingLocalDate: 'Loading local date...',
    loginSubtitle: 'Enter your credentials to access CoSpace',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    loggingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    createAccount: 'Create Account',
    registerSubtitle: 'Sign up to book workspaces',
    fullNameLabel: 'Full Name',
    minPasswordPlaceholder: 'Minimum 6 characters',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    manageSpaces: 'Manage Spaces',
    viewPublicCatalog: 'View Public Catalog',
    adminTitle: 'Space Administration',
    adminSubtitle: 'Create, edit, or deactivate catalog spaces',
    addNewSpace: '+ Add New Space',
    spaceNamePlaceholder: 'Space name',
    deskOption: 'DESK (Desk)',
    meetingRoomOption: 'MEETING_ROOM (Meeting Room)',
    boothOption: 'BOOTH (Booth)',
    capacityPlaceholder: 'Capacity',
    pricePerHourPlaceholder: 'Price per hour ($)',
    imageUrlPlaceholder: 'Image URL (Unsplash or other)',
    descriptionPlaceholder: 'Detailed description',
    saveSpace: 'Save Space',
    registeredSpaces: 'Registered Spaces',
    loadingInventory: 'Loading inventory...',
    deactivate: 'Deactivate',
    confirmDeactivate: 'Are you sure you want to deactivate this space?',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['es'];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'es',
  setLang: () => {},
  t: translations.es,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    const saved = window.localStorage.getItem('cospace_lang');
    if (saved === 'es' || saved === 'en') {
      queueMicrotask(() => {
        setLang(saved);
      });
    }
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    window.localStorage.setItem('cospace_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

export const T = ({ k }: { k: keyof typeof translations['es'] }) => {
  const { t } = useTranslation();
  return <>{t[k]}</>;
};

export const HeroSecondaryButton = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (user) {
    return (
      <Link
        href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
        className="rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 transition-colors"
      >
        {user.role === 'ADMIN' ? t.admin : t.dashboard}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 transition-colors"
    >
      {t.login}
    </Link>
  );
};

