import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import { FeatureCard } from '@/components/ui/landing/FeatureCard';
import { features } from '@/data/landing/features';
import { TestimonialCard } from '@/components/ui/landing/TestimonialCard';
import { testimonials } from '@/data/landing/testimonials';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="home-page">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center" data-testid="hero-section">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mystical-glow mb-6" data-testid="main-heading">
            Twoja Przepowiednia
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200 text-light mb-6" data-testid="main-subheading">
            Odkryj swoją przyszłość z pomocą doświadczonych astrologów
          </p>
          <p className="text-lg text-indigo-200/80 text-light mb-12 max-w-2xl mx-auto">
            Personalizowane horoskopy, które naprawdę działają, oparte na starożytnej mądrości i współczesnej wiedzy astrologicznej
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="auth-buttons">
            <Link href="/login" className="btn-login px-6 py-3 rounded-lg text-white hover:shadow-mystical transition-all" data-testid="login-button">
              Zaloguj się
            </Link>
            <Link href="/register" className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all" data-testid="register-button">
              Zarejestruj się
            </Link>
          </div>
          
          <div className="mt-6">
            <Link href="/astrologers" className="text-indigo-300 hover:text-indigo-200 transition-colors flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              Poznaj naszych astrologów
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Zalety */}
      <section className="py-16 px-4" data-testid="features-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-white text-center mystical-glow mb-12" data-testid="features-heading">
            Dlaczego nasi klienci nam ufają
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="features-grid">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                testId={feature.testId}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Sekcja astrologów */}
      <section className="py-16 px-4 bg-indigo-900/20" data-testid="astrologers-section">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white text-center mystical-glow mb-6" data-testid="astrologers-heading">
            Nasi doświadczeni astrologowie
          </h2>
          <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
            Wybierz spośród naszych wykwalifikowanych astrologów i ekspertów duchowych, 
            którzy pomogą Ci odnaleźć właściwą ścieżkę.
          </p>
          <Link 
            href="/astrologers" 
            className="btn-primary px-6 py-3 rounded-lg text-white shadow-mystical inline-flex items-center hover:shadow-mystical-hover transition-all"
            data-testid="view-astrologers-button"
          >
            <User className="h-5 w-5 mr-2" />
            Zobacz astrologów
          </Link>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 px-4 bg-indigo-900/20" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl text-white text-center mystical-glow mb-12" data-testid="testimonials-heading">
            Co mówią nasi klienci
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="testimonials-grid">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                testId={`testimonial-${testimonial.id}`}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 px-4" data-testid="cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white mystical-glow mb-6" data-testid="cta-heading">
            Rozpocznij swoją podróż ku gwiazdom już dziś
          </h2>
          <p className="text-indigo-200 mb-8">
            Pierwszy horoskop otrzymasz całkowicie za darmo - przekonaj się o naszej skuteczności!
          </p>
          <Link href="/register" className="inline-flex items-center btn-primary px-6 py-3 rounded-lg text-white shadow-mystical hover:shadow-mystical-hover transition-all" data-testid="cta-button">
            Rozpocznij za darmo <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-indigo-300/20" data-testid="footer">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-indigo-300/60 text-sm" data-testid="copyright">
            &copy; {new Date().getFullYear()} Twoja Przepowiednia. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}