import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-secondary/30 hidden md:block">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-display font-bold text-lg">LinkUp</span>
          </div>
          <p className="text-sm text-muted-foreground">Connect through real activities. Make memories that matter.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Platform</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/explore" className="block hover:text-foreground transition-colors">Explore</Link>
            <Link to="/create" className="block hover:text-foreground transition-colors">Create Activity</Link>
            <Link to="/profile" className="block hover:text-foreground transition-colors">Profile</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <span className="block">About</span>
            <span className="block">Careers</span>
            <span className="block">Blog</span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Support</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <span className="block">Help Center</span>
            <span className="block">Safety</span>
            <span className="block">Privacy</span>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 LinkUp. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
