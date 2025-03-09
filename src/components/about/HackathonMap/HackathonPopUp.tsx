import HackathonInformation from "@/interfaces/HackathonInformation";

export default function HackathonPopup({
  hackathon,
}: {
  hackathon: HackathonInformation;
}) {
  return (
    <div>
      <h3>{hackathon.name}</h3>
      <div style={{ marginBottom: "8px" }}>
        {" "}
        {/* Add some spacing */}
        <strong>Place:</strong> <span>{hackathon.place}</span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>Location:</strong>{" "}
        <span>
          {hackathon.city}, {hackathon.state}
        </span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>Organizer:</strong> <span>{hackathon.organizer}</span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>Type:</strong> <span>{hackathon.type}</span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>Role:</strong> <span>{hackathon.role}</span>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <strong>Date:</strong> <span>{hackathon.date.toDateString()}</span>
      </div>
      {hackathon.awards && hackathon.awards.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <strong>Awards:</strong>
          <ul>
            {hackathon.awards.map((award, index) => (
              <li key={"award-" + index}>{award}</li>
            ))}
          </ul>
        </div>
      )}

      {hackathon.github && hackathon.github.length > 0 && (
        <div>
          <strong>GitHub Repositories:</strong>
          <div>
            {hackathon.github.map((link, index) => (
              <div key={"github-" + index} style={{ marginBottom: "4px" }}>
                {" "}
                {/* Space between links */}
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {" "}
                  {/* Open in new tab */}
                  {link}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
