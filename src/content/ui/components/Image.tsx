import React, { useState } from "react";

interface Props {
  src: string | null;
  fallbackIcon: React.JSX.Element;
  className?: string;
}

export default function Image(props: Props) {
  const [hasError, setHasError] = useState(false);
  const { src, fallbackIcon: FallBackIcon, className } = props;

  const onError = () => {
    setHasError(true);
  };

  return hasError || !src ? (
    FallBackIcon
  ) : (
    <img src={src} className={className} onError={onError} />
  );
}
