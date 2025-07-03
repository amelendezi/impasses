document.addEventListener('DOMContentLoaded', function() {
    const uploadedApplications = JSON.parse(localStorage.getItem('servicenow-upload') || '[]');
    const stateData = JSON.parse(localStorage.getItem('state') || '{"applications": []}');
    const config = JSON.parse(localStorage.getItem('config-upload') || '{}');

    const applicationPrimaryKey = config.applicationPrimaryKey || 'Business Application ID'; // Default if not found

    document.getElementById('uploaded-count').textContent = uploadedApplications.length;
    document.getElementById('state-count').textContent = stateData.applications.length;

    let matchingCount = 0;
    const stateAppIds = new Set(stateData.applications.map(app => app[applicationPrimaryKey]));

    uploadedApplications.forEach(uploadedApp => {
        if (stateAppIds.has(uploadedApp[applicationPrimaryKey])) {
            matchingCount++;
        }
    });

    document.getElementById('matching-count').textContent = matchingCount;
});