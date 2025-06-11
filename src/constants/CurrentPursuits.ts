const CurrentPursuits = [
  "Software Dev Engineer I at Amazon Health (One Medical)",
  "Mentoring hackathons!",
  "Trying out new areas, like game development",
  "Georgia Tech Online Masters of CS",
];

export function getCurrentPursuitsString() {
  // format the current pursuits into a bunch of bullet points
  let currentPursuitsString = "";
  CurrentPursuits.forEach((pursuit) => {
    currentPursuitsString += `* ${pursuit}\n`;
  });
  return currentPursuitsString;
}

export default CurrentPursuits;
