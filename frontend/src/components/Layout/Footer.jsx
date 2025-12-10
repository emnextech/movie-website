import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Film className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-bold text-white">Luxury Movies</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Your premium destination for movies and TV series.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              A luxury movie website built with React and Node.js.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Luxury Movies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

