import React, { useState } from "react";
import { Icon } from "@common/types";

interface Props {
  src: string | null;
  fallbackIcon: Icon;
  className?: string;
}

export default function Image(props: Props) {
  const [hasError, setHasError] = useState(false);
  const { src, fallbackIcon: FallBackIcon, className } = props;

  const onError = () => {
    setHasError(true);
  }

  return (hasError || !src) ? (
    <FallBackIcon className={className}/>
  ) : (
    <img src={src} className={className} onError={onError}/>
  );
}
