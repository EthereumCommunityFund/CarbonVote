import { Jelly } from '@uiball/loaders';

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
  asListItem?: boolean;
}

export const Loader = ({
  size = 50,
  color = '#F87171',
  className = '',
  asListItem = false,
}: LoaderProps) => {
  const content = (
    <div className={`flex justify-center ${className}`}>
      <Jelly size={size} color={color} />
    </div>
  );

  if (asListItem) {
    return <li className="py-3">{content}</li>;
  }

  return <div className="py-3">{content}</div>;
};
