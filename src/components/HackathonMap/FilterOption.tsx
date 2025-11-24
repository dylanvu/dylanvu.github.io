"use client";
import "@/styles/hackathon-map/filter-option.css";

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
}: {
  label: string;
  filterOptionType: FilterOptionType;
  onClick: (isSelected: boolean, value: FilterOptionType) => void;
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
        <div className="label">{label}</div>
      </div>
    </button>
  );
}
