import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

export function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { href: "/products", label: "Products" },
    { href: "/orders", label: "Orders" },
    { href: "/admin", label: "Admin" },
  ];

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu-trigger">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary-100 text-primary-600">
              {user ? user.firstName[0] + user.lastName[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block font-medium">
            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile" data-testid="link-profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders" data-testid="link-orders">My Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} data-testid="button-logout">
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/login" data-testid="link-login">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary-600" data-testid="logo">
              ShopFlow
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-700 hover:text-primary-600 font-medium transition-colors ${
                    location === item.href ? "text-primary-600" : ""
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative" data-testid="cart-link">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    data-testid="cart-badge"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-6 pt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Input
                          type="search"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10"
                          data-testid="mobile-search-input"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-3">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`text-gray-700 hover:text-primary-600 font-medium transition-colors px-3 py-2 rounded-lg ${
                            location === item.href ? "text-primary-600 bg-primary-50" : ""
                          }`}
                          data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile User Menu */}
                    <div className="border-t pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary-100 text-primary-600">
                            {user ? user.firstName[0] + user.lastName[0] : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                          </div>
                          {user && <div className="text-sm text-gray-500">{user.email}</div>}
                        </div>
                      </div>
                      
                      {user ? (
                        <div className="flex flex-col space-y-2">
                          <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/profile" data-testid="mobile-link-profile">Profile</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/orders" data-testid="mobile-link-orders">My Orders</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start" onClick={logout} data-testid="mobile-button-logout">
                            Logout
                          </Button>
                        </div>
                      ) : (
                        <Button variant="default" className="w-full" asChild>
                          <Link href="/login" data-testid="mobile-link-login">Login</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
