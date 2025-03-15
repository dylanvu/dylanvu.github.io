"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../styles/hackathon-map/filter-option.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { useState } from "react";
import {
  HackathonRole,
  HackathonType,
} from "@/interfaces/HackathonInformation";

export type FilterOptionType = HackathonRole | HackathonType;

export default function FilterOption({
  label,
  filterOptionType,
  onClick,
  icon,
}: {
  label: string;
  filterOptionType: FilterOptionType;
  onClick: (isSelected: boolean, value: FilterOptionType) => void;
  icon: IconDefinition;
}) {
  const [isActive, setIsActive] = useState(false);

  function handleClick() {
    setIsActive(!isActive);
    onClick(!isActive, filterOptionType);
  }
  return (
    // button with an icon
    <button
      onClick={handleClick}
      className={`filter-option-button ${isActive ? "active" : null}`}
    >
      <div className="filter-option-content-container">
        <FontAwesomeIcon icon={icon} className="icon" />
        <div className="label">{label}</div>
      </div>
    </button>
  );
}
