import React from "react";
import { BsExclamationTriangle } from "react-icons/bs";

export default function Error() {
  return (
    <div className="empty-container">
      <BsExclamationTriangle className="empty-container-logo" />
      <div className="text-base">There was an error getting the results.</div>
    </div>
  );
}
