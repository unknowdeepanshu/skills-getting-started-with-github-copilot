document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML with simple avatar initials and remove buttons
        const participantsHtml = details.participants && details.participants.length
          ? `<ul class="participants-list">${details.participants.map(p => {
              const local = p.split('@')[0];
              const initial = local && local.length ? local.charAt(0).toUpperCase() : '?';
              return `<li><div class="participant-left"><span class="participant-avatar">${initial}</span><span class="participant-name">${p}</span></div><button class="participant-remove" data-email="${p}" data-activity="${name}" aria-label="Remove ${p}">✕</button></li>`;
            }).join('')}</ul>`
          : '<p class="participants-empty">No participants yet</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants</strong>
            ${participantsHtml}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Delegate click for participant removal
  activitiesList.addEventListener('click', async (event) => {
    const btn = event.target.closest('.participant-remove');
    if (!btn) return;

    const email = btn.dataset.email;
    const activity = btn.dataset.activity;
    if (!email || !activity) return;

    // Confirm removal
    if (!confirm(`Remove ${email} from ${activity}?`)) return;

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = 'success';
        // Refresh list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || 'Failed to remove participant';
        messageDiv.className = 'error';
      }
      messageDiv.classList.remove('hidden');
      setTimeout(() => messageDiv.classList.add('hidden'), 5000);
    } catch (err) {
      messageDiv.textContent = 'Failed to remove participant. Please try again.';
      messageDiv.className = 'error';
      messageDiv.classList.remove('hidden');
      console.error('Error removing participant:', err);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
