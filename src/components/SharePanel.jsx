import React, { useState, useEffect } from "react";
import {
  Share2,
  Link,
  Copy,
  CheckCircle,
  Settings,
  Globe,
  Lock,
  Users,
  Mail,
  MessageSquare,
} from "lucide-react";
import useFloorPlanStore from "../stores/floorPlanStore.js";

const SharePanel = () => {
  const { createShareableLink, currentShareableLink, updateShareSettings } =
    useFloorPlanStore();
  const [copied, setCopied] = useState(false);
  const [linkPrivacy, setLinkPrivacy] = useState("view-only"); // "view-only", "comment", "edit"
  const [expirationDays, setExpirationDays] = useState(30);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientMessage, setRecipientMessage] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
    if (currentShareableLink) {
      navigator.clipboard.writeText(currentShareableLink);
      setCopied(true);
    }
  };

  const handleCreateLink = () => {
    const settings = {
      privacy: linkPrivacy,
      expirationDays,
      requiresLogin: linkPrivacy !== "view-only",
    };
    createShareableLink(settings);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!recipientEmail || !currentShareableLink) return;

    // In a real implementation, this would send an email via API
    console.log(
      "Sending email to:",
      recipientEmail,
      "with link:",
      currentShareableLink
    );
    console.log(
      "Message:",
      recipientMessage || "Check out my floor plan design!"
    );

    // Reset form
    setRecipientEmail("");
    setRecipientMessage("");

    // Show success message
    alert("Invitation sent successfully!");
  };

  const privacyOptions = [
    {
      id: "view-only",
      label: "View only",
      icon: <Globe className="h-4 w-4" />,
      description: "Anyone with the link can view",
    },
    {
      id: "comment",
      label: "Can comment",
      icon: <MessageSquare className="h-4 w-4" />,
      description: "Anyone with the link can view and comment",
    },
    {
      id: "edit",
      label: "Can edit",
      icon: <Users className="h-4 w-4" />,
      description: "Anyone with the link can edit (collaboration)",
    },
  ];

  const expirationOptions = [
    { value: 1, label: "1 day" },
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "1 year" },
    { value: 0, label: "No expiration" },
  ];

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1 flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Share Design
        </h3>
        <p className="text-sm text-gray-500">
          Create a shareable link to your design for feedback or collaboration
        </p>
      </div>

      {currentShareableLink ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shareable Link
          </label>
          <div className="flex items-center">
            <div className="flex-1 border rounded-l-md px-3 py-2 bg-gray-50 overflow-hidden whitespace-nowrap text-ellipsis text-sm">
              {currentShareableLink}
            </div>
            <button
              onClick={handleCopyLink}
              className={`rounded-r-md p-2 flex items-center ${
                copied ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
              title="Copy link"
            >
              {copied ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {linkPrivacy === "view-only"
              ? "Anyone with this link can view your design"
              : linkPrivacy === "comment"
              ? "Anyone with this link can view and comment on your design"
              : "Anyone with this link can edit your design"}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can access this link?
              </label>
              <div className="space-y-2">
                {privacyOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center p-3 border rounded-md cursor-pointer ${
                      linkPrivacy === option.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setLinkPrivacy(option.id)}
                  >
                    <div
                      className={`rounded-full p-1 mr-3 ${
                        linkPrivacy === option.id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                className="text-sm flex items-center text-gray-600 hover:text-blue-600"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                {showAdvancedSettings ? "Hide" : "Show"} advanced settings
              </button>
            </div>

            {showAdvancedSettings && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link expiration
                  </label>
                  <select
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  >
                    {expirationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    After expiration, the link will no longer work
                  </p>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      id="require-login"
                      type="checkbox"
                      checked={linkPrivacy !== "view-only"}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      disabled={linkPrivacy !== "view-only"}
                    />
                    <label
                      htmlFor="require-login"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Require login for commenting and editing
                      {linkPrivacy !== "view-only" && (
                        <span className="text-xs text-gray-500 ml-1">
                          (Required for this permission level)
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateLink}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
            >
              <Link className="h-4 w-4 mr-2" />
              Generate shareable link
            </button>
          </div>
        </div>
      )}

      {currentShareableLink && (
        <>
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h4 className="text-md font-medium mb-3">
              Invite people via email
            </h4>
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="colleague@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  placeholder="I'd love your feedback on my design"
                  value={recipientMessage}
                  onChange={(e) => setRecipientMessage(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send invitation
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p className="font-medium">Public preview available</p>
            <p className="text-blue-700">
              Anyone with the link can view your design and leave comments in
              the side panel.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SharePanel;
