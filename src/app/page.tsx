'use client';

import Link from 'next/link';
import { University, Search, Shield, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section with Background Image Effect */}
      <div 
        className="absolute inset-0 -z-10 opacity-15"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.9)'
        }}
      />
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:min-h-[calc(100vh-4rem)] lg:items-center lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Header with Logo - Animated */}
          <div className="flex items-center justify-center gap-x-3 mb-8 animate-fadeIn">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary shadow-lg backdrop-blur-sm border-2 border-primary/20 animate-float">
              <University className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
              Bhumi
            </h1>
          </div>

          {/* Main Headline - Animated */}
          <h2 className="text-5xl font-extrabold tracking-tight sm:text-7xl font-headline mb-6 leading-tight animate-fadeInUp">
            <span className="text-foreground">Secure, Transparent </span>
            <span className="text-primary">Land Registry</span>
            <span className="text-foreground"> on Blockchain</span>
          </h2>

          {/* Subheadline - Animated */}
          <p className="mt-6 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto animate-fadeInUp animate-delay-200">
            Leverage blockchain technology for immutable property records, transparent ownership verification, and secure land transactions. Join the future of decentralized land management.
          </p>

          {/* Search Box - Animated */}
          <div className="mt-12 bg-card rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-border hover-lift animate-scaleIn animate-delay-300">
            <h3 className="text-lg font-semibold mb-6 text-foreground text-left flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search & Verify Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Search By</label>
                <select className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth">
                  <option>Parcel ID</option>
                  <option>Owner Address</option>
                  <option>Location</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Search Term</label>
                <input 
                  type="text" 
                  placeholder="Enter search term..." 
                  className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-smooth">
                  <Link href="/public-portal">
                    <Search className="h-4 w-4 mr-2" />
                    Verify Property
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* CTA Buttons - Animated */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4 animate-fadeInUp animate-delay-400">
            <Button size="lg" asChild className="rounded-full px-8 py-6 text-lg w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-smooth">
              <Link href="/my-properties/add">
                <FileText className="h-5 w-5 mr-2" />
                Register Property
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 py-6 text-lg w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/10 transition-smooth">
              <Link href="/marketplace">
                Explore Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section - Animated */}
      <div className="bg-card/80 backdrop-blur-sm py-20 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground animate-fadeIn">
            Why Choose Bhumi Land Registry?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl bg-card shadow-md hover-lift animate-fadeInUp">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Blockchain Security</h4>
              <p className="text-muted-foreground">
                Immutable records stored on Ethereum blockchain ensure tamper-proof property ownership.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl bg-card shadow-md hover-lift animate-fadeInUp animate-delay-200">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Instant Verification</h4>
              <p className="text-muted-foreground">
                Verify property ownership and documents instantly through our decentralized platform.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl bg-card shadow-md hover-lift animate-fadeInUp animate-delay-400">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">IPFS Storage</h4>
              <p className="text-muted-foreground">
                Documents stored on IPFS ensure permanent availability and integrity verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Animated */}
      <div className="bg-gradient-to-b from-card/60 to-primary/5 backdrop-blur-sm py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fadeInUp">
              <div className="text-5xl font-bold text-primary mb-2">980+</div>
              <div className="text-sm text-muted-foreground font-medium">Properties Registered</div>
            </div>
            <div className="animate-fadeInUp animate-delay-200">
              <div className="text-5xl font-bold text-primary mb-2">800+</div>
              <div className="text-sm text-muted-foreground font-medium">Verified Owners</div>
            </div>
            <div className="animate-fadeInUp animate-delay-300">
              <div className="text-5xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground font-medium">Locations Covered</div>
            </div>
            <div className="animate-fadeInUp animate-delay-400">
              <div className="text-5xl font-bold text-primary mb-2">2000+</div>
              <div className="text-sm text-muted-foreground font-medium">Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Animated */}
      <div className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center animate-fadeInUp">
          <h3 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Secure Your Land Records?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of property owners who trust Bhumi for transparent, secure, and decentralized land registry management.
          </p>
          <Button size="lg" asChild className="rounded-full px-10 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-smooth animate-pulse-glow">
            <Link href="/my-properties/add">
              Get Started Today
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative gradient blurs */}
      <div
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem]
          bg-gradient-to-tr from-primary/30 to-accent/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-float"
        />
      </div>
    </div>
  );
}
