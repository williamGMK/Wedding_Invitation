class DashboardManager {
  constructor() {
    this.rsvpData = [];
    this.filteredData = [];
    this.searchInput = document.getElementById("searchInput");
    this.attendingFilter = document.getElementById("attendingFilter");
    this.refreshBtn = document.getElementById("refreshBtn");
    this.clearSearchBtn = document.getElementById("clearSearchBtn");
    this.exportCSV = document.getElementById("exportCSV");
    this.exportJSON = document.getElementById("exportJSON");
    this.printList = document.getElementById("printList");

    // Remove BroadcastChannel and localStorage dependencies
    this.autoRefreshInterval = null;
    this.baseURL = window.location.origin; // Your server URL

    this.init();
  }

  async init() {
    await this.loadRSVPData();
    this.setupEventListeners();
    this.setupRealTimeUpdates();
    this.renderTable();
  }

  setupRealTimeUpdates() {
    // Replace with API polling for real-time updates
    this.autoRefreshInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 15000); // Check every 15 seconds
  }

  async checkForUpdates() {
    const previousCount = this.rsvpData.length;
    await this.loadRSVPData();

    if (this.rsvpData.length !== previousCount) {
      this.filterData();
      this.showUpdateNotification();
    }
  }

  async loadRSVPData() {
    try {
      const response = await fetch(`${this.baseURL}/api/rsvp`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        this.rsvpData = result.data || [];
        this.filteredData = [...this.rsvpData];
        console.log(`Loaded ${this.rsvpData.length} RSVPs from server`);
      } else {
        throw new Error(result.message || "Failed to load RSVP data");
      }
    } catch (error) {
      console.error("Error loading RSVP data from server:", error);
      this.showError("Failed to load RSVP data from server");
      this.rsvpData = [];
      this.filteredData = [];
    }

    await this.updateStats();
  }

  async updateStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/rsvp/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const stats = result.data;
        document.getElementById("totalGuests").textContent =
          stats.totalGuests.toLocaleString();
        document.getElementById("attendingGuests").textContent =
          stats.attending.toLocaleString();
        document.getElementById("notAttendingGuests").textContent =
          stats.notAttending.toLocaleString();
        document.getElementById("totalResponses").textContent =
          stats.totalResponses.toLocaleString();
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Fallback to calculating from local data
      this.calculateStatsFromData();
    }
  }

  calculateStatsFromData() {
    // Fallback method if stats API fails
    const totalGuests = this.rsvpData.reduce((sum, rsvp) => {
      const guests = parseInt(rsvp.guests) || 1;
      return sum + guests;
    }, 0);

    const attendingCount = this.rsvpData.filter(
      (rsvp) => rsvp.attending === "Yes"
    ).length;
    const notAttendingCount = this.rsvpData.filter(
      (rsvp) => rsvp.attending === "No"
    ).length;

    document.getElementById("totalGuests").textContent =
      totalGuests.toLocaleString();
    document.getElementById("attendingGuests").textContent =
      attendingCount.toLocaleString();
    document.getElementById("notAttendingGuests").textContent =
      notAttendingCount.toLocaleString();
    document.getElementById("totalResponses").textContent =
      this.rsvpData.length.toLocaleString();
  }

  showUpdateNotification() {
    // Create or update notification
    let notification = document.getElementById("updateNotification");
    if (!notification) {
      notification = document.createElement("div");
      notification.id = "updateNotification";
      notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-gold);
                color: black;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
      document.body.appendChild(notification);
    }

    notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            New RSVPs Received
        `;

    setTimeout(() => {
      if (notification) {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  showError(message) {
    // Show error notification
    let errorNotification = document.getElementById("errorNotification");
    if (!errorNotification) {
      errorNotification = document.createElement("div");
      errorNotification.id = "errorNotification";
      errorNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
      document.body.appendChild(errorNotification);
    }

    errorNotification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        `;

    setTimeout(() => {
      if (errorNotification) {
        errorNotification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (errorNotification && errorNotification.parentNode) {
            errorNotification.parentNode.removeChild(errorNotification);
          }
        }, 300);
      }
    }, 5000);
  }

  async refreshData() {
    const originalHtml = this.refreshBtn.innerHTML;
    this.refreshBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    this.refreshBtn.disabled = true;

    try {
      await this.loadRSVPData();
      this.filterData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      this.showError("Error refreshing data");
    } finally {
      setTimeout(() => {
        this.refreshBtn.innerHTML = originalHtml;
        this.refreshBtn.disabled = false;
      }, 1000);
    }
  }

  // Keep all your existing methods that don't depend on localStorage:
  filterData() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const attendingFilter = this.attendingFilter.value;

    this.filteredData = this.rsvpData.filter((rsvp) => {
      const matchesSearch =
        !searchTerm ||
        rsvp.name.toLowerCase().includes(searchTerm) ||
        rsvp.email.toLowerCase().includes(searchTerm) ||
        (rsvp.message && rsvp.message.toLowerCase().includes(searchTerm));

      const matchesFilter =
        attendingFilter === "all" || rsvp.attending === attendingFilter;

      return matchesSearch && matchesFilter;
    });

    this.renderTable();
  }

  clearFilters() {
    this.searchInput.value = "";
    this.attendingFilter.value = "all";
    this.filterData();
  }

  renderTable() {
    const tbody = document.getElementById("rsvpTableBody");
    const emptyState = document.getElementById("emptyState");

    if (this.filteredData.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    tbody.innerHTML = this.filteredData
      .map(
        (rsvp) => `
            <tr>
                <td>
                    <strong>${this.escapeHtml(rsvp.name)}</strong>
                </td>
                <td>${this.escapeHtml(rsvp.email)}</td>
                <td>
                    <span class="status-badge ${
                      rsvp.attending === "Yes"
                        ? "status-attending"
                        : "status-not-attending"
                    }">
                        <i class="fas ${
                          rsvp.attending === "Yes" ? "fa-check" : "fa-times"
                        }"></i>
                        ${
                          rsvp.attending === "Yes"
                            ? "Attending"
                            : "Not Attending"
                        }
                    </span>
                </td>
                <td>
                    <span class="guest-count">${rsvp.guests} guest${
          rsvp.guests > 1 ? "s" : ""
        }</span>
                </td>
                <td>
                    <div class="message-preview" title="${this.escapeHtml(
                      rsvp.message || "No message"
                    )}">
                        ${this.escapeHtml(rsvp.message || "-")}
                    </div>
                </td>
                <td class="timestamp">
                    ${this.formatDate(rsvp.timestamp)}
                    <br>
                    <small style="color: #888;">${this.timeAgo(
                      rsvp.timestamp
                    )}</small>
                </td>
            </tr>
        `
      )
      .join("");
  }

  // Export methods - update to use API
  async exportToCSV() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/export/csv`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "silver-anniversary-rsvps.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      this.showError("Error exporting CSV data");
    }
  }

  async exportToJSON() {
    if (this.rsvpData.length === 0) {
      alert("No data to export!");
      return;
    }

    const jsonData = JSON.stringify(this.rsvpData, null, 2);
    this.downloadFile(
      jsonData,
      "silver-anniversary-rsvps.json",
      "application/json"
    );
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Keep your existing helper methods:
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  timeAgo(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(timestamp);
  }

  printData() {
    // Keep your existing printData method
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>RSVP List - Eric & Aziza's Silver Anniversary</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .attending { color: green; }
                    .not-attending { color: red; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>RSVP List - Eric & Aziza's Silver Anniversary</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Total Responses: ${this.rsvpData.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Guests</th>
                            <th>Message</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.rsvpData
                          .map(
                            (rsvp) => `
                            <tr>
                                <td>${this.escapeHtml(rsvp.name)}</td>
                                <td>${this.escapeHtml(rsvp.email)}</td>
                                <td class="${
                                  rsvp.attending === "Yes"
                                    ? "attending"
                                    : "not-attending"
                                }">
                                    ${rsvp.attending}
                                </td>
                                <td>${rsvp.guests}</td>
                                <td>${this.escapeHtml(rsvp.message || "-")}</td>
                                <td>${this.formatDate(rsvp.timestamp)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  setupEventListeners() {
    this.searchInput.addEventListener("input", () => this.filterData());
    this.attendingFilter.addEventListener("change", () => this.filterData());
    this.refreshBtn.addEventListener("click", () => this.refreshData());
    this.clearSearchBtn.addEventListener("click", () => this.clearFilters());

    this.exportCSV.addEventListener("click", () => this.exportToCSV());
    this.exportJSON.addEventListener("click", () => this.exportToJSON());
    this.printList.addEventListener("click", () => this.printData());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        this.refreshData();
      }
    });
  }

  // Cleanup
  destroy() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DashboardManager();
});
