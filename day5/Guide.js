import React, { useState } from 'react';
import '../UserGuide.css';

const UserGuide = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "Getting Started",
      content: (
        <div className="guide-content">
          <h2>Resiliency Framework Portal - High Level Design</h2>
          <ul>
            <li>The Resiliency Framework is a portal-based solution designed to manage failover operations for applications between East and West regions.</li>
            <li>Supports both ECS-based (Traditional) and Fargate-based (Serverless) applications.</li>
            <li>Streamlines application resilience management for various teams.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Features and Capabilities",
      content: (
        <div className="guide-content">
          {["Platforms", "Onboarding", "Execution Count", "Track Logs", "Advanced Analytics"].map((feature, index) => (
            <div key={index} className="feature-card">
              <h4 onClick={() => toggleSection(index)}>
                {feature}
                <span className="arrow">{expandedSection === index ? "▲" : "▼"}</span>
              </h4>
              {expandedSection === index && (
                <ul>
                  {feature === "Platforms" && (
                    <>
                      <li>Application Visibility: View all applications within your team.</li>
                      <li>Failover Operations:
                        <ul>
                          <li>Failover to East or West.</li>
                          <li>Supports bulk and individual application selection.</li>
                          <li>Post-failover reporting with detailed logs.</li>
                        </ul>
                      </li>
                    </>
                  )}
                  {feature === "Onboarding" && (
                    <>
                      <li>Application Name, Domain URL, Team Name selection.</li>
                      <li>Deployment Type:
                        <ul>
                          <li>Traditional (ECS): Requires Health Check IDs.</li>
                          <li>Serverless (Fargate): Requires Hosted Zone ID and Record Name.</li>
                        </ul>
                      </li>
                      <li>Role ARN (Optional) for cross-account access.</li>
                    </>
                  )}
                  {feature === "Execution Count" && (
                    <>
                      <li>Graphical Representation of failover activities.</li>
                      <li>Team-wise and Month-wise insights.</li>
                    </>
                  )}
                  {feature === "Track Logs" && (
                    <>
                      <li>Track failover activities with timestamps (IST/EST).</li>
                      <li>Detailed results showing success, skipped, and failed operations.</li>
                    </>
                  )}
                  {feature === "Advanced Analytics" && (
                    <>
                      <li>Custom dashboards for operational metrics.</li>
                      <li>Trends and anomaly detection for failover events.</li>
                    </>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Onboarding Process",
      content: (
        <div className="guide-content">
          <h3>ECS-Based Applications</h3>
          <ol>
            <li>Enter application details (name, team, etc.).</li>
            <li>Provide Health Check IDs for both East and West regions.</li>
            <li>Optional: Add Role ARN for cross-account integrations.</li>
          </ol>
          <h3>Serverless Applications (Fargate)</h3>
          <ol>
            <li>Provide Hosted Zone ID and Record Name.</li>
            <li>Optional: Add Role ARN if required.</li>
          </ol>
        </div>
      ),
    },
    {
      title: "Portal Support",
      content: (
        <div className="guide-content">
          <h3>Request Access</h3>
          <p>Contact the XCP-DevOps team at <a href="mailto:xyz@abc.com">xcpdevops@comcast.com</a> to request access.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="user-guide">
      <div className="guide-container">
        <div className="content-area">{sections[currentSection].content}</div>

        <div className="section-switcher">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentSection + 1) * 100) / sections.length}%` }}
            ></div>
          </div>

          <div className="section-buttons">
            {currentSection > 0 && (
              <button className="nav-button prev" onClick={() => setCurrentSection(prev => prev - 1)}>
                ← Previous
              </button>
            )}
            <span className="section-indicator">
              {currentSection + 1} / {sections.length}
            </span>
            {currentSection < sections.length - 1 && (
              <button className="nav-button next" onClick={() => setCurrentSection(prev => prev + 1)}>
                Next →
              </button>
            )}
          </div>

          <div className="section-dots">
            {sections.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSection ? 'active' : ''}`}
                onClick={() => setCurrentSection(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
