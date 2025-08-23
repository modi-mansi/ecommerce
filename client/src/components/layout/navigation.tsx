import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", exact: true },
    { href: "/products", label: "Products" },
    { href: "/orders", label: "Orders" },
    { href: "/admin", label: "Admin" },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <nav className={cn("flex space-x-6", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-gray-700 hover:text-primary-600 font-medium transition-colors",
            isActive(item.href, item.exact) && "text-primary-600"
          )}
          data-testid={`nav-link-${item.label.toLowerCase()}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
