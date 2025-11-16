import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Smartphone, TrendingUp, Users, Zap } from "lucide-react";
import { CanvasLogo } from "@/components/canvas-logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <CanvasLogo size="md" showText={true} />
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="brand-text">log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full brand-text">open account</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with Background */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Fallback */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950"
          style={{
            backgroundImage: "url('/images/hero-background.jpg')",
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            Banking that works for you
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Join thousands of members who trust Canvas Credit Union for their financial journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 brand-text bg-white text-primary hover:bg-white/90 shadow-xl">
                become a member
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 brand-text bg-transparent text-white border-white hover:bg-white/10 shadow-xl">
                log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why choose canvas</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bank-Grade Security</CardTitle>
              <CardDescription>
                Your data is protected with advanced encryption and multi-factor authentication
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Instant Transfers</CardTitle>
              <CardDescription>
                Send and receive money instantly 24/7 with our IMPS payment system
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Digital First</CardTitle>
              <CardDescription>
                Manage your finances anytime, anywhere with our mobile-optimized platform
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What we offer</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Banking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Savings & Current Accounts
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Debit Cards with Global Acceptance
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Internet Banking
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Fund Transfer (IMPS/NEFT/RTGS)
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Digital Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 24/7 Account Access
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Beneficiary Management
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Transaction History & Statements
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Secure OTP Verification
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16">
        <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About canvas</h2>
          <p className="text-muted-foreground mb-4">
            Canvas Credit Union is a member-owned financial cooperative dedicated to helping you afford life. We're here to support your financial journey with personalized service and innovative solutions.
          </p>
          <p className="text-muted-foreground">
            From savings and checking accounts to loans and financial planning, we provide the tools you need to achieve your goals.
          </p>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 brand-text">ready to join?</h2>
          <p className="text-lg mb-8 opacity-90">
            Become a member today and start your financial journey with canvas
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 brand-text">
              open account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <CanvasLogo size="sm" showText={true} className="mb-4" />
              <p className="text-sm opacity-70">
                Member-owned. Community-focused. Built for you.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Savings Account</li>
                <li>Current Account</li>
                <li>Debit Cards</li>
                <li>Fund Transfer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Disclaimer</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Canvas Credit Union. All rights reserved.</p>
            <p className="mt-2">
              <Shield className="inline h-4 w-4 mr-1" />
              Your security is our priority
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
