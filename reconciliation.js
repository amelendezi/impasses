document.addEventListener('DOMContentLoaded', function() {
    const uploadedApplications = JSON.parse(localStorage.getItem('servicenow-upload') || '[]');
    const stateData = JSON.parse(localStorage.getItem('state') || '{"applications": []}');
    const config = JSON.parse(localStorage.getItem('config-upload') || '{}');

    const applicationPrimaryKey = config.applicationPrimaryKey || 'Business Application ID'; // Default if not found

    document.getElementById('uploaded-count').textContent = uploadedApplications.length;
    document.getElementById('state-count').textContent = stateData.applications.length;

    let newApplicationsCount = 0;
    let conflictsCount = 0;

    const stateApplicationsMap = new Map();
    stateData.applications.forEach(app => {
        stateApplicationsMap.set(app[applicationPrimaryKey], app);
    });

    uploadedApplications.forEach(uploadedApp => {
        const primaryKeyValue = uploadedApp[applicationPrimaryKey];
        if (stateApplicationsMap.has(primaryKeyValue)) {
            // Application exists in state, check for conflicts
            const stateApp = stateApplicationsMap.get(primaryKeyValue);
            let hasConflict = false;
            for (const key in uploadedApp) {
                if (uploadedApp.hasOwnProperty(key) && stateApp.hasOwnProperty(key)) {
                    if (uploadedApp[key] !== stateApp[key]) {
                        hasConflict = true;
                        break;
                    }
                } else if (uploadedApp.hasOwnProperty(key) !== stateApp.hasOwnProperty(key)) {
                    // Property exists in one but not the other
                    hasConflict = true;
                    break;
                }
            }
            if (hasConflict) {
                conflictsCount++;
            }
        } else {
            // New application
            newApplicationsCount++;
        }
    });

    document.getElementById('new-applications-count').textContent = newApplicationsCount;
    document.getElementById('conflicts-count').textContent = conflictsCount;
});