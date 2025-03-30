import React, { ReactNode } from 'react';
import Link from 'next/link';
import {
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Moon,
  Star,
  PlusCircle,
  HelpingHand
} from 'lucide-react';

// Interfejs dla pojedynczego elementu nawigacji
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  testId?: string;
}

// Interfejs dla sekcji nawigacji (grupa elementów)
export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  showSeparator?: boolean;
}

// Komponent dla pojedynczego elementu menu
export function NavigationMenuItem({ item }: { item: NavigationItem }) {
  const baseClassNames = "flex items-center gap-2 cursor-pointer";
  
  // Wybór klas CSS na podstawie wariantu
  const variantClassNames = {
    default: "hover:bg-indigo-800/80",
    danger: "text-red-300 hover:bg-red-900/30 hover:text-red-200",
    success: "text-green-300 hover:bg-green-900/30 hover:text-green-200",
  };
  
  const className = `${baseClassNames} ${variantClassNames[item.variant || 'default']}`;
  
  // Jeśli element ma href, renderuj jako Link
  if (item.href) {
    return (
      <DropdownMenuItem className={className} disabled={item.disabled} asChild>
        <Link href={item.href} data-testid={item.testId}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </DropdownMenuItem>
    );
  }
  
  // Jeśli element ma onClick, renderuj jako przycisk
  return (
    <DropdownMenuItem 
      className={className}
      onClick={item.onClick}
      disabled={item.disabled}
      data-testid={item.testId}
    >
      {item.icon}
      <span>{item.label}</span>
    </DropdownMenuItem>
  );
}

// Komponent dla sekcji nawigacji
export function NavigationMenuSection({ section }: { section: NavigationSection }) {
  return (
    <>
      <DropdownMenuGroup>
        {section.items.map((item) => (
          <NavigationMenuItem key={item.id} item={item} />
        ))}
      </DropdownMenuGroup>
      
      {section.showSeparator && (
        <DropdownMenuSeparator className="bg-indigo-700/50" />
      )}
    </>
  );
}

// Funkcja, która zwraca dane nawigacyjne (pozwala na dynamiczne tworzenie menu)
export const getNavigationData = (
  handleSignOut: () => void,
  creditsBalance: number = 0,
  isLoadingInitial: boolean = false
): NavigationSection[] => {
  return [
    // Sekcja kredytów
    {
      id: 'credits',
      items: [
        {
          id: 'credits-balance',
          label: `Kredyty: ${creditsBalance}`,
          icon: <CreditCard className="h-4 w-4 text-indigo-300" />,
          disabled: true,
        },
        {
          id: 'add-credits',
          label: 'Doładuj kredyty',
          href: '/dashboard/credits',
          icon: <PlusCircle className="h-4 w-4 text-green-300" />,
        }
      ],
      showSeparator: true
    },
    
    // Sekcja astralna
    {
      id: 'astral',
      items: [
        {
          id: 'horoscopes',
          label: 'Twoje horoskopy',
          href: '/dashboard/horoscopes',
          icon: <Moon className="h-4 w-4 text-indigo-300" />,
        },
        {
          id: 'order-horoscope',
          label: 'Zamów horoskop',
          href: '/dashboard/horoscopes/order',
          icon: <Star className="h-4 w-4 text-yellow-300" />,
        },
        {
          id: 'questions',
          label: 'Pytania i odpowiedzi',
          href: '/dashboard/questions',
          icon: <HelpingHand className="h-4 w-4 text-indigo-300" />,
        }
      ],
      showSeparator: true
    },
    
    // Sekcja ustawień
    {
      id: 'settings',
      items: [
        {
          id: 'profile',
          label: 'Mój profil',
          href: '/dashboard/profile',
          icon: <User className="h-4 w-4 text-indigo-300" />,
        },
        {
          id: 'settings',
          label: 'Ustawienia',
          href: '/dashboard/settings',
          icon: <Settings className="h-4 w-4 text-indigo-300" />,
        },
        {
          id: 'help',
          label: 'Pomoc',
          href: '/dashboard/help',
          icon: <HelpCircle className="h-4 w-4 text-indigo-300" />,
        }
      ],
      showSeparator: true
    },
    
    // Sekcja wylogowania
    {
      id: 'logout',
      items: [
        {
          id: 'logout',
          label: isLoadingInitial ? "Wylogowywanie..." : "Wyloguj się",
          onClick: handleSignOut,
          icon: <LogOut className="h-4 w-4" />,
          variant: 'danger',
          disabled: isLoadingInitial,
          testId: 'logout-button'
        }
      ]
    }
  ];
};
