const NextSteps = [
  "Go through my current learning bucket list: WebRTC and Go Lang",
  "Finish a major robotics project",
  "Think of another long-term project",
  "Not get fired from my job :P",
];

export function getNextStepsString() {
  // format the next steps into a bunch of bullet points
  let nextStepsString = "";
  NextSteps.forEach((step) => {
    nextStepsString += `* ${step}\n`;
  });
  return nextStepsString;
}

export default NextSteps;
