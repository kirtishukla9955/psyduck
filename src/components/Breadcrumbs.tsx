import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = '/',
  className = '',
}) => {
  return (
    <nav className={`flex text-xs text-neutral-500 mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to={homeHref}
            className="inline-flex items-center hover:text-primary transition-colors text-neutral-500"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center">
              <ChevronRight className="w-3 h-3 text-neutral-400 mx-1" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-primary transition-colors font-medium text-neutral-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-neutral-800">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
