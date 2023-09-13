import {
  ArrowUturnLeftIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { BsArrowDownUp, BsArrowReturnLeft } from "react-icons/bs";

export function BottomBar() {
  return (
    <div className="bottom-bar">
      <div className="bottom-bar-item">
        <div className="bottom-bar-item-icon-container">
          <BsArrowDownUp className="bottom-bar-item-icon" />
        </div>
        <div className="bottom-bar-item-text text-xs">Navigate</div>
      </div>

      <div className="bottom-bar-item">
        <div className="bottom-bar-item-icon-container">
          <BsArrowReturnLeft className="bottom-bar-item-icon" />
        </div>
        <div className="bottom-bar-item-text text-xs">Go to Tab</div>
      </div>

      <div className="bottom-bar-item">
        <div className="bottom-bar-item-icon-container">
          <div className="bottom-bar-item-text text-xs">Esc</div>
        </div>
        <div className="bottom-bar-item-text text-xs">Close</div>
      </div>
    </div>
  );
}
