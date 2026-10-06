import { renderNavIcon } from './icons/navIcons';
import { renderActionIcon } from './icons/actionIcons';
import { renderStatusIcon } from './icons/statusIcons';

/**
 * Standardized SVG Icons for Super Store POS interface.
 */
export const Icon = ({ name, size = 20, className = '', strokeWidth = 2 }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `inline-block shrink-0 ${className}`,
  };

  const nav = renderNavIcon(name, iconProps);
  if (nav) return nav;

  const action = renderActionIcon(name, iconProps);
  if (action) return action;

  const status = renderStatusIcon(name, iconProps);
  if (status) return status;

  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};
