export function Sidebar({
  groupedDings,
  activeRecipient,
  handleSetActiveRecipient,
  setRecipientDid,
  handleConfirmNewChat,
  handleCopyDid,
  handleStartNewChat,
  showNewChatInput,
  didCopied,
  recipientDid,
  isWeb5Connected,
}) {
  return (
    <aside aria-label="Main Sidebar Navigation">
      {Object.keys(groupedDings).map((recipient) => (
        <div
          key={recipient}
          className={`sidebar-item truncate ${
            activeRecipient === recipient ? "active" : ""
          }`}
          onClick={() => handleSetActiveRecipient(recipient)}
          role="button"
          tabIndex={0} // Make the div focusable
          aria-label={`Select ${recipient}`} // ARIA label for the recipient
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSetActiveRecipient(recipient);
          }} // Handle keyboard activation
        >
          <h3>{recipient}</h3>
        </div>
      ))}
      {activeRecipient === null && showNewChatInput && (
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Recipient DID"
            name="recipientDid"
            id="recipientDid"
            aria-label="Recipient DID"
            value={recipientDid}
            onChange={(e) => setRecipientDid(e.target.value)}
            onFocus={() => setRecipientDid("")}
          />
          <button
            className="confirm"
            onClick={handleConfirmNewChat}
            aria-label="Confirm New Chat"
          >
            Confirm
          </button>
        </div>
      )}
      <div className="button-group">
        {isWeb5Connected && (
          <button
            className="fixed-button button"
            id="copy-did-button"
            onClick={handleCopyDid}
            aria-label="Copy DID" // ARIA label for the button
          >
            {didCopied ? "DID Copied!" : "Copy DID"}
          </button>
        )}
        <div
          className="fixed-button button"
          onClick={handleStartNewChat}
          role="button"
          tabIndex={0} // Make the div focusable
          aria-label="Start New Chat" // ARIA label for the button
          onKeyPress={(e) => {
            if (e.key === "Enter") handleStartNewChat();
          }} // Handle keyboard activation
        >
          <span>Create +</span>
        </div>
      </div>
    </aside>
  );
}
