import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function Error() {
  return (
    <div className="empty-container">
      <ExclamationTriangleIcon className="empty-container-logo" />
      <div className="text-base">There was an error getting the results.</div>
    </div>
  );
}
