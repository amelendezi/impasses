    document.addEventListener('DOMContentLoaded', function() {
    console.log('Reconciliation page loaded.');
    const uploadedApplications = JSON.parse(localStorage.getItem('servicenow-upload') || '[]');
    let stateData = JSON.parse(localStorage.getItem('state') || '{"applications": []}');
    const config = JSON.parse(localStorage.getItem('config-upload') || '{}');

    console.log('Uploaded Applications:', uploadedApplications);
    console.log('State Data:', stateData);
    console.log('Config:', config);

    const applicationPrimaryKey = config.applicationPrimaryKey || 'Business Application ID'; // Default if not found
    console.log('Application Primary Key:', applicationPrimaryKey);

    document.getElementById('uploaded-count').textContent = uploadedApplications.length;
    document.getElementById('state-count').textContent = stateData.applications.length;

    console.log('Uploaded Count:', uploadedApplications.length);
    console.log('State Count:', stateData.applications.length);

    let newApplicationsCount = 0;
    let conflictsCount = 0;
    const newApplications = [];
    const conflictingApplications = [];

    const stateApplicationsMap = new Map();
    stateData.applications.forEach(app => {
        stateApplicationsMap.set(app[applicationPrimaryKey], app);
    });

    uploadedApplications.forEach(uploadedApp => {
        const primaryKeyValue = uploadedApp[applicationPrimaryKey];
        if (stateApplicationsMap.has(primaryKeyValue)) {
            const stateApp = stateApplicationsMap.get(primaryKeyValue);
            let hasConflict = false;
            const differences = [];

            // Check for differing property values
            for (const key in uploadedApp) {
                if (uploadedApp.hasOwnProperty(key)) {
                    if (stateApp.hasOwnProperty(key)) {
                        if (uploadedApp[key] !== stateApp[key]) {
                            hasConflict = true;
                            differences.push({ property: key, uploadedValue: uploadedApp[key], stateValue: stateApp[key] });
                        }
                    } else {
                        // Property exists in uploaded but not in state
                        hasConflict = true;
                        differences.push({ property: key, uploadedValue: uploadedApp[key], stateValue: 'N/A' });
                    }
                }
            }

            // Check for properties in state but not in uploaded
            for (const key in stateApp) {
                if (stateApp.hasOwnProperty(key) && !uploadedApp.hasOwnProperty(key)) {
                    hasConflict = true;
                    differences.push({ property: key, uploadedValue: 'N/A', stateValue: stateApp[key] });
                }
            }

            if (hasConflict) {
                conflictsCount++;
                conflictingApplications.push({ uploadedApp, stateApp, differences });
            }
        } else {
            newApplicationsCount++;
            newApplications.push(uploadedApp);
        }
    });

    document.getElementById('new-applications-count').textContent = newApplicationsCount;
    document.getElementById('conflicts-count').textContent = conflictsCount;

    const addAllNewBtn = document.getElementById('add-all-new-btn');
    const addAllNewStatus = document.getElementById('add-all-new-status');
    const ignoreAllNewBtn = document.getElementById('ignore-all-new-btn');
    const ignoreAllNewStatus = document.getElementById('ignore-all-new-status');

    if (newApplicationsCount > 0) {
        addAllNewBtn.style.display = 'inline-block';
        ignoreAllNewBtn.style.display = 'inline-block';
    } else {
        addAllNewBtn.style.display = 'none';
        ignoreAllNewBtn.style.display = 'none';
    }

    addAllNewBtn.addEventListener('click', () => {
        stateData.applications.push(...newApplications);
        localStorage.setItem('state', JSON.stringify(stateData, null, 2));
        addAllNewStatus.textContent = `${newApplicationsCount} added to state.`;
        addAllNewBtn.style.display = 'none'; // Hide button after adding
        ignoreAllNewBtn.style.display = 'none'; // Hide ignore button as well
        document.getElementById('state-count').textContent = stateData.applications.length; // Update state count
    });

    ignoreAllNewBtn.addEventListener('click', () => {
        ignoreAllNewStatus.textContent = `${newApplicationsCount} applications ignored.`;
        addAllNewBtn.style.display = 'none'; // Hide add button
        ignoreAllNewBtn.style.display = 'none'; // Hide ignore button
    });

    const conflictsTableBody = document.getElementById('conflicts-table-body');
    conflictingApplications.forEach((conflict, index) => {
        conflict.differences.forEach(diff => {
            const row = conflictsTableBody.insertRow();
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${conflict.uploadedApp[applicationPrimaryKey]}</td>
                <td class="py-2 px-4 border-b">${diff.property}</td>
                <td class="py-2 px-4 border-b">${diff.uploadedValue}</td>
                <td class="py-2 px-4 border-b">${diff.stateValue}</td>
                <td class="py-2 px-4 border-b" id="actions-${index}-${diff.property}">
                    <button class="update-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm" data-index="${index}" data-property="${diff.property}">Update</button>
                    <button class="ignore-btn bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm ml-2" data-index="${index}" data-property="${diff.property}">Ignore</button>
                </td>
            `;
        });
    });

    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            const property = event.target.dataset.property;
            const conflict = conflictingApplications[index];
            const primaryKeyValue = conflict.uploadedApp[applicationPrimaryKey];

            // Find the application in stateData.applications and update it
            const stateAppIndex = stateData.applications.findIndex(app => app[applicationPrimaryKey] === primaryKeyValue);
            if (stateAppIndex !== -1) {
                stateData.applications[stateAppIndex] = { ...stateData.applications[stateAppIndex], ...conflict.uploadedApp };
                localStorage.setItem('state', JSON.stringify(stateData, null, 2));
            }

            const actionCell = document.getElementById(`actions-${index}-${property}`);
            actionCell.innerHTML = '<span class="text-green-500">Resolved</span>';
        });
    });

    document.querySelectorAll('.ignore-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            const property = event.target.dataset.property;
            const actionCell = document.getElementById(`actions-${index}-${property}`);
            actionCell.innerHTML = '<span class="text-green-500">Resolved</span>';
        });
    });

    const updateAllBtn = document.getElementById('update-all-btn');
    const ignoreAllBtn = document.getElementById('ignore-all-btn');
    const allActionsHeader = document.getElementById('all-actions-header');

    if (conflictingApplications.length > 0) {
        updateAllBtn.style.display = 'inline-block';
        ignoreAllBtn.style.display = 'inline-block';
    } else {
        updateAllBtn.style.display = 'none';
        ignoreAllBtn.style.display = 'none';
    }

    updateAllBtn.addEventListener('click', () => {
        conflictingApplications.forEach(conflict => {
            const primaryKeyValue = conflict.uploadedApp[applicationPrimaryKey];
            const stateAppIndex = stateData.applications.findIndex(app => app[applicationPrimaryKey] === primaryKeyValue);
            if (stateAppIndex !== -1) {
                stateData.applications[stateAppIndex] = { ...stateData.applications[stateAppIndex], ...conflict.uploadedApp };
            }
        });
        localStorage.setItem('state', JSON.stringify(stateData, null, 2));
        
        // Resolve all individual conflict rows
        document.querySelectorAll('[id^="actions-"]').forEach(cell => {
            cell.innerHTML = '<span class="text-gray-500">Ignored</span>';
        });
        allActionsHeader.innerHTML = ''; // Remove header buttons
    });

    ignoreAllBtn.addEventListener('click', () => {
        // Resolve all individual conflict rows without updating state
        document.querySelectorAll('[id^="actions-"]').forEach(cell => {
            cell.innerHTML = '<span class="text-gray-500">Ignored</span>';
        });
        allActionsHeader.innerHTML = ''; // Remove header buttons
    });
});