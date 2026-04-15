import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { testimonials } from '@/lib/mock-data';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/lib/types';
import SkeletonCard from '@/components/SkeletonCard';

const Landing = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-36 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Real connections, real experiences
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-balance">
              Find people. Join activities.{' '}
              <span className="gradient-text">Make real memories.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              LinkUp connects you with people who share your passions. Discover activities near you, join communities, and turn screen time into real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/explore">
                <Button size="lg" className="gradient-bg text-primary-foreground border-0 btn-glow text-base px-8 h-12 w-full sm:w-auto">
                  Explore Activities <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create">
                <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto">
                  Create Activity
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '12K+', label: 'Active Users' },
              { value: '3.2K', label: 'Activities' },
              { value: '89', label: 'Cities' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">Three simple steps to start connecting</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', icon: '🔍', title: 'Discover', desc: 'Browse activities by category, location, or date. Find what excites you.' },
              { step: '02', icon: '🤝', title: 'Join', desc: 'Sign up for activities with one click. Meet your group in person.' },
              { step: '03', icon: '✨', title: 'Connect', desc: 'Build friendships through shared experiences. Keep the streak going!' },
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-2xl p-6 border border-border card-hover text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold text-primary mb-2">{item.step}</div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — live from API */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Trending Categories</h2>
          <p className="text-muted-foreground text-center mb-12">Find your people, find your thing</p>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {categories.map((cat: Category) => (
                <Link
                  to={`/explore?category=${cat.name}`}
                  key={cat.id}
                  className="bg-card rounded-2xl p-4 border border-border card-hover text-center group"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-medium text-sm">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cat.count} activities</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-6 border border-border card-hover">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Link Up?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of people making real connections through shared activities.</p>
          <Link to="/explore">
            <Button size="lg" className="gradient-bg text-primary-foreground border-0 btn-glow text-base px-8 h-12">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
