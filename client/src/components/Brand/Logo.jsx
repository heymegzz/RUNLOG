import { Link } from 'react-router-dom';
import './logo.css';

/** 16×16 grid — pulse, timeline spine, play (3 shapes, pixel-crisp at 16px) */
const ICON_PATHS = (
  <>
    <rect x="4" y="3" width="2" height="2" className="brand-pulse" />
    <rect x="4" y="5" width="1" height="9" />
    <path d="M7 6l4 2-4 2V6z" />
  </>
);

function BrandIcon() {
  return (
    <span className="brand-icon" aria-hidden>
      <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {ICON_PATHS}
      </svg>
    </span>
  );
}

function BrandWordmark() {
  return (
    <span className="brand-wordmark">
      <span className="brand-run">Run</span>
      <span className="brand-log">log</span>
    </span>
  );
}

/**
 * @param {'inline' | 'stacked' | 'icon'} variant
 * @param {'sm' | 'md' | 'lg' | 'xl'} size
 */
export default function Logo({
  variant = 'inline',
  size = 'md',
  to,
  className = '',
  mono = false,
  unified = false,
}) {
  const variantClass =
    variant === 'stacked' ? 'brand--stacked' : variant === 'icon' ? 'brand--icon-only' : '';

  const classes = [
    'brand',
    `brand--${size}`,
    variantClass,
    mono ? 'brand--mono' : '',
    unified ? 'brand--unified' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = unified ? (
    <>
      <BrandIcon />
      <span className="brand-wordmark brand-wordmark--single">Runlog</span>
    </>
  ) : (
    <>
      <BrandIcon />
      <BrandWordmark />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Runlog home">
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} role="img" aria-label="Runlog">
      {content}
    </span>
  );
}
